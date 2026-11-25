import { randomUUID } from "node:crypto"
import { test, after } from "node:test"
import assert from "node:assert/strict"
import { Pool } from "pg"
import { defaultWorkflow } from "@rms/api-contracts/workflow"
import { withTenant } from "../../dist/db/tenant-transaction.js"
import { resolveAccount } from "../../dist/modules/iam/account.js"
import { activateGraph } from "../../dist/modules/workflow/kernel.js"
import { saveCall,changeCall } from "../../dist/modules/call/service.js"
import { createDraft,actOnProposal } from "../../dist/modules/proposal/service.js"
import { finalizeProposal } from "../../dist/modules/proposal/finalize.js"
import { createCommittee,openRound,reviewQueue } from "../../dist/modules/review/open-review/service.js"
import { saveSheet } from "../../dist/modules/review/submit-score/service.js"
import { conclude,recordEthics,reviewResult } from "../../dist/modules/review/review-decision/service.js"
import { amendmentState, amendRound } from "../../dist/modules/review/amendment.js"
import { moveTo } from "../../dist/modules/workflow/move-to.js"
import { deliverNext } from "../../dist/modules/notification/worker.js"
import { listInbox,readNotice } from "../../dist/modules/notification/inbox.js"

const pool=new Pool({user:"rms_test_client",max:8})
after(()=>pool.end())
const tenant=n=>"00000000-0000-4000-8000-"+String(n).padStart(12,"0")
const as=(subject,action,n=15)=>withTenant(pool,tenant(n),async db=>action(db,await resolveAccount(db,{subject,email:subject+"@example.invalid"})))
const at=new Date("2026-11-18T09:00:00Z")
const status=code=>error=>error.getStatus?.()===code
test("review rechecks current seats and project membership, freezes science and publishes each final decision once",async()=>{
  const [unit,field,form,criteria]=Array.from({length:4},()=>randomUUID())
  const ids={}
  await as("operator",async(db,a)=>{
    await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Khoa xét duyệt')",[unit])
    await db.query("UPDATE rms.account SET user_type='admin',unit_id=$2 WHERE id=$1",[a.id,unit])
    const rubric={type:"PROPOSAL_REVIEW",items:[{key:"quality",label:"Chất lượng",weight:0.6,maxScore:10},{key:"impact",label:"Tác động",weight:0.4,maxScore:10}]}
    for(const [id,kind,data] of [[field,"field",{}],[form,"form",{fields:[]}],[criteria,"criteria",rubric]])
      await db.query("INSERT INTO rms.intake_reference(tenant_id,id,kind,name,definition) VALUES(rms.current_tenant(),$1,$2,$2,$3)",[id,kind,data])
  })
  await as("operator",(db,a)=>activateGraph(db,a,defaultWorkflow(),0))
  for(const [who,role] of [["operator","staff"],["second","staff"],["pi","author"],["voter","user"],["conflicted","user"]]){
    ids[who]=await as(who,async(db,a)=>{await db.query("UPDATE rms.account SET user_type=$2,unit_id=$3 WHERE id=$1",[a.id,role,unit]);return a.id})
  }
  const call=await as("operator",async(db,a)=>{
    const draft=await saveCall(db,a,{code:"KG-F03",name:"Kỳ F03",startDate:"2026-11-01",endDate:"2026-11-30",fieldIds:[field],templateId:form,criteriaId:criteria})
    return changeCall(db,a,draft.id,{revision:draft.revision,action:"open"},at)
  })
  const projects=[]
  for(const title of ["Miễn thẩm định","Đạo đức thông qua sau","Đạo đức từ chối","Khoa học từ chối","Đạo đức thông qua trước","Mẫu thiếu cạnh quay lại"]){
    if(projects.length===5){
      const legacy=defaultWorkflow()
      legacy.transitions=legacy.transitions.filter(e=>!e.code.startsWith("reopen-"))
      legacy.steps.find(s=>s.semantic==="REJECTED").final=true
      await as("architect",(db,a)=>db.query("UPDATE rms.account SET user_type='admin' WHERE id=$1",[a.id]))
      await as("architect",(db,a)=>activateGraph(db,a,legacy,1))
    }
    const p=await as("pi",(db,a)=>createDraft(db,a,call.id,{title,fieldId:field,months:6,budget:0,memberIds:[],document:{}},at))
    projects.push((await as("pi",(db,a)=>actOnProposal(db,a,p.id,{action:"submit",revision:p.revision},at))).id)
  }
  const seats=[{accountId:ids.voter,role:"REVIEWER"},{accountId:ids.conflicted,role:"SECRETARY"},{accountId:ids.pi,role:"MEMBER"}]
  const add=(who)=>as(who,(db,a)=>createCommittee(db,a,{name:"Hội đồng khoa học",seats}))
  await assert.rejects(add("voter"),status(403))
  const committee=await add("operator")
  const open=(id,ethicsRequired,who="operator",n)=>as(who,(db,a)=>openRound(db,a,id,{committeeId:committee.id,ethicsRequired}),n)
  await assert.rejects(open(projects[0],false),status(409))
  await as("operator",(db,a)=>changeCall(db,a,call.id,{action:"close",revision:call.revision},at))
  await assert.rejects(open(projects[0],false),status(409))
  await assert.rejects(as("voter",(db,a)=>finalizeProposal(db,a,projects[0])),status(403))
  for(const p of projects)await as("operator",(db,a)=>finalizeProposal(db,a,p))
  await assert.rejects(open(projects[0],false,"voter"),status(403))
  await assert.rejects(as("operator",(db,a)=>openRound(db,{...a,userType:"staff",unitId:unit},projects[0],{committeeId:committee.id,ethicsRequired:false}),16),status(404))
  const [first,replay]=await Promise.all([open(projects[0],false),open(projects[0],false,"second")])
  assert.equal(first.id,replay.id)
  assert.deepEqual(new Set(first.eligible.map(x=>x.id)),new Set([ids.voter,ids.conflicted]))
  assert.ok(!(await as("pi",reviewQueue)).some(x=>x.id===first.id))
  assert.ok((await as("voter",reviewQueue)).some(x=>x.id===first.id))
  const policy={minimum:1,passing:7}
  for(const [index,project] of projects.entries()){
    const round=index===0?first:await open(project,index!==3)
    const score=(who,points,submit)=>as(who,(db,a)=>saveSheet(db,a,round.id,{points,comment:"Nhận xét thử nghiệm",submit}))
    const decide=revision=>as("operator",(db,a)=>conclude(db,a,round.id,policy,"PROPOSAL_REVIEW",revision))
    const ethics=(result)=>as("operator",(db,a)=>recordEthics(db,a,round.id,{result,note:"Biên bản HĐĐĐ số 12"}))
    await assert.rejects(as("voter",(db,a)=>conclude(db,a,round.id,policy)),status(403))
    await assert.rejects(decide(),e=>e.getStatus()===409&&e.message.includes("1 phiếu"))
    await assert.rejects(score("pi",{quality:10,impact:10},true),status(404))
    await score("conflicted",{quality:10},false)
    await as("operator",db=>db.query("INSERT INTO rms.project_member VALUES(rms.current_tenant(),$1,$2,false)",[project,ids.conflicted]))
    await assert.rejects(score("conflicted",{quality:10,impact:10},true),status(404))
    assert.ok(!(await as("conflicted",reviewQueue)).some(x=>x.id===round.id))
    await score("voter",{quality:10},false)
    await assert.rejects(score("voter",{quality:11,impact:3},true),status(400))
    await assert.rejects(score("voter",{quality:9},true),status(400))
    const sheet=await score("voter",{quality:index===3?0:10,impact:2.5},true)
    assert.equal(sheet.total,index===3?1:7)
    await assert.rejects(score("voter",{quality:10,impact:10},true),status(409))
    if(index>=4)await ethics("APPROVED")
    const initial=await decide()
    assert.equal(initial.conclusion,index===3?"FAILED":"PASSED")
    const held=index===1||index===2
    assert.equal(initial.projectStatus,held?"UNDER_REVIEW":index===3?"REJECTED":"APPROVED")
    if(held){
      if(index===1){
        const updated=await as("operator",(db,a)=>amendRound(db,a,round.id,{action:"REOPEN",revision:0,reason:"Soát kết quả khi chờ đạo đức."}))
        assert.equal(updated.history[0].projectStatus,"UNDER_REVIEW")
        assert.equal((await decide(1)).projectStatus,"UNDER_REVIEW")
      }
      await ethics("SUPPLEMENT")
      const visible=await as("pi",(db,a)=>reviewResult(db,a,project,false))
      assert.equal(visible.ethicsNote,"Biên bản HĐĐĐ số 12")
      await as("operator",async db=>assert.equal((await db.query("SELECT count(*)::int n FROM rms.outbox WHERE target_id=$1 AND event_type IN ('PROJECT.APPROVED','PROJECT.REJECTED')",[project])).rows[0].n,0))
      const final=index===2?"REJECTED":"APPROVED"
      for(let attempt=0;attempt<2;attempt++)assert.equal((await ethics(final)).projectStatus,final)
    }
    assert.deepEqual((await as("pi",(db,a)=>reviewResult(db,a,project,false))).comments,[])
    assert.deepEqual((await as("pi",(db,a)=>reviewResult(db,a,project,true))).comments,["Nhận xét thử nghiệm"])
    await assert.rejects(as("voter",(db,a)=>reviewResult(db,a,project,true),16),status(404))
    await as("operator",async db=>{
      for(const events of [["PROJECT.UNDER_REVIEW"],["PROJECT.APPROVED","PROJECT.REJECTED"]]){
        assert.equal((await db.query("SELECT count(*)::int n FROM rms.outbox WHERE target_id=$1 AND event_type=ANY($2::text[])",[project,events])).rows[0].n,1)
      }
    })
    const state=()=>as("operator",(db,a)=>amendmentState(db,a,round.id))
    const amend=(who,cmd)=>as(who,(db,a)=>amendRound(db,a,round.id,cmd))
    const cmd={action:"REOPEN",revision:0,reason:"Bổ sung căn cứ từ biên bản."}
    if(index===0 || index===3){
      assert.equal((await state()).action,"REOPEN")
      await assert.rejects(as("operator",(db,a)=>amendmentState(db,{...a,userType:"staff",unitId:unit},round.id),16),status(404))
      await assert.rejects(as("operator",(db,a)=>amendRound(db,{...a,unitId:randomUUID()},round.id,cmd)),status(404))
      await assert.rejects(amend("pi",cmd),status(403))
      await assert.rejects(amend("operator",{...cmd,reason:" "}),status(400))
      const attempts=await Promise.allSettled([amend("operator",cmd),amend("second",cmd)])
      assert.equal(attempts.filter(r=>r.status==="fulfilled").length,1)
      const updated=await state()
      assert.equal(updated.history.length,1)
      assert.equal(updated.history[0].mean,sheet.total)
      assert.equal(updated.history[0].conclusion,initial.conclusion)
      assert.equal(updated.history[0].reason,cmd.reason)
      assert.equal((await as("pi",(db,a)=>reviewResult(db,a,project,true))).projectStatus,"UNDER_REVIEW")
      await assert.rejects(decide(),status(409))
      assert.equal((await decide(updated.revision)).conclusion,initial.conclusion)
      await assert.rejects(amend("operator",cmd),status(409))
    }
    if(index===4 || index===5){
      if(index===4){
        await as("second",(db,a)=>db.query("UPDATE rms.account SET user_type='admin' WHERE id=$1",[a.id]))
        await as("operator",async(db,a)=>{
          const {rows:[p]}=await db.query("SELECT row_version FROM rms.research_project WHERE id=$1",[project])
          await moveTo(db,a,project,"IN_PROGRESS",p.row_version)
        })
      }
      assert.equal((await state()).action,"REFER")
      await assert.rejects(amend("operator",{...cmd,action:"REFER",recipientId:ids.pi}),status(400))
      const updated=await amend("operator",{...cmd,action:"REFER",recipientId:ids.second})
      assert.equal(updated.history[0].action,"REFER")
      assert.equal(updated.history[0].recipient,"second@example.invalid")
      assert.equal(updated.action,null)
      assert.equal((await as("pi",(db,a)=>reviewResult(db,a,project,false))).projectStatus,index===4?"IN_PROGRESS":"APPROVED")
      const queued=await as("operator",db=>db.query("SELECT payload FROM rms.outbox WHERE target_id=$1 AND event_type='ROUND_CORRECTION_REQUESTED'",[project]))
      assert.deepEqual(queued.rows.map(r=>r.payload.recipientIds),[[ids.second]])
      const worker=new Pool({user:"rms_test_worker"})
      try {while(await deliverNext(worker,async()=>{},tenant(15))) { /* drain this tenant's local fixture */ }}
      finally {await worker.end()}
      const inbox=await as("second",(db,a)=>listInbox(db,a,{}))
      const notice=inbox.items.find(n=>n.title==="Có yêu cầu đính chính kết luận hội đồng")
      const detail=await as("second",(db,a)=>readNotice(db,a,notice.id))
      assert.ok(detail.body.includes(cmd.reason))
      assert.equal(detail.targetId,project)
      await assert.rejects(as("operator",(db,a)=>readNotice(db,a,notice.id)),status(404))
    }
  }
})
