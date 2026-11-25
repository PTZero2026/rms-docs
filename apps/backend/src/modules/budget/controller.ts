import { Body,ConflictException,Controller,ForbiddenException,Get,Header,Headers,HttpCode,Module,Param,ParseUUIDPipe,Post,Put } from "@nestjs/common"
import type { operations } from "@rms/api-contracts"
import { IamModule,IamService } from "../iam/iam.module.js"
import { CatalogModule } from "../catalog/config-override/controller.js"
import { CatalogAdapter } from "../catalog/config-override/service.js"
import { allocate,budgetDetail,reconcile,saveExpense,settle,voidExpense } from "./service.js"

type Input<K extends "confirmAllocation"|"saveExpense"|"voidExpense"|"reconcileExpense"|"settleBudget">=operations[K]["requestBody"]["content"]["application/json"]
@Controller("tenants/:slug/projects/:id/budget")
class BudgetController {
  constructor(private iam:IamService,private catalog:CatalogAdapter){}
  private async value(slug:string,auth:string,key:string){
    return this.catalog.optionalText(slug,"budget."+key,auth)
  }
  private async mode(slug:string,auth:string){
    const value=await this.value(slug,auth,"reconciliationEnabled")
    if(value===null||value==="false")return false
    if(value==="true")return true
    throw new ConflictException("Chế độ đối soát B01 chưa hợp lệ.")
  }
  private async checkOfficer(slug:string,auth:string,id:string){
    return this.iam.authorized(slug,auth,async(db,a)=>{
      if(a.userType!=="staff")throw new ForbiddenException()
      const detail=await budgetDetail(db,a,id)
      if(!detail.officer)throw new ForbiddenException()
    })
  }
  @Get() @Header("Cache-Control","private, no-store")
  async detail(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string){
    const detail=await this.iam.authorized(slug,auth,(db,a)=>budgetDetail(db,a,id))
    return {...detail,reconciliationEnabled:detail.officer?await this.mode(slug,auth):null}
  }
  @Post("allocation") @HttpCode(200)
  async confirm(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string,@Body() input:Input<"confirmAllocation">){
    await this.checkOfficer(slug,auth,id)
    const [rate,cap]=await Promise.all([this.value(slug,auth,"managementFeeRate"),this.value(slug,auth,"managementFeeCap")])
    if(rate===null)throw new ConflictException("Chưa cấu hình tỷ lệ phí quản lý của trường.")
    return this.iam.authorized(slug,auth,(db,a)=>allocate(db,a,id,input,{rate,cap}))
  }
  @Put("allocation") adjust(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string,@Body() input:Input<"confirmAllocation">){
    return this.iam.authorized(slug,auth,(db,a)=>allocate(db,a,id,input,null,true))
  }
  @Put("expenses/:expenseId") save(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Param("expenseId",ParseUUIDPipe) expenseId:string,@Headers("authorization") auth:string,@Body() input:Input<"saveExpense">){
    return this.iam.authorized(slug,auth,(db,a)=>saveExpense(db,a,id,expenseId,input))
  }
  @Post("expenses/:expenseId/void") @HttpCode(200)
  remove(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Param("expenseId",ParseUUIDPipe) expenseId:string,@Headers("authorization") auth:string,@Body() input:Input<"voidExpense">){
    return this.iam.authorized(slug,auth,(db,a)=>voidExpense(db,a,id,expenseId,input))
  }
  @Post("expenses/:expenseId/reconcile") @HttpCode(200)
  async match(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Param("expenseId",ParseUUIDPipe) expenseId:string,@Headers("authorization") auth:string,@Body() input:Input<"reconcileExpense">){
    await this.checkOfficer(slug,auth,id)
    const enabled=await this.mode(slug,auth)
    return this.iam.authorized(slug,auth,(db,a)=>reconcile(db,a,id,expenseId,input,enabled))
  }
  @Post("settle") @HttpCode(200)
  async close(@Param("slug") slug:string,@Param("id",ParseUUIDPipe) id:string,@Headers("authorization") auth:string,@Body() input:Input<"settleBudget">){
    await this.checkOfficer(slug,auth,id)
    const enabled=await this.mode(slug,auth)
    return this.iam.authorized(slug,auth,(db,a)=>settle(db,a,id,input,enabled))
  }
}
@Module({imports:[IamModule,CatalogModule],controllers:[BudgetController]})
export class BudgetModule {}
