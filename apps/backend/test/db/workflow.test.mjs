import assert from "node:assert/strict"
import { after,test } from "node:test"
import { randomUUID } from "node:crypto"
import { Pool } from "pg"
import { withTenant } from "../../dist/db/tenant-transaction.js"
import { resolveAccount } from "../../dist/modules/iam/account.js"
import { activateGraph, startProject, transition } from "../../dist/modules/workflow/kernel.js"

const pool = new Pool({ user:"rms_test_client",max:4 })
after(()=>pool.end())
const a="00000000-0000-4000-8000-"+"5".padStart(12,"0")
const run = fn=>withTenant(pool,a,fn)
test("one version wins and a failed command leaves no status, history, audit or outbox change", async ()=>{
  const user = {subject:"workflow-admin",email:"workflow@example.invalid"}
  const unit = randomUUID(), id = randomUUID()
  const kernelGraph = {
    steps:[{code:"writing",semantic:"DRAFT",initial:true,final:false},{code:"done",semantic:"COMPLETED",initial:false,final:true}],
    transitions:[{code:"finish",from:"writing",to:"done",roles:["admin"],requiresComment:true,guards:[],effects:["notify"]}],
  }
  await run(async db=>{
    const who = await resolveAccount(db,user)
    await db.query("update rms.account set user_type='admin' where id=$1",[who.id])
    const admin = await resolveAccount(db,user)
    await db.query("insert into rms.unit values(rms.current_tenant(),$1,'Khoa')",[unit])
    await activateGraph(db,admin,kernelGraph,0)
    await startProject(db,admin,{id,title:"Kiểm nguyên tử",unitId:unit})
  })
  async function state(db) {
    const {rows:[r]}=await db.query(`SELECT status, row_version,
      (SELECT count(*)::int FROM rms.workflow_history WHERE project_id=$1) AS history,
      (SELECT count(*)::int FROM rms.audit_log WHERE target_id=$1 AND action='WORKFLOW_TRANSITION') AS audit,
      (SELECT count(*)::int FROM rms.outbox WHERE target_id=$1) AS events
      FROM rms.research_project WHERE id=$1`,[id]);return r
  }
  const before={status:"writing",row_version:0,history:0,audit:0,events:0}
  const command = async (db,reason) => transition(db,await resolveAccount(db,user),{projectId:id,code:"finish",expectedVersion:0,reason})
  await assert.rejects(run(db=>command(db,"  ")),err=>err.getStatus()===400)
  await assert.rejects(run(async db=>{await command(db,"Đã duyệt"); throw Error("cancel")}),/cancel/)
  assert.deepEqual(await run(state),before)
  const results = await Promise.allSettled([run(db=>command(db,"Đã duyệt")),run(db=>command(db,"Đã duyệt"))])
  assert.equal(results.filter(r=>r.status==="fulfilled").length,1)
  assert.equal(results.find(r=>r.status==="rejected").reason.getStatus(),409)
  assert.deepEqual(await run(state),{status:"done",row_version:1,history:1,audit:1,events:1})
  await assert.rejects(run(db=>db.query("delete from rms.audit_log where target_id=$1",[id])),{code:"42501"})
})

test("an existing instance keeps v1 while a new one follows v2 through different next steps",async()=>{
  const { readInstance,activeTemplate }=await import("../../dist/modules/workflow/version.js")
  const school="00000000-0000-4000-8000-"+"10".padStart(12,"0")
  const inSchool=fn=>withTenant(pool,school,fn)
  const user={subject:"version-admin",email:"version-admin@example.invalid"}
  const unit=randomUUID(),x=randomUUID(),y=randomUUID()
  function graph(next){
    const step=(code,semantic,initial=false,final=false)=>({code,semantic,initial,final})
    const edge=(code,from,to)=>({code,from,to,roles:["admin"],guards:[],effects:[],requiresComment:false})
    return {steps:[step("lap","DRAFT",true),step("duyet","UNDER_REVIEW"),step(next,"APPROVED"),step("dong","COMPLETED",false,true)],
      transitions:[edge("nop","lap","duyet"),edge("chapnhan","duyet",next),edge("ketthuc",next,"dong")]}
  }
  await inSchool(async db=>{
    const account=await resolveAccount(db,user)
    await db.query("UPDATE rms.account SET user_type='admin' WHERE id=$1",[account.id])
    const admin=await resolveAccount(db,user)
    await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Khoa')",[unit])
    await activateGraph(db,admin,graph("duyetcu"),0)
    await startProject(db,admin,{id:x,unitId:unit,title:"Hồ sơ X"})
    await transition(db,admin,{projectId:x,code:"nop",expectedVersion:0})
    const broken=graph("duyetmoi");delete broken.steps[1].semantic
    await assert.rejects(activateGraph(db,admin,broken,1),e=>e.getStatus()===400 && e.message.includes("duyet"))
    const orphan=graph("duyetmoi");orphan.transitions[1].to="thieu"
    await assert.rejects(activateGraph(db,admin,orphan,1),e=>e.getStatus()===400)
    await activateGraph(db,admin,graph("duyetmoi"),1)
    assert.equal((await activeTemplate(db,admin)).version,2)
    await startProject(db,admin,{id:y,unitId:unit,title:"Hồ sơ Y"})
    await transition(db,admin,{projectId:y,code:"nop",expectedVersion:0})
    for(const [id,version,next] of [[x,1,"duyetcu"],[y,2,"duyetmoi"]]){
      const read=()=>readInstance(db,admin,id)
      assert.equal((await read()).version,version)
      assert.equal((await read()).next[0].to,next)
      await transition(db,admin,{projectId:id,code:"chapnhan",expectedVersion:1})
      assert.equal((await read()).step,next)
      await transition(db,admin,{projectId:id,code:"ketthuc",expectedVersion:2})
      const done=await read();assert.equal(done.version,version);assert.equal(done.step,"dong");assert.deepEqual(done.next,[])
    }
  })
})
