import {test,after} from "node:test"
import assert from "node:assert/strict"
import {randomUUID} from "node:crypto"
import {Pool} from "pg"
import {withTenant} from "../../dist/db/tenant-transaction.js"
import {resolveAccount} from "../../dist/modules/iam/account.js"
import {saveApplied,submitApplied,decideApplied,submitAppliedResult,appliedHours} from "../../dist/modules/applied-project/register-applied-project/service.js"
import {processHours} from "../../dist/modules/teaching-hour/teaching-hours/consumer.js"
import {personHours,publishFormula} from "../../dist/modules/teaching-hour/teaching-hours/service.js"
const tenant="00000000-0000-4000-8000-000000000035",pool=new Pool({user:"rms_test_client"}),worker=new Pool({user:"rms_test_worker"})
after(()=>Promise.all([pool.end(),worker.end()]))
const run=(who,fn)=>withTenant(pool,tenant,async db=>fn(db,await resolveAccount(db,{subject:"hours-f11-"+who,email:"hours-f11-"+who+"@example.invalid"})))
const rules={types:[{code:"TRANSFER",label:"Chuyển giao",required:[],resultEvidence:["ACCEPTANCE_MINUTES","RESULT_CONFIRMATION"]}],
  bodies:[],evidence:["CONTRACT","ACCEPTANCE_MINUTES","RESULT_CONFIRMATION"].map(code=>({code,label:code}))}
