import { signIn,provision } from "../../integration/session-fixture"
import type { Page } from "@playwright/test"

export async function catalogUser(page:Page,slug:string,name:string,role:"operator"|"admin"|"user") {
  const path="/api/tenants/"+slug+"/catalog/configurations"
  const {account,res}=await signIn(page,slug,name+"@example.invalid")
  if(role==="operator") provision("INSERT INTO rms.catalog_operator(tenant_id,account_id) SELECT tenant_id,id FROM rms.account WHERE id=:'id'::uuid",{id:account.id})
  if(role==="admin") provision("UPDATE rms.account SET user_type='admin' WHERE id=:'id'::uuid",{id:account.id})
  if(role==="admin"){
    await page.getByRole("button",{name:"Tải lại thông tin"}).click()
    await page.getByText("Vai trò admin",{exact:true}).waitFor()
  }
  return {path,account,headers:{authorization:(await res.request().allHeaders()).authorization}}
}
