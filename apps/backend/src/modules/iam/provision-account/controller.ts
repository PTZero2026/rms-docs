import {Body,Controller,ForbiddenException,Get,Header,Headers,HttpCode,Module,Param,Post} from "@nestjs/common"
import {IamService,IamModule} from "../iam.module.js"
import {reserveAccount,completeAccount,type Command} from "./service.js"
import {provisionIdentity} from "./keycloak.js"
@Controller("tenants/:slug/admin")
class ProvisionController {
  constructor(private iam:IamService){}
  @Get("units") @Header("Cache-Control","no-store")
  units(@Param("slug") slug:string,@Headers("authorization") auth:string){
    return this.iam.authorized(slug,auth,async(db,a)=>{
      if(a.userType!=="admin")throw new ForbiddenException()
      return (await db.query("SELECT id,name FROM rms.unit ORDER BY name,id")).rows
    })
  }
  @Post("users") @HttpCode(200)
  async create(@Param("slug") slug:string,@Headers("authorization") auth:string,@Body() cmd:Command){
    const prior=await this.iam.authorized(slug,auth,async(db,a,realm)=>({...await reserveAccount(db,a,cmd),issuer:realm.issuer}),{manageAccounts:true})
    if(prior.account)return prior.account
    const sub=await provisionIdentity(prior.issuer,slug,cmd)
    return this.iam.authorized(slug,auth,(db,a)=>completeAccount(db,a,cmd,sub),{manageAccounts:true})
  }
}
@Module({imports:[IamModule],controllers:[ProvisionController]})
export class ProvisionAccountModule{}
