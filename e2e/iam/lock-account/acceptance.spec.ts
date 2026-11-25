import { test,expect } from "@playwright/test"
import { fileURLToPath } from "node:url"
import { provision,signIn } from "../../integration/session-fixture"

test("RV-01 lock and unlock through IAM preserve profile for both first requests after lock",async({browser})=>{
  test.skip(process.env.RMS_OIDC_INTEGRATION!=="1")
  test.setTimeout(90000)
  const pages=await Promise.all([0,1,2].map(()=>browser.newPage({baseURL:"http://127.0.0.1:4191"})))
  const [admin,u,b]=pages
  try{
    const [a,target,outsider]=await Promise.all([signIn(admin,"school-1","quantri-iam@example.invalid"),signIn(u,"school-1","nhansu-thu@example.invalid"),signIn(b,"school-2","quantri-iam-b@example.invalid")])
    provision("UPDATE rms.account SET user_type='admin' WHERE id IN (:'a'::uuid,:'b'::uuid)",{a:a.account.id,b:outsider.account.id})
    const adminHeaders={authorization:(await a.res.request().allHeaders()).authorization}
    const targetHeaders={authorization:(await target.res.request().allHeaders()).authorization}
    const otherHeaders={authorization:(await outsider.res.request().allHeaders()).authorization}
    const path="/api/tenants/school-1/admin/users/"+target.account.id
    expect((await u.request.post(path+"/lock",{headers:targetHeaders})).status()).toBe(403)
    expect((await b.request.post(path.replace("school-1","school-2")+"/lock",{headers:otherHeaders})).status()).toBe(404)
    expect((await u.request.post("/api/tenants/school-1/admin/users",{headers:{authorization:(await target.res.request().allHeaders()).authorization},data:{}})).status()).toBe(403)
    await u.getByRole("button",{name:"Hồ sơ cá nhân",exact:true}).click()
    await u.getByLabel("Họ và tên").fill("Nguyễn An")
    await u.getByRole("button",{name:"Lưu hồ sơ cá nhân"}).click()
    await expect(u.getByText("Đã lưu hồ sơ cá nhân.")).toBeVisible()
    await admin.getByRole("button",{name:"Tải lại thông tin"}).click()
    await admin.getByRole("button",{name:"Quản lý người dùng"}).click()
    await admin.getByLabel("Tên hoặc email").fill(target.email)
    await admin.getByRole("button",{name:"Tìm người dùng"}).click()
    await admin.getByRole("button",{name:target.email,exact:true}).click()
    const action=async(lock:boolean)=>{
      await admin.getByRole("button",{name:lock?"Khóa tài khoản":"Mở khóa tài khoản",exact:true}).click()
      await admin.getByRole("button",{name:"Xác nhận thay đổi"}).click()
      await expect(admin.getByText(new RegExp("Sự kiện "+(lock?"ACCOUNT_LOCKED":"ACCOUNT_UNLOCKED")))).toBeVisible()
    }
    const shot=(name:string)=>fileURLToPath(new URL("../../../docs/reviews/screenshots/iam/"+name+".png",import.meta.url))
    await action(true)
    const repeat=await admin.request.post(path+"/lock",{headers:adminHeaders})
    expect(repeat.status()).toBe(200)
    expect((await repeat.json()).event.actorId).toBe(a.account.id)
    await admin.screenshot({path:shot("quan-tri-da-khoa"),fullPage:true})
    const firstRead=u.waitForResponse(r=>r.url().endsWith("/users/me"))
    await u.getByRole("button",{name:"Tải lại hồ sơ cá nhân"}).click()
    expect((await firstRead).status()).toBe(403)
    await action(false)
    await u.getByRole("button",{name:"Tải lại hồ sơ cá nhân"}).click()
    await expect(u.getByLabel("Họ và tên")).toHaveValue("Nguyễn An")
    await u.getByLabel("Họ và tên").fill("Bản chưa lưu")
    await action(true)
    const firstSave=u.waitForResponse(r=>r.url().endsWith("/users/me") && r.request().method()==="PATCH")
    await u.getByRole("button",{name:"Lưu hồ sơ cá nhân"}).click()
    expect((await firstSave).status()).toBe(403)
    await expect(u.getByText("Tài khoản không còn quyền thực hiện yêu cầu.")).toBeVisible()
    await u.screenshot({path:shot("phien-cu-tu-choi"),fullPage:true})
    const after=await (await admin.request.get(path,{headers:adminHeaders})).json()
    expect(after.account).toMatchObject({fullName:"Nguyễn An",revision:1,isActive:false})
    provision("DO $$ BEGIN IF (SELECT count(*) FROM rms.audit_log a JOIN rms.account u ON (u.tenant_id,u.id)=(a.tenant_id,a.target_id) WHERE u.email='nhansu-thu@example.invalid' AND action='PROFILE_UPDATED')<>1 THEN RAISE EXCEPTION 'unexpected profile history'; END IF; END $$;",{})
  }finally{await Promise.all(pages.map(p=>p.close()))}
})
