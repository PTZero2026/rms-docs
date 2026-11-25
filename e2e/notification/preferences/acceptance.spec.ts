import {test,expect} from "@playwright/test"
import {fileURLToPath} from "node:url"
import {retryPolicyReader} from "../../../apps/backend/src/modules/notification/worker"
import {catalogUser} from "../../catalog/config-override/fixtures"

test("B04 persists a personal opt-out and applies the school's channel rules to subsequent deliveries",async({browser})=>{
  test.skip(process.env.RMS_OIDC_INTEGRATION!=="1")
  const [person,admin]=await Promise.all([0,1].map(()=>browser.newPage({baseURL:"http://127.0.0.1:4191"})))
  try{
    const [,manager]=await Promise.all([catalogUser(person,"school-2","tuy-chon-nguoi-dung","user"),catalogUser(admin,"school-2","ma-tran-quan-tri","admin")])
    for(const [key,value] of [["notification.maxRetry","2"],["notification.retryBaseSeconds","7"]]){
      const result=await admin.request.post(manager.path,{headers:manager.headers,data:{key,content:Buffer.from(value).toString("base64"),mime_type:"text/plain"}})
      expect(result.status()).toBe(200)
    }
    const origin="http://127.0.0.1:3192",schoolId=(n:number)=>"00000000-0000-4000-8000-"+String(n).padStart(12,"0")
    const policy=retryPolicyReader(origin,process.env.RMS_REMINDER_SERVICE_SECRET!)
    expect(await policy(schoolId(2))).toEqual({maxAttempts:2,baseSeconds:7})
    expect(await policy(schoolId(1))).toEqual({maxAttempts:5,baseSeconds:10})
    expect((await person.request.get(origin+"/internal/notifications/"+schoolId(2)+"/retry-policy")).status()).toBe(401)
    for(const p of [person,admin]){
      await p.getByRole("button",{name:"Hộp thông báo",exact:true}).click()
      await p.getByRole("button",{name:"Tùy chọn nhận thông báo"}).click()
    }
    const prefs=person.getByRole("region",{name:"Tùy chọn thông báo"}),rules=admin.getByRole("region",{name:"Tùy chọn thông báo"})
    await prefs.getByLabel("Nhận email cá nhân").uncheck()
    await prefs.getByRole("button",{name:"Lưu tùy chọn cá nhân"}).click()
    await expect(prefs.getByText("Đã lưu tùy chọn nhận email.")).toBeVisible()
    await prefs.getByLabel("Nhóm sự kiện").selectOption("PROGRESS_REPORT_OVERDUE")
    await expect(prefs.getByLabel("Nhận email cá nhân")).toBeDisabled()
    await expect(prefs.getByText("Email bắt buộc cho nhóm sự kiện này.")).toBeVisible()
    await rules.getByLabel("Nhóm sự kiện").selectOption("RESEARCH_OUTPUT_REJECTED")
    const matrix=rules.getByRole("form",{name:"Quy tắc của trường"})
    await matrix.getByLabel("Bật email toàn trường cho nhóm này").uncheck()
    await matrix.getByLabel("Tiêu đề trong ứng dụng").fill("Cần bổ sung hồ sơ sản phẩm")
    await matrix.getByRole("button",{name:"Lưu quy tắc của trường"}).click()
    await expect(rules.getByText("Đã cập nhật quy tắc của trường.")).toBeVisible()
    await rules.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/notifications/ma-tran-email.png",import.meta.url))})
    await person.reload()
    await person.getByRole("button",{name:"Tùy chọn nhận thông báo"}).click()
    await expect(prefs.getByLabel("Nhận email cá nhân")).not.toBeChecked()
    await prefs.getByLabel("Nhóm sự kiện").selectOption("RESEARCH_OUTPUT_REJECTED")
    await expect(prefs.getByText("Trường đã tắt email cho sự kiện này.")).toBeVisible()
  }finally{await Promise.all([person.close(),admin.close()])}
})
