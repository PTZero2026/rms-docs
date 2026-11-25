import {fileURLToPath} from "node:url"
import {expect,test,type Page} from "@playwright/test"
import {catalogUser} from "../../catalog/config-override/fixtures"
import {provision} from "../../integration/session-fixture"

type Manager=Awaited<ReturnType<typeof catalogUser>>

async function override(page:Page,manager:Manager,key:string,value:string){
  const {path,headers}=manager
  const url=path+"/"+key
  const prior=await page.request.get(url,{headers})
  expect([200,404]).toContain(prior.status())
  const exists=prior.headers()["x-rms-scope"]==="tenant"
  const data={key,mime_type:"text/plain",content:Buffer.from(value).toString("base64")}
  const saved=exists?await page.request.put(url,{headers,data:{key,content:data.content}}):await page.request.post(path,{headers,data})
  expect(saved.status(),await saved.text()).toBe(200)
  return async()=>{
    if(exists){
      const restored=await page.request.put(url,{headers,data:{key,content:(await prior.body()).toString("base64")}})
      expect(restored.status(),await restored.text()).toBe(200)
    }else expect((await page.request.delete(url,{headers})).status()).toBe(204)
  }
}

test("a broken professional profile source leaves the home page usable and retries locally",async({page})=>{
  test.skip(process.env.RMS_OIDC_INTEGRATION!=="1")
  const manager=await catalogUser(page,"school-2","quan-tri-kiem-nguon","admin")
  const restore=await override(page,manager,"PROFILE.FIELDS","{")
  let repaired=false
  try{
    await page.setViewportSize({width:390,height:844})
    await page.reload()
    const home=page.getByRole("region",{name:"Trang chủ cá nhân"})
    const profile=home.getByRole("region",{name:"Lý lịch cá nhân"})
    await expect(profile.getByRole("alert")).toBeVisible()
    await home.getByRole("link",{name:"Mở báo cáo theo kỳ"}).click()
    await expect(page.getByRole("heading",{name:"Báo cáo theo kỳ",level:1})).toBeVisible()
    await page.getByRole("link",{name:"Về trang chủ",exact:true}).click()
    await home.getByRole("link",{name:"Xem tất cả thông báo"}).click()
    await expect(page.getByRole("region",{name:"Hộp thông báo"}).getByText(/\d+ tin chưa đọc/)).toBeVisible()
    const work=home.getByRole("region",{name:"Việc cần làm"})
    await work.getByRole("radio",{name:"Quá hạn",exact:true}).click()
    await expect(work.getByRole("radio",{name:"Quá hạn",checked:true})).toBeVisible()
    await expect(work.getByText(/\d+ việc · \d+ quá hạn/)).toBeVisible()
    await expect(profile.getByRole("alert")).toBeVisible()
    await home.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/home/loi-rieng-ly-lich.png",import.meta.url))})
    await restore()
    repaired=true
    const reads:string[]=[]
    page.on("request",req=>{if(req.url().includes("/home/"))reads.push(new URL(req.url()).pathname.split("/home/")[1])})
    await profile.getByRole("button",{name:"Thử lại"}).click()
    await expect(profile.getByRole("button",{name:"Bổ sung thông tin còn thiếu trong lý lịch"})).toBeVisible()
    expect(reads).toEqual(["widgets/profile"])
    await expect(work.getByRole("radio",{name:"Quá hạn",checked:true})).toBeVisible()
  }finally{if(!repaired)await restore()}
})

