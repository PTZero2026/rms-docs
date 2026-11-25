import {after,test} from "node:test"
import assert from "node:assert/strict"
import {randomUUID} from "node:crypto"
import {Pool} from "pg"
import {withTenant} from "../../dist/db/tenant-transaction.js"
import {resolveAccount} from "../../dist/modules/iam/account.js"
import {enqueueProductHours} from "../../dist/modules/product/teaching-credit.js"
import {personHours,publishFormula} from "../../dist/modules/teaching-hour/teaching-hours/service.js"
import {processHours} from "../../dist/modules/teaching-hour/teaching-hours/consumer.js"
import {profileView} from "../../dist/modules/profile/export-profile/data.js"
import {saveIndependent,submitIndependent,decideIndependent,independentPage,findIndependentAuthor} from "../../dist/modules/product/independent.js"
import {issue,finalizeEntry,downloadEntry} from "../../dist/modules/extension/files.js"
const pool=new Pool({user:"rms_test_client"}),ops=new Pool(),worker=new Pool({user:"rms_test_worker"})
after(()=>Promise.all([pool.end(),ops.end(),worker.end()]))
test("F07 independent evidence and approval feed only the authors' CV without a source project",async()=>{
  const tenant=(await ops.query("SELECT id FROM rms.tenant WHERE slug='school-39'")).rows[0].id
  const run=(who,fn)=>withTenant(pool,tenant,async db=>fn(db,await resolveAccount(db,{subject:"ind-"+who,email:who+"@example.invalid"})))
  const unit=randomUUID(),otherUnit=randomUUID(),id=randomUUID(),accounts={}
  for(const u of [unit,otherUnit])await ops.query("INSERT INTO rms.unit VALUES($1,$2,'Viện nghiên cứu')",[tenant,u])
  for(const [who,role,u] of [["author","author",unit],["coauthor","author",otherUnit],["officer","staff",unit],["other","staff",otherUnit]]){
    accounts[who]=await run(who,async(db,a)=>a.id)
    await ops.query("UPDATE rms.account SET user_type=$1,unit_id=$2 WHERE id=$3",[role,u,accounts[who]])
  }
  const found=await run("author",(db,a)=>findIndependentAuthor(db,a,"COAUTHOR@example.invalid"))
  assert.equal(found.id,accounts.coauthor)
  await assert.rejects(run("author",(db,a)=>findIndependentAuthor(db,a,"coauthor")),e=>e.getStatus?.()===400)
  const input={revision:0,title:"Bản đồ không thuộc đề tài",kind:"BASIN_MAP",year:2026,publication:"Tập bản đồ khoa học",authors:[accounts.author,accounts.coauthor],files:[]}
  const save=(who,data)=>run(who,(db,a)=>saveIndependent(db,a,id,data))
  let item=await save("author",input)
  const submit=()=>run("author",(db,a)=>submitIndependent(db,a,id,{revision:item.revision,distinct:false},["BASIN_MAP"]))
  const status=n=>e=>e.getStatus?.()===n
  await assert.rejects(submit(),status(400))
  assert.equal((await run("other",(db,a)=>independentPage(db,a))).items.length,0)
  const store={form:async()=>({url:"",fields:{}}),promote:async()=>{},download:async(_t,i)=>({url:i})}
  const file=await run("author",(db,a)=>issue(db,a,"product",id,{resourceVersion:item.revision,filename:"Bando.pdf",mime:"application/pdf",size:5,sha256:"a".repeat(64),evidenceType:"OUTPUT"},{evidence:[]},store,tenant))
  await run("author",(db,a)=>finalizeEntry(db,a,"product",id,file.id,store,tenant))
  await assert.rejects(run("other",(db,a)=>downloadEntry(db,a,"product",id,file.id,store,tenant)),status(404))
  await assert.rejects(save("author",{...input,revision:item.revision,files:[randomUUID()]}),status(400))
  item=await save("author",{...input,revision:item.revision,files:[file.id]})
  item=await submit()
  const decide=(who,action,reason="")=>run(who,(db,a)=>decideIndependent(db,a,id,{action,reason,revision:item.revision}))
  await assert.rejects(decide("coauthor","approve"),status(403))
  await assert.rejects(decide("other","approve"),status(404))
  const cv=who=>run(who,(db,a)=>profileView(db,a,a.id))
  assert.equal((await cv("coauthor")).outputs.length,0)
  item=await decide("officer","reject","Làm rõ thông tin công bố")
  assert.equal(item.status,"REJECTED")
  item=await save("author",{...input,publication:"Tập bản đồ khoa học, bản 2",revision:item.revision,files:[file.id]})
  item=await submit()
  const allocation=[{accountId:accounts.author,role:"CORRESPONDING_OR_FIRST",share:70},{accountId:accounts.coauthor,role:"COAUTHOR",share:30}]
  const approveWith=credits=>run("officer",(db,a)=>decideIndependent(db,a,id,{action:"approve",reason:"",revision:item.revision,credits},true))
  await assert.rejects(approveWith(undefined),status(400))
  await assert.rejects(approveWith([{...allocation[0],share:60},allocation[1]]),status(400))
  await assert.rejects(approveWith([{...allocation[0],accountId:accounts.officer},allocation[1]]),status(400))
  const decisions=await Promise.all([approveWith(allocation),approveWith(allocation)])
  item=decisions[0]
  assert.equal(item.status,"APPROVED")
  await run("hour-admin",async(db,a)=>db.query("UPDATE rms.account SET user_type='admin' WHERE id=$1",[a.id]))
  for(const [role,hours] of [["CORRESPONDING_OR_FIRST","20"],["COAUTHOR","10"]])await run("hour-admin",(db,a)=>publishFormula(db,a,
    {kind:"product",category:"BASIN_MAP",role,periodType:"ACADEMIC_YEAR",from:"2020-01-01",to:"2099-12-31",hours,version:"signed-test"}))
  const calendar=[{type:"ACADEMIC_YEAR",code:"F07",from:"2020-01-01",to:"2099-12-31"}]
  await run("officer",db=>enqueueProductHours(db,id))
  assert.equal(await processHours(worker,tenant,calendar),2)
  assert.equal(await processHours(worker,tenant,calendar),0)
  const hoursFor=who=>run(who,(db,a)=>personHours(db,a,a.id))
  for(const [who,value] of [["author","14.00"],["coauthor","3.00"]]){
    const ledger=await hoursFor(who)
    assert.equal(ledger.items[0].adjusted,value)
    assert.equal(ledger.items[0].title,input.title)
  }
  for(const who of ["author","coauthor"])assert.deepEqual((await cv(who)).outputs.map(o=>[o.id,o.projectId]),[[id,null]])
  await assert.rejects(save("author",{...input,revision:item.revision}),status(409))
  assert.equal((await ops.query("SELECT id FROM rms.audit_log WHERE target_id=$1 AND action='PRODUCT_APPROVED'",[id])).rowCount,1)
  const next=randomUUID()
  let duplicate=await run("author",(db,a)=>saveIndependent(db,a,next,input))
  const secondFile=await run("author",(db,a)=>issue(db,a,"product",next,{resourceVersion:duplicate.revision,filename:"Khac.pdf",mime:"application/pdf",size:5,sha256:"b".repeat(64),evidenceType:"OUTPUT"},{evidence:[]},store,tenant))
  await run("author",(db,a)=>finalizeEntry(db,a,"product",next,secondFile.id,store,tenant))
  duplicate=await run("author",(db,a)=>saveIndependent(db,a,next,{...input,revision:duplicate.revision,files:[secondFile.id]}))
  const confirmDuplicate=distinct=>run("author",(db,a)=>submitIndependent(db,a,next,{revision:duplicate.revision,distinct},["BASIN_MAP"]))
  await assert.rejects(confirmDuplicate(false),status(409))
  await assert.rejects(confirmDuplicate("false"),status(409))
  assert.equal((await confirmDuplicate(true)).status,"PENDING_APPROVAL")
  const onBehalf=randomUUID()
  const imported=await run("officer",(db,a)=>saveIndependent(db,a,onBehalf,{...input,title:"Hồ sơ nhập hộ"}))
  assert.equal(imported.ownerId,accounts.author)
  assert.equal(imported.canReview,false)
  const officerCV=await cv("officer")
  assert.equal(officerCV.outputs.length,0)
  item=await decide("officer","reopen","Đính chính theo quyết định")
  assert.equal((await cv("author")).outputs.length,0)
  for(const who of ["author","coauthor"])assert.equal((await hoursFor(who)).periods[0].total,"0.00")
  item=await save("author",{...input,publication:"Đính chính bản in",revision:item.revision,files:[file.id]})
  item=await run("author",(db,a)=>submitIndependent(db,a,id,{revision:item.revision,distinct:true},["BASIN_MAP"]))
  item=await approveWith([{accountId:accounts.author,role:"CORRESPONDING_OR_FIRST",share:100}])
  await run("officer",db=>enqueueProductHours(db,id))
  assert.equal(await processHours(worker,tenant,calendar),1)
  assert.equal((await hoursFor("author")).periods[0].total,"20.00")
  assert.equal((await hoursFor("coauthor")).periods[0].total,"0.00")

})
