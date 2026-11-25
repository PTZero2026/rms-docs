import {expect,type Page} from "@playwright/test"
import {execFileSync} from "node:child_process"
import {fileURLToPath} from "node:url"

interface User {account:{id:string};headers:{authorization:string};path:string}
export async function checkHours(admin:Page,reviewer:Page,author:Page,other:Page,manager:User,owner:User,foreign:User){
  const period={type:"ACADEMIC_YEAR",code:"2026-2027",from:"2026-09-01",to:"2027-08-31"}
  for(const [key,value] of [["P03.CALENDAR",JSON.stringify([period])],["FEATURE.P03","true"]]){
    const data={key,mime_type:"text/plain",content:Buffer.from(value).toString("base64")}
    const put=await admin.request.post(manager.path,{headers:manager.headers,data})
    if(put.status()===409)expect((await admin.request.put(manager.path+"/"+key,{headers:manager.headers,data})).status()).toBe(200)
    else expect(put.status()).toBe(200)
  }
  await admin.reload();await admin.getByRole("button",{name:"Định mức giờ giảng",exact:true}).click()
  const editor=admin.getByRole("region",{name:"Định mức giờ giảng"})
  for(const [version,hours,from,to] of [["v1","6","2026-01-01","2026-09-30"],["v2","9","2026-10-01","2027-08-31"]]){
    await editor.getByLabel("Mã loại hoạt động").fill("CONFERENCE");await editor.getByLabel("Hiệu lực từ").fill(from);await editor.getByLabel("Hiệu lực đến").fill(to)
    await editor.getByLabel("Định mức giờ",{exact:true}).fill(hours);await editor.getByLabel("Phiên bản định mức").fill(version)
    await editor.getByRole("button",{name:"Lưu định mức"}).click()
    await expect(editor.getByText("CONFERENCE · LECTURER · "+version+" · "+hours+" giờ")).toBeVisible()
  }
  await reviewer.reload();await reviewer.getByRole("button",{name:"Hoạt động khoa học",exact:true}).click()
  const office=reviewer.getByRole("region",{name:"Hoạt động khoa học"})
  await office.getByRole("button",{name:"Hội nghị tháng chín"}).click()
  await office.getByLabel("Kinh phí hỗ trợ được duyệt (VND)").fill("2500000")
  await office.getByRole("button",{name:"Duyệt đầu mục",exact:true}).click()
  await expect(office.getByText("Trạng thái · Đã duyệt")).toBeVisible()
  await expect(office.getByText("Kinh phí hỗ trợ được duyệt · 2.500.000 ₫")).toBeVisible()
  await office.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/extension/kinh-phi-ho-tro-hoat-dong.png",import.meta.url))})
  const script=fileURLToPath(new URL("../../../apps/backend/test/db/consume-hours.mjs",import.meta.url))
  for(const applied of [1,0])expect(JSON.parse(execFileSync(process.execPath,[script],{encoding:"utf8"}))).toMatchObject({applied,failed:0})
  await author.goto("/app/school-1?profile="+owner.account.id)
  const cv=author.getByRole("region",{name:"Lý lịch khoa học"})
  await expect(cv.getByText("2026-2027 · 6.00 giờ")).toBeVisible()
  await cv.getByRole("button",{name:"Xem sổ giờ giảng"}).click()
  await expect(cv.getByText("30/09/2026 · 2026-2027 · v1 · Giảng viên · 100%")).toBeVisible()
  await cv.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/extension/ly-lich-so-gio.png",import.meta.url))})
  expect((await other.request.get("/api/tenants/school-2/teaching-hours/people/"+owner.account.id,{headers:foreign.headers})).status()).toBe(404)
  await admin.goto("/app/school-1?profile="+owner.account.id)
  const managed=admin.getByRole("region",{name:"Lý lịch khoa học"})
  await managed.getByRole("button",{name:"Xem sổ giờ giảng"}).click();await managed.getByRole("button",{name:"Điều chỉnh giờ"}).click()
  await managed.getByLabel("Chênh lệch giờ").fill("-1.00");await managed.getByLabel("Lý do điều chỉnh").fill("Đối chiếu biên bản")
  await managed.getByRole("button",{name:"Ghi điều chỉnh"}).click()
  await expect(managed.getByText("2026-2027 · 5.00 giờ")).toBeVisible()
  await office.getByLabel("Lý do thu hồi").fill("Biên bản điều chỉnh xác nhận hội nghị")
  await office.getByRole("button",{name:"Thu hồi đầu mục đã duyệt"}).click()
  await expect(office.getByText("Trạng thái · Nháp")).toBeVisible()
  await expect(office.getByText(/Kinh phí hỗ trợ được duyệt/)).toHaveCount(0)
  await author.reload()
  await expect(cv.getByText("2026-2027 · 0.00 giờ")).toBeVisible()
  expect(JSON.parse(execFileSync(process.execPath,[script],{encoding:"utf8"}))).toMatchObject({applied:0,failed:0})
  await author.getByRole("button",{name:"Hoạt động khoa học",exact:true}).click()
  const activity=author.getByRole("region",{name:"Hoạt động khoa học"})
  await activity.getByRole("button",{name:"Hội nghị tháng chín"}).click()
  await activity.getByRole("button",{name:"Gửi duyệt đầu mục"}).click()
  await expect(activity.getByText("Trạng thái · Chờ duyệt")).toBeVisible()
  await office.getByRole("button",{name:"Tải lại đầu mục"}).click()
  await office.getByLabel("Lý do trả lại hoặc từ chối").fill("Hoạt động ngoài chương trình được công nhận")
  await office.getByRole("button",{name:"Từ chối hoạt động"}).click()
  await expect(office.getByText("Trạng thái · Đã từ chối")).toBeVisible()
  await activity.getByRole("button",{name:"Tải lại đầu mục"}).click()
  await expect(activity.getByText("Hoạt động ngoài chương trình được công nhận")).toBeVisible()
  await expect(activity.getByRole("button",{name:"Gửi duyệt đầu mục"})).toHaveCount(0)
}
