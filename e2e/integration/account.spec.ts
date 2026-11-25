import { provision, signIn } from "./session-fixture"
import { expect, test } from "@playwright/test"

test("an OTP session reaches RMS and the same access token observes account revocation", async ({page}) => {
  test.skip(process.env.RMS_OIDC_INTEGRATION !== "1", "Requires the isolated PostgreSQL and Keycloak fixture.")
  const {email,account,res}=await signIn(page,"school-1")
  expect(account).toMatchObject({email,userType:"user",isNew:true,isProfileComplete:false,permissions:["meetings.view"]})
  const authorization = (await res.request().allHeaders()).authorization
  const wrongTenant = await page.request.get("/api/tenants/school-2/auth/me",{headers:{authorization}})
  expect(wrongTenant.status()).toBe(401)
  // Exercise a manual account refresh after the initial home requests have completed.
  const home=page.getByRole("region",{name:"Trang chủ cá nhân"})
  await expect(home.getByText("Xin chào, "+email,{exact:true})).toBeVisible()
  await expect(home.getByRole("region",{name:"Việc cần làm"}).getByText(/\d+ việc · \d+ quá hạn/)).toBeVisible()
  await expect(home.getByRole("link",{name:"Xem tất cả thông báo"})).toBeVisible()
  provision("UPDATE rms.account SET is_active=false WHERE id=:'account_id'::uuid;",{account_id:account.id})
  const locked = await page.request.get("/api/tenants/school-1/auth/me",{headers:{authorization}})
  expect(locked.status()).toBe(403)
  await page.getByRole("button",{name:"Tải lại thông tin"}).click()
  await expect(page.getByRole("alert")).toContainText("Tài khoản đã ngừng truy cập.")
})

test("logout ends the browser SSO session and asks for a fresh OTP login",async ({page})=>{
  test.skip(process.env.RMS_OIDC_INTEGRATION!=="1","Requires isolated realm.")
  await signIn(page,"school-1")
  await page.getByRole("button",{name:"Đăng xuất"}).click()
  await expect(page.locator("input[name=username]")).toBeVisible()
  await page.goto("/app/school-1")
  await expect(page.locator("input[name=username]")).toBeVisible()
  await expect(page.getByRole("button",{name:"Tải lại thông tin"})).toHaveCount(0)
})
