import { test,after } from "node:test"
import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { Pool } from "pg"
import { withTenant } from "../../dist/db/tenant-transaction.js"
import { resolveAccount } from "../../dist/modules/iam/account.js"
import { profileView,exportProfile,downloadProfile } from "../../dist/modules/profile/export-profile/service.js"

const pool=new Pool({user:"rms_test_client"}),tenant="00000000-0000-4000-8000-"+String(29).padStart(12,"0")
after(()=>pool.end())
const as=(who,fn,t=tenant)=>withTenant(pool,t,async db=>fn(db,await resolveAccount(db,{subject:who,email:who+"@example.invalid"})))
test("a CV uses approved unique outputs, the exact current template and current scope on re-download",async()=>{
  const unit=randomUUID(),p=randomUUID()
  const owner=await as("researcher",async(db,a)=>{
    await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Khoa Công trình')",[unit])
    await db.query("UPDATE rms.account SET full_name='Lê Thanh Mai',unit_id=$2,user_type='author' WHERE id=$1",[a.id,unit])
    await db.query("INSERT INTO rms.research_project(tenant_id,id,unit_id,title,owner_id) VALUES(rms.current_tenant(),$1,$2,'Đo nước',$3)",[p,unit,a.id])
    await db.query("INSERT INTO rms.project_member VALUES(rms.current_tenant(),$1,$2,true)",[p,a.id])
    for(const [title,status] of [["Bài đã duyệt","APPROVED"],["Bài chờ","PENDING_APPROVAL"]])
      await db.query("INSERT INTO rms.research_output(tenant_id,project_id,id,owner_id,unit_id,title,normalized_title,kind,publication_year,publication,authors,status) VALUES(rms.current_tenant(),$1,$2,$3,$4,$5,$5,'ARTICLE',2026,'Tạp chí',ARRAY[$3::uuid],$6)",[p,randomUUID(),a.id,unit,title,status])
    return a.id
  })
  const cv=await as("researcher",(db,a)=>profileView(db,a,owner))
  assert.deepEqual(cv.outputs.map(o=>o.title),["Bài đã duyệt"]);assert.equal(cv.projects.length,1)
  const tpl={code:"CV-01",version:"v1",title:"Lý lịch nghiên cứu"}
  const first=await as("researcher",(db,a)=>exportProfile(db,a,owner,tpl))
  const second=await as("researcher",(db,a)=>exportProfile(db,a,owner,{...tpl,version:"v2",title:"Lý lịch khoa học cấp trường"}))
  const bytes=await as("researcher",(db,a)=>downloadProfile(db,a,owner,first.id))
  assert.equal(bytes.subarray(0,5).toString(),"%PDF-")
  await assert.rejects(as("researcher",(db,a)=>exportProfile(db,a,owner,{...tpl,title:"Đổi tên cùng phiên bản"})),e=>e.getStatus()===409)
  await assert.rejects(as("outsider",(db,a)=>downloadProfile(db,a,owner,first.id)),e=>e.getStatus()===404)
  await assert.rejects(as("researcher",(db,a)=>profileView(db,a,owner),tenant.slice(0,-1)+"8"),e=>e.getStatus()===404)
  const audits=await as("researcher",db=>db.query("SELECT details->>'version' AS version FROM rms.audit_log WHERE action='EXPORT_CV' ORDER BY occurred_at"))
  assert.deepEqual(audits.rows.map(x=>x.version),["v1","v2"])
  assert.notEqual(first.id,second.id)
  const settings = (await import("../../dist/modules/profile/professional/service.js")).profileSettings
  await assert.rejects(as("researcher",(db,a)=>downloadProfile(db,a,owner,first.id,false,settings('{"fields":{"phone":"hidden"}}'))),e=>e.getStatus()===404)
  await as("faculty-officer",async(db,a)=>{
    await db.query("UPDATE rms.account SET user_type='staff', unit_id=$2 WHERE id=$1",[a.id,unit])
  })
  const officerCopy=await as("faculty-officer",(db,a)=>exportProfile(db,a,owner,tpl))
  await as("researcher",async db=>{
    const next=randomUUID()
    await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Khoa mới')",[next])
    await db.query("UPDATE rms.research_project SET unit_id=$1 WHERE id=$2",[next,p])
  })
  await assert.rejects(as("faculty-officer",(db,a)=>downloadProfile(db,a,owner,officerCopy.id)),e=>e.getStatus()===404)
})
