import {MeetingsController} from "./meetings/controller.js"
import {amendmentState,amendRound} from "./amendment.js"
import { Body, ConflictException, Controller, Get, Header, Headers, HttpCode, HttpException, Module, Param, ParseUUIDPipe, Post, Put } from "@nestjs/common"
import type { operations } from "@rms/api-contracts"
import { CatalogModule } from "../catalog/config-override/controller.js"
import { CatalogAdapter } from "../catalog/config-override/service.js"
import { IamModule,IamService } from "../iam/iam.module.js"
import { finalizeProposal } from "../proposal/finalize.js"
import { createCommittee,managedRound,openRound,reviewQueue,reviewSetup } from "./open-review/service.js"
import { saveSheet } from "./submit-score/service.js"
import { conclude,recordEthics,reviewResult } from "./review-decision/service.js"

type Input<K extends "createReviewCommittee"|"openReview"|"saveReviewSheet"|"recordReviewEthics">=operations[K]["requestBody"]["content"]["application/json"]
@Controller("tenants/:slug")
class ReviewController {
  constructor(private iam:IamService,private catalog:CatalogAdapter){}
  @Get("review/rounds/:id/amendment") @Header("Cache-Control","private, no-store")
  amendment(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string){
    return this.iam.authorized(slug,auth,(db,a)=>amendmentState(db,a,id))
  }
  @Post("review/rounds/:id/amendment") @HttpCode(200)
  amend(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string,
    @Body() body:operations["amendRound"]["requestBody"]["content"]["application/json"]){
    return this.iam.authorized(slug,auth,(db,a)=>amendRound(db,a,id,body))
  }
  private async setting(slug:string,auth:string,key:string,optional=false):Promise<unknown>{
    try{
      const value=await this.catalog.read(slug,"PROPOSAL_REVIEW."+key,auth)
      const raw=Buffer.from(value.content,"base64").toString("utf8")
      try{return JSON.parse(raw)}catch{throw new ConflictException("Giá trị B01 chưa đúng kiểu cho "+key+".")}
    }catch(e){
      if(e instanceof HttpException && e.getStatus()===404){
        if(optional)return false
        throw new ConflictException("Cần cấu hình B01 cho "+key+".")
      }
      throw e
    }
  }
  @Get("review/setup") @Header("Cache-Control","no-store")
  setup(@Param("slug") slug:string,@Headers("authorization") auth:string){return this.iam.authorized(slug,auth,reviewSetup)}
  @Post("review/committees") @HttpCode(200)
  committee(@Param("slug") slug:string,@Headers("authorization") auth:string,@Body() input:Input<"createReviewCommittee">){
    return this.iam.authorized(slug,auth,(db,a)=>createCommittee(db,a,input))
  }
  @Post("projects/:id/finalize") @HttpCode(200)
  finalize(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string){
    return this.iam.authorized(slug,auth,(db,a)=>finalizeProposal(db,a,id))
  }
  @Post("projects/:id/reviews") @HttpCode(200)
  open(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string,@Body() body:Input<"openReview">){
    return this.iam.authorized(slug,auth,(db,a)=>openRound(db,a,id,body))
  }
  @Get("review/queue") @Header("Cache-Control","no-store")
  queue(@Param("slug") slug:string,@Headers("authorization") auth:string){return this.iam.authorized(slug,auth,reviewQueue)}
  @Get("review/rounds/:id") @Header("Cache-Control","no-store")
  round(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string){
    return this.iam.authorized(slug,auth,(db,a)=>managedRound(db,a,id))
  }
  @Put("review/rounds/:id/sheet")
  sheet(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string,@Body() body:Input<"saveReviewSheet">){
    return this.iam.authorized(slug,auth,(db,a)=>saveSheet(db,a,id,body))
  }
  @Post("review/rounds/:id/conclusion") @HttpCode(200)
  async decide(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string,
    @Body() body:NonNullable<operations["concludeReview"]["requestBody"]>["content"]["application/json"]){
    const current=await this.iam.authorized(slug,auth,(db,a)=>managedRound(db,a,id))
    const revision=body?.revision??0
    if(current.decisionRevision!==revision)throw new ConflictException("Vòng đã được mở lại. Hãy tải lại trước khi chốt.")
    if(current.conclusion)return current
    const [minimum,passing]=await Promise.all(["MIN_SUBMITTED_SCORE_SHEETS","PASSING_SCORE"].map(k=>this.setting(slug,auth,k)))
    if(typeof minimum!=="number" || typeof passing!=="number")throw new ConflictException("Cần giá trị số từ B01.")
    return this.iam.authorized(slug,auth,(db,a)=>conclude(db,a,id,{minimum,passing},"PROPOSAL_REVIEW",revision))
  }
  @Put("review/rounds/:id/ethics")
  ethics(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string,@Body() body:Input<"recordReviewEthics">){
    return this.iam.authorized(slug,auth,(db,a)=>recordEthics(db,a,id,body))
  }
  @Get("projects/:id/review-result") @Header("Cache-Control","no-store")
  async result(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string){
    const current=await this.iam.authorized(slug,auth,(db,a)=>reviewResult(db,a,id,false))
    if(!current.conclusion)return current
    const visible=await this.setting(slug,auth,"PUBLIC_COMMENTS",true)
    return visible===true?this.iam.authorized(slug,auth,(db,a)=>reviewResult(db,a,id,true)):current
  }
}
@Module({imports:[IamModule,CatalogModule],controllers:[ReviewController,MeetingsController]})
export class ReviewModule {}
