import {teachingEnabled} from "../catalog/features.js"
import type {operations} from "@rms/api-contracts"
import {Body,Controller,Get,Header,Headers,HttpCode,Param,ParseUUIDPipe,Post,Put} from "@nestjs/common"
import {IamService} from "../iam/iam.module.js"
import {CatalogAdapter} from "../catalog/config-override/service.js"
import {productTypes} from "./catalog.js"
import {decideIndependent,findIndependentAuthor,independentPage,saveIndependent,submitIndependent} from "./independent.js"

@Controller("tenants/:slug/independent-products")
export class IndependentProductsController{
  constructor(private iam:IamService,private catalog:CatalogAdapter){}
  @Get() @Header("Cache-Control","private, no-store")
  list(@Param("slug") slug:string,@Headers("authorization") auth:string){
    return this.iam.authorized(slug,auth,(db,a)=>independentPage(db,a))
  }
  @Post("author-lookup") @HttpCode(200) @Header("Cache-Control","no-store")
  author(@Param("slug") slug:string,@Headers("authorization") auth:string,@Body() body:operations["findIndependentAuthor"]["requestBody"]["content"]["application/json"]){
    return this.iam.authorized(slug,auth,(db,a)=>findIndependentAuthor(db,a,body?.email))
  }
  @Put(":id")
  save(@Param("slug") slug:string,@Headers("authorization") auth:string,@Param("id",ParseUUIDPipe) id:string,@Body() cmd:Parameters<typeof saveIndependent>[3]){
    return this.iam.authorized(slug,auth,(db,a)=>saveIndependent(db,a,id,cmd))
  }
  @Post(":id/submit") @HttpCode(200)
  async submit(@Param("slug") slug:string,@Headers("authorization") auth:string,@Param("id",ParseUUIDPipe) id:string,@Body() cmd:Parameters<typeof submitIndependent>[3]){
    const types=(await productTypes(this.catalog,slug,auth)).map(t=>t.code)
    return this.iam.authorized(slug,auth,(db,a)=>submitIndependent(db,a,id,cmd,types))
  }
  @Post(":id/decision") @HttpCode(200)
  async decide(@Param("slug") slug:string,@Headers("authorization") auth:string,@Param("id",ParseUUIDPipe) id:string,@Body() cmd:Parameters<typeof decideIndependent>[3]){
    const hours=cmd?.action==="approve"&&await teachingEnabled(this.catalog,slug,auth)
    return this.iam.authorized(slug,auth,(db,a)=>decideIndependent(db,a,id,cmd,hours))
  }
}
