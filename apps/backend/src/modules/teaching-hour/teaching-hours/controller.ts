import {Body,Controller,Get,Header,Headers,HttpCode,Module,Param,ParseUUIDPipe,Post} from "@nestjs/common"
import {IamModule,IamService} from "../../iam/iam.module.js"
import {CatalogModule} from "../../catalog/config-override/controller.js"
import {CatalogAdapter} from "../../catalog/config-override/service.js"
import {requireExtension} from "../../catalog/features.js"
import {adjustHours,listFormulas,personHours,publishFormula,type Adjustment,type Formula} from "./service.js"
@Controller("tenants/:slug/teaching-hours")
class HoursController{
  constructor(private iam:IamService,private catalog:CatalogAdapter){}
  @Get("formulas") @Header("Cache-Control","no-store")
  async formulas(@Param("slug") slug:string,@Headers("authorization") auth:string){
    await requireExtension(this.catalog,slug,auth,"P03")
    return this.iam.authorized(slug,auth,listFormulas)
  }
  @Post("formulas") @HttpCode(200)
  async publish(@Param("slug") slug:string,@Headers("authorization") auth:string,@Body() cmd:Formula){
    await requireExtension(this.catalog,slug,auth,"P03")
    return this.iam.authorized(slug,auth,(db,a)=>publishFormula(db,a,cmd))
  }
  @Get("people/:id") @Header("Cache-Control","no-store")
  async person(@Param("slug") slug:string,@Headers("authorization") auth:string,@Param("id",ParseUUIDPipe) id:string){
    await requireExtension(this.catalog,slug,auth,"P03")
    return this.iam.authorized(slug,auth,(db,a)=>personHours(db,a,id))
  }
  @Post("records/:id/adjustments") @HttpCode(200)
  async adjust(@Param("slug") slug:string,@Headers("authorization") auth:string,@Param("id",ParseUUIDPipe) id:string,@Body() cmd:Adjustment){
    await requireExtension(this.catalog,slug,auth,"P03")
    return this.iam.authorized(slug,auth,(db,a)=>adjustHours(db,a,id,cmd))
  }
}
@Module({imports:[IamModule,CatalogModule],controllers:[HoursController]})
export class TeachingHourModule{}
