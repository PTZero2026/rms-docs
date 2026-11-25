import { CreateBucketCommand,DeleteBucketCommand,ListObjectsV2Command,DeleteObjectCommand } from "@aws-sdk/client-s3"
import { basename } from "node:path"
import { AttachmentStore } from "../../dist/modules/attachments/store.js"

if(process.env.RMS_S3_ENDPOINT!=="http://127.0.0.1:8333" || !/^\/tmp\/rms-pg\.[a-zA-Z0-9]+$/.test(process.env.PGHOST??""))
  throw Error("Requires disposable loopback store and PostgreSQL fixture")
const bucket="rms-e2e-"+basename(process.env.PGHOST).replace("rms-pg.","").toLowerCase()
const store=new AttachmentStore(bucket)
try{
  if(process.argv[2]==="create"){
    await store.client.send(new CreateBucketCommand({Bucket:bucket}))
    process.stdout.write(bucket)
  }else if(process.argv[2]==="cleanup" && bucket===process.env.RMS_BROWSER_FIXTURE_BUCKET){
    const list=await store.client.send(new ListObjectsV2Command({Bucket:bucket}))
    for(const f of list.Contents??[])await store.client.send(new DeleteObjectCommand({Bucket:bucket,Key:f.Key}))
    await store.client.send(new DeleteBucketCommand({Bucket:bucket}))
  }else throw Error("Unrecognized bucket operation")
}finally{store.client.destroy()}
