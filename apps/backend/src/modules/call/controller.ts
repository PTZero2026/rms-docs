import { Body,Controller,Get,Header,Headers,HttpCode,Module,Param,ParseUUIDPipe,Post,Put,Query } from "@nestjs/common"
import type { operations } from "@rms/api-contracts"
import { IamModule,IamService } from "../iam/iam.module.js"
import { changeCall,getCall,listCalls,references,saveCall } from "./service.js"

type Input=operations["saveNewCall"]["requestBody"]["content"]["application/json"]
type Change=operations["changeCallStatus"]["requestBody"]["content"]["application/json"]
@Controller("tenants/:slug/calls")
class CallController {
  constructor(private readonly iam:IamService){}
  @Get() @Header("Cache-Control","no-store")
  list(@Param("slug") slug:string,@Query() q:Record<string,unknown>,@Headers("authorization") auth:string) {
    return this.iam.authorized(slug,auth,(db,a)=>listCalls(db,a,q))
  }
  @Get("references") @Header("Cache-Control","no-store")
  refs(@Param("slug") slug:string,@Headers("authorization") auth:string) {
    return this.iam.authorized(slug,auth,references)
  }
  @Get(":id") @Header("Cache-Control","no-store")
  get(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string) {
    return this.iam.authorized(slug,auth,(db,a)=>getCall(db,a,id))
  }
  @Post() @HttpCode(200)
  create(@Param("slug") slug:string,@Body() input:Input,@Headers("authorization") auth:string) {
    return this.iam.authorized(slug,auth,(db,a)=>saveCall(db,a,input))
  }
  @Put(":id")
  edit(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Body() input:Input,@Headers("authorization") auth:string) {
    return this.iam.authorized(slug,auth,(db,a)=>saveCall(db,a,input,id))
  }
  @Post(":id/actions") @HttpCode(200)
  change(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Body() input:Change,@Headers("authorization") auth:string) {
    return this.iam.authorized(slug,auth,(db,a)=>changeCall(db,a,id,input))
  }
}
@Module({imports:[IamModule],controllers:[CallController]})
export class CallModule {}
