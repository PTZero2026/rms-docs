import {CatalogModule} from "../catalog/config-override/controller.js"
import {CatalogAdapter} from "../catalog/config-override/service.js"
import {productTypes} from "../product/catalog.js"
import { Body,Controller,Get,Header,Headers,HttpCode,Module,Param,ParseUUIDPipe,Post } from "@nestjs/common"
import type { operations } from "@rms/api-contracts"
import { IamModule,IamService } from "../iam/iam.module.js"
import { assignProject,changeActivity,createPeriod,progressDetail,reviewPeriod,submitPeriod } from "./service.js"

type Input<K extends "assignProject"|"changeProjectActivity"|"createReportPeriod"|"submitProgress"|"reviewProgress">=operations[K]["requestBody"]["content"]["application/json"]
@Controller("tenants/:slug/projects/:id")
class ProgressController{
  constructor(private iam:IamService,private catalog:CatalogAdapter){}
  @Get("progress") @Header("Cache-Control","no-store")
  detail(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string){
    return this.iam.authorized(slug,auth,(db,a)=>progressDetail(db,a,id))
  }
  @Post("assignment") @HttpCode(200)
  async assign(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string,@Body() body:Input<"assignProject">){
    const codes=Object.keys(body?.commitments??{}).length?(await productTypes(this.catalog,slug,auth)).map(t=>t.code):undefined
    return this.iam.authorized(slug,auth,(db,a)=>assignProject(db,a,id,body,new Date(),codes))
  }
  @Post("activity") @HttpCode(200)
  activity(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string,@Body() body:Input<"changeProjectActivity">){
    return this.iam.authorized(slug,auth,(db,a)=>changeActivity(db,a,id,body))
  }
  @Post("periods") @HttpCode(200)
  period(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string,@Body() body:Input<"createReportPeriod">){
    return this.iam.authorized(slug,auth,(db,a)=>createPeriod(db,a,id,body))
  }
  @Post("periods/:periodId/submission") @HttpCode(200)
  submit(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Param("periodId",ParseUUIDPipe) period:string,@Headers("authorization") auth:string,@Body() body:Input<"submitProgress">){
    const at=new Date()
    return this.iam.authorized(slug,auth,(db,a)=>submitPeriod(db,a,id,period,body,at))
  }
  @Post("periods/:periodId/review") @HttpCode(200)
  review(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Param("periodId",ParseUUIDPipe) period:string,@Headers("authorization") auth:string,@Body() body:Input<"reviewProgress">){
    return this.iam.authorized(slug,auth,(db,a)=>reviewPeriod(db,a,id,period,body))
  }
}
@Module({imports:[IamModule,CatalogModule],controllers:[ProgressController]})
export class ProgressModule {}
