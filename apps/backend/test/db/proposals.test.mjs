import { randomUUID } from "node:crypto"
import { test,after } from "node:test"
import assert from "node:assert/strict"
import { Pool } from "pg"
import { defaultWorkflow } from "@rms/api-contracts/workflow"
import { withTenant } from "../../dist/db/tenant-transaction.js"
import { resolveAccount } from "../../dist/modules/iam/account.js"
import { activateGraph } from "../../dist/modules/workflow/kernel.js"
import { moveTo } from "../../dist/modules/workflow/move-to.js"
import { saveCall,changeCall } from "../../dist/modules/call/service.js"
import { createDraft,editDraft,proposal,actOnProposal } from "../../dist/modules/proposal/service.js"
import { finalizeProposal } from "../../dist/modules/proposal/finalize.js"
import { reviewSetup } from "../../dist/modules/review/open-review/service.js"
import { createReport } from "../../dist/modules/report/call-report/service.js"
const pool=new Pool({user:"rms_test_client",max:6})
after(()=>pool.end())
const tn=n=>"00000000-0000-4000-8000-"+String(n).padStart(12,"0")
const when=new Date("2026-11-30T16:59:59.999Z"),late=new Date("2026-11-30T17:00:00Z")
const run=(who,fn,n=13)=>withTenant(pool,tn(n),async db=>fn(db,await resolveAccount(db,{subject:who,email:who+"@example.invalid"})))
test("draft, concurrent submit, return and resubmit preserve source fields, audit and tracking number",async()=>{
  const [unit,field,form,criteria]=Array.from({length:4},()=>randomUUID())
  await run("manager",async(db,a)=>{
    await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Khoa')",[unit])
    await db.query("UPDATE rms.account SET user_type='admin',unit_id=$2 WHERE id=$1",[a.id,unit])
    for(const [id,k,def] of [[field,"field",{}],[form,"form",{fields:[{key:"method",label:"Phương pháp",required:true}]}],[criteria,"criteria",{}]])
      await db.query("INSERT INTO rms.intake_reference(tenant_id,id,kind,name,definition) VALUES(rms.current_tenant(),$1,$2,$2,$3)",[id,k,def])
  })
  for(const who of ["pi","other"])await run(who,(db,a)=>db.query("UPDATE rms.account SET user_type='author',unit_id=$2 WHERE id=$1",[a.id,unit]))
  const call=await run("manager",async(db,a)=>{
    const legacy=defaultWorkflow()
    for(const edge of legacy.transitions.filter(e=>e.code==="return"||e.code.startsWith("cancel-")))edge.roles.push("admin")
    await activateGraph(db,a,legacy,0)
    const c=await saveCall(db,a,{code:"KG-F01",name:"Kỳ nghiên cứu",startDate:"2026-11-01",endDate:"2026-11-30",fieldIds:[field],templateId:form,criteriaId:criteria})
    return changeCall(db,a,c.id,{action:"open",revision:1},when)
  })
  const minimal={title:"Bản nháp chưa đủ",fieldId:null,months:null,budget:null,document:{},memberIds:[]}
  const promised={...minimal,title:"Cam kết bản đồ",commitments:{BASIN_MAP:2}}
  await assert.rejects(run("pi",(db,a)=>createDraft(db,a,call.id,promised,when,["ARTICLE"])),e=>e.getStatus?.()===400)
  const custom=await run("pi",(db,a)=>createDraft(db,a,call.id,promised,when,["BASIN_MAP"]))
  assert.equal(custom.submitUntil,late.toISOString())
  assert.equal((await run("pi",(db,a)=>proposal(db,a,custom.id,late))).submitUntil,null)
  const unchanged=await run("pi",(db,a)=>editDraft(db,a,custom.id,{...promised,revision:custom.revision},when,["ARTICLE"]))
  assert.deepEqual(unchanged.commitments,promised.commitments)
  await assert.rejects(run("pi",(db,a)=>editDraft(db,a,custom.id,{...promised,commitments:{BASIN_MAP:3},revision:unchanged.revision},when,["ARTICLE"])),e=>e.getStatus?.()===400)
  const draft=await run("pi",(db,a)=>createDraft(db,a,call.id,minimal,when))
  assert.equal(draft.projectCode,null);assert.equal(draft.members.filter(m=>m.principal).length,1)
  assert.equal((await run("pi",(db,a)=>proposal(db,a,draft.id))).title,minimal.title)
  await assert.rejects(run("other",(db,a)=>proposal(db,a,draft.id)),e=>e.getStatus()===404)
  await assert.rejects(run("pi",(db,a)=>proposal(db,a,draft.id),14),e=>e.getStatus()===404)
  const submit=(id,version,at=when)=>run("pi",(db,a)=>actOnProposal(db,a,id,{action:"submit",revision:version},at))
  await assert.rejects(submit(draft.id,draft.revision),e=>e.getStatus()===400 && e.message.includes("Phương pháp"))
  const full={...minimal,fieldId:field,months:12,budget:50000000,document:{method:"Đo mẫu định kỳ."},revision:draft.revision}
  const ready=await run("pi",(db,a)=>editDraft(db,a,draft.id,full,when))
  await assert.rejects(submit(ready.id,ready.revision,late),e=>e.getStatus()===409)
  const responses=await Promise.all([submit(ready.id,ready.revision),submit(ready.id,ready.revision)])
  const accepted=responses[0]
  assert.equal(accepted.projectCode,responses[1].projectCode);assert.equal(accepted.semantic,"SUBMITTED")
  await assert.rejects(run("pi",(db,a)=>editDraft(db,a,ready.id,{...full,revision:accepted.revision},when)),e=>e.getStatus()===409)
  await run("officer",(db,a)=>db.query("UPDATE rms.account SET user_type='staff',unit_id=$2 WHERE id=$1",[a.id,unit]))
  assert.equal((await run("manager",(db,a)=>proposal(db,a,ready.id,when))).canReturn,false)
  await assert.rejects(run("manager",(db,a)=>actOnProposal(db,a,ready.id,{action:"return",revision:accepted.revision,reason:"Bổ sung phương pháp."},when)),e=>e.getStatus?.()===403)
  const revert=(reason,at)=>run("officer",(db,a)=>actOnProposal(db,a,ready.id,{action:"return",revision:accepted.revision,reason},at))
  await assert.rejects(revert(" ",when),e=>e.getStatus()===400)
  await assert.rejects(revert("Bổ sung",late),e=>e.getStatus()===409)
  const returned=await revert("Bổ sung phương pháp.",when)
  assert.equal(returned.reason,"Bổ sung phương pháp.")
  const second=await submit(ready.id,returned.revision)
  assert.equal(second.projectCode,accepted.projectCode)
  const more=await Promise.all([0,1].map(()=>run("pi",(db,a)=>createDraft(db,a,call.id,full,when))))
  const receipts=await Promise.all(more.map(p=>submit(p.id,p.revision)))
  assert.equal(new Set([second,...receipts].map(p=>p.projectCode)).size,3)
  await assert.rejects(run("pi",(db,a)=>actOnProposal(db,a,ready.id,{action:"return",revision:second.revision,reason:"Không thuộc trường"},when),14),e=>e.getStatus()===404)
  await assert.rejects(run("manager",(db,a)=>changeCall(db,a,call.id,{action:"cancel",revision:call.revision},when)),e=>e.getStatus()===409)
  await run("manager",async db=>{
    assert.equal((await db.query("SELECT count(*)::int AS n FROM rms.workflow_history WHERE project_id=$1",[ready.id])).rows[0].n,3)
  })
  // BR-10 applies up to review, including after intake closes.
  const otherUnit=randomUUID()
  await run("manager",db=>db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Khoa khác')",[otherUnit]))
  await run("elsewhere",(db,a)=>db.query("UPDATE rms.account SET user_type='staff',unit_id=$2 WHERE id=$1",[a.id,otherUnit]))
  const cancel=(who,p,reason,tenant=13)=>run(who,(db,a)=>actOnProposal(db,a,p.id,{action:"cancel",revision:p.revision,reason},late),tenant)
  const status=code=>e=>e.getStatus?.()===code
  assert.equal((await run("pi",(db,a)=>proposal(db,a,unchanged.id,late))).canCancel,true)
  await assert.rejects(cancel("manager",unchanged,"Tài khoản quản trị"),status(403))
  await assert.rejects(cancel("pi",unchanged," \u200b "),status(400))
  await assert.rejects(cancel("other",unchanged,"Hồ sơ người khác"),status(404))
  await assert.rejects(cancel("elsewhere",unchanged,"Khác khoa"),status(404))
  await assert.rejects(cancel("pi",unchanged,"Khác trường",14),status(404))
  const withdrawn=await cancel("pi",unchanged,"  Dừng phương án bản đồ.  ")
  assert.equal(withdrawn.semantic,"CANCELLED")
  assert.equal(withdrawn.reason,"Dừng phương án bản đồ.")
  assert.equal(withdrawn.projectCode,null)
  assert.equal(withdrawn.canCancel,false)
  assert.deepEqual(withdrawn.commitments,promised.commitments)
  const race=await Promise.allSettled([cancel("pi",second,"Chủ nhiệm rút hồ sơ."),cancel("officer",second,"Khoa dừng tiếp nhận.")])
  assert.equal(race.filter(result=>result.status==="fulfilled").length,1)
  assert.equal(race.find(result=>result.status==="rejected").reason.getStatus(),409)
  const saved=await run("pi",(db,a)=>proposal(db,a,second.id,late))
  assert.equal(saved.semantic,"CANCELLED")
  assert.equal(saved.projectCode,second.projectCode)
  await run("manager",async db=>{
    const {rows}=await db.query(`SELECT h.reason,a.details->>'reason' AS audit_reason,o.event_type
      FROM rms.workflow_history h JOIN rms.audit_log a ON a.id=h.audit_id AND a.tenant_id=h.tenant_id
      JOIN rms.outbox o ON o.audit_id=a.id AND o.tenant_id=a.tenant_id WHERE h.project_id=$1 AND o.event_type='PROJECT.CANCELLED'`,[saved.id])
    assert.deepEqual(rows,[{reason:saved.reason,audit_reason:saved.reason,event_type:"PROJECT.CANCELLED"}])
  })
  const byStaff=await cancel("officer",receipts[0],"Khoa hủy hồ sơ trùng.")
  assert.equal(byStaff.projectCode,receipts[0].projectCode)
  await run("officer",(db,a)=>moveTo(db,a,receipts[1].id,"UNDER_REVIEW",receipts[1].revision))
  const inReview=await run("officer",(db,a)=>proposal(db,a,receipts[1].id,late))
  assert.equal(inReview.canCancel,false)
  await assert.rejects(cancel("officer",inReview,"Đã sang hội đồng"),status(409))
  const restricted=defaultWorkflow()
  const teammate=await run("other",(_db,a)=>a.id)
  const priorDraft=await run("pi",(db,a)=>createDraft(db,a,call.id,{...minimal,memberIds:[teammate]},when))
  assert.equal((await run("other",(db,a)=>proposal(db,a,priorDraft.id,when))).canCancel,false)
  await assert.rejects(cancel("other",priorDraft,"Thành viên không phải chủ nhiệm"),status(403))
  restricted.transitions.filter(edge=>edge.code.startsWith("cancel-")).forEach(edge=>{edge.roles=["staff"]})
  await run("manager",(db,a)=>activateGraph(db,a,restricted,1))
  assert.equal((await cancel("pi",priorDraft,"Thực hiện theo mẫu ban đầu.")).templateVersion,1)
  const restrictedDraft=await run("pi",(db,a)=>createDraft(db,a,call.id,minimal,when))
  assert.equal(restrictedDraft.canCancel,false)
  await assert.rejects(cancel("pi",restrictedDraft,"Mẫu không cấp quyền"),status(409))
  assert.equal((await cancel("officer",restrictedDraft,"Đúng cạnh trong bản ghim.")).semantic,"CANCELLED")
  const candidate=await run("pi",(db,a)=>createDraft(db,a,call.id,full,when))
  const received=await submit(candidate.id,candidate.revision)
  await run("manager",(db,a)=>changeCall(db,a,call.id,{action:"close",revision:call.revision},late))
  await run("officer",(db,a)=>finalizeProposal(db,a,received.id))
  const queue=()=>run("officer",(db,a)=>reviewSetup(db,a))
  assert.ok((await queue()).projects.some(row=>row.id===received.id&&row.finalized))
  await cancel("officer",received,"Rút khỏi danh sách trước khi mở vòng.")
  assert.ok(!(await queue()).projects.some(row=>row.id===received.id))
  const report=await run("officer",(db,a)=>createReport(db,a,{callId:call.id}))
  assert.equal(report.rows.filter(row=>row.id===received.id&&row.code===received.projectCode&&row.semantic==="CANCELLED").length,1)
  assert.ok(!report.rows.some(row=>row.id===withdrawn.id))
})
