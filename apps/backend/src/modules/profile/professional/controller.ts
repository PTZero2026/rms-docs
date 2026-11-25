import {Body,Controller,Get,Header,Headers,Module,Param,ParseUUIDPipe,Put} from "@nestjs/common"
import {IamModule,IamService} from "../../iam/iam.module.js"
import {CatalogModule} from "../../catalog/config-override/controller.js"
import {CatalogAdapter} from "../../catalog/config-override/service.js"
import {profileSettings,readProfessional,saveProfessional,type Update} from "./service.js"
@Controller("tenants/:slug/profiles/:id/professional")
class ProfessionalController{
  constructor(private iam:IamService,private catalog:CatalogAdapter){}
  @Get() @Header("Cache-Control","private, no-store")
  async read(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string){
    const settings=profileSettings(await this.catalog.optionalText(slug,"PROFILE.FIELDS",auth))
    return this.iam.authorized(slug,auth,(db,a)=>readProfessional(db,a,id,settings))
  }
  @Put() @Header("Cache-Control","private, no-store")
  async save(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string,@Body() cmd:Update){
    const settings=profileSettings(await this.catalog.optionalText(slug,"PROFILE.FIELDS",auth))
    return this.iam.authorized(slug,auth,(db,a)=>saveProfessional(db,a,id,cmd,settings),{manageAccounts:true})
  }
}
@Module({imports:[IamModule,CatalogModule],controllers:[ProfessionalController]})
export class ProfessionalModule{}
