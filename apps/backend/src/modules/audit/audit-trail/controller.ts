import { Controller,Get,Header,Headers,Module,Param,ParseUUIDPipe,Query } from "@nestjs/common"
import { IamModule,IamService } from "../../iam/iam.module.js"
import { listProjects } from "../../proposal/access.js"
import { projectTrail } from "./service.js"

@Controller("tenants/:slug/projects")
class ProjectReadController {
  constructor(private readonly iam:IamService) {}
  @Get() @Header("Cache-Control","private, no-store")
  list(@Param("slug") slug:string,@Query("search") search:unknown,@Query("skip") skip:unknown,@Headers("authorization") auth:string) {
    return this.iam.authorized(slug,auth,(db,actor)=>listProjects(db,actor,search,skip))
  }
  @Get(":id/audit") @Header("Cache-Control","private, no-store")
  trail(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Query() query:Record<string,unknown>,@Headers("authorization") auth:string) {
    return this.iam.authorized(slug,auth,(db,actor)=>projectTrail(db,actor,id,query))
  }
}
@Module({imports:[IamModule],controllers:[ProjectReadController]})
export class AuditModule {}
