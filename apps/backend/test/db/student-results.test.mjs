import {after,test} from "node:test"
import assert from "node:assert/strict"
import {randomUUID} from "node:crypto"
import {Pool} from "pg"
import {withTenant} from "../../dist/db/tenant-transaction.js"
import {resolveAccount} from "../../dist/modules/iam/account.js"
import {registerStudent,answerMentor,submitStudent,decideStudent,parseCalls,businessDay} from "../../dist/modules/student-project/confirm-mentor/service.js"
import {recordProgress} from "../../dist/modules/student-project/progress.js"
import {studentResult} from "../../dist/modules/student-project/results.js"
import {enqueueStudentHours,personHours,publishFormula} from "../../dist/modules/teaching-hour/teaching-hours/service.js"
import {processHours} from "../../dist/modules/teaching-hour/teaching-hours/consumer.js"
import {issue,finalizeEntry,downloadEntry} from "../../dist/modules/extension/files.js"

const pool=new Pool({user:"rms_test_client"}),ops=new Pool(),worker=new Pool({user:"rms_test_worker"})
after(()=>Promise.all([pool.end(),ops.end(),worker.end()]))
test("F10 pins final evidence, binds mentor endorsement to the submission and posts a passing result to P03 exactly once",async()=>{
  const tenant=(await ops.query("SELECT id FROM rms.tenant WHERE slug='school-38'")).rows[0].id
  const unit=randomUUID(), project=randomUUID()
  const run=(name,fn)=>withTenant(pool,tenant,async db=>fn(db,await resolveAccount(db,{subject:name,email:name+"@example.invalid"})))
  await ops.query("INSERT INTO rms.unit VALUES($1,$2,'Khoa nghiên cứu')",[tenant,unit])
  const ids={}
  for(const [name,kind] of [["final-student","STUDENT"],["final-mentor","MENTOR"],["final-admin",null]]){
    ids[name]=await run(name,async(db,a)=>a.id)
    await ops.query("UPDATE rms.account SET unit_id=$1,user_type=$2 WHERE id=$3",[unit,kind?"user":"admin",ids[name]])
    if(kind)await ops.query("INSERT INTO rms.student_directory VALUES($1,$2,$3)",[tenant,ids[name],kind])
  }
  const [student,mentor,admin]=Object.keys(ids)
  const call={unitId:unit,starts:"2020-01-01",ends:"2099-12-31",min:1,max:5,code:"F10-FINAL",onApproval:"IN_PROGRESS",
    finalEvidence:[{code:"REPORT",label:"Tổng kết"},{code:"PRODUCT",label:"Sản phẩm"}],hourCategory:"STUDENT_SCIENCE",requireProgress:true,finalDue:"2099-02-01"}
  assert.deepEqual(parseCalls(JSON.stringify([call]))[0].finalEvidence,call.finalEvidence)
  for(const bad of [{hourCategory:" "},{requireMentorFinal:1},{finalEvidence:[call.finalEvidence[0],call.finalEvidence[0]]},{requireProgress:"on"},{finalDue:"2026-02-30"}]){
    assert.throws(()=>parseCalls(JSON.stringify([{...call,...bad}])),e=>e.getStatus?.()===409)
  }
  const start=async(id,policy)=>{
    await run(student,(db,a)=>registerStudent(db,a,id,{title:"Kết quả nhóm",call:call.code,mentorId:ids[mentor],members:[ids[student]]},[policy]))
    await run(mentor,(db,a)=>answerMentor(db,a,id,"accept",""))
    const submitted=await run(student,(db,a)=>submitStudent(db,a,id,[policy]))
    return run(admin,(db,a)=>decideStudent(db,a,id,{action:"approve",reason:"",revision:submitted.revision}))
  }
  let row=await start(project,call)
  const apply=(who,action,revision=row.revision,message="",id=project)=>run(who,(db,a)=>studentResult(db,a,id,{action,revision,message},true))
  const upload=async(code,round)=>{
    const store={form:async()=>({url:"",fields:{}}),promote:async()=>{}}
    const cmd={resourceVersion:round,filename:code+".pdf",mime:"application/pdf",size:50,sha256:"a".repeat(64),evidenceType:code}
    const file=await run(student,(db,a)=>issue(db,a,"student-project",project,cmd,{evidence:[]},store,tenant))
    return run(student,(db,a)=>finalizeEntry(db,a,"student-project",project,file.id,store,tenant))
  }
  const conflict=e=>e.getStatus?.()===409
  await assert.rejects(apply(mentor,"submit",row.revision,"Tổng kết"),e=>e.getStatus?.()===403)
  const report=await upload("REPORT",row.revision)
  const store={download:async(_school,id)=>({url:id})}
  assert.equal((await run(mentor,(db,a)=>downloadEntry(db,a,"student-project",project,report.id,store,tenant))).url,report.id)
  await assert.rejects(run("final-outsider",(db,a)=>downloadEntry(db,a,"student-project",project,report.id,store,tenant)),e=>e.getStatus?.()===404)
  await assert.rejects(apply(student,"submit",row.revision,"Tổng kết"),e=>conflict(e)&&e.message.includes("Sản phẩm"))
  await upload("PRODUCT",row.revision)
  assert.equal(row.dueDate,"2099-02-01")
  await assert.rejects(apply(student,"submit",row.revision,"Kết quả vòng đầu"),e=>conflict(e)&&e.message.includes("tiến độ"))
  const progress=(who,revision,note)=>run(who,(db,a)=>recordProgress(db,a,project,{revision,note}))
  await assert.rejects(progress(admin,row.revision,"Cập nhật thay"),e=>e.getStatus?.()===403)
  await assert.rejects(progress(student,row.revision," "),e=>e.getStatus?.()===400)
  const first=await progress(student,row.revision,"Đã thu số liệu")
  await assert.rejects(progress(mentor,row.revision,"Bản cũ"),conflict)
  row=await progress(mentor,first.revision,"Đã đối chiếu kết quả")
  assert.deepEqual([row.progressNote,row.progressBy],[ "Đã đối chiếu kết quả",ids[mentor]])
  assert.ok(row.progressAt)
  const notes=await run(admin,db=>db.query("SELECT actor_id,details FROM rms.audit_log WHERE target_id=$1 AND action='STUDENT_PROGRESS_RECORDED' ORDER BY occurred_at,id",[project]))
  assert.deepEqual(notes.rows.map(n=>[n.actor_id,n.details.previousNote,n.details.note]),[
    [ids[student],"","Đã thu số liệu"],[ids[mentor],"Đã thu số liệu","Đã đối chiếu kết quả"]])
  row=await apply(student,"submit",row.revision,"Kết quả vòng đầu")
  await assert.rejects(progress(mentor,row.revision,"Cập nhật muộn"),conflict)
  await assert.rejects(apply(admin,"pass"),conflict)
  await assert.rejects(upload("PRODUCT",row.revision),conflict)
  row=await apply(mentor,"revise",row.revision,"Sửa bảng số liệu")
  assert.equal(row.files.length,0)
  await assert.rejects(apply(student,"submit",row.revision,"Kết quả sửa"),conflict)
  await upload("REPORT",row.revision)
  await upload("PRODUCT",row.revision)
  row=await apply(student,"submit",row.revision,"Kết quả sửa")
  await ops.query("DELETE FROM rms.student_directory WHERE tenant_id=$1 AND account_id=$2",[tenant,ids[mentor]])
  await assert.rejects(apply(mentor,"endorse"),e=>e.getStatus?.()===403)
  await ops.query("INSERT INTO rms.student_directory VALUES($1,$2,'MENTOR')",[tenant,ids[mentor]])
  row=await apply(mentor,"endorse")
  await assert.rejects(apply(mentor,"pass"),e=>e.getStatus?.()===403)
  await assert.rejects(apply(admin,"pass",row.revision-1),conflict)
  row=await apply(admin,"pass")
  await run(admin,(db,a)=>publishFormula(db,a,{kind:"student-project",category:"STUDENT_SCIENCE",role:"MENTOR",periodType:"ACADEMIC_YEAR",from:"2020-01-01",to:"2099-12-31",hours:"8",version:"test"}))
  const closing=await Promise.allSettled([apply(admin,"close"),apply(admin,"close")])
  assert.equal(closing.filter(r=>r.status==="fulfilled").length,1)
  await run(admin,db=>enqueueStudentHours(db,project))
  const calendar=[{type:"ACADEMIC_YEAR",code:"F10",from:"2020-01-01",to:"2099-12-31"}]
  await processHours(worker,tenant,calendar)
  await processHours(worker,tenant,calendar)
  const ledger=await run(mentor,(db,a)=>personHours(db,a,a.id))
  assert.deepEqual(ledger.items.filter(x=>x.sourceId===project).map(x=>[x.title,x.role,x.share,x.adjusted]),[["Kết quả nhóm","MENTOR",100,"8.00"]])
  const audit=(await ops.query("SELECT details,actor_id FROM rms.audit_log WHERE tenant_id=$1 AND target_id=$2 AND action='STUDENT_PROJECT_ACCEPTED'",[tenant,project])).rows
  assert.equal(audit.length,1)
  assert.equal(audit[0].actor_id,ids[admin])
  assert.deepEqual([audit[0].details.from,audit[0].details.to,audit[0].details.round],["PASSED","COMPLETED",2])
  assert.equal(audit[0].details.files.length,2)
  const other=randomUUID()
  const fast=await start(other,{...call,finalEvidence:[],requireMentorFinal:false,requireProgress:false})
  const final=await apply(student,"submit",fast.revision,"Không cần hội đồng",other)
  await assert.rejects(apply(admin,"fail",final.revision,"",other),e=>e.getStatus?.()===400)
  const failed=await apply(admin,"fail",final.revision,"Thiếu kết quả",other)
  assert.equal(failed.status,"FAILED")
  await assert.rejects(apply(admin,"close",failed.revision,"",other),conflict)
  const reopen=(dueDate)=>run(admin,(db,a)=>studentResult(db,a,other,{action:"reopen",revision:failed.revision,message:"Nộp lại báo cáo",dueDate},true))
  await assert.rejects(reopen("2020-01-01"),e=>e.getStatus?.()===400)
  const retry=await reopen("2099-12-31")
  assert.equal(retry.finalRound,2)
  assert.equal(retry.acceptanceDate,null)
  assert.equal(retry.dueDate,"2099-12-31")
  await ops.query("UPDATE rms.student_project SET result_due_date='2020-01-01' WHERE id=$1",[other])
  await assert.rejects(apply(student,"submit",retry.revision,"Quá hạn",other),conflict)
  await run(admin,db=>enqueueStudentHours(db,other))
  assert.equal((await ops.query("SELECT id FROM rms.hour_request WHERE source_id=$1",[other])).rowCount,0)
  const disabled=randomUUID()
  const draft=await start(disabled,{...call,finalEvidence:[],requireMentorFinal:false,requireProgress:undefined,finalDue:undefined})
  assert.equal(draft.dueDate,null)
  const ready=await apply(student,"submit",draft.revision,"Hồ sơ không yêu cầu quy đổi",disabled)
  const passed=await apply(admin,"pass",ready.revision,"",disabled)
  const closed=await run(admin,(db,a)=>studentResult(db,a,disabled,{action:"close",revision:passed.revision,message:""},false))
  assert.equal(closed.hoursRequested,false)
  await run(admin,db=>enqueueStudentHours(db,disabled))
  assert.equal((await ops.query("SELECT id FROM rms.hour_request WHERE source_id=$1",[disabled])).rowCount,0)
  for(const due of ["2020-02-01",businessDay()]){
    const subjectId=randomUUID(),current=await start(subjectId,{...call,requireProgress:false,finalEvidence:[],finalDue:due})
    const sending=apply(student,"submit",current.revision,"Báo cáo đúng ngày",subjectId)
    if(due===businessDay())assert.equal((await sending).status,"FINAL_SUBMITTED")
    else await assert.rejects(sending,e=>conflict(e)&&e.message.includes("hết hạn nộp"))
  }
})
