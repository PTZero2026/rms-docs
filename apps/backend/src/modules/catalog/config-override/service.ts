import { BadRequestException,HttpException,Injectable,PayloadTooLargeException,ServiceUnavailableException } from "@nestjs/common"
import { createRmsClient,type operations } from "@rms/api-contracts"
import { IamService } from "../../iam/iam.module.js"
type Input=operations["createCatalogValue"]["requestBody"]["content"]["application/json"]
const limit=64*1024

@Injectable()
export class CatalogAdapter {
  constructor(private iam:IamService){}
  private async client(slug:string,key:string,token:string|undefined) {
    await this.iam.authorized(slug,token,async()=>true)
    if (!/^[A-Za-z0-9._-]{1,128}$/.test(key)) throw new BadRequestException()
    const origin=process.env.RMS_CONFIG_ORIGIN
    if (!origin) throw new ServiceUnavailableException()
    const url=new URL(origin)
    if(url.protocol!=="https:" && !(url.protocol==="http:" && ["127.0.0.1","localhost","[::1]"].includes(url.hostname)))throw new ServiceUnavailableException()
    const api=createRmsClient(url.origin)
    const options={params:{path:{slug,key}},headers:{authorization:token!},redirect:"error" as const,signal:AbortSignal.timeout(5000)}
    return {api,options}
  }
  private upstream(response:Response) {
    if (!response.ok) throw new HttpException("Không thể truy cập cấu hình.",[400,401,403,404,409,413].includes(response.status)?response.status:503)
  }
  async read(slug:string,key:string,token:string|undefined):Promise<operations["getCatalogValue"]["responses"][200]["content"]["application/json"]> {
    const {api,options}=await this.client(slug,key,token)
    const {data,response}=await api.GET("/api/tenants/{slug}/catalog/configurations/{key}",{...options,parseAs:"stream"})
    this.upstream(response)
    if (!data)throw new ServiceUnavailableException()
    const reader=data.getReader(),chunks:Uint8Array[]=[]
    let total=0
    try {
      while(true) {
        const {done,value}=await reader.read()
        if(done)break
        total+=value.length
        if(total>limit) {await reader.cancel();throw new PayloadTooLargeException()}
        chunks.push(value)
      }
    } finally {reader.releaseLock()}
    return {content:Buffer.concat(chunks).toString("base64"),mime:response.headers.get("content-type")??"application/octet-stream",
      scope:response.headers.get("x-rms-scope")==="shared"?"shared":"tenant",cache:response.headers.get("x-cache")==="HIT"?"HIT":"MISS"}
  }
  async optionalText(slug:string,key:string,token:string|undefined):Promise<string|null> {
    try{return Buffer.from((await this.read(slug,key,token)).content,"base64").toString().trim()}
    catch(e){if(e instanceof HttpException&&e.getStatus()===404)return null;throw e}
  }
  async write(slug:string,key:string,token:string|undefined,body:Input,create:boolean) {
    const {api,options}=await this.client(slug,key,token)
    if (!body || (body.key && body.key.toLowerCase()!==key.toLowerCase()))throw new BadRequestException()
    if(body.content && (typeof body.content!=="string" || Buffer.byteLength(body.content,"base64")>limit))throw new PayloadTooLargeException()
    const result=create?await api.POST("/api/tenants/{slug}/catalog/configurations",{...options,body:{...body,key}}):
      await api.PUT("/api/tenants/{slug}/catalog/configurations/{key}",{...options,body})
    this.upstream(result.response)
    return result.data
  }
}
