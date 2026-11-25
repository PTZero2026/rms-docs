import { Controller,Get,Header,Headers,Module,Param } from "@nestjs/common"
import { CatalogAdapter } from "./config-override/service.js"
import { CatalogModule } from "./config-override/controller.js"

@Controller("tenants/:slug/features")
class CapabilityController {
  constructor(private catalog:CatalogAdapter){}
  @Get() @Header("Cache-Control","no-store")
  async list(@Param("slug") slug:string,@Headers("authorization") auth:string){
    const ai=await this.catalog.optionalText(slug,"FEATURE.AI",auth)==="true"?["AI"]:[]
    if(await this.catalog.optionalText(slug,"FEATURE.E4",auth)!=="true")return {modules:ai}
    const modules=await Promise.all(["F09","F10","F11","F12","P03"].map(async code=>{
      const setting=await this.catalog.optionalText(slug,"FEATURE."+code,auth)
      return setting==="true"||setting===null&&code!=="P03"?code:null
    }))
    return {modules:[...ai,...modules.filter(code=>code!==null)]}
  }
}
@Module({imports:[CatalogModule],controllers:[CapabilityController]})
export class CapabilityModule {}
