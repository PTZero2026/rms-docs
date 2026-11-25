import { Body,Controller,Delete,Get,Header,Headers,HttpCode,Module,Param,ParseUUIDPipe,Patch,Post,Query } from "@nestjs/common"
import type { operations } from "@rms/api-contracts"
import { IamModule,IamService } from "../iam.module.js"
import { listAccounts,managed,manageAccount,ownProfile,saveProfile } from "./service.js"

@Controller("tenants/:slug")
class AccountController {
  constructor(private readonly iam:IamService){}
  @Get("users/me") @Header("Cache-Control","no-store")
  profile(@Param("slug") slug:string,@Headers("authorization") auth:string) {
    return this.iam.authorized(slug,auth,ownProfile)
  }
  @Patch("users/me") @Header("Cache-Control","no-store")
  save(@Param("slug") slug:string,@Headers("authorization") auth:string,@Body() body:operations["saveOwnProfile"]["requestBody"]["content"]["application/json"]) {
    return this.iam.authorized(slug,auth,(db,a)=>saveProfile(db,a,body),{manageAccounts:true})
  }
  @Get("admin/users") @Header("Cache-Control","no-store")
  list(@Param("slug") slug:string,@Headers("authorization") auth:string,@Query("search") search:unknown,@Query("skip") skip:unknown) {
    return this.iam.authorized(slug,auth,(db,a)=>listAccounts(db,a,search,skip))
  }
  @Get("admin/users/:id") @Header("Cache-Control","no-store")
  account(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string) {
    return this.iam.authorized(slug,auth,(db,a)=>managed(db,a,id))
  }
  @Post("admin/users/:id/lock") @HttpCode(200)
  lock(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string) {
    return this.iam.authorized(slug,auth,(db,a)=>manageAccount(db,a,id,"lock"),{manageAccounts:true})
  }
  @Post("admin/users/:id/unlock") @HttpCode(200)
  unlock(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string) {
    return this.iam.authorized(slug,auth,(db,a)=>manageAccount(db,a,id,"unlock"),{manageAccounts:true})
  }
  @Delete("admin/users/:id")
  deactivate(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string) {
    return this.iam.authorized(slug,auth,(db,a)=>manageAccount(db,a,id,"deactivate"),{manageAccounts:true})
  }
  @Post("admin/users/:id/change-role") @HttpCode(200)
  role(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string,@Body() body:operations["changeAccountRole"]["requestBody"]["content"]["application/json"]) {
    return this.iam.authorized(slug,auth,(db,a)=>manageAccount(db,a,id,"role",body?.userType),{manageAccounts:true})
  }
}
@Module({imports:[IamModule],controllers:[AccountController]})
export class AccountModule {}
