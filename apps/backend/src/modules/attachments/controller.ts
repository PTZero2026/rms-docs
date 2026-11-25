import { Body,Controller,Get,Header,Headers,HttpCode,Module,Param,ParseUUIDPipe,Post } from "@nestjs/common"
import { IamModule,IamService } from "../iam/iam.module.js"
import { AttachmentStore } from "./store.js"
import { download,finalize,issueIntent,type FileRequest } from "./service.js"

@Controller("tenants/:slug/projects/:projectId/files")
class FileController {
  constructor(private readonly iam:IamService) {}
  private storage?:AttachmentStore
  private store() { return this.storage??=new AttachmentStore(process.env.RMS_S3_BUCKET??"") }
  onModuleDestroy() { this.storage?.client.destroy() }

  @Post("intents")
  @HttpCode(200)
  @Header("Cache-Control","no-store")
  intent(@Param("slug") slug:string,@Param("projectId",ParseUUIDPipe) project:string,@Headers("authorization") token:string,@Body() body:FileRequest) {
    return this.iam.authorized(slug,token,(db,actor)=>issueIntent(db,actor,this.store(),project,body))
  }
  @Post(":id/finalize")
  @HttpCode(200)
  attach(@Param("slug") slug:string,@Param("projectId",ParseUUIDPipe) project:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") token:string) {
    return this.iam.authorized(slug,token,(db,actor)=>finalize(db,actor,this.store(),project,id))
  }
  @Get(":id/download")
  @Header("Cache-Control","no-store")
  read(@Param("slug") slug:string,@Param("projectId",ParseUUIDPipe) project:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") token:string) {
    return this.iam.authorized(slug,token,(db,actor)=>download(db,actor,this.store(),project,id))
  }
}
@Module({imports:[IamModule],controllers:[FileController]})
export class AttachmentModule {}
