import { choose } from "../../lib/choice.mjs"
import {expect,test} from "@playwright/test"
import {execFileSync} from "node:child_process"
import {provision} from "../../integration/session-fixture"
import {fileURLToPath} from "node:url"
import {catalogUser} from "../../catalog/config-override/fixtures"

test("B04 admin previews two channel templates, removes one and the officer sees the missing channel",async({browser})=>{
  test.skip(process.env.RMS_OIDC_INTEGRATION!=="1")
  const [admin,officer]=await Promise.all([390,1280].map(width=>browser.newPage({
    baseURL:"http://127.0.0.1:4191",viewport:{width,height:900},
  })))
  try{
    const [manager,staff]=await Promise.all([catalogUser(admin,"school-2","mau-thong-bao","admin"),
      catalogUser(officer,"school-2","xem-mau-thong-bao","user")])
    provision("UPDATE rms.account SET user_type='staff' WHERE id=:'id'",{id:staff.account.id})
    await officer.reload()
    for (const page of [admin,officer]){
      await page.getByRole("button",{name:"Hộp thông báo",exact:true}).click()
      await page.getByRole("button",{name:"Tùy chọn nhận thông báo"}).click()
      await choose(page.getByLabel("Nhóm sự kiện"), "PROGRESS_REPORT_OVERDUE")
      await page.getByRole("button",{name:"Mẫu thông báo theo kênh"}).click()
    }
    const editor=admin.getByRole("region",{name:"Mẫu thông báo theo kênh"})
    const reader=officer.getByRole("region",{name:"Mẫu thông báo theo kênh"})
    await expect(reader.getByRole("button",{name:"Lưu mẫu"})).toHaveCount(0)
    await editor.getByLabel("Tiêu đề mẫu").fill("Nhắc kỳ {{period}}")
    await editor.getByLabel("Nội dung mẫu").fill("{{projectName}} · hạn {{unknown}}")
    await editor.getByRole("button",{name:"Xem trước"}).click()
    await expect(editor.getByRole("alert")).toContainText("Biến không hợp lệ")
    await editor.getByLabel("Nội dung mẫu").fill("{{projectName}} · hạn {{dueDate}}")
    await editor.getByRole("button",{name:"Xem trước"}).click()
    await expect(editor.getByText("Khảo sát nguồn nước · hạn 15/12/2026")).toBeVisible()
    await editor.getByRole("button",{name:"Lưu mẫu"}).click()
    await expect(editor.getByText("Đã lưu mẫu thông báo.")).toBeVisible()
    await choose(editor.getByLabel("Kênh của mẫu"), "smtp")
    await editor.getByLabel("Tiêu đề mẫu").fill("Email nhắc kỳ {{period}}")
    await editor.getByLabel("Nội dung mẫu").fill("Hạn nộp là {{dueDate}}.")
    await editor.getByRole("button",{name:"Lưu mẫu"}).click()
    await expect(editor.getByText("Đã lưu mẫu thông báo.")).toBeVisible()
    await editor.getByRole("button",{name:"Xem trước"}).click()
    await expect(editor.getByText("Hạn nộp là 15/12/2026.")).toBeVisible()
    await editor.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/notifications/xem-truoc-mau.png",import.meta.url))})
    const notice=execFileSync(process.execPath,[fileURLToPath(new URL("../../../apps/backend/test/db/seed-template-notice.mjs",import.meta.url)),
      manager.account.id,staff.account.id],{encoding:"utf8"}).trim()
    await choose(editor.getByLabel("Kênh của mẫu"), "in_app")
    await editor.getByRole("button",{name:"Gỡ mẫu",exact:true}).click()
    await editor.getByRole("button",{name:"Xác nhận gỡ mẫu"}).click()
    await expect(editor.getByText("Thiếu mẫu cho kênh này.")).toBeVisible()
    await reader.getByRole("button",{name:"Tải bản hiện hành"}).click()
    await expect(reader.getByText("Thiếu mẫu cho kênh này.")).toBeVisible()
    const endpoint="/api/tenants/school-2/notifications/templates/PROGRESS_REPORT_OVERDUE/smtp"
    expect((await officer.request.put(endpoint,{headers:staff.headers,data:{revision:3,title:"Sửa",body:"Đổi"}})).status()).toBe(403)
    provision("UPDATE rms.account SET user_type='user' WHERE id=:'id'",{id:manager.account.id})
    await editor.getByRole("button",{name:"Tải bản hiện hành"}).click()
    await expect(editor.getByLabel("Nội dung mẫu")).toHaveCount(0)
    await officer.goto("/app/school-2?inbox=all&notice="+notice)
    const inbox=officer.getByRole("region",{name:"Hộp thông báo"})
    await expect(inbox.getByRole("heading",{name:"Nhắc kỳ 4"})).toBeVisible()
    await expect(inbox.getByText("Chất lượng nước hồ · hạn 09/12/2026")).toBeVisible()
    await inbox.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/notifications/tin-theo-mau.png",import.meta.url))})
  }finally{await Promise.all([admin.close(),officer.close()])}
})