test("F11 posts the selected approval milestone once and reverses every beneficiary even after result revisions",async()=>{
  const unit=randomUUID(),accounts={}
  for(const [who,role] of [["manager","admin"],["principal","author"],["coordinator","author"]]){
    accounts[who]=await run(who,async(db,a)=>{
      if(who==="manager")await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Viện thử nghiệm')",[unit])
      await db.query("UPDATE rms.account SET user_type=$2,unit_id=$3 WHERE id=$1",[a.id,role,unit]);return a.id
    })
  }
  const calendar=[{type:"ACADEMIC_YEAR",code:"fixture",from:"2020-01-01",to:"2040-12-31"}]
  for(const role of ["PRINCIPAL","SECRETARY"]){
    const formula={kind:"applied-project",category:"TRANSFER",role,periodType:"ACADEMIC_YEAR",from:calendar[0].from,to:calendar[0].to,version:"local",hours:"20.00"}
    const publish=f=>run("manager",(db,a)=>publishFormula(db,a,f))
    await publish({...formula,minVnd:"0",maxVnd:"50000000",hours:"10.00"})
    await publish({...formula,minVnd:"50000000",maxVnd:"300000000"})
    await publish({...formula,minVnd:"300000000",hours:"60.00"})
    await assert.rejects(publish({...formula,minVnd:"49000000",maxVnd:"51000000",version:"overlap"}),e=>e.getStatus?.()===409)
  }
  for(const trigger of ["ON_RESULT_APPROVED","ON_PROJECT_APPROVED"]){
    const id=randomUUID(),draft={unitId:unit,title:"Chuyển giao "+trigger,amount:trigger==="ON_PROJECT_APPROVED"?"350000000":"50000000",partners:["Đối tác thử"],category:"TRANSFER",revision:0,members:[{email:"hours-f11-coordinator@example.invalid",share:30,role:"SECRETARY"}]}
    const decide=(action,revision,reason="",who="manager")=>run(who,(db,a)=>decideApplied(db,a,id,{action,revision,reason},rules,{enabled:true,trigger}))
    const requests=()=>run("manager",db=>db.query("SELECT recipient,role,share,source_date::text FROM rms.hour_request WHERE kind='applied-project' AND source_id=$1 ORDER BY role",[id]).then(r=>r.rows))
    await run("principal",(db,a)=>saveApplied(db,a,id,draft,rules))
    const legacyEdit={unitId:unit,title:draft.title,amount:draft.amount,partners:draft.partners,revision:1}
    const saved=await run("principal",(db,a)=>saveApplied(db,a,id,legacyEdit,rules))
    assert.equal(saved.category,"TRANSFER")
    assert.deepEqual(saved.members,draft.members)
    await run("principal",(db,a)=>submitApplied(db,a,id,saved.revision))
    const approved=await decide("approve",saved.revision+1)
    assert.equal((await requests()).length,trigger==="ON_RESULT_APPROVED"?0:2)
    if(trigger==="ON_RESULT_APPROVED"){
      // Approved records from before migration 0037 have no saved approval revision.
      await run("manager",db=>db.query("UPDATE rms.applied_project SET approval_revision=NULL WHERE id=$1",[id]))
    }
    const submit=(revision)=>run("principal",(db,a)=>submitAppliedResult(db,a,id,{revision,summary:"Bàn giao kết quả theo biên bản.",date:"2026-09-30"},rules))
    await assert.rejects(submit(approved.revision),e=>e.getStatus?.()===400)
    await run("principal",(db,a)=>db.query(`INSERT INTO rms.attachment_intent(tenant_id,applied_id,applied_cycle,evidence_type,resource_version,uploader_id,filename,mime,size_bytes,sha256,expires_at,attached_at)
      VALUES(rms.current_tenant(),$1,$2,'RESULT_CONFIRMATION',$2,$3,'xac-nhan.pdf','application/pdf',10,repeat('1',64),now(),now())`,[id,approved.revision,a.id]))
    const pending=await submit(approved.revision)
    await assert.rejects(decide("confirmResult",pending.revision,"","principal"),e=>e.getStatus?.()===403)
    const tightened={...rules,types:[{...rules.types[0],resultEvidence:["ACCEPTANCE_MINUTES"]}]}
    await assert.rejects(run("manager",(db,a)=>decideApplied(db,a,id,{action:"confirmResult",revision:pending.revision,reason:""},tightened,{enabled:true,trigger})),e=>e.getStatus?.()===400)
    const returned=await decide("returnResult",pending.revision,"Bổ sung diễn giải.")
    assert.equal(returned.resultStatus,"DRAFT")
    const resubmitted=await submit(returned.revision)
    const final=await Promise.allSettled([decide("confirmResult",resubmitted.revision),decide("confirmResult",resubmitted.revision)])
    assert.equal(final.filter(v=>v.status==="fulfilled").length,1)
    const records=await requests()
    assert.deepEqual(records.map(r=>[r.role,r.share]),[["PRINCIPAL",70],["SECRETARY",30]])
    if(trigger==="ON_RESULT_APPROVED")assert.equal(records[0].source_date,"2026-09-30")
    await processHours(worker,tenant,calendar);await processHours(worker,tenant,calendar)
    const ledger=who=>run(who,(db,a)=>personHours(db,a,accounts[who]).then(r=>r.items.filter(i=>i.sourceId===id)))
    assert.deepEqual((await ledger("principal")).map(v=>v.adjusted),[trigger==="ON_RESULT_APPROVED"?"14.00":"42.00"])
    assert.deepEqual((await ledger("coordinator")).map(v=>v.adjusted),[trigger==="ON_RESULT_APPROVED"?"6.00":"18.00"])
    await assert.rejects(run("coordinator",(db,a)=>appliedHours(db,a,id)),e=>e.getStatus?.()===404)
    const revoked=await run("manager",(db,a)=>decideApplied(db,a,id,{action:"revoke",revision:resubmitted.revision+1,reason:"Thu hồi biên bản nguồn."},rules,{enabled:false,trigger}))
    assert.deepEqual((await ledger("coordinator")).map(v=>v.adjusted),["0.00"])
    assert.deepEqual((await ledger("principal")).map(v=>v.adjusted),["0.00"])
    const next=await run("principal",(db,a)=>submitApplied(db,a,id,revoked.revision))
    const approvedAgain=await run("manager",(db,a)=>decideApplied(db,a,id,{action:"approve",revision:next.revision,reason:""},rules,{enabled:false,trigger}))
    await assert.rejects(submit(approvedAgain.revision),e=>e.getStatus?.()===400)
    assert.deepEqual(await run("manager",(db,a)=>appliedHours(db,a,id)),[])
    assert.equal((await requests()).length,2)
  }
})
