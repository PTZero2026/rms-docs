import {Body,Controller,Get,Header,Headers,HttpCode,Module,Param,ParseUUIDPipe,Patch,Post} from "@nestjs/common"
import type {operations} from "@rms/api-contracts"
import {IamModule,IamService} from "../iam.module.js"
import {submitRequest,reviewRequest,listRequests} from "./service.js"

type Application=operations["submitAuthorRequest"]["requestBody"]["content"]["application/json"]
type Note=operations["approveAuthorRequest"]["requestBody"]["content"]["application/json"]

@Controller("tenants/:slug/users")
class AuthorRequestController {
  constructor(private readonly iam:IamService){}
  @Get("me/author-request") @Header("Cache-Control","private, no-store")
  mine(@Param("slug") slug:string,@Headers("authorization") token:string) {
    return this.iam.authorized(slug,token,(db,a)=>listRequests(db,a,false))
  }
  @Get("author-requests") @Header("Cache-Control","private, no-store")
  queue(@Param("slug") slug:string,@Headers("authorization") token:string) {
    return this.iam.authorized(slug,token,(db,a)=>listRequests(db,a,true))
  }
  @Post("me/author-request") @HttpCode(200)
  submit(@Param("slug") slug:string,@Headers("authorization") token:string,@Body() data:Application) {
    return this.iam.authorized(slug,token,(db,a)=>submitRequest(db,a,data),{manageAccounts:true})
  }
  @Patch("author-requests/:id/approve")
  approve(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") token:string,@Body() data:Note) {
    return this.iam.authorized(slug,token,(db,a)=>reviewRequest(db,a,id,true,data?.adminNote??""),{manageAccounts:true})
  }
  @Patch("author-requests/:id/reject")
  reject(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") token:string,@Body() data:Note) {
    return this.iam.authorized(slug,token,(db,a)=>reviewRequest(db,a,id,false,data?.adminNote??""),{manageAccounts:true})
  }
}
@Module({imports:[IamModule],controllers:[AuthorRequestController]})
export class AuthorRequestModule {}
