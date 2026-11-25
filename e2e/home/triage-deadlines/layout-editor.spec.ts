import {expect,test} from "@playwright/test"
import {fileURLToPath} from "node:url"
import {catalogUser} from "../../catalog/config-override/fixtures"
import {provision} from "../../integration/session-fixture"

test("HOME-11 saves an officer layout, reports conflicts and shows both sides of each change",async({browser})=>{
  test.skip(process.env.RMS_OIDC_INTEGRATION!=="1")
  test.setTimeout(75000)
  const pages=await Promise.all([390,1280,390].map(width=>browser.newPage({baseURL:"http://127.0.0.1:4191",viewport:{width,height:900}})))
  const [admin,peer,officer]=pages
  let cleanup:(()=>Promise<void>)|undefined
  try {
    const [owner,secondAdmin,reader]=await Promise.all(pages.map((p,i)=>catalogUser(p,"school-1",["quan-tri-bo-cuc","quan-tri-thu-hai","chuyen-vien-bo-cuc"][i],i===2?"user":"admin")))
    const keyUrl=secondAdmin.path+"/HOME.OFFICER"
    const prior=await peer.request.get(keyUrl,{headers:secondAdmin.headers})
    expect(prior.status()===404||prior.headers()["x-rms-scope"]==="shared").toBe(true)
    cleanup=async()=>{
      const deleted=await peer.request.delete(keyUrl,{headers:secondAdmin.headers})
      expect([204,404]).toContain(deleted.status())
    }
    provision("UPDATE rms.account SET user_type='staff' WHERE id=:'id'",{id:reader.account.id})
    for(const p of [admin,peer]){
      await p.getByRole("button",{name:"Cấu hình hệ thống",exact:true}).click()
      const open=p.getByRole("button",{name:"Bố cục trang chủ theo vai trò",exact:true})
      await expect(open).toBeVisible()
      await open.click()
      await p.getByLabel("Vai trò áp dụng").selectOption("staff")
      await expect(p.getByRole("checkbox",{name:"Việc cần làm",exact:true})).toBeChecked()
    }
    const editor=admin.getByRole("region",{name:"Bố cục trang chủ theo vai trò"})
    const second=peer.getByRole("region",{name:"Bố cục trang chủ theo vai trò"})
    await editor.getByLabel("Việc cần làm",{exact:true}).uncheck()
    await editor.getByLabel("Lối tắt",{exact:true}).uncheck()
    await editor.getByRole("button",{name:"Đưa Thông báo gần đây lên"}).click()
    await editor.getByRole("button",{name:"Lưu bố cục"}).click()
    await expect(editor.getByText("Đã lưu cấu hình trang chủ.")).toBeVisible()
    const history=editor.getByRole("region",{name:"Lịch sử bố cục"})
    await expect(history.getByText("Thông báo gần đây → Số liệu nhanh",{exact:true})).toBeVisible()
    await expect(history.getByText(owner.account.email,{exact:true})).toBeVisible()
    await second.getByLabel("Số liệu nhanh",{exact:true}).uncheck()
    await second.getByRole("button",{name:"Lưu bố cục"}).click()
    await expect(second.getByRole("alert")).toContainText("đã thay đổi")
    await second.getByRole("button",{name:"Tải bản hiện hành"}).click()
    await expect(second.getByLabel("Việc cần làm",{exact:true})).not.toBeChecked()
    await second.getByLabel("Lối tắt",{exact:true}).check()
    await second.getByRole("button",{name:"Lưu bố cục"}).click()
    await expect(second.getByText("Đã lưu cấu hình trang chủ.")).toBeVisible()
    const latest=second.getByRole("region",{name:"Lịch sử bố cục"})
    await expect(latest.getByText("Thông báo gần đây → Số liệu nhanh → Lối tắt",{exact:true})).toBeVisible()
    await expect(latest.getByText("Thông báo gần đây → Số liệu nhanh",{exact:true})).toHaveCount(2)
    await latest.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/home/lich-su-bo-cuc.png",import.meta.url))})
    await editor.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/home/quan-tri-bo-cuc.png",import.meta.url))})
    expect(await admin.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
    await officer.reload()
    const home=officer.getByRole("region",{name:"Trang chủ cá nhân"})
    await expect(home.getByRole("link",{name:"Xem tất cả thông báo"})).toBeVisible()
    await expect(home.getByRole("link",{name:"Mở báo cáo theo kỳ"})).toBeVisible()
    expect(await home.locator(":scope > section").evaluateAll(nodes=>nodes.map(n=>n.getAttribute("aria-label")))).toEqual(
      ["Lý lịch cá nhân","Thông báo gần đây","Số liệu nhanh","Lối tắt"])
    expect((await officer.request.get(reader.path+"/home-layouts/staff",{headers:reader.headers})).status()).toBe(403)
    provision("UPDATE rms.account SET user_type='user' WHERE id=:'id'",{id:owner.account.id})
    await editor.getByLabel("Vai trò áp dụng").selectOption("user")
    await expect(editor).toHaveCount(0)
    await expect(admin.getByText("Tài khoản thiếu quyền quản lý bố cục của trường.")).toBeVisible()
  } finally {
    try {await cleanup?.()} finally {await Promise.all(pages.map(p=>p.close()))}
  }
})
