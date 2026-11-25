import {execFileSync} from "node:child_process"
import {test,expect} from "@playwright/test"
import {randomUUID} from "node:crypto"
import {fileURLToPath} from "node:url"
import {catalogUser} from "../../catalog/config-override/fixtures"
import {provision} from "../../integration/session-fixture"

test("F07 approves an independent research output and exposes the publication in its author's F08 profile",async({browser})=>{
  test.skip(process.env.RMS_OIDC_INTEGRATION!=="1"||!process.env.RMS_BROWSER_FIXTURE_BUCKET)
  const pages=await Promise.all([0,1,2,3].map(()=>browser.newPage({baseURL:"http://127.0.0.1:4191"})))
  const [author,reviewer,coauthor,admin]=pages
  try{
    const [pi,staff,co,manager]=await Promise.all(pages.map((p,i)=>catalogUser(p,"school-2",["tac-gia-doc-lap","chuyen-vien-san-pham","dong-tac-gia","quan-tri-gio-f07"][i],i===3?"admin":"user")))
    const unit=randomUUID(),otherUnit=randomUUID()
    provision(`INSERT INTO rms.unit SELECT tenant_id,:'unit','Viện Khoa học' FROM rms.account WHERE id=:'pi';
      INSERT INTO rms.unit SELECT tenant_id,:'other','Khoa Quan trắc' FROM rms.account WHERE id=:'co';
      UPDATE rms.account SET unit_id=:'unit',user_type='staff' WHERE id=:'staff';
      UPDATE rms.account SET unit_id=:'unit',user_type='author' WHERE id=:'pi';
      UPDATE rms.account SET unit_id=:'other',user_type='author' WHERE id=:'co'`,
      {unit,other:otherUnit,pi:pi.account.id,staff:staff.account.id,co:co.account.id})
    const calendar=[{type:"ACADEMIC_YEAR",code:"2026-2027",from:"2026-09-01",to:"2027-08-31"}]
    for(const [key,value] of [["FEATURE.E4","true"],["FEATURE.P03","true"],["P03.CALENDAR",JSON.stringify(calendar)]]){
      const data={key,mime_type:"text/plain",content:Buffer.from(value).toString("base64")}
      const r=await admin.request.post(manager.path,{headers:manager.headers,data})
      if(r.status()===409)expect((await admin.request.put(manager.path+"/"+key,{headers:manager.headers,data})).status()).toBe(200)
      else expect(r.status()).toBe(200)
    }
    for(const [role,hours] of [["CORRESPONDING_OR_FIRST","20"],["COAUTHOR","10"]]){
      const r=await admin.request.post("/api/tenants/school-2/teaching-hours/formulas",{headers:manager.headers,data:{
        kind:"product",category:"BOOK",role,periodType:"ACADEMIC_YEAR",from:"2026-09-01",to:"2027-08-31",hours,version:"f07-test"}})
      expect(r.status(),await r.text()).toBe(200)
    }
    const title="Atlas tài nguyên nước độc lập"
    await author.reload();await author.getByRole("button",{name:"Sản phẩm ngoài đề tài",exact:true}).click()
    const editor=author.getByRole("region",{name:"Sản phẩm ngoài đề tài"})
    await editor.getByRole("button",{name:"Kê khai sản phẩm độc lập"}).click()
    await editor.getByLabel("Tên sản phẩm").fill(title)
    await editor.getByLabel("Loại sản phẩm").selectOption("BOOK")
    await editor.getByLabel("Thông tin công bố").fill("Nhà xuất bản Khoa học, 2026")
    await expect(editor.getByRole("checkbox",{name:co.account.email})).toHaveCount(0)
    await editor.getByLabel("Email đồng tác giả khác khoa").fill(co.account.email)
    await editor.getByRole("button",{name:"Thêm đồng tác giả theo email"}).click()
    await expect(editor.getByRole("checkbox",{name:co.account.email})).toBeChecked()
    await editor.getByRole("button",{name:"Lưu nháp sản phẩm"}).click()
    const item=editor.getByRole("article").filter({hasText:title})
    await item.getByRole("button",{name:"Gửi duyệt sản phẩm"}).click()
    await expect(editor.getByRole("alert")).toContainText("minh chứng")
    await item.getByRole("button",{name:"Sửa bản kê khai"}).click()
    await editor.getByLabel("Tải tệp căn cứ").setInputFiles(fileURLToPath(new URL("../../review/meeting-minutes/evidence/bien-ban-hop.pdf",import.meta.url)))
    await editor.getByRole("button",{name:"Tải và xác nhận tệp"}).click()
    await expect(editor.getByRole("checkbox",{name:"bien-ban-hop.pdf"})).toBeChecked()
    await editor.getByRole("button",{name:"Lưu nháp sản phẩm"}).click()
    await item.getByRole("button",{name:"Gửi duyệt sản phẩm"}).click()
    await expect(item).toContainText("Chờ duyệt")
    await reviewer.reload();await reviewer.getByRole("button",{name:"Sản phẩm ngoài đề tài",exact:true}).click()
    const queue=reviewer.getByRole("region",{name:"Sản phẩm ngoài đề tài"})
    const pending=queue.getByRole("article").filter({hasText:title})
    await expect(pending.getByRole("button",{name:"bien-ban-hop.pdf"})).toBeVisible()
    await pending.getByLabel("Tác giả chính hoặc liên hệ").selectOption(pi.account.id)
    await pending.getByLabel("Tỷ lệ % · "+pi.account.email).fill("70")
    await expect(pending.getByRole("button",{name:"Duyệt sản phẩm"})).toBeDisabled()
    await pending.getByLabel("Tỷ lệ % · "+co.account.email).fill("30")
    await pending.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/product/phan-bo-gio-tac-gia.png",import.meta.url))})
    await pending.getByRole("button",{name:"Duyệt sản phẩm"}).click()
    await expect(pending).toContainText("Đã duyệt")
    await pending.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/product/duyet-ngoai-de-tai.png",import.meta.url))})
    const worker=fileURLToPath(new URL("../../../apps/backend/test/db/consume-hours.mjs",import.meta.url))
    for(const applied of [2,0])expect(JSON.parse(execFileSync(process.execPath,[worker],{encoding:"utf8"}))).toMatchObject({applied,failed:0})
    await coauthor.goto("/app/school-2?profile="+co.account.id)
    const cv=coauthor.getByRole("region",{name:"Lý lịch khoa học"})
    await expect(cv.getByText(title+" · Nhà xuất bản Khoa học, 2026 · 2026")).toBeVisible()
    await expect(cv.getByRole("link",{name:title})).toHaveCount(0)
    await cv.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/product/ly-lich-san-pham-doc-lap.png",import.meta.url))})
    await cv.getByRole("button",{name:"Xem sổ giờ giảng"}).click()
    const ledger=cv.getByRole("region",{name:"Sổ giờ giảng"})
    await expect(ledger).toContainText("Đồng tác giả · 30%")
    await expect(ledger).toContainText("Sau điều chỉnh 3.00")
    await ledger.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/product/gio-dong-tac-gia.png",import.meta.url))})
    await pending.getByLabel("Nhận xét của chuyên viên").fill("Đính chính bản in")
    await pending.getByRole("button",{name:"Mở lại bản kê khai"}).click()
    await expect(pending).toContainText("Nháp")
    await coauthor.reload()
    await expect(cv.getByText("2026-2027 · 0.00 giờ")).toBeVisible()
    await expect(cv.getByText(title+" · Nhà xuất bản Khoa học, 2026 · 2026")).toHaveCount(0)
  }finally{await Promise.all(pages.map(p=>p.close()))}
})
