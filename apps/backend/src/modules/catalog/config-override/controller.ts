import { Body,Controller,Get,Header,Headers,HttpCode,Module,Param,Post,Put } from "@nestjs/common"
import type { operations } from "@rms/api-contracts"
import { IamModule } from "../../iam/iam.module.js"
import { CatalogAdapter } from "./service.js"

type Input=operations["createCatalogValue"]["requestBody"]["content"]["application/json"]
@Controller("tenants/:slug/catalog/values/:key")
class CatalogController {
  constructor(private readonly adapter:CatalogAdapter){}
  @Get() @Header("Cache-Control","private, no-store")
  read(@Param("slug") slug:string,@Param("key") key:string,@Headers("authorization") auth?:string) {
    return this.adapter.read(slug,key,auth)
  }
  @Post() @HttpCode(200)
  create(@Param("slug") slug:string,@Param("key") key:string,@Body() body:Input,@Headers("authorization") auth?:string) {
    return this.adapter.write(slug,key,auth,body,true)
  }
  @Put()
  update(@Param("slug") slug:string,@Param("key") key:string,@Body() body:Input,@Headers("authorization") auth?:string) {
    return this.adapter.write(slug,key,auth,body,false)
  }
}
@Module({imports:[IamModule],controllers:[CatalogController],providers:[CatalogAdapter],exports:[CatalogAdapter]})
export class CatalogModule {}
