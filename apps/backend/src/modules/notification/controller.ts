import { Body,Controller,Get,Header,Headers,HttpCode,Module,Param,ParseUUIDPipe,Post,Put,Query } from "@nestjs/common"
import type { operations } from "@rms/api-contracts"
import {listDeliveries,resendDeliveries} from "./deliveries.js"
import {readTemplate,saveTemplate,previewTemplate,type TemplateDraft} from "./templates.js"
import {preferences,savePreference,saveRule} from "./policy.js"
import { IamModule,IamService } from "../iam/iam.module.js"
import { listInbox,readAll,readNotice } from "./inbox.js"

@Controller("tenants/:slug/notifications")
class InboxController {
  constructor(private readonly iam:IamService){}
  @Get("deliveries") @Header("Cache-Control","private, no-store")
  deliveries(@Param("slug") slug:string,@Headers("authorization") auth:string,@Query() q:Record<string,unknown>){
    return this.iam.authorized(slug,auth,(db,a)=>listDeliveries(db,a,q))
  }
  @Post("deliveries/resend") @HttpCode(200)
  resend(@Param("slug") slug:string,@Headers("authorization") auth:string,@Body() cmd:operations["resendNotificationDeliveries"]["requestBody"]["content"]["application/json"]){
    return this.iam.authorized(slug,auth,(db,a)=>resendDeliveries(db,a,cmd))
  }
  @Get("templates/:code/:channel") @Header("Cache-Control","private, no-store")
  readTemplate(@Param("slug") slug:string,@Headers("authorization") auth:string,@Param("code") code:string,@Param("channel") channel:string){
    return this.iam.authorized(slug,auth,(db,a)=>readTemplate(db,a,code,channel))
  }
  @Put("templates/:code/:channel") @Header("Cache-Control","private, no-store")
  saveTemplate(@Param("slug") slug:string,@Headers("authorization") auth:string,@Param("code") code:string,@Param("channel") channel:string,@Body() input:TemplateDraft){
    return this.iam.authorized(slug,auth,(db,a)=>saveTemplate(db,a,code,channel,input))
  }
  @Post("templates/:code/:channel/preview") @HttpCode(200) @Header("Cache-Control","private, no-store")
  previewTemplate(@Param("slug") slug:string,@Headers("authorization") auth:string,@Param("code") code:string,@Param("channel") channel:string,@Body() input:TemplateDraft){
    return this.iam.authorized(slug,auth,(db,a)=>previewTemplate(db,a,code,channel,input))
  }
  @Get("preferences") @Header("Cache-Control","private, no-store")
  preferences(@Param("slug") slug:string,@Headers("authorization") auth:string){
    return this.iam.authorized(slug,auth,preferences)
  }
  @Put("preferences")
  preference(@Param("slug") slug:string,@Headers("authorization") auth:string,@Body() input:operations["saveNoticePreference"]["requestBody"]["content"]["application/json"]){
    return this.iam.authorized(slug,auth,(db,a)=>savePreference(db,a,input))
  }
  @Put("rules")
  rule(@Param("slug") slug:string,@Headers("authorization") auth:string,@Body() input:operations["saveNoticeRule"]["requestBody"]["content"]["application/json"]){
    return this.iam.authorized(slug,auth,(db,a)=>saveRule(db,a,input))
  }
  @Get() @Header("Cache-Control","private, no-store")
  list(@Param("slug") slug:string,@Headers("authorization") auth:string,@Query() q:Record<string,unknown>){
    return this.iam.authorized(slug,auth,(db,a)=>listInbox(db,a,q))
  }
  @Post("read-all") @HttpCode(204)
  all(@Param("slug") slug:string,@Headers("authorization") auth:string){
    return this.iam.authorized(slug,auth,readAll)
  }
  @Post(":id/read") @HttpCode(200) @Header("Cache-Control","private, no-store")
  read(@Param("slug") slug:string,@Headers("authorization") auth:string,@Param("id",ParseUUIDPipe) id:string){
    return this.iam.authorized(slug,auth,(db,a)=>readNotice(db,a,id))
  }
}
@Module({imports:[IamModule],controllers:[InboxController]})
export class InboxModule {}
