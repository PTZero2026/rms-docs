import {ConflictException,Controller,Get,Header,Headers,Module,NotFoundException,Param,ParseUUIDPipe,Query} from "@nestjs/common"
import type {PoolClient} from "pg"
import {IamModule,IamService} from "../../iam/iam.module.js"
import type {SessionAccount} from "../../iam/account.js"
import {CatalogModule} from "../../catalog/config-override/controller.js"
import {CatalogAdapter} from "../../catalog/config-override/service.js"
import {openWork,returnedWork} from "./service.js"
import {dashboard,dataWidget,homeLayout,homeProfile,layoutKey,widgetsFor,type WidgetData} from "../overview.js"
import {teachingEnabled} from "../../catalog/features.js"
import {profileSettings} from "../../profile/professional/service.js"

@Controller("tenants/:slug/home")
class HomeController {
  constructor(private readonly iam:IamService,private readonly catalog:CatalogAdapter){}

  private async withLayout<T>(slug:string,auth:string,includeTeaching:boolean,
    read:(db:PoolClient,a:SessionAccount,widgets:ReturnType<typeof widgetsFor>)=>Promise<T>,
    roleChanged=()=>new ConflictException("Vai trò đã thay đổi.")){
    const role=await this.iam.authorized(slug,auth,async(_db,a)=>a.userType)
    const configured=await this.catalog.optionalText(slug,layoutKey(role),auth)
    let widgets=widgetsFor(role,configured,includeTeaching)
    if(widgets.includes("teaching")&&!await teachingEnabled(this.catalog,slug,auth))
      widgets=widgets.filter(widget=>widget!=="teaching")
    return this.iam.authorized(slug,auth,(db,a)=>{
      if(a.userType!==role)throw roleChanged()
      return read(db,a,widgets)
    })
  }

  @Get("layout") @Header("Cache-Control","private, no-store")
  layout(@Param("slug") slug:string,@Headers("authorization") auth:string){
    return this.withLayout(slug,auth,true,async(_db,a,widgets)=>homeLayout(a,widgets))
  }

  @Get("widgets/:widget") @Header("Cache-Control","private, no-store")
  async widget(@Param("slug") slug:string,@Param("widget") widget:string,@Headers("authorization") auth:string):Promise<WidgetData>{
    if(widget==="profile"){
      const config=await this.catalog.optionalText(slug,"PROFILE.FIELDS",auth)
      return this.iam.authorized(slug,auth,async(db,a)=>({widget:"profile" as const,...await homeProfile(db,a,profileSettings(config).required)}))
    }
    if(widget!=="projects"&&widget!=="teaching"&&widget!=="activity")throw new NotFoundException()
    return this.withLayout(slug,auth,widget==="teaching",(db,a,widgets)=>{
      if(!widgets.includes(widget))throw new NotFoundException()
      return dataWidget(db,a,widget)
    })
  }

  @Get("overview") @Header("Cache-Control","private, no-store")
  async overview(@Param("slug") slug:string,@Headers("authorization") auth:string){
    const config=await this.catalog.optionalText(slug,"PROFILE.FIELDS",auth)
    return this.withLayout(slug,auth,true,(db,a,widgets)=>dashboard(db,a,widgets,profileSettings(config).required))
  }

  @Get("work") @Header("Cache-Control","private, no-store")
  list(@Param("slug") slug:string,@Headers("authorization") auth:string,@Query() query:Record<string,unknown>){
    return this.withLayout(slug,auth,false,(db,a,widgets)=>
      widgets.includes("tasks")?returnedWork(db,a,query):Promise.resolve({visible:false,total:0,overdue:0,items:[]}))
  }

  @Get("work/:id") @Header("Cache-Control","private, no-store")
  source(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string){
    return this.withLayout(slug,auth,false,(db,a,widgets)=>{
      if(!widgets.includes("tasks"))throw new NotFoundException()
      return openWork(db,a,id)
    },()=>new NotFoundException())
  }
}
@Module({imports:[IamModule,CatalogModule],controllers:[HomeController]})
export class HomeModule {}
