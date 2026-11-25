import { Body,ConflictException,Controller,Get,Header,Headers,HttpCode,Module,Param,ParseUUIDPipe,Post,Put } from "@nestjs/common"
import type { operations } from "@rms/api-contracts"
import { IamModule,IamService } from "../iam/iam.module.js"
import { CatalogModule } from "../catalog/config-override/controller.js"
import { CatalogAdapter } from "../catalog/config-override/service.js"
import { createCommittee,managedRound } from "../review/open-review/service.js"
import { saveSheet } from "../review/submit-score/service.js"
import { acceptanceDetail,requestAcceptance,openAcceptance,acceptanceQueue,concludeAcceptance,redoAcceptance } from "./service.js"
type Op="requestAcceptance"|"createAcceptanceCommittee"|"openAcceptance"|"saveAcceptanceSheet"|"redoAcceptance"
type Input<K extends Op>=operations[K]["requestBody"]["content"]["application/json"]
@Controller("tenants/:slug")
class AcceptanceController{
  constructor(private iam:IamService,private catalog:CatalogAdapter){}
  private async number(slug:string,auth:string,key:string){
    const v=await this.catalog.optionalText(slug,"ACCEPTANCE."+key,auth)
    if(v===null||!/^\d+(\.\d+)?$/.test(v)||!Number.isFinite(Number(v)))throw new ConflictException("Cần cấu hình B01 cho ACCEPTANCE."+key)
    return Number(v)
  }
  @Get("projects/:id/acceptance") @Header("Cache-Control","private, no-store")
  detail(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string){return this.iam.authorized(slug,auth,(db,a)=>acceptanceDetail(db,a,id))}
  @Post("projects/:id/acceptance") @HttpCode(200)
  submit(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string,@Body() cmd:Input<"requestAcceptance">){return this.iam.authorized(slug,auth,(db,a)=>requestAcceptance(db,a,id,cmd))}
  @Post("acceptance/committees") @HttpCode(200)
  committee(@Param("slug") slug:string,@Headers("authorization") auth:string,@Body() cmd:Input<"createAcceptanceCommittee">){return this.iam.authorized(slug,auth,(db,a)=>createCommittee(db,a,cmd,"ACCEPTANCE"))}
  @Post("projects/:id/acceptance/rounds") @HttpCode(200)
  open(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string,@Body() cmd:Input<"openAcceptance">){return this.iam.authorized(slug,auth,(db,a)=>openAcceptance(db,a,id,cmd))}
  @Get("acceptance/queue") @Header("Cache-Control","private, no-store")
  queue(@Param("slug") slug:string,@Headers("authorization") auth:string){return this.iam.authorized(slug,auth,acceptanceQueue)}
  @Get("acceptance/rounds/:id") @Header("Cache-Control","private, no-store")
  round(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string){return this.iam.authorized(slug,auth,(db,a)=>managedRound(db,a,id,false,"ACCEPTANCE"))}
  @Put("acceptance/rounds/:id/sheet")
  sheet(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string,@Body() cmd:Input<"saveAcceptanceSheet">){return this.iam.authorized(slug,auth,(db,a)=>saveSheet(db,a,id,cmd,"ACCEPTANCE"))}
  @Post("acceptance/rounds/:id/conclusion") @HttpCode(200)
  async conclude(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string,
    @Body() body:NonNullable<operations["concludeAcceptance"]["requestBody"]>["content"]["application/json"]){
    const r=await this.iam.authorized(slug,auth,(db,a)=>managedRound(db,a,id,false,"ACCEPTANCE"))
    const revision=body?.revision??0
    if(r.decisionRevision!==revision)throw new ConflictException("Vòng đã được mở lại. Hãy tải lại trước khi chốt.")
    if(r.conclusion)return r
    const [minimum,passing]=await Promise.all([this.number(slug,auth,"MIN_SUBMITTED_SCORE_SHEETS"),this.number(slug,auth,"PASSING_SCORE")])
    return this.iam.authorized(slug,auth,(db,a)=>concludeAcceptance(db,a,id,{minimum,passing},revision))
  }
  @Post("projects/:id/acceptance/redo") @HttpCode(200)
  async redo(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string,@Body() cmd:Input<"redoAcceptance">){
    const limit=await this.number(slug,auth,"MAX_REDO_COUNT")
    return this.iam.authorized(slug,auth,(db,a)=>redoAcceptance(db,a,id,cmd,limit))
  }
}
@Module({imports:[IamModule,CatalogModule],controllers:[AcceptanceController]})
export class AcceptanceModule {}
