import { Body,Controller,Get,Header,Headers,HttpCode,Module,Param,ParseUUIDPipe,Post } from "@nestjs/common"
import type { operations } from "@rms/api-contracts"
import { IamModule,IamService } from "../../iam/iam.module.js"
import { createReport,exportReport,readReport,reportFilters } from "./service.js"

@Controller("tenants/:slug/reports/calls")
class ReportController {
  constructor(private iam:IamService){}
  @Get("filters") @Header("Cache-Control","no-store")
  filters(@Param("slug") slug:string,@Headers("authorization") auth:string){return this.iam.authorized(slug,auth,reportFilters)}
  @Post("snapshots") @HttpCode(200)
  create(@Param("slug") slug:string,@Headers("authorization") auth:string,@Body() body:operations["generateCallReport"]["requestBody"]["content"]["application/json"]){
    return this.iam.authorized(slug,auth,(db,a)=>createReport(db,a,body))
  }
  @Get("snapshots/:id") @Header("Cache-Control","no-store")
  read(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string){
    return this.iam.authorized(slug,auth,(db,a)=>readReport(db,a,id))
  }
  @Get("snapshots/:id/csv") @Header("Cache-Control","no-store") @Header("Content-Type","text/csv; charset=utf-8") @Header("Content-Disposition",'attachment; filename="doi-chieu-ky.csv"')
  csv(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string){
    return this.iam.authorized(slug,auth,(db,a)=>exportReport(db,a,id))
  }
}
@Module({imports:[IamModule],controllers:[ReportController]})
export class ReportModule {}