test("work, projects, activity and teaching load and recover independently",async({page})=>{
  test.skip(process.env.RMS_OIDC_INTEGRATION!=="1")
  test.setTimeout(90000)
  const manager=await catalogUser(page,"school-2","quan-tri-kiem-the","admin")
  const restore:Array<()=>Promise<void>>=[]
  const home=page.getByRole("region",{name:"Trang chủ cá nhân"})
  const cards=[
    {path:"work",label:"Việc cần làm",ready:/\d+ việc · \d+ quá hạn/},
    {path:"widgets/projects",label:"Số liệu nhanh",ready:"Mở báo cáo theo kỳ"},
    {path:"widgets/activity",label:"Thông báo gần đây",ready:"Xem tất cả thông báo"},
    {path:"widgets/teaching",label:"Giờ giảng",ready:"Xem giờ trong lý lịch"},
  ]
  try{
    for(const [key,value] of [["FEATURE.E4","true"],["FEATURE.P03","true"],["HOME.ADMIN","tasks,projects,activity,teaching,shortcuts"]])
      restore.push(await override(page,manager,key,value))
    for(const target of cards){
      const pattern=(url:URL)=>url.pathname.endsWith("/home/"+target.path)
      let release!:()=>void
      const delay=new Promise<void>(resolve=>{release=resolve})
      await page.route(pattern,async route=>{
        await delay
        await route.fulfill({status:503,contentType:"application/json",body:'{"message":"Source unavailable"}'})
      })
      const card=home.getByRole("region",{name:target.label,exact:true})
      try{
        await page.reload({waitUntil:"domcontentloaded"})
        await expect(card.getByRole("status")).toBeVisible()
        for(const other of cards.filter(c=>c!==target))
          await expect(home.getByRole("region",{name:other.label,exact:true}).getByText(other.ready,{exact:true})).toBeVisible()
        await expect(home.getByRole("region",{name:"Lối tắt"}).getByRole("button",{name:"Xem báo cáo kỳ"})).toBeVisible()
      }finally{release()}
      await expect(card.getByRole("alert")).toBeVisible()
      await page.unroute(pattern)
      const reads:string[]=[]
      const record=(req:{url():string})=>{if(req.url().includes("/home/"))reads.push(new URL(req.url()).pathname.split("/home/")[1])}
      page.on("request",record)
      await card.getByRole("button",{name:"Thử lại"}).click()
      await expect(card.getByText(target.ready,{exact:true})).toBeVisible()
      page.off("request",record)
      expect(reads).toEqual([target.path])
    }
    restore.push(await override(page,manager,"FEATURE.P03","false"))
    const hidden=await page.request.get("/api/tenants/school-2/home/widgets/teaching",{headers:manager.headers})
    expect(hidden.status()).toBe(404)
    await page.reload()
    await expect(home.getByRole("link",{name:"Mở báo cáo theo kỳ"})).toBeVisible()
    await expect(home.getByRole("region",{name:"Giờ giảng",exact:true})).toHaveCount(0)
    const legacy=await page.request.get("/api/tenants/school-2/home/overview",{headers:manager.headers})
    expect(legacy.status()).toBe(200)
    expect(await legacy.json()).toMatchObject({
      name:manager.account.email,widgets:["tasks","projects","activity","shortcuts"],
      shortcuts:["profile","calls","reports"],counters:expect.arrayContaining([expect.objectContaining({code:"active"})]),
    })
  }finally{for(const undo of restore.reverse())await undo()}
})

test("home drops private content after a role refresh or an account lock",async({page})=>{
  test.skip(process.env.RMS_OIDC_INTEGRATION!=="1")
  const manager=await catalogUser(page,"school-2","kiem-quyen-trang-chu","admin")
  await page.reload()
  const home=page.getByRole("region",{name:"Trang chủ cá nhân"})
  await expect(home.getByRole("region",{name:"Số liệu nhanh"}).getByText(/Cập nhật/)).toBeVisible()
  await expect(home.getByRole("button",{name:"Xem báo cáo kỳ",exact:true})).toBeVisible()
  provision("UPDATE rms.account SET user_type='user' WHERE id=:'id'",{id:manager.account.id})
  await page.getByRole("button",{name:"Tải lại thông tin"}).click()
  await expect(page.getByText("Vai trò user",{exact:true})).toBeVisible()
  await expect(home.getByRole("region",{name:"Số liệu nhanh"})).toHaveCount(0)
  await expect(home.getByRole("button",{name:"Hoàn thiện lý lịch"})).toBeVisible()
  await expect(home.getByRole("button",{name:"Xem báo cáo kỳ",exact:true})).toHaveCount(0)
  expect((await page.request.get("/api/tenants/school-2/home/widgets/projects",{headers:manager.headers})).status()).toBe(404)
  const work=home.getByRole("region",{name:"Việc cần làm"})
  await expect(work.getByText(/\d+ việc · \d+ quá hạn/)).toBeVisible()
  provision("UPDATE rms.account SET is_active=false WHERE id=:'id'",{id:manager.account.id})
  const rejected=page.waitForResponse(r=>r.url().includes("/home/work?group=overdue"))
  await work.getByRole("radio",{name:"Quá hạn",exact:true}).click()
  expect((await rejected).status()).toBe(403)
  await expect(home).toHaveCount(0)
  await expect(page.getByRole("alert")).toContainText("quyền truy cập trang chủ")
  await expect(page.getByRole("button",{name:"Hồ sơ cá nhân",exact:true})).toHaveCount(0)
  provision("UPDATE rms.account SET is_active=true WHERE id=:'id'",{id:manager.account.id})
  await page.getByRole("button",{name:"Đăng nhập lại"}).click()
  await expect(work.getByText(/\d+ việc · \d+ quá hạn/)).toBeVisible()
  await expect(home.getByRole("link",{name:"Xem tất cả thông báo"})).toBeVisible()
})
