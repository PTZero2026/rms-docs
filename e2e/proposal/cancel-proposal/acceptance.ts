import {expect,type Page} from "@playwright/test"
import {fileURLToPath} from "node:url"

export async function checkWithdrawal(officer:Page,author:Page,project:string,code:string){
  const path="/app/school-1?project="+project
  await officer.goto(path)
  await officer.getByRole("button",{name:"Mở thuyết minh"}).click()
  const open=async(page:Page)=>{
    await page.getByRole("button",{name:"Hủy đề xuất",exact:true}).click()
    return page.getByRole("button",{name:"Xác nhận hủy đề xuất"})
  }
  const staffConfirm=await open(officer)
  await officer.getByLabel("Lý do hủy đề xuất").fill("Phòng đã nhận thông báo dừng.")
  const authorConfirm=await open(author)
  await expect(authorConfirm).toBeDisabled()
  const reason="Chủ nhiệm dừng khảo sát tại địa điểm đã đăng ký."
  await author.getByLabel("Lý do hủy đề xuất").fill(reason)
  await authorConfirm.click()
  const verify=async(page:Page)=>{
    await expect(page.getByText("Lý do hủy · "+reason,{exact:true})).toBeVisible()
    await expect(page.getByText("Mã đề tài "+code,{exact:true})).toBeVisible()
    await expect(page.getByLabel("Tên đề xuất")).toBeDisabled()
    await expect(page.getByRole("button",{name:"Hủy đề xuất",exact:true})).toHaveCount(0)
  }
  await verify(author)
  await expect(author.getByText("Đã hủy đề xuất.",{exact:true})).toBeVisible()
  const stale=officer.waitForResponse(r=>r.url().endsWith("/proposal/actions"))
  await staffConfirm.click()
  expect((await stale).status()).toBe(409)
  await verify(officer)
  await author.goto(path)
  await author.getByRole("button",{name:"Mở thuyết minh"}).click()
  await verify(author)
  const editor=author.locator("section").filter({has:author.getByRole("heading",{name:"Thuyết minh đề xuất"})}).last()
  await editor.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/calls/chu-nhiem-huy-de-xuat.png",import.meta.url))})
}
