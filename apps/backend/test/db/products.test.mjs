import { test,after } from "node:test"
import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { Pool } from "pg"
import { withTenant } from "../../dist/db/tenant-transaction.js"
import { resolveAccount } from "../../dist/modules/iam/account.js"
import {profileView} from "../../dist/modules/profile/export-profile/data.js"
import { listProducts,saveProduct,submitProduct,decideProduct,revokeProductEvidence } from "../../dist/modules/product/service.js"

const pool=new Pool({user:"rms_test_client"}),tenant="00000000-0000-4000-8000-"+String(27).padStart(12,"0")
after(()=>pool.end())
const as=(who,fn,t=tenant)=>withTenant(pool,t,async db=>fn(db,await resolveAccount(db,{subject:who,email:who+"@example.invalid"})))
const code=n=>e=>e.getStatus?.()===n
test("F07 rechecks the file, locks published fields and counts approvals once per committed type",async()=>{
  const project=randomUUID(),unit=randomUUID(),file=randomUUID(),revoked=randomUUID(),output=randomUUID()
  const pi=await as("scientist",async(db,a)=>{
    await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Khoa sản phẩm')",[unit])
    await db.query("UPDATE rms.account SET user_type='author',unit_id=$2 WHERE id=$1",[a.id,unit])
    await db.query("INSERT INTO rms.research_project(tenant_id,id,unit_id,title,owner_id,status_semantic) VALUES(rms.current_tenant(),$1,$2,'Sản phẩm nghiên cứu',$3,'IN_PROGRESS')",[project,unit,a.id])
    for(const f of [file,revoked])await db.query("INSERT INTO rms.attachment_intent(tenant_id,id,project_id,resource_version,uploader_id,filename,mime,size_bytes,sha256,expires_at,attached_at) VALUES(rms.current_tenant(),$1,$2,0,$3,'Nghien-cuu.pdf','application/pdf',5,repeat('a',64),now(),now())",[f,project,a.id])
    await db.query("INSERT INTO rms.project_assignment(tenant_id,project_id,reference,signed,effective,starts,ends,budget,note,commitments,file_id) VALUES(rms.current_tenant(),$1,'QĐ',current_date,current_date,'2025-01-01','2027-01-01',50000000,'',$2,$3)",[project,{ARTICLE:2,PATENT:1},file])
    return a.id
  })
  await as("officer",(db,a)=>db.query("UPDATE rms.account SET user_type='staff',unit_id=$2 WHERE id=$1",[a.id,unit]))
  const input={revision:0,title:"Đo mực nước",kind:"ARTICLE",year:2026,authors:[pi],publication:"Tạp chí thủy văn",files:[],distinct:false}
  const save=(data)=>as("scientist",(db,a)=>saveProduct(db,a,project,output,data))
  const submit=(revision,kinds=["ARTICLE","PATENT"])=>as("scientist",(db,a)=>submitProduct(db,a,project,output,{revision,distinct:false},kinds))
  await save(input)
  await assert.rejects(submit(1),code(400))
  await save({...input,files:[revoked],revision:1})
  await as("officer",(db,a)=>revokeProductEvidence(db,a,project,revoked,{reason:"Hết quyền sử dụng."}))
  await assert.rejects(submit(2),code(400))
  await save({...input,files:[file],revision:2})
  await assert.rejects(submit(3,["PATENT"]),code(400))
  await submit(3)
  const decision={action:"approve",revision:4,reason:""}
  await assert.rejects(as("scientist",(db,a)=>decideProduct(db,a,project,output,decision)),code(403))
  const approve=()=>as("officer",(db,a)=>decideProduct(db,a,project,output,decision,true))
  await Promise.all([approve(),approve()])
  const page=await as("scientist",(db,a)=>listProducts(db,a,project))
  assert.deepEqual(page.commitments.find(c=>c.kind==="ARTICLE"),{kind:"ARTICLE",required:2,approved:1,missing:1})
  assert.equal(page.items[0].status,"APPROVED")
  const credit=await as("scientist",db=>db.query("SELECT source_revision,recipient,role,share FROM rms.hour_request WHERE product_id=$1",[output]))
  assert.deepEqual(credit.rows,[{source_revision:5,recipient:pi,role:"CORRESPONDING_OR_FIRST",share:100}])
  await assert.rejects(save({...input,revision:5}),code(409))
  await assert.rejects(as("scientist",(db,a)=>listProducts(db,a,project),tenant.slice(0,-1)+"6"),code(404))
  const events=await as("scientist",db=>db.query("SELECT count(*)::int AS n FROM rms.audit_log WHERE action='PRODUCT_APPROVED' AND target_id=$1",[project]))
  assert.equal(events.rows[0].n,1)
  const map=randomUUID()
  await as("scientist",(db,a)=>saveProduct(db,a,project,map,{...input,title:"Bản đồ lưu vực",kind:"BASIN_MAP",files:[file]}))
  const submitMap=(types)=>as("scientist",(db,a)=>submitProduct(db,a,project,map,{revision:1,distinct:false},types))
  await assert.rejects(submitMap(["ARTICLE"]),code(400))
  const pending=await submitMap(["BASIN_MAP"])
  assert.equal(pending.items.find(item=>item.id===map).status,"PENDING_APPROVAL")
  await as("officer",(db,a)=>decideProduct(db,a,project,map,{action:"approve",reason:"",revision:2},false))
  assert.equal((await as("officer",db=>db.query("SELECT id FROM rms.hour_request WHERE product_id=$1",[map]))).rowCount,0)
  await as("officer",(db,a)=>decideProduct(db,a,project,output,{action:"reopen",reason:"Đính chính tạp chí",revision:5},false))
  const revokedCredit=await as("officer",db=>db.query("SELECT revoked_at IS NOT NULL AND processed_at IS NOT NULL AS ended FROM rms.hour_request WHERE product_id=$1",[output]))
  assert.equal(revokedCredit.rows[0].ended,true)

  const behalf=randomUUID()
  await as("officer",(db,a)=>saveProduct(db,a,project,behalf,{...input,title:"Công bố nhập hộ",files:[file]}))
  await as("officer",(db,a)=>submitProduct(db,a,project,behalf,{revision:1,distinct:false},["ARTICLE"]))
  const confirm={action:"approve",reason:"",revision:2}
  await assert.rejects(as("officer",(db,a)=>decideProduct(db,a,project,behalf,confirm)),code(403))
  await as("second-officer",(db,a)=>db.query("UPDATE rms.account SET user_type='staff',unit_id=$2 WHERE id=$1",[a.id,unit]))
  await as("second-officer",(db,a)=>decideProduct(db,a,project,behalf,confirm))
  const officerCV=await as("officer",(db,a)=>profileView(db,a,a.id))
  assert.equal(officerCV.outputs.some(item=>item.id===behalf),false)

})
