import { test,expect } from "@playwright/test"
import { fileURLToPath } from "node:url"
import { provision,signIn } from "../../integration/session-fixture"

test("tenant process admin activates a version and rejects an incomplete graph",async({page})=>{
  test.skip(process.env.RMS_OIDC_INTEGRATION!=="1")
  const {account,res}=await signIn(page,"school-2","chuquytrinh@example.invalid")
  provision("UPDATE rms.account SET user_type='admin' WHERE id=:'id'::uuid",{id:account.id})
  await page.getByRole("button",{name:"Tải lại thông tin"}).click()
  await page.getByRole("button",{name:"Cấu hình quy trình"}).click()
  const headers={authorization:(await res.request().allHeaders()).authorization}
  const current=await page.request.get("/api/tenants/school-2/workflow/active",{headers})
  const version=(await current.json()).version+1
  await page.getByRole("button",{name:"Kích hoạt phiên bản "+version}).click()
  await expect(page.getByRole("heading",{name:"Mẫu quy trình · Phiên bản "+version})).toBeVisible()
  await page.getByRole("combobox",{name:"Chọn bước",exact:true}).selectOption({label:"UNDER_REVIEW"})
  await page.getByLabel("Mã bước",{exact:true}).fill("CHO_HOI_DONG")
  await page.getByRole("button",{name:"Kích hoạt phiên bản "+(version+1)}).click()
  await expect(page.getByRole("heading",{name:"Mẫu quy trình · Phiên bản "+(version+1)})).toBeVisible()
  await page.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/workflow/phien-ban-2.png",import.meta.url)),fullPage:true})
  await page.getByRole("button",{name:"Bỏ bước",exact:true}).click()
  await page.getByRole("button",{name:"Kích hoạt phiên bản "+(version+2)}).click()
  await expect(page.getByText(/Cạnh chưa hợp lệ/)).toBeVisible()
  const active=await page.request.get("/api/tenants/school-2/workflow/active",{headers})
  expect((await active.json()).version).toBe(version+1)
  expect((await page.request.get("/api/tenants/school-1/workflow/active",{headers})).status()).toBe(401)
})
