import {Body,ConflictException,Controller,Get,Header,Headers,HttpCode,Module,Param,ParseUUIDPipe,Post,Put} from "@nestjs/common"
import type {operations} from "@rms/api-contracts"
import {IamModule,IamService} from "../../iam/iam.module.js"
import {CatalogModule} from "../../catalog/config-override/controller.js"
import {CatalogAdapter} from "../../catalog/config-override/service.js"
import {requireExtension} from "../../catalog/features.js"
import {readRules} from "../../extension/entries.js"
import {appliedHours,decideApplied,listApplied,saveApplied,submitApplied,submitAppliedResult} from "./service.js"
import {readPartnerDirectory} from "./partners.js"
type Draft=operations["saveAppliedProject"]["requestBody"]["content"]["application/json"]
@Controller("tenants/:slug/applied-projects")
class AppliedController{
  constructor(private iam:IamService,private catalog:CatalogAdapter){}
  private async rules(slug:string,auth:string){
    await requireExtension(this.catalog,slug,auth,"F11")
    return readRules(await this.catalog.optionalText(slug,"F11.CATALOG",auth))
  }
  @Get() @Header("Cache-Control","no-store")
  async list(@Param("slug") slug:string,@Headers("authorization") auth:string){
    const rules=await this.rules(slug,auth)
    const enabled=await this.catalog.optionalText(slug,"FEATURE.P03",auth)==="true"
    const directory=readPartnerDirectory(await this.catalog.optionalText(slug,"EXTERNAL_PARTNER",auth))
    return this.iam.authorized(slug,auth,(db,a)=>listApplied(db,a,rules,enabled,directory))
  }
  @Get(":id/hours") @Header("Cache-Control","no-store")
  async hours(@Param("slug") slug:string,@Headers("authorization") auth:string,@Param("id",ParseUUIDPipe) id:string){
    await requireExtension(this.catalog,slug,auth,"F11")
    await requireExtension(this.catalog,slug,auth,"P03")
    return this.iam.authorized(slug,auth,(db,a)=>appliedHours(db,a,id))
  }
  @Put(":id")
  async save(@Param("slug") slug:string,@Headers("authorization") auth:string,@Param("id",ParseUUIDPipe) id:string,@Body() cmd:Draft){
    const rules=await this.rules(slug,auth)
    const directory=cmd?.partnerCodes?.length?readPartnerDirectory(await this.catalog.optionalText(slug,"EXTERNAL_PARTNER",auth)):[]
    return this.iam.authorized(slug,auth,(db,a)=>saveApplied(db,a,id,cmd,rules,directory))
  }
  @Post(":id/decision") @HttpCode(200)
  async decide(@Param("slug") slug:string,@Headers("authorization") auth:string,@Param("id",ParseUUIDPipe) id:string,@Body() cmd:operations["reviewAppliedProject"]["requestBody"]["content"]["application/json"]){
    const rules=await this.rules(slug,auth)
    const trigger=cmd?.action==="approve"?(await this.catalog.optionalText(slug,"f11.teachingHourTrigger",auth)??"ON_RESULT_APPROVED"):"ON_RESULT_APPROVED"
    if(trigger!=="ON_PROJECT_APPROVED"&&trigger!=="ON_RESULT_APPROVED")throw new ConflictException("Mốc quy đổi F11 chưa hợp lệ.")
    const enabled=(cmd?.action==="approve"||cmd?.action==="confirmResult")&&await this.catalog.optionalText(slug,"FEATURE.P03",auth)==="true"
    return this.iam.authorized(slug,auth,(db,a)=>decideApplied(db,a,id,cmd,rules,{enabled,trigger}))
  }
  @Post(":id/result") @HttpCode(200)
  async result(@Param("slug") slug:string,@Headers("authorization") auth:string,@Param("id",ParseUUIDPipe) id:string,@Body() cmd:operations["submitAppliedResult"]["requestBody"]["content"]["application/json"]){
    const rules=await this.rules(slug,auth)
    return this.iam.authorized(slug,auth,(db,a)=>submitAppliedResult(db,a,id,cmd,rules))
  }
  @Post(":id/submit") @HttpCode(200)
  async submit(@Param("slug") slug:string,@Headers("authorization") auth:string,@Param("id",ParseUUIDPipe) id:string,@Body() cmd:{revision:number}){
    await requireExtension(this.catalog,slug,auth,"F11")
    return this.iam.authorized(slug,auth,(db,a)=>submitApplied(db,a,id,cmd?.revision))
  }
}
@Module({imports:[IamModule,CatalogModule],controllers:[AppliedController]})
export class AppliedModule{}
