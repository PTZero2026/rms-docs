import {test,after} from "node:test"
import assert from "node:assert/strict"
import {randomUUID} from "node:crypto"
import {Pool} from "pg"
import {withTenant} from "../../dist/db/tenant-transaction.js"
import {resolveAccount} from "../../dist/modules/iam/account.js"
import {publishFormula,adjustHours,personHours,enqueueApproved} from "../../dist/modules/teaching-hour/teaching-hours/service.js"
import {processHours} from "../../dist/modules/teaching-hour/teaching-hours/consumer.js"
import {saveEntry,changeEntry} from "../../dist/modules/extension/entries.js"
const pool=new Pool({user:"rms_test_client"}),worker=new Pool({user:"rms_test_worker"}),tenant="00000000-0000-4000-8000-000000000033"
after(()=>Promise.all([pool.end(),worker.end()]))
const run=(who,fn)=>withTenant(pool,tenant,async db=>fn(db,await resolveAccount(db,{subject:who,email:who+"@example.invalid"})))
test("F09 allocates the approved source shares across three people, replays once and reverses every recipient",async()=>{
  const unit=randomUUID(),id=randomUUID(),ids={}
  await run("allocation-admin",async(db,a)=>{
    await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Viện khảo sát')",[unit])
    await db.query("UPDATE rms.account SET user_type='admin' WHERE id=$1",[a.id])
  })
  for(const name of ["lead","first-member","second-member"]){
    ids[name]=await run(name,async(db,a)=>{
      await db.query("UPDATE rms.account SET user_type='author',unit_id=$2 WHERE id=$1",[a.id,unit])
      return a.id
    })
  }
  const rules={types:[{code:"NATIONAL",label:"Quốc gia",required:[]}],bodies:[{code:"MIN",label:"Bộ"}],evidence:[]}
  const members=[{email:"first-member@example.invalid",share:30},{email:"second-member@example.invalid",share:20}]
  const cmd={revision:0,title:"Định mức ba thành viên",date:"2026-09-30",hostId:unit,body:"MIN",category:"NATIONAL",members}
  const save=(input)=>run("lead",(db,a)=>saveEntry(db,a,"upper-project",id,input,rules))
  for(const invalid of [[members[0],members[0]],[{...members[0],share:100}],[{...members[0],email:"lead@example.invalid"}],
    [{...members[0],email:"absent@example.invalid"}]])await assert.rejects(save({...cmd,members:invalid}),e=>e.getStatus()===400)
  const draft=await save(cmd)
  assert.deepEqual(draft.members,members)
  const {members:omitted,...priorClient}=cmd
  const kept=await save({...priorClient,revision:draft.revision})
  assert.deepEqual(kept.members,members)
  await run("lead",(db,a)=>changeEntry(db,a,"upper-project",id,{action:"submit",revision:kept.revision,reason:""},rules))
  const calendar=[{type:"ACADEMIC_YEAR",code:"2026-2027",from:"2026-09-01",to:"2027-08-31"}]
  const approved=await run("allocation-admin",async(db,a)=>{
    for(const [role,hours] of [["PRINCIPAL","20"],["MEMBER","10"]])await publishFormula(db,a,
      {kind:"upper-project",role,category:"NATIONAL",periodType:"ACADEMIC_YEAR",from:"2026-01-01",to:"2027-01-01",hours,version:"fixture"})
    const result=await changeEntry(db,a,"upper-project",id,{action:"approve",revision:kept.revision+1,reason:""},rules)
    await enqueueApproved(db,"upper-project",id);await enqueueApproved(db,"upper-project",id)
    return result
  })
  await processHours(worker,tenant,calendar)
  for(const [who,share,total] of [["lead",50,"10.00"],["first-member",30,"3.00"],["second-member",20,"2.00"]]){
    const ledger=await run(who,(db,a)=>personHours(db,a,ids[who]))
    assert.deepEqual(ledger.items.map(v=>[v.sourceId,v.share,v.adjusted]),[[id,share,total]])
  }
  await run("allocation-admin",(db,a)=>changeEntry(db,a,"upper-project",id,{action:"revoke",revision:approved.revision,reason:"Thu hồi quyết định nguồn."},rules))
  for(const who of Object.keys(ids))assert.equal((await run(who,(db,a)=>personHours(db,a,ids[who]))).periods[0].total,"0.00")
})
test("P03 replays a September event only once and preserves its formula and period after October",async()=>{
  const unit=randomUUID(),id=randomUUID()
  await run("admin",async(db,a)=>{await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Viện A')",[unit]);await db.query("UPDATE rms.account SET unit_id=$1,user_type='admin' WHERE id=$2",[unit,a.id])})
  const subject=await run("lecturer",async(db,a)=>{await db.query("UPDATE rms.account SET unit_id=$1,user_type='author' WHERE id=$2",[unit,a.id]);return a.id})
  const rule={kind:"activity",category:"CONFERENCE",role:"LECTURER",periodType:"ACADEMIC_YEAR",from:"2026-01-01",to:"2026-09-30",hours:"6.00",version:"v1"}
  await run("admin",(db,a)=>publishFormula(db,a,rule))
  await run("admin",(db,a)=>publishFormula(db,a,{...rule,from:"2026-10-01",to:"2027-08-31",version:"v2",hours:"9.00"}))
  await assert.rejects(run("admin",(db,a)=>publishFormula(db,a,{...rule,to:"2026-12-31",version:"v3"})),e=>e.getStatus()===409)
  await run("lecturer",async(db,a)=>{
    await db.query("INSERT INTO rms.extension_entry(tenant_id,id,kind,unit_id,owner_id,title,category,managing_body,source_date,status) VALUES(rms.current_tenant(),$1,'activity',$2,$3,'Hội nghị','CONFERENCE','','2026-09-30','APPROVED')",[id,unit,a.id])
    await enqueueApproved(db,"activity",id)
  })
  const calendar=[{type:"ACADEMIC_YEAR",code:"2026-2027",from:"2026-09-01",to:"2027-08-31"}]
  const results=await Promise.all([processHours(worker,tenant,calendar),processHours(worker,tenant,calendar)])
  assert.equal(results.reduce((a,b)=>a+b,0),1)
  await run("lecturer",db=>enqueueApproved(db,"activity",id));assert.equal(await processHours(worker,tenant,calendar),0)
  const page=await run("lecturer",(db,a)=>personHours(db,a,subject))
  assert.equal(page.items.length,1);assert.equal(page.items[0].hours,"6.00");assert.equal(page.items[0].version,"v1");assert.equal(page.periods[0].total,"6.00")
  const adjustment={id:randomUUID(),delta:"-1.00",reason:"Điều chỉnh phân bổ theo biên bản"}
  await run("admin",(db,a)=>adjustHours(db,a,page.items[0].id,adjustment))
  await run("admin",(db,a)=>adjustHours(db,a,page.items[0].id,adjustment))
  assert.equal((await run("lecturer",(db,a)=>personHours(db,a,subject))).periods[0].total,"5.00")
  const {changeEntry}=await import("../../dist/modules/extension/entries.js")
  await run("admin",async(db,a)=>{
    const {rows:[source]}=await db.query("SELECT revision FROM rms.extension_entry WHERE id=$1",[id])
    const cmd={action:"revoke",revision:source.revision,reason:"Thu hồi theo biên bản"}
    await changeEntry(db,a,"activity",id,cmd,{types:[],evidence:[],bodies:[]})
    await assert.rejects(changeEntry(db,a,"activity",id,cmd,{types:[],evidence:[],bodies:[]}),e=>e.getStatus()===409)
  })
  assert.equal((await run("lecturer",(db,a)=>personHours(db,a,subject))).periods[0].total,"0.00")
  await assert.rejects(run("admin",(db,a)=>adjustHours(db,a,page.items[0].id,{...adjustment,id:randomUUID(),delta:"1.00"})),e=>e.getStatus()===409)
  assert.equal(await processHours(worker,tenant,calendar),0)
})
