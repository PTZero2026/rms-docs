import {profileSettings} from "../professional/service.js"
import {teachingEnabled} from "../../catalog/features.js"
import { Controller,Get,Header,Headers,HttpCode,Module,Param,ParseUUIDPipe,Post,StreamableFile } from "@nestjs/common"
import { IamModule,IamService } from "../../iam/iam.module.js"
import { CatalogModule } from "../../catalog/config-override/controller.js"
import { CatalogAdapter } from "../../catalog/config-override/service.js"
import { downloadProfile,effectiveTemplate,exportProfile,profileView } from "./service.js"

@Controller("tenants/:slug/profiles/:id/cv")
class ProfileController{
  constructor(private iam:IamService,private catalog:CatalogAdapter){}
  @Get() @Header("Cache-Control","private, no-store")
  async read(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string){
    const hours=await teachingEnabled(this.catalog,slug,auth).catch(()=>false)
    return this.iam.authorized(slug,auth,(db,a)=>profileView(db,a,id,hours))
  }
  @Post("exports") @HttpCode(200) @Header("Cache-Control","no-store")
  async export(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string){
    const template=effectiveTemplate(await this.catalog.optionalText(slug,"PROFILE.TEMPLATE",auth))
    const hours=await teachingEnabled(this.catalog,slug,auth)
    const settings=profileSettings(await this.catalog.optionalText(slug,"PROFILE.FIELDS",auth))
    return this.iam.authorized(slug,auth,(db,a)=>exportProfile(db,a,id,template,hours,settings))
  }
  @Get("exports/:exportId/file") @Header("Cache-Control","private, no-store")
  async file(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Param("exportId",ParseUUIDPipe) exportId:string,@Headers("authorization") auth:string){
    const [hours,rawSettings]=await Promise.all([teachingEnabled(this.catalog,slug,auth),this.catalog.optionalText(slug,"PROFILE.FIELDS",auth)])
    const settings=profileSettings(rawSettings)
    const pdf=await this.iam.authorized(slug,auth,(db,a)=>downloadProfile(db,a,id,exportId,hours,settings))
    return new StreamableFile(pdf,{type:"application/pdf",disposition:'attachment; filename="ly-lich-khoa-hoc.pdf"'})
  }
}
@Module({imports:[IamModule,CatalogModule],controllers:[ProfileController]})
export class ProfileModule {}
