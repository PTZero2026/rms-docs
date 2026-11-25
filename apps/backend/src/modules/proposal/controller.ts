import {CatalogModule} from "../catalog/config-override/controller.js"
import {CatalogAdapter} from "../catalog/config-override/service.js"
import {productTypes} from "../product/catalog.js"
import { Body,Controller,Get,Header,Headers,HttpCode,Module,Param,ParseUUIDPipe,Post,Put } from "@nestjs/common"
import type { operations } from "@rms/api-contracts"
import { IamModule,IamService } from "../iam/iam.module.js"
import { actOnProposal,createDraft,editDraft,proposal } from "./service.js"

type Input=operations["createDraftProposal"]["requestBody"]["content"]["application/json"]
type Command=operations["actOnProposal"]["requestBody"]["content"]["application/json"]
@Controller("tenants/:slug")
class ProposalController {
  constructor(private readonly iam:IamService,private catalog:CatalogAdapter){}
  @Post("calls/:id/proposals") @HttpCode(200)
  async create(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string,@Body() input:Input) {
    const arrived=new Date()
    const codes=Object.keys(input?.commitments??{}).length?(await productTypes(this.catalog,slug,auth)).map(t=>t.code):undefined
    return this.iam.authorized(slug,auth,(db,a)=>createDraft(db,a,id,input,arrived,codes))
  }
  @Get("projects/:id/proposal") @Header("Cache-Control","no-store")
  get(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string) {
    return this.iam.authorized(slug,auth,(db,a)=>proposal(db,a,id))
  }
  @Put("projects/:id/proposal")
  async edit(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string,@Body() input:Input) {
    const arrived=new Date()
    const codes=Object.keys(input?.commitments??{}).length?(await productTypes(this.catalog,slug,auth)).map(t=>t.code):undefined
    return this.iam.authorized(slug,auth,(db,a)=>editDraft(db,a,id,input,arrived,codes))
  }
  @Post("projects/:id/proposal/actions") @HttpCode(200)
  act(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string,@Body() cmd:Command) {
    const arrived=new Date()
    return this.iam.authorized(slug,auth,(db,a)=>actOnProposal(db,a,id,cmd,arrived))
  }
}
@Module({imports:[IamModule,CatalogModule],controllers:[ProposalController]})
export class ProposalModule {}
