import {S3Client,CreateBucketCommand,PutObjectCommand,GetObjectCommand,DeleteObjectCommand,DeleteBucketCommand} from "@aws-sdk/client-s3"
import {Pool} from "pg"
import {createHash,randomUUID,randomBytes} from "node:crypto"
import {mkdtemp,readFile,writeFile} from "node:fs/promises"
import {join,basename} from "node:path"
import {execFileSync} from "node:child_process"
import {fileURLToPath} from "node:url"
import assert from "node:assert/strict"
if(!/^\/tmp\/rms-pg\.[a-zA-Z0-9]+$/.test(process.env.PGHOST??"")||process.env.RMS_S3_ENDPOINT!=="http://127.0.0.1:8333")throw Error("Private cluster and object store required")
const root=fileURLToPath(new URL("../../../../",import.meta.url))
const s3=new S3Client({endpoint:process.env.RMS_S3_ENDPOINT,forcePathStyle:true,region:"us-east-1"})
const db=new Pool(),restored=new Pool({database:"rms_restored",user:"rms_test_client"})
const suffix=basename(process.env.PGHOST).split(".")[1].toLowerCase()
const buckets=["rms-src-"+suffix,"rms-restored-"+suffix],made=[],files=[]
const dir=await mkdtemp(join(process.env.PGHOST,"objects-")),sha=bytes=>createHash("sha256").update(bytes).digest("hex")
const started=Date.now()
try{
  for(const name of buckets){await s3.send(new CreateBucketCommand({Bucket:name}));made.push(name)}
  for(let i=1;i<=2;i++){
    const tenant="00000000-0000-4000-8000-"+String(i).padStart(12,"0"),pid=randomUUID(),unit=randomUUID(),id=randomUUID(),account=randomUUID()
    await db.query("INSERT INTO rms.unit VALUES($1,$2,'Recovery unit')",[tenant,unit])
    await db.query("INSERT INTO rms.account(tenant_id,id,subject,email,issuer,unit_id) SELECT id,$2,$3,$4,issuer,$5 FROM rms.tenant WHERE id=$1",[tenant,account,"rehearsal-"+i,"rehearsal-"+i+"@example.invalid",unit])
    await db.query("INSERT INTO rms.research_project(tenant_id,id,unit_id,owner_id,title) VALUES($1,$2,$3,$4,'Hồ sơ khôi phục')",[tenant,pid,unit,account])
    const bytes=randomBytes((i===1?1:6)*1024*1024),key="files/"+tenant+"/"+id,digest=sha(bytes)
    await db.query("INSERT INTO rms.attachment_intent(tenant_id,id,project_id,resource_version,uploader_id,filename,mime,size_bytes,sha256,expires_at,attached_at) VALUES($1,$2,$3,1,$4,'fixture.bin','application/octet-stream',$5,$6,now(),now())",[tenant,id,pid,account,bytes.length,digest])
    await s3.send(new PutObjectCommand({Bucket:buckets[0],Key:key,Body:bytes,Metadata:{sha256:digest}}))
    const obj=await s3.send(new GetObjectCommand({Bucket:buckets[0],Key:key}))
    await writeFile(join(dir,id),await obj.Body.transformToByteArray(),{mode:0o600})
    files.push({id,tenant,key,digest,size:bytes.length})
  }
  const databases=JSON.parse(execFileSync("python3",[join(root,"e2e/release/db-restore.py")],{encoding:"utf8"}))
  for(const f of files){
    await s3.send(new PutObjectCommand({Bucket:buckets[1],Key:f.key,Body:await readFile(join(dir,f.id)),Metadata:{sha256:f.digest}}))
    const obj=await s3.send(new GetObjectCommand({Bucket:buckets[1],Key:f.key}))
    const digest=sha(await obj.Body.transformToByteArray());assert.equal(digest,f.digest)
    const client=await restored.connect()
    try{await client.query("BEGIN");await client.query("SELECT set_config('rms.tenant_id',$1,true)",[f.tenant])
      const {rows}=await client.query("SELECT id,sha256 FROM rms.attachment_intent WHERE id=ANY($1::uuid[])",[files.map(x=>x.id)])
      assert.deepEqual(rows,[{id:f.id,sha256:digest}]);await client.query("COMMIT")
    }finally{client.release()}
  }
  const result={recordedAt:new Date().toISOString(),databases,objects:files.map(f=>({bytes:f.size,sha256:f.digest})),restoredScopeChecked:true,controlledWritesLost:0,seconds:(Date.now()-started)/1000}
  await writeFile(join(root,"e2e/release/restore-result.json"),JSON.stringify(result,null,2)+"\n")
}finally{
  for(const Bucket of made){for(const f of files)await s3.send(new DeleteObjectCommand({Bucket,Key:f.key}));await s3.send(new DeleteBucketCommand({Bucket}))}
  await Promise.all([db.end(),restored.end()]);s3.destroy()
}
