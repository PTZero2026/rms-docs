import {teachingEnabled} from "../catalog/features.js"
import {IndependentProductsController} from "./independent-controller.js"
import { Body,Controller,Get,Header,Headers,HttpCode,Module,Param,ParseUUIDPipe,Post,Put } from "@nestjs/common"
import type { operations } from "@rms/api-contracts"
import {productTypes} from "./catalog.js"
import { IamModule,IamService } from "../iam/iam.module.js"
import { CatalogModule } from "../catalog/config-override/controller.js"
import { CatalogAdapter } from "../catalog/config-override/service.js"
import { decideProduct,listProducts,revokeProductEvidence,saveProduct,submitProduct } from "./service.js"

type Op="saveProduct"|"submitProduct"|"decideProduct"|"revokeProductEvidence"
type Input<K extends Op>=operations[K]["requestBody"]["content"]["application/json"]
@Controller("tenants/:slug/projects/:id/products")
class ProductController{
  constructor(private iam:IamService,private catalog:CatalogAdapter){}
  @Get() @Header("Cache-Control","private, no-store")
  list(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string){
    return this.iam.authorized(slug,auth,(db,a)=>listProducts(db,a,id))
  }
  @Put(":productId")
  save(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string,@Param("productId",ParseUUIDPipe) prod:string,@Body() cmd:Input<"saveProduct">){
    return this.iam.authorized(slug,auth,(db,a)=>saveProduct(db,a,id,prod,cmd))
  }
  @Post(":productId/submit") @HttpCode(200)
  async submit(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string,@Param("productId",ParseUUIDPipe) prod:string,@Body() cmd:Input<"submitProduct">){
    const active=(await productTypes(this.catalog,slug,auth)).map(type=>type.code)
    return this.iam.authorized(slug,auth,(db,a)=>submitProduct(db,a,id,prod,cmd,active))
  }
  @Post(":productId/decision") @HttpCode(200)
  async decide(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string,@Param("productId",ParseUUIDPipe) prod:string,@Body() cmd:Input<"decideProduct">){
    const hours=cmd?.action==="approve"&&await teachingEnabled(this.catalog,slug,auth)
    return this.iam.authorized(slug,auth,(db,a)=>decideProduct(db,a,id,prod,cmd,hours))
  }
  @Post("files/:fileId/revoke") @HttpCode(200)
  revoke(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string,@Param("fileId",ParseUUIDPipe) file:string,@Body() cmd:Input<"revokeProductEvidence">){
    return this.iam.authorized(slug,auth,(db,a)=>revokeProductEvidence(db,a,id,file,cmd))
  }
}
@Controller("tenants/:slug/product-types")
class ProductTypesController{
  constructor(private catalog:CatalogAdapter){}
  @Get() @Header("Cache-Control","private, no-store")
  list(@Param("slug") slug:string,@Headers("authorization") auth:string){
    return productTypes(this.catalog,slug,auth)
  }
}
@Module({imports:[IamModule,CatalogModule],controllers:[ProductController,ProductTypesController,IndependentProductsController]})
export class ProductModule {}
