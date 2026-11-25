import { BadRequestException,Body,Controller,Get,Header,Headers,Module,Param,ParseUUIDPipe,Put } from "@nestjs/common"
import type { components } from "@rms/api-contracts"
import { IamModule,IamService } from "../iam/iam.module.js"
import { activateGraph } from "./kernel.js"
import { activeTemplate,readInstance } from "./version.js"

@Controller("tenants/:slug")
class WorkflowController {
  constructor(private readonly iam:IamService){}
  @Get("workflow/active") @Header("Cache-Control","no-store")
  active(@Param("slug") slug:string,@Headers("authorization") auth:string) {
    return this.iam.authorized(slug,auth,activeTemplate)
  }
  @Put("workflow/active")
  activate(@Param("slug") slug:string,@Headers("authorization") auth:string,@Body() body:components["schemas"]["WorkflowTemplate"]) {
    return this.iam.authorized(slug,auth,async(db,actor)=>{
      if(!Number.isSafeInteger(body?.version)||body.version<0)throw new BadRequestException()
      const version=await activateGraph(db,actor,body.graph,body.version)
      return {version,graph:body.graph}
    })
  }
  @Get("projects/:id/workflow") @Header("Cache-Control","no-store")
  project(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string) {
    return this.iam.authorized(slug,auth,(db,actor)=>readInstance(db,actor,id))
  }
}
@Module({imports:[IamModule],controllers:[WorkflowController]})
export class WorkflowModule {}
