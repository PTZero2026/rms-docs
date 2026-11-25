import { randomUUID } from "node:crypto"
import { test,after } from "node:test"
import assert from "node:assert/strict"
import { Pool } from "pg"
import { withTenant } from "../../dist/db/tenant-transaction.js"
import { resolveAccount } from "../../dist/modules/iam/account.js"
import { createReport,readReport,exportReport } from "../../dist/modules/report/call-report/service.js"
const pool=new Pool({user:"rms_test_client"}),provisioner=new Pool()
after(()=>Promise.all([pool.end(),provisioner.end()]))
const tenant=n=>"00000000-0000-4000-8000-"+String(n).padStart(12,"0")
const as=(who,fn,n=19)=>withTenant(pool,tenant(n),async db=>fn(db,await resolveAccount(db,{subject:who,email:who+"@example.invalid"})))
test("report snapshots count issued codes once, keep captured state and reject a narrowed source scope",async()=>{
  const [a,b,call]=Array.from({length:3},()=>randomUUID())
  const lead=await as("lead",async(db,user)=>{
    for(const [id,label] of [[a,"Khoa A"],[b,"Khoa B"]])await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,$2)",[id,label])
    await db.query("UPDATE rms.account SET user_type='staff',unit_id=$2 WHERE id=$1",[user.id,a])
    await db.query("INSERT INTO rms.proposal_call(tenant_id,id,code,name,start_date,end_date) VALUES(rms.current_tenant(),$1,'BC-13','Kỳ báo cáo','2026-11-01','2026-11-30')",[call])
    for(const [unit,code,state] of [[a,"A1","SUBMITTED"],[a,"A2","DRAFT"],[b,"B1","SUBMITTED"],[a,null,"DRAFT"]]){
      await db.query("INSERT INTO rms.research_project(tenant_id,id,unit_id,call_id,project_code,title,status_semantic) VALUES(rms.current_tenant(),$1,$2,$3,$4,$5,$6)",[randomUUID(),unit,call,code,"=Nguồn mẫu",state])
    }
    return user.id
  })
  await provisioner.query("INSERT INTO rms.report_unit_grant VALUES($1,$2,$3)",[tenant(19),lead,b])
  await as("staff",async(db,u)=>db.query("UPDATE rms.account SET user_type='staff',unit_id=$2 WHERE id=$1",[u.id,a]))
  const old=await as("lead",(db,u)=>createReport(db,u,{callId:call}))
  assert.equal(old.total,3);assert.deepEqual(old.groups,{DRAFT:1,SUBMITTED:2})
  await as("lead",db=>db.query("UPDATE rms.research_project SET status_semantic='SUBMITTED' WHERE project_code='A2'"))
  assert.deepEqual(await as("lead",(db,u)=>readReport(db,u,old.id)),old)
  const csv=await as("lead",(db,u)=>exportReport(db,u,old.id))
  assert.match(csv,/A2/);assert.match(csv,/DRAFT/);assert.match(csv,/'=Nguồn mẫu/);assert.ok(csv.includes(old.capturedAt))
  assert.ok(csv.includes('"Mã bản chụp","'+old.id+'"'),"CSV identifies the exact snapshot")
  assert.ok(csv.includes('"Trạng thái chuẩn","Số hồ sơ"'))
  assert.ok(csv.includes('"DRAFT","1"')&&csv.includes('"SUBMITTED","2"'))
  assert.equal(old.callId,call)
  for(const row of old.rows)assert.ok(csv.includes('"'+row.id+'"'),"Project identifier on each detail row")
  const secondCsv=await as("lead",(db,u)=>exportReport(db,u,old.id))
  assert.equal(secondCsv,csv)
  const fresh=await as("lead",(db,u)=>createReport(db,u,{callId:call}))
  assert.deepEqual(fresh.groups,{SUBMITTED:3})
  const scoped=await as("staff",(db,u)=>createReport(db,u,{callId:call}))
  assert.equal(scoped.total,2);assert.ok(scoped.rows.every(r=>r.unitId===a))
  const scopedCsv=await as("staff",(db,u)=>exportReport(db,u,scoped.id))
  assert.ok(scopedCsv.includes('"SUBMITTED","2"'))
  assert.ok(!scopedCsv.includes('"B1"')&&!scopedCsv.includes(old.rows.find(r=>r.unitId===b).id))
  const emptyId=randomUUID()
  await as("staff",db=>db.query("INSERT INTO rms.proposal_call(tenant_id,id,code,name,start_date,end_date) VALUES(rms.current_tenant(),$1,'BC-13-EMPTY','Kỳ trống','2026-11-01','2026-11-30')",[emptyId]))
  const empty=await as("staff",(db,u)=>createReport(db,u,{callId:emptyId,unitId:a}))
  assert.equal(empty.total,0)
  assert.deepEqual(empty.groups,{})
  assert.deepEqual(empty.unitIds,[a])
  const emptyCsv=await as("staff",(db,u)=>exportReport(db,u,empty.id))
  assert.ok(emptyCsv.includes('"Tổng số","0"'))
  assert.ok(emptyCsv.includes(empty.capturedAt)&&emptyCsv.includes(empty.id))
  assert.equal(emptyCsv.trimEnd().split("\r\n").at(-1),'"Mã đề tài","Tên đề tài","Đơn vị","Trạng thái chuẩn","Định danh đề tài"')
  await assert.rejects(as("staff",(db,u)=>createReport(db,u,{callId:call,unitId:b})),e=>e.getStatus()===403)
  await assert.rejects(as("staff",(db,u)=>exportReport(db,u,old.id)),e=>e.getStatus()===404)
  await assert.rejects(as("lead",(db,u)=>readReport(db,{...u,userType:"staff",permissions:["reports.view"]},old.id),20),e=>e.getStatus()===404)
  await as("lead",db=>db.query("UPDATE rms.account SET unit_id=NULL WHERE id=$1",[lead]))
  await assert.rejects(as("lead",(db,u)=>exportReport(db,u,old.id)),e=>e.getStatus()===409)
})
