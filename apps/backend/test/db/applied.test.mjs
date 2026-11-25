import {test,after} from "node:test"
import assert from "node:assert/strict"
import {randomUUID} from "node:crypto"
import {Pool} from "pg"
import {withTenant} from "../../dist/db/tenant-transaction.js"
import {resolveAccount} from "../../dist/modules/iam/account.js"
import {listApplied,saveApplied,submitApplied} from "../../dist/modules/applied-project/register-applied-project/service.js"
import {readPartnerDirectory} from "../../dist/modules/applied-project/register-applied-project/partners.js"
const pool=new Pool({user:"rms_test_client"}),tenant="00000000-0000-4000-8000-000000000030"
after(()=>pool.end())
const run=(fn,other=false)=>withTenant(pool,other?tenant.slice(0,-2)+"29":tenant,async db=>fn(db,await resolveAccount(db,{subject:"author",email:"f11@example.invalid"})))
test("F11 keeps its VND total and outside partners on the same draft across a blocked submission",async()=>{
  const id=randomUUID(),unitId=randomUUID()
  const cmd={title:"Chuyển giao mô hình",unitId,partners:[],amount:"50000000",revision:0}
  await run(async(db,a)=>{
    await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Viện môi trường')",[unitId])
    await db.query("UPDATE rms.account SET unit_id=$1,user_type='author' WHERE id=$2",[unitId,a.id])
  })
  await assert.rejects(run((db,a)=>saveApplied(db,a,id,{...cmd,unitId:""})),e=>e.getStatus()===400)
  const first=await run((db,a)=>saveApplied(db,a,id,cmd));assert.equal(first.amount,"50000000")
  await assert.rejects(run((db,a)=>submitApplied(db,a,id,1)),e=>e.getStatus()===400)
  const after=await run((db,a)=>listApplied(db,a));assert.equal(after.items[0].status,"DRAFT")
  const directory=[{code:"WATER",label:"Doanh nghiệp nước sạch"}]
  assert.deepEqual(readPartnerDirectory(JSON.stringify(directory)),directory)
  assert.throws(()=>readPartnerDirectory(JSON.stringify([...directory,...directory])),e=>e.getStatus?.()===409)
  await assert.rejects(run((db,a)=>saveApplied(db,a,id,{...cmd,revision:1,partnerCodes:["OTHER"]},undefined,directory)),e=>e.getStatus?.()===400)
  const selected=await run((db,a)=>saveApplied(db,a,id,{...cmd,revision:1,partners:["  doanh nghiệp NƯỚC sạch ","Đối tác nháp"],partnerCodes:["WATER"]},undefined,directory))
  assert.deepEqual(selected.partners,["Doanh nghiệp nước sạch","Đối tác nháp"])
  assert.deepEqual(selected.directoryPartners,directory)
  const legacy=await run((db,a)=>saveApplied(db,a,id,{...cmd,revision:selected.revision,partners:selected.partners}))
  assert.deepEqual(legacy.directoryPartners,directory)
  assert.equal((await run((db,a)=>submitApplied(db,a,id,legacy.revision))).status,"PENDING")
  await assert.rejects(run((db,a)=>submitApplied(db,a,id,2),true),e=>e.getStatus()===404)
  assert.equal((await run(db=>db.query("SELECT count(*)::int AS n FROM rms.budget_expense"))).rows[0].n,0)
})

test("F11 approval requires current category evidence and a separate scoped reviewer",async()=>{
  const {decideApplied}=await import("../../dist/modules/applied-project/register-applied-project/service.js")
  const rules={types:[{code:"SERVICE",label:"Dịch vụ",required:["CONTRACT"]}],evidence:[{code:"CONTRACT",label:"Hợp đồng"}],bodies:[]}
  const id=randomUUID(),unit=randomUUID()
  const reviewer=(fn)=>withTenant(pool,tenant,async db=>fn(db,await resolveAccount(db,{subject:"f11-desk",email:"f11-desk@example.invalid"})))
  const owner=await run(async(db,a)=>{
    await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Viện')",[unit])
    await db.query("UPDATE rms.account SET unit_id=$1 WHERE id=$2",[unit,a.id]);return a.id
  })
  await reviewer((db,a)=>db.query("UPDATE rms.account SET unit_id=$1,user_type='staff' WHERE id=$2",[unit,a.id]))
  await run((db,a)=>saveApplied(db,a,id,{revision:0,unitId:unit,title:"Dịch vụ đo lưu lượng",partners:["A"],amount:"10",category:"SERVICE"},rules))
  await run((db,a)=>submitApplied(db,a,id,1))
  const decide=(action,revision,reason="")=>reviewer((db,a)=>decideApplied(db,a,id,{action,revision,reason},rules))
  await assert.rejects(decide("approve",2),e=>e.getStatus?.()===400&&e.message.includes("CONTRACT"))
  await assert.rejects(decide("return",2," "),e=>e.getStatus?.()===400)
  assert.equal((await decide("return",2,"Bổ sung hợp đồng")).reason,"Bổ sung hợp đồng")
  await run(db=>db.query(`INSERT INTO rms.attachment_intent(tenant_id,applied_id,evidence_type,resource_version,uploader_id,filename,mime,size_bytes,sha256,expires_at,attached_at)
    VALUES(rms.current_tenant(),$1,'CONTRACT',3,$2,'contract.pdf','application/pdf',50,repeat('0',64),now(),now())`,[id,owner]))
  await run((db,a)=>submitApplied(db,a,id,3))
  await assert.rejects(run((db,a)=>decideApplied(db,a,id,{action:"approve",revision:4,reason:""},rules)),e=>e.getStatus?.()===403)
  assert.equal((await decide("approve",4)).status,"APPROVED")
  assert.equal((await decide("revoke",5,"Quyết định điều chỉnh")).status,"DRAFT")
  await assert.rejects(decide("revoke",5,"Quyết định điều chỉnh"),e=>e.getStatus?.()===409)
  assert.equal((await run(db=>db.query("SELECT count(*)::int AS n FROM rms.audit_log WHERE target_id=$1 AND action IN ('APPLIED_PROJECT_APPROVED','APPLIED_PROJECT_RETURNED','APPLIED_PROJECT_REVOKED')",[id]))).rows[0].n,3)
})
