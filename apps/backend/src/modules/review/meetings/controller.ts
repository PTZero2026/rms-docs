import {Body,Controller,Get,Headers,HttpCode,Param,ParseUUIDPipe,Post} from "@nestjs/common"
import type {operations} from "@rms/api-contracts"
import {IamService} from "../../iam/iam.module.js"
import {AttachmentStore} from "../../attachments/store.js"
import type {FileRequest} from "../../attachments/service.js"
import {createMeeting,downloadMinutes,finishMinutes,issueMinutes,meetingRounds,meetings} from "./service.js"

@Controller("tenants/:slug/review")
export class MeetingsController {
  constructor(private readonly iam:IamService){}
  private storage?:AttachmentStore
  private store(){return this.storage??=new AttachmentStore(process.env.RMS_S3_BUCKET??"")}
  onModuleDestroy(){this.storage?.client.destroy()}
  @Get("meeting-rounds")
  rounds(@Param("slug") slug:string,@Headers("authorization") auth:string){
    return this.iam.authorized(slug,auth,meetingRounds)
  }
  @Get("rounds/:id/meetings")
  list(@Param("slug") slug:string,@Headers("authorization") auth:string,@Param("id",ParseUUIDPipe) id:string){
    return this.iam.authorized(slug,auth,(db,a)=>meetings(db,a,id))
  }
  @Post("rounds/:id/meetings") @HttpCode(200)
  create(@Param("slug") slug:string,@Headers("authorization") auth:string,@Param("id",ParseUUIDPipe) id:string,@Body() cmd:operations["createRoundMeeting"]["requestBody"]["content"]["application/json"]){
    return this.iam.authorized(slug,auth,(db,a)=>createMeeting(db,a,id,cmd))
  }
  @Post("meetings/:id/files") @HttpCode(200)
  upload(@Param("slug") slug:string,@Headers("authorization") auth:string,@Param("id",ParseUUIDPipe) id:string,@Body() cmd:FileRequest){
    return this.iam.authorized(slug,auth,(db,a)=>issueMinutes(db,a,id,cmd,this.store()))
  }
  @Post("meetings/:id/files/:fileId/finalize") @HttpCode(200)
  finish(@Param("slug") slug:string,@Headers("authorization") auth:string,@Param("id",ParseUUIDPipe) id:string,@Param("fileId",ParseUUIDPipe) file:string){
    return this.iam.authorized(slug,auth,(db,a)=>finishMinutes(db,a,id,file,this.store()))
  }
  @Get("meetings/:id/files/:fileId/download")
  download(@Param("slug") slug:string,@Headers("authorization") auth:string,@Param("id",ParseUUIDPipe) id:string,@Param("fileId",ParseUUIDPipe) file:string){
    return this.iam.authorized(slug,auth,(db,a)=>downloadMinutes(db,a,id,file,this.store()))
  }
}
