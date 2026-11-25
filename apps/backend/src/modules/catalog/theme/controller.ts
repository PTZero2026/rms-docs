import { Body, Controller, Get, Header, Headers, HttpCode, Module, Param, Post, Put } from "@nestjs/common"
import { IamService,IamModule } from "../../iam/iam.module.js"
import { applyDraft,getActive,getEditor,rollbackTheme,saveDraft,type Apply,type Rollback,type Save } from "./service.js"

@Controller("tenants/:slug/catalog/theme")
class ThemeController {
  constructor(private readonly iam:IamService) {}
  @Get()
  @Header("Cache-Control","no-store")
  active(@Param("slug") slug:string,@Headers("authorization") token:string) {
    return this.iam.authorized(slug,token,getActive)
  }
  @Get("editor")
  @Header("Cache-Control","no-store")
  editor(@Param("slug") slug:string,@Headers("authorization") token:string) {
    return this.iam.authorized(slug,token,getEditor)
  }
  @Put("draft")
  draft(@Param("slug") slug:string,@Headers("authorization") token:string,@Body() body:Save) {
    return this.iam.authorized(slug,token,(db,a)=>saveDraft(db,a,body))
  }
  @Post("apply")
  @HttpCode(200)
  apply(@Param("slug") slug:string,@Headers("authorization") token:string,@Body() body:Apply) {
    return this.iam.authorized(slug,token,(db,a)=>applyDraft(db,a,body))
  }
  @Post("rollback")
  @HttpCode(200)
  rollback(@Param("slug") slug:string,@Headers("authorization") token:string,@Body() body:Rollback) {
    return this.iam.authorized(slug,token,(db,a)=>rollbackTheme(db,a,body))
  }
}
@Module({ imports:[IamModule], controllers:[ThemeController] })
export class ThemeModule {}
