import { expect,type Page } from "@playwright/test"
import { fileURLToPath } from "node:url"
import { provision } from "../../integration/session-fixture"

export async function verifyReturnedWork(page:Page,foreign:Page,id:string,account:string,otherToken:string) {
  const url="/app/school-1",title="Đánh giá chất lượng nước",gotoSource="?work="+id
  for(const width of [360,390]){
    await page.setViewportSize({width,height:844})
    await page.goto(url)
    const list=page.getByRole("region",{name:"Việc cần làm"})
    await expect(list.getByText("1 việc · 0 quá hạn")).toBeVisible()
    const link=list.getByRole("link",{name:new RegExp(title)})
    expect(await link.getAttribute("href")).toBe(gotoSource)
    expect((await link.boundingBox())?.height).toBeGreaterThanOrEqual(44)
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    if(width===360)await list.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/home/chu-nhiem-viec-can-bo-sung.png",import.meta.url))})
    await link.click()
    await expect(page.getByLabel("Tên đề xuất")).toHaveValue(title)
    await expect(page.getByText("Lý do trả hồ sơ · Bổ sung địa điểm lấy mẫu.")).toBeVisible()
    await page.getByRole("link",{name:"Về danh sách việc"}).click()
    await expect(list.getByRole("link",{name:new RegExp(title)})).toBeVisible()
  }
  provision("UPDATE rms.account SET user_type='user' WHERE id=:'id'::uuid",{id:account})
  await page.getByRole("region",{name:"Việc cần làm"}).getByRole("link",{name:new RegExp(title)}).click()
  await expect(page.getByText("Công việc không còn trong phạm vi hiện tại.")).toBeVisible()
  await expect(page.getByText(title,{exact:true})).toHaveCount(0)
  await page.getByRole("link",{name:"Về danh sách việc"}).click()
  await expect(page.getByText("Vai trò Người dùng",{exact:true})).toBeVisible()
  expect((await foreign.request.get("/api/tenants/school-2/home/work/"+id,{headers:{authorization:otherToken}})).status()).toBe(404)
  expect((await (await foreign.request.get("/api/tenants/school-2/home/work",{headers:{authorization:otherToken}})).json()).total).toBe(0)
  provision("UPDATE rms.account SET user_type='author' WHERE id=:'id'::uuid",{id:account})
}
