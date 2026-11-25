import {test,expect} from "@playwright/test"
import {fileURLToPath} from "node:url"
import {catalogUser} from "../../catalog/config-override/fixtures"

test("B04 user opts out of priority SMS independently of mandatory email and admin sets the SMS template",async({browser})=>{
  test.skip(process.env.RMS_OIDC_INTEGRATION!=="1")
  const [member,admin]=await Promise.all([390,1280].map(width=>browser.newPage({baseURL:"http://127.0.0.1:4191",viewport:{width,height:900}})))
  try{
    await Promise.all([catalogUser(member,"school-1","sms-nguoi-dung","user"),catalogUser(admin,"school-1","sms-quan-tri","admin")])
    for(const page of [member,admin]){
      await page.getByRole("button",{name:"Hộp thông báo",exact:true}).click()
      await page.getByRole("button",{name:"Tùy chọn nhận thông báo"}).click()
      await expect(page.getByLabel("Nhận SMS cá nhân")).toHaveCount(0)
      await page.getByLabel("Nhóm sự kiện").selectOption("ACCEPTANCE_RESULT")
    }
    const prefs=member.getByRole("region",{name:"Tùy chọn thông báo"})
    await expect(prefs.getByLabel("Nhận email cá nhân")).toBeDisabled()
    await prefs.getByLabel("Nhận SMS cá nhân").uncheck()
    await prefs.getByRole("button",{name:"Lưu tùy chọn cá nhân"}).click()
    await expect(prefs.getByText("Đã lưu tùy chọn nhận thông báo.")).toBeVisible()
    await member.reload()
    await member.getByRole("button",{name:"Tùy chọn nhận thông báo"}).click()
    await prefs.getByLabel("Nhóm sự kiện").selectOption("ACCEPTANCE_RESULT")
    await expect(prefs.getByLabel("Nhận SMS cá nhân")).not.toBeChecked()
    await expect(prefs.getByText("Cập nhật số điện thoại trong hồ sơ để nhận SMS.")).toBeVisible()
    await prefs.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/notifications/tuy-chon-sms.png",import.meta.url))})
    await admin.getByRole("button",{name:"Mẫu thông báo theo kênh"}).click()
    const editor=admin.getByRole("region",{name:"Mẫu thông báo theo kênh"})
    await editor.getByLabel("Kênh của mẫu").selectOption("sms")
    await editor.getByLabel("Nội dung mẫu").fill("RMS · {{event}}. Mở hộp thông báo của trường.")
    await editor.getByRole("button",{name:"Lưu mẫu"}).click()
    await expect(editor.getByText("Đã lưu mẫu thông báo.")).toBeVisible()
    await editor.getByRole("button",{name:"Xem trước"}).click()
    await expect(editor.getByRole("region",{name:"Bản xem trước"})).toContainText("RMS · Đã có kết quả nghiệm thu.")
    await admin.getByLabel("Bật SMS toàn trường cho nhóm này").uncheck()
    await admin.getByRole("button",{name:"Lưu quy tắc của trường"}).click()
    await expect(admin.getByText("Đã cập nhật quy tắc của trường.")).toBeVisible()
    await member.reload()
    await member.getByRole("button",{name:"Tùy chọn nhận thông báo"}).click()
    await prefs.getByLabel("Nhóm sự kiện").selectOption("ACCEPTANCE_RESULT")
    await expect(prefs.getByLabel("Nhận SMS cá nhân")).toBeDisabled()
    await expect(prefs.getByText("Trường đã tắt SMS cho sự kiện này.")).toBeVisible()
  }finally{await Promise.all([member.close(),admin.close()])}
})
