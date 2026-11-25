import {Body,Controller,Get,Header,Headers,HttpCode,Module,NotFoundException,Param,ParseUUIDPipe,Post} from "@nestjs/common"
import type {operations} from "@rms/api-contracts"
import {IamModule,IamService} from "../iam/iam.module.js"
import {CatalogModule} from "../catalog/config-override/controller.js"
import {CatalogAdapter} from "../catalog/config-override/service.js"
import {kind,library} from "./source.js"
import {decideSuggestion,generateSuggestion,history,readSuggestion} from "./service.js"
import {configuredSelector} from "./model.js"
type Decision=operations["decideSourceSuggestion"]["requestBody"]["content"]["application/json"]
@Controller("tenants/:slug/assistant")
class AssistantController{
  constructor(private iam:IamService,private catalog:CatalogAdapter){}
  private async check(slug:string,auth:string){
    if(await this.catalog.optionalText(slug,"FEATURE.AI",auth)!=="true")throw new NotFoundException()
  }
  @Get("library") @Header("Cache-Control","private, no-store")
  async library(@Param("slug") slug:string,@Headers("authorization") auth:string){
    await this.check(slug,auth)
    return this.iam.authorized(slug,auth,library)
  }
  @Get(":module/:id") @Header("Cache-Control","private, no-store")
  async history(@Param("slug") slug:string,@Headers("authorization") auth:string,@Param("module") m:string,@Param("id",ParseUUIDPipe) id:string){
    await this.check(slug,auth)
    return this.iam.authorized(slug,auth,(db,a)=>history(db,a,kind(m),id))
  }
  @Post(":module/:id") @HttpCode(200) @Header("Cache-Control","no-store")
  async generate(@Param("slug") slug:string,@Headers("authorization") auth:string,@Param("module") m:string,@Param("id",ParseUUIDPipe) id:string){
    await this.check(slug,auth)
    return this.iam.authorized(slug,auth,(db,a)=>generateSuggestion(db,a,kind(m),id,configuredSelector()))
  }
  @Get(":module/:id/:suggestionId") @Header("Cache-Control","private, no-store")
  async read(@Param("slug") slug:string,@Headers("authorization") auth:string,@Param("module") m:string,@Param("id",ParseUUIDPipe) id:string,@Param("suggestionId",ParseUUIDPipe) suggestion:string){
    await this.check(slug,auth)
    return this.iam.authorized(slug,auth,(db,a)=>readSuggestion(db,a,kind(m),id,suggestion))
  }
  @Post(":module/:id/:suggestionId") @HttpCode(200) @Header("Cache-Control","no-store")
  async decide(@Param("slug") slug:string,@Headers("authorization") auth:string,@Param("module") m:string,@Param("id",ParseUUIDPipe) id:string,@Param("suggestionId",ParseUUIDPipe) suggestion:string,@Body() cmd:Decision){
    await this.check(slug,auth)
    return this.iam.authorized(slug,auth,(db,a)=>decideSuggestion(db,a,kind(m),id,suggestion,cmd))
  }
}
@Module({imports:[IamModule,CatalogModule],controllers:[AssistantController]})
export class AssistantModule{}
