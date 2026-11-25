import test,{after} from "node:test"
import assert from "node:assert/strict"
import { createHash,randomUUID } from "node:crypto"
import { Pool } from "pg"
import { CreateBucketCommand,DeleteBucketCommand,ListObjectsV2Command,DeleteObjectCommand } from "@aws-sdk/client-s3"
import { withTenant } from "../../dist/db/tenant-transaction.js"
import { resolveAccount } from "../../dist/modules/iam/account.js"
import { AttachmentStore } from "../../dist/modules/attachments/store.js"
import { issueIntent,finalize,download,cleanExpired } from "../../dist/modules/attachments/service.js"

const pool=new Pool({user:"rms_test_client"});after(()=>pool.end())
test("signed upload, finalize, duplicate, content rejection, revocation and orphan collection",{
  skip:process.env.RMS_S3_ENDPOINT!=="http://127.0.0.1:8333" && "Requires disposable loopback object store",
},async t=>{
  const bucket="rms-test-"+randomUUID()
  const store=new AttachmentStore(bucket)
  await store.client.send(new CreateBucketCommand({Bucket:bucket}))
  t.after(async()=>{
    const {Contents=[]}=await store.client.send(new ListObjectsV2Command({Bucket:bucket}))
    for(const o of Contents) await store.client.send(new DeleteObjectCommand({Bucket:bucket,Key:o.Key}))
    await store.client.send(new DeleteBucketCommand({Bucket:bucket}));store.client.destroy()
  })
  const tenant="00000000-0000-4000-8000-"+"8".padStart(12,"0")
  const unit=randomUUID(),project=randomUUID()
  const reach=(subject,fn)=>withTenant(pool,tenant,async db=>fn(db,await resolveAccount(db,{subject,email:subject+"@example.invalid"})))
  await reach("files",async(db,a)=>{
    await db.query("insert into rms.unit values(rms.current_tenant(),$1,'QA')",[unit])
    await db.query("update rms.account set user_type='author',unit_id=$1 where id=$2",[unit,a.id])
    await db.query("insert into rms.research_project(tenant_id,id,title,unit_id,owner_id) values(rms.current_tenant(),$1,'Tệp kiểm thử',$2,$3)",[project,unit,a.id])
  })
  const bytes=Buffer.from("%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF\n")
  const input={filename:"minh-chung.pdf",mime:"application/pdf",size:bytes.length,sha256:createHash("sha256").update(bytes).digest("hex"),resourceVersion:0}
  const issue=(over={})=>reach("files",(db,a)=>issueIntent(db,a,store,project,{...input,...over}))
  const upload=async(i,bytes)=>{
    const form=new FormData()
    for(const [k,v] of Object.entries(i.fields))form.set(k,v)
    form.set("file",new Blob([bytes],{type:input.mime}),"minh-chung.pdf")
    const r=await fetch(i.url,{method:"POST",body:form});assert.ok(r.ok,"upload status "+r.status)
  }
  await assert.rejects(issue({size:24*1024*1024}),e=>e.getStatus()===400)
  const first=await issue();await upload(first,bytes)
  await assert.rejects(reach("other",(db,a)=>finalize(db,a,store,project,first.id)),e=>[403,404].includes(e.getStatus()))
  const accept=id=>reach("files",(db,a)=>finalize(db,a,store,project,id))
  assert.equal((await accept(first.id)).id,first.id);assert.equal((await accept(first.id)).id,first.id)
  const url=await reach("files",(db,a)=>download(db,a,store,project,first.id))
  assert.deepEqual(Buffer.from(await (await fetch(url.url)).arrayBuffer()),bytes)
  const wrong=Buffer.alloc(bytes.length,65)
  const bad=await issue({sha256:createHash("sha256").update(wrong).digest("hex")});await upload(bad,wrong)
  await assert.rejects(accept(bad.id),e=>e.getStatus()===400)
  const altered=await issue();await upload(altered,wrong);await assert.rejects(accept(altered.id),e=>e.getStatus()===400)
  await reach("files",async db=>{
    await db.query("UPDATE rms.research_project SET owner_id=NULL WHERE id=$1",[project])
  })
  await assert.rejects(reach("files",(db,a)=>download(db,a,store,project,first.id)),e=>e.getStatus()===404)
  const ops=new Pool()
  try{await ops.query("update rms.attachment_intent set expires_at=now()-interval '1 second' where tenant_id=$1",[tenant])}finally{await ops.end()}
  await withTenant(pool,tenant,db=>cleanExpired(db,store))
  const {Contents=[]}=await store.client.send(new ListObjectsV2Command({Bucket:bucket}))
  assert.equal(Contents.length,1)
  assert.equal(Contents[0].Key,"files/"+tenant+"/"+first.id)
})
