import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { test,expect } from "@playwright/test"
import { signIn,provision } from "../../integration/session-fixture"

test("B01 schedules one F04 reminder per principal and B04 keeps each reader's filter across Back and reload",async({browser})=>{
  test.skip(process.env.RMS_OIDC_INTEGRATION!=="1")
  test.setTimeout(90000)
  const pages=await Promise.all([360,390,1280,1280].map(width=>browser.newPage({baseURL:"http://127.0.0.1:4191",viewport:{width,height:850}})))
  try{
    const actors=await Promise.all(pages.map((p,i)=>signIn(p,i===3?"school-2":"school-1",["mai-inbox","nga-inbox","quan-tri-inbox","truong-b-inbox"][i]+"@example.invalid")))
    const headers=async(i:number)=>({authorization:(await actors[i].res.request().allHeaders()).authorization})
    provision("UPDATE rms.account SET user_type='admin' WHERE id=:'id'::uuid",{id:actors[2].account.id})
    const configured=await pages[2].request.post("/api/tenants/school-1/catalog/configurations",{headers:await headers(2),data:{
      key:"PROGRESS.REMINDER_DAYS_BEFORE_DUE",content:Buffer.from("7").toString("base64"),mime_type:"text/plain"}})
    expect(configured.status(),await configured.text()).toBe(200)
    expect((await pages[2].request.get("http://127.0.0.1:3192/internal/reminders/00000000-0000-4000-8000-000000000001/window")).status()).toBe(401)
    const result=JSON.parse(execFileSync(process.execPath,[fileURLToPath(new URL("../../../apps/backend/test/db/seed-reminder-case.mjs",import.meta.url)),actors[0].account.id,actors[1].account.id],{encoding:"utf8"}))
    expect(result.first.enqueued).toBeGreaterThanOrEqual(2)
    expect(result.repeat.enqueued).toBe(0)
    for(const [i,p] of pages.slice(0,2).entries()){
      await p.reload()
      const recent=p.getByRole("region",{name:"Thông báo gần đây"})
      await expect(recent.getByRole("listitem")).toHaveCount(2)
      await expect(recent.getByRole("link",{name:/Sắp đến hạn báo cáo tiến độ/})).toBeVisible()
      await recent.getByRole("link",{name:"Xem tất cả thông báo"}).click()
      const inbox=p.getByRole("region",{name:"Hộp thông báo"})
      const unreadList = (url:URL) => url.pathname.endsWith("/notifications") && url.searchParams.get("filter")==="unread"
      let requests=0
      if(i===0)await p.route(unreadList, async route => {
        requests++
        if(requests===1)await route.fulfill({status:503,contentType:"application/json",body:"{}"})
        else await route.continue()
      })
      await inbox.getByRole("radio",{name:"Chưa đọc",exact:true}).click()
      if(i===0)await test.step("TC-22 retries the unread list without leaving the current filter",async()=>{
        const url=p.url()
        await expect(inbox.getByRole("alert")).toBeVisible()
        const retry=inbox.getByRole("button",{name:"Thử lại",exact:true})
        await expect(retry).toBeVisible()
        await inbox.getByRole("button",{name:"Tùy chọn nhận thông báo"}).click()
        await expect(inbox.getByLabel("Nhóm sự kiện")).toBeVisible()
        await inbox.getByRole("button",{name:"Tùy chọn nhận thông báo"}).click()
        await inbox.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/notifications/thu-lai-hop-thu.png",import.meta.url))})
        await retry.click()
        await expect(inbox.getByText("2 tin chưa đọc")).toBeVisible()
        await expect(inbox.getByRole("alert")).toHaveCount(0)
        await expect(inbox.getByRole("radio",{name:"Chưa đọc",exact:true})).toHaveAttribute("aria-checked","true")
        expect(requests).toBe(2)
        expect(p.url()).toBe(url)
        await p.unroute(unreadList)
      })
      await expect(inbox.getByText("2 tin chưa đọc")).toBeVisible()
      await inbox.getByRole("button",{name:/Sắp đến hạn báo cáo tiến độ/}).click()
      await expect(inbox.getByText("Đánh giá lưu lượng nước · Kỳ 2 · Hạn 10/12/2026")).toBeVisible()
      await expect(inbox.getByText("1 tin chưa đọc")).toBeVisible()
      const url=p.url(),id=new URL(url).searchParams.get("notice")!
      for(const k of [2,3]){
        const slug=k===3?"school-2":"school-1"
        expect((await pages[k].request.post("/api/tenants/"+slug+"/notifications/"+id+"/read",{headers:await headers(k)})).status()).toBe(404)
      }
      if(i===0)await inbox.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/notifications/chu-nhiem-nhac-han.png",import.meta.url))})
      await p.goBack()
      await p.reload()
      await expect(inbox.getByRole("radio",{name:"Chưa đọc",exact:true})).toHaveAttribute("aria-checked","true")
      await expect(inbox.getByRole("button",{name:/Sắp đến hạn/})).toHaveCount(0)
      await inbox.getByRole("button",{name:/Kỳ nhận đề xuất đã mở/}).click()
      await expect(inbox.getByText("0 tin chưa đọc")).toBeVisible()
      await p.goBack()
      await expect(inbox.getByText("Bạn đã đọc hết thông báo.")).toBeVisible()
      await inbox.getByRole("radio",{name:"Tất cả",exact:true}).click()
      await inbox.getByRole("button",{name:/Sắp đến hạn/}).click()
      await expect(inbox.getByText("0 tin chưa đọc")).toBeVisible()
      await expect(p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).resolves.toBeTruthy()
    }
    await pages[3].goto("/app/school-2?inbox=unread")
    await expect(pages[3].getByText("Bạn đã đọc hết thông báo.")).toBeVisible()
  }finally{await Promise.all(pages.map(p=>p.close()))}
})
