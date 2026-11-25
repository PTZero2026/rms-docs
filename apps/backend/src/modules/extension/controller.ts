import {enqueueApproved} from "../teaching-hour/teaching-hours/service.js"
import {Body,Controller,Get,Header,Headers,HttpCode,Module,Param,ParseUUIDPipe,Post,Put} from "@nestjs/common"
import {IamModule,IamService} from "../iam/iam.module.js"
import {CatalogModule} from "../catalog/config-override/controller.js"
import {CatalogAdapter} from "../catalog/config-override/service.js"
import {requireExtension} from "../catalog/features.js"
import {AttachmentStore} from "../attachments/store.js"
import {issue,finalizeEntry,downloadEntry,type Upload} from "./files.js"
import {changeEntry,listEntries,saveEntry,moduleKind,moduleCode,readRules,type Draft,type Decision} from "./entries.js"

@Controller("tenants/:slug/extensions/:module")
class EvidenceController{
  constructor(private iam:IamService,private catalog:CatalogAdapter){}
  private storage?:AttachmentStore
  private store(){return this.storage??=new AttachmentStore(process.env.RMS_S3_BUCKET??"")}
  onModuleDestroy(){this.storage?.client.destroy()}
  private async kind(slug:string,m:string,auth:string){
    const k=moduleKind(m)
    await requireExtension(this.catalog,slug,auth,moduleCode(k))
    return k
  }
  private async rules(slug:string,m:string,auth:string){
    const k=await this.kind(slug,m,auth)
    const rules=readRules(await this.catalog.optionalText(slug,moduleCode(k)+".CATALOG",auth))
    return {k,rules}
  }
  @Get() @Header("Cache-Control","no-store")
  async list(@Param("slug") slug:string,@Param("module") m:string,@Headers("authorization") auth:string){
    const {k,rules}=await this.rules(slug,m,auth)
    return this.iam.authorized(slug,auth,(db,a)=>listEntries(db,a,k,rules))
  }
  @Put(":id")
  async save(@Param("slug") slug:string,@Param("module") m:string,@Headers("authorization") auth:string,@Param("id",ParseUUIDPipe) id:string,@Body() cmd:Draft){
    const {k,rules}=await this.rules(slug,m,auth)
    return this.iam.authorized(slug,auth,(db,a)=>saveEntry(db,a,k,id,cmd,rules))
  }
  @Post(":id/decision") @HttpCode(200)
  async decide(@Param("slug") slug:string,@Param("module") m:string,@Headers("authorization") auth:string,@Param("id",ParseUUIDPipe) id:string,@Body() cmd:Decision){
    const {k,rules}=await this.rules(slug,m,auth)
    const hours=cmd?.action==="approve"&&await this.catalog.optionalText(slug,"FEATURE.P03",auth)==="true"
    return this.iam.authorized(slug,auth,async(db,a)=>{
      const result=await changeEntry(db,a,k,id,cmd,rules)
      if(hours)await enqueueApproved(db,k,id)
      return result
    })
  }
  private async fileKind(slug:string,m:string,auth:string){
    if(m==="product")return m
    if(m!=="applied-project"&&m!=="student-project")return this.kind(slug,m,auth)
    await requireExtension(this.catalog,slug,auth,m==="student-project"?"F10":"F11")
    return m
  }
  @Post(":id/files") @HttpCode(200)
  async upload(@Param("slug") slug:string,@Param("module") m:string,@Headers("authorization") auth:string,@Param("id",ParseUUIDPipe) id:string,@Body() cmd:Upload){
    const k=await this.fileKind(slug,m,auth)
    const rules=k==="student-project"||k==="product"?{types:[],bodies:[],evidence:[]}:readRules(await this.catalog.optionalText(slug,(k==="applied-project"?"F11":moduleCode(k))+".CATALOG",auth))
    return this.iam.authorized(slug,auth,(db,a,t)=>issue(db,a,k,id,cmd,rules,this.store(),t.id))
  }
  @Post(":id/files/:fileId/finalize") @HttpCode(200)
  async finalize(@Param("slug") slug:string,@Param("module") m:string,@Headers("authorization") auth:string,@Param("id",ParseUUIDPipe) id:string,@Param("fileId",ParseUUIDPipe) file:string){
    const k=await this.fileKind(slug,m,auth)
    return this.iam.authorized(slug,auth,(db,a,t)=>finalizeEntry(db,a,k,id,file,this.store(),t.id))
  }
  @Get(":id/files/:fileId/download") @Header("Cache-Control","no-store")
  async download(@Param("slug") slug:string,@Param("module") m:string,@Headers("authorization") auth:string,@Param("id",ParseUUIDPipe) id:string,@Param("fileId",ParseUUIDPipe) file:string){
    const k=await this.fileKind(slug,m,auth)
    return this.iam.authorized(slug,auth,(db,a,t)=>downloadEntry(db,a,k,id,file,this.store(),t.id))
  }
}
@Module({imports:[IamModule,CatalogModule],controllers:[EvidenceController]})
export class EvidenceModule{}
