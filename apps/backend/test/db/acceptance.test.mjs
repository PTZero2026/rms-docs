import { test,after } from "node:test"
import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { Pool } from "pg"
import { defaultWorkflow } from "@rms/api-contracts/workflow"
import { withTenant } from "../../dist/db/tenant-transaction.js"
import { resolveAccount } from "../../dist/modules/iam/account.js"
import { activateGraph,startProject } from "../../dist/modules/workflow/kernel.js"
import { createCommittee } from "../../dist/modules/review/open-review/service.js"
import { saveSheet } from "../../dist/modules/review/submit-score/service.js"
import { requestAcceptance,openAcceptance,concludeAcceptance } from "../../dist/modules/acceptance/service.js"
import { amendmentState,amendRound } from "../../dist/modules/review/amendment.js"
import { openWork,returnedWork } from "../../dist/modules/home/open-work-item/service.js"

const pool=new Pool({user:"rms_test_client"}),tenant="00000000-0000-4000-8000-"+String(28).padStart(12,"0")
after(()=>pool.end())
const as=(who,fn,t=tenant)=>withTenant(pool,t,async db=>fn(db,await resolveAccount(db,{subject:who,email:who+"@example.invalid"})))
test("acceptance gates by last period and product type, then counts only this round's eligible ballots",async()=>{
  const id=randomUUID(),unit=randomUUID(),file=randomUUID(),criteria=randomUUID()
  const def={type:"ACCEPTANCE",items:[{key:"A",label:"Chất lượng",maxScore:10,weight:1}]}
  await as("staff",async(db,a)=>{
    await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Khoa nghiệm thu')",[unit])
    await db.query("UPDATE rms.account SET user_type='admin',unit_id=$2 WHERE id=$1",[a.id,unit])
  })
  await as("staff",async(db,a)=>{
    await activateGraph(db,a,defaultWorkflow(),0);await db.query("UPDATE rms.account SET user_type='staff' WHERE id=$1",[a.id])
  })
  await as("pi",(db,a)=>db.query("UPDATE rms.account SET user_type='author',unit_id=$2 WHERE id=$1",[a.id,unit]))
  const owner=await as("pi",async(db,a)=>{
    await startProject(db,a,{id,unitId:unit,title:"Hồ sơ nghiệm thu"})
    await db.query("UPDATE rms.research_project SET status='IN_PROGRESS',status_semantic='IN_PROGRESS' WHERE id=$1",[id])
    await db.query("UPDATE rms.workflow_instance SET current_step='IN_PROGRESS' WHERE project_id=$1",[id])
    await db.query("INSERT INTO rms.attachment_intent(tenant_id,id,project_id,resource_version,uploader_id,filename,mime,size_bytes,sha256,expires_at,attached_at) VALUES(rms.current_tenant(),$1,$2,0,$3,'Ho-so.pdf','application/pdf',12,repeat('f',64),now(),now())",[file,id,a.id])
    await db.query("INSERT INTO rms.project_assignment(tenant_id,project_id,reference,signed,effective,starts,ends,budget,note,commitments,file_id) VALUES(rms.current_tenant(),$1,'QD',current_date,current_date,current_date,current_date,1000000,'',$2,$3)",[id,{ARTICLE:1,PATENT:1},file])
    for(const n of [1,2])await db.query("INSERT INTO rms.research_output(tenant_id,project_id,id,owner_id,unit_id,title,normalized_title,kind,publication_year,publication,authors,files,status) VALUES(rms.current_tenant(),$1,$2,$3,$4,$5,$5,'ARTICLE',2026,'Hoi nghi',ARRAY[$3::uuid],ARRAY[$6::uuid],'APPROVED')",[id,randomUUID(),a.id,unit,"Bai "+n,file])
    return a.id
  })
  const request=()=>as("pi",(db,a)=>requestAcceptance(db,a,id,{fileId:file,summary:"Hồ sơ cuối cùng."}))
  await assert.rejects(request(),e=>e.message.includes("kỳ cuối"))
  await as("staff",db=>db.query("INSERT INTO rms.progress_period(tenant_id,project_id,period,due_date,status) VALUES(rms.current_tenant(),$1,1,current_date,'PASSED')",[id]))
  await assert.rejects(request(),e=>e.message.includes("PATENT")&&e.message.includes("1"))
  const principal=await as("pi",async(db,a)=>{
    await db.query("INSERT INTO rms.research_output(tenant_id,project_id,id,owner_id,unit_id,title,normalized_title,kind,publication_year,publication,authors,files,status) VALUES(rms.current_tenant(),$1,$2,$3,$4,'Sang che','sang che','PATENT',2026,'Van bang',ARRAY[$3::uuid],ARRAY[$5::uuid],'APPROVED')",[id,randomUUID(),owner,unit,file])
    return a.id
  })
  assert.equal((await request()).status,"PENDING_ACCEPTANCE")
  const workFor=who=>as(who,(db,a)=>returnedWork(db,a,{}))
  const link=(who,workId,t)=>as(who,(db,a)=>openWork(db,a,workId),t)
  const coordination=await link("staff",id)
  assert.deepEqual([coordination.feature,coordination.targetType,coordination.targetId],["F06","project",id])
  assert.deepEqual((await workFor("staff")).items.map(w=>w.id),[id])
  await assert.rejects(link("pi",id),e=>e.getStatus()===404)
  await as("another-office",async(db,a)=>{
    const otherUnit=randomUUID()
    await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Khoa khác')",[otherUnit])
    await db.query("UPDATE rms.account SET user_type='staff',unit_id=$2 WHERE id=$1",[a.id,otherUnit])
  })
  assert.equal((await workFor("another-office")).total,0)
  await assert.rejects(link("another-office",id),e=>e.getStatus()===404)
  await assert.rejects(as("pi",(db,a)=>requestAcceptance(db,a,id,{fileId:file,summary:"x"}),tenant.slice(0,-1)+"7"),e=>[403,404].includes(e.getStatus()))
  const member=await as("reviewer",(_db,a)=>a.id)
  const options={name:"Hội đồng",seats:[{accountId:member,role:"REVIEWER"},{accountId:principal,role:"CHAIR"}]}
  const {round,other}=await as("staff",async(db,a)=>{
    await db.query("INSERT INTO rms.intake_reference(tenant_id,id,kind,name,definition) VALUES(rms.current_tenant(),$1,'criteria','Nghiệm thu',$2)",[criteria,def])
    const initial=await createCommittee(db,a,options)
    const {rows:[noise]}=await db.query("INSERT INTO rms.evaluation_round(tenant_id,project_id,committee_id,kind,criteria,ethics) VALUES(rms.current_tenant(),$1,$2,'PROPOSAL_REVIEW',$3,'EXEMPT') RETURNING id",[id,initial.id,{definition:{...def,type:"PROPOSAL_REVIEW"}}])
    await db.query("INSERT INTO rms.score_sheet(tenant_id,round_id,account_id,points,comment,total,submitted_at) VALUES(rms.current_tenant(),$1,$2,'{}','',10,now())",[noise.id,member])
    const committee=await createCommittee(db,a,options,"ACCEPTANCE")
    return {round:await openAcceptance(db,a,id,{committeeId:committee.id,criteriaId:criteria}),other:noise.id}
  })
  const sheet={points:{A:7},comment:"Đạt",submit:true}
  const reviewerWork=await workFor("reviewer")
  assert.deepEqual(reviewerWork.items.map(w=>[w.id,w.targetType,w.targetId,w.feature]),[[round.id,"round",round.id,"F06"]])
  assert.equal(reviewerWork.overdue,0)
  assert.equal((await link("staff",id)).targetType,"project")
  await assert.rejects(link("pi",round.id),e=>e.getStatus()===404)
  await assert.rejects(link("reviewer",round.id,tenant.slice(0,-1)+"7"),e=>e.getStatus()===404)
  await as("reviewer",(db,a)=>saveSheet(db,a,round.id,{...sheet,submit:false},"ACCEPTANCE"))
  assert.equal((await link("reviewer",round.id)).id,round.id)
  await as("staff",db=>db.query("INSERT INTO rms.project_member VALUES(rms.current_tenant(),$1,$2,false)",[id,member]))
  assert.equal((await workFor("reviewer")).total,0)
  await assert.rejects(link("reviewer",round.id),e=>e.getStatus()===404)
  await as("staff",db=>db.query("DELETE FROM rms.project_member WHERE project_id=$1 AND account_id=$2",[id,member]))
  await assert.rejects(as("pi",(db,a)=>saveSheet(db,a,round.id,sheet,"ACCEPTANCE")),e=>e.getStatus()===404)
  await assert.rejects(as("reviewer",(db,a)=>saveSheet(db,a,other,sheet,"ACCEPTANCE")),e=>e.getStatus()===404)
  const finish=revision=>as("staff",(db,a)=>concludeAcceptance(db,a,round.id,{minimum:1,passing:7},revision))
  await assert.rejects(finish(),e=>e.message.includes("1 phiếu"))
  await as("reviewer",(db,a)=>saveSheet(db,a,round.id,sheet,"ACCEPTANCE"))
  assert.equal((await workFor("reviewer")).total,0)
  await assert.rejects(link("reviewer",round.id),e=>e.getStatus()===404)
  const done=await finish()
  await assert.rejects(link("staff",id),e=>e.getStatus()===404)
  assert.equal(done.projectStatus,"PASSED");assert.equal(done.count,1);assert.equal(done.mean,7)
  assert.equal((await finish()).projectStatus,"PASSED")
  await assert.rejects(as("reviewer",(db,a)=>saveSheet(db,a,round.id,sheet,"ACCEPTANCE")),e=>e.getStatus()===409)
  assert.equal((await as("staff",(db,a)=>amendmentState(db,a,round.id))).action,"REOPEN")
  await as("staff",(db,a)=>amendRound(db,a,round.id,{action:"REOPEN",revision:0,reason:"Kiểm tra lại kết quả."}))
  assert.equal((await link("staff",id)).targetType,"project")
  assert.equal((await workFor("reviewer")).total,0)
  await assert.rejects(finish(),e=>e.getStatus()===409)
  assert.equal((await finish(1)).projectStatus,"PASSED")
  const state=await as("staff",(db,a)=>amendmentState(db,a,round.id))
  assert.deepEqual(state.history.map(h=>[h.conclusion,h.count,h.mean]),[["PASSED",1,7]])
  await assert.rejects(as("staff",db=>db.query("DELETE FROM rms.round_amendment WHERE round_id=$1",[round.id])),e=>e.code==="42501")
})
