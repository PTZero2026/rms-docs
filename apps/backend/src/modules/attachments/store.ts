import { BadRequestException, ConflictException, ServiceUnavailableException } from "@nestjs/common"
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { createPresignedPost } from "@aws-sdk/s3-presigned-post"
import { createHash } from "node:crypto"
import { Readable } from "node:stream"
import { fileTypeFromBuffer } from "file-type"

export const maxSize=20*1024*1024
export const supported:Record<string,string> = {
  "application/pdf":"pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":"docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":"xlsx",
  "image/png":"png","image/jpeg":"jpg",
}
export class AttachmentStore {
  readonly client = new S3Client({ region:process.env.AWS_REGION??"us-east-1",endpoint:process.env.RMS_S3_ENDPOINT,
    forcePathStyle:!!process.env.RMS_S3_ENDPOINT,maxAttempts:2 })
  constructor(readonly bucket:string) { if (!bucket) throw new ServiceUnavailableException("Kho tệp chưa được cấu hình.") }
  form(tenant:string,id:string,mime:string,size:number) {
    return createPresignedPost(this.client,{Bucket:this.bucket,Key:"quarantine/"+tenant+"/"+id,Expires:300,
      Fields:{"Content-Type":mime}, Conditions:[["content-length-range",size,size],["eq","$Content-Type",mime]]})
  }
  async promote(tenant:string,id:string,size:number,mime:string,sha256:string) {
    const source=await this.client.send(new GetObjectCommand({Bucket:this.bucket,Key:"quarantine/"+tenant+"/"+id})).catch(err=>{
      if (err.$metadata?.httpStatusCode===404) throw new ConflictException("Tệp chưa được tải lên.")
      throw err
    })
    const body=source.Body as Readable
    try {
      if (!body || source.ContentLength!==size || source.ContentType!==mime || size>maxSize) throw new BadRequestException("Kích thước hoặc loại tệp không khớp.")
      const chunks:Buffer[]=[]
      let total=0
      for await(const chunk of body) {
        const bytes=Buffer.from(chunk)
        total+=bytes.length
        if (total>size) throw new BadRequestException("Tệp vượt giới hạn.")
        chunks.push(bytes)
      }
      const bytes=Buffer.concat(chunks)
      if(total!==size || createHash("sha256").update(bytes).digest("hex")!==sha256) throw new BadRequestException("Checksum của tệp không khớp.")
      const detected=await fileTypeFromBuffer(bytes).catch(()=>undefined)
      if(detected?.mime!==mime) throw new BadRequestException("Nội dung không khớp định dạng đã khai.")
      // Write the same verified bytes to a different private key. A subsequent
      // POST to the staging URL cannot replace the attached file.
      await this.client.send(new PutObjectCommand({Bucket:this.bucket,Key:"files/"+tenant+"/"+id,Body:bytes,ContentType:mime,Metadata:{sha256}}))
    } finally { body?.destroy() }
  }
  async download(tenant:string,id:string,filename:string) {
    return {ttlSeconds:60,url:await getSignedUrl(this.client,new GetObjectCommand({Bucket:this.bucket,Key:"files/"+tenant+"/"+id,
      ResponseContentDisposition:"attachment; filename*=UTF-8''"+encodeURIComponent(filename).replace(/['()*]/g,c=>"%"+c.charCodeAt(0).toString(16)),
    }),{expiresIn:60})}
  }
  async remove(key:string) { await this.client.send(new DeleteObjectCommand({Bucket:this.bucket,Key:key})) }
}
