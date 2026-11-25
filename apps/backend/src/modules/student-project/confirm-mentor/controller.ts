import {Body,Controller,Get,Header,Headers,HttpCode,Module,Param,ParseUUIDPipe,Post,Put} from "@nestjs/common"
import {IamModule,IamService} from "../../iam/iam.module.js"
import {CatalogModule} from "../../catalog/config-override/controller.js"
import {CatalogAdapter} from "../../catalog/config-override/service.js"
import {requireExtension} from "../../catalog/features.js"
import {listStudents,registerStudent,submitStudent,answerMentor,parseCalls,decideStudent,type Answer,type Draft} from "./service.js"
import {studentResult,type ResultDecision} from "../results.js"
import {amendmentPeople,amendStudent,type Amendment} from "../amendments.js"
import {recordProgress,type Progress} from "../progress.js"
@Controller("tenants/:slug/student-projects")
class StudentController{
  constructor(private iam:IamService,private catalog:CatalogAdapter){}
  private async calls(slug:string,auth:string){
    await requireExtension(this.catalog,slug,auth,"F10")
    return parseCalls(await this.catalog.optionalText(slug,"F10.CALLS",auth))
  }
  @Get() @Header("Cache-Control","no-store")
  async list(@Param("slug") slug:string,@Headers("authorization") auth:string){
    const calls=await this.calls(slug,auth)
    return this.iam.authorized(slug,auth,(db,a)=>listStudents(db,a,calls))
  }
  @Put(":id")
  async save(@Param("slug") slug:string,@Headers("authorization") auth:string,@Param("id",ParseUUIDPipe) id:string,@Body() cmd:Draft){
    const calls=await this.calls(slug,auth)
    return this.iam.authorized(slug,auth,(db,a)=>registerStudent(db,a,id,cmd,calls))
  }
  @Post(":id/decision") @HttpCode(200)
  async decide(@Param("slug") slug:string,@Headers("authorization") auth:string,@Param("id",ParseUUIDPipe) id:string,@Body() cmd:Parameters<typeof decideStudent>[3]){
    await requireExtension(this.catalog,slug,auth,"F10")
    return this.iam.authorized(slug,auth,(db,a)=>decideStudent(db,a,id,cmd))
  }
  @Get(":id/amendment") @Header("Cache-Control","no-store")
  async amendmentOptions(@Param("slug") slug:string,@Headers("authorization") auth:string,@Param("id",ParseUUIDPipe) id:string){
    await requireExtension(this.catalog,slug,auth,"F10")
    return this.iam.authorized(slug,auth,(db,a)=>amendmentPeople(db,a,id))
  }
  @Post(":id/amendment") @HttpCode(200)
  async amend(@Param("slug") slug:string,@Headers("authorization") auth:string,@Param("id",ParseUUIDPipe) id:string,@Body() cmd:Amendment){
    const calls=await this.calls(slug,auth)
    return this.iam.authorized(slug,auth,(db,a)=>amendStudent(db,a,id,cmd,calls))
  }
  @Post(":id/progress") @HttpCode(200)
  async progress(@Param("slug") slug:string,@Headers("authorization") auth:string,@Param("id",ParseUUIDPipe) id:string,@Body() cmd:Progress){
    await requireExtension(this.catalog,slug,auth,"F10")
    return this.iam.authorized(slug,auth,(db,a)=>recordProgress(db,a,id,cmd))
  }
  @Post(":id/result") @HttpCode(200)
  async result(@Param("slug") slug:string,@Headers("authorization") auth:string,@Param("id",ParseUUIDPipe) id:string,@Body() cmd:ResultDecision){
    await requireExtension(this.catalog,slug,auth,"F10")
    const hours=cmd?.action==="close"&&await this.catalog.optionalText(slug,"FEATURE.P03",auth)==="true"
    return this.iam.authorized(slug,auth,(db,a)=>studentResult(db,a,id,cmd,hours))
  }
  @Post(":id/mentor") @HttpCode(200)
  async answer(@Param("slug") slug:string,@Headers("authorization") auth:string,@Param("id",ParseUUIDPipe) id:string,@Body() cmd:Answer){
    await requireExtension(this.catalog,slug,auth,"F10")
    return this.iam.authorized(slug,auth,(db,a)=>answerMentor(db,a,id,cmd?.action,cmd?.reason,cmd?.revision))
  }
  @Post(":id/submit") @HttpCode(200)
  async submit(@Param("slug") slug:string,@Headers("authorization") auth:string,@Param("id",ParseUUIDPipe) id:string){
    const calls=await this.calls(slug,auth)
    return this.iam.authorized(slug,auth,(db,a)=>submitStudent(db,a,id,calls))
  }
}
@Module({imports:[IamModule,CatalogModule],controllers:[StudentController]})
export class StudentModule{}
