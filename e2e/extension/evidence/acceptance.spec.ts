import {checkHours} from "../../teaching-hour/teaching-hours/acceptance"
import {test,expect,type Page,type Locator} from "@playwright/test"
import {fileURLToPath} from "node:url"
import {randomUUID} from "node:crypto"
import {catalogUser} from "../../catalog/config-override/fixtures"
import {provision} from "../../integration/session-fixture"

test("F09 reviews the ministry decision and F12 validates each school's conference evidence at submission",async({browser})=>{
  test.skip(!process.env.RMS_BROWSER_FIXTURE_BUCKET,"Requires the local S3 integration bucket")
  test.setTimeout(120000)
  const pages=await Promise.all([0,1,2,3,4].map(()=>browser.newPage({baseURL:"http://127.0.0.1:4191"})))
  const [author,reviewer,adminA,authorB,adminB]=pages
  try{
    const users=await Promise.all(pages.map((p,i)=>catalogUser(p,i<3?"school-1":"school-2","e4-minh-chung-"+i,i===2||i===4?"admin":"user")))
    const [a,o,manager,b,managerB]=users
    for(const [i,ids] of [[0,[a.account.id,o.account.id]],[1,[b.account.id]]] as const){
      const unit=randomUUID()
      provision("INSERT INTO rms.unit SELECT tenant_id,:'unit','Khoa Kỹ thuật' FROM rms.account WHERE id=:'id'; UPDATE rms.account SET unit_id=:'unit',user_type='author' WHERE id IN (:'id',:'other')",{unit,id:ids[0],other:ids[1]??ids[0]})
      if(!i)provision("UPDATE rms.account SET user_type='staff' WHERE id=:'id'",{id:o.account.id})
    }
    const items=[{code:"DECISION",label:"Quyết định"},{code:"INVITE",label:"Thư mời"},{code:"REPORT",label:"Báo cáo"}]
    const upper={types:[{code:"MINISTRY",label:"Cấp Bộ",required:["DECISION"]},{code:"OTHER",label:"Cấp khác",required:[]}],evidence:items,bodies:[{code:"BO",label:"Bộ quản lý"}]}
    for(const [p,u,requirement] of [[adminA,manager,"INVITE"],[adminB,managerB,"REPORT"]] as const){
      const catalog={types:[{code:"CONFERENCE",label:"Hội nghị",required:[requirement]}],evidence:items,bodies:[]}
      for(const [key,val] of [["FEATURE.E4","true"],["F09.CATALOG",JSON.stringify(upper)],["F12.CATALOG",JSON.stringify(catalog)]]){
        const data={key,content:Buffer.from(val).toString("base64"),mime_type:"text/plain"},r=await p.request.post(u.path,{headers:u.headers,data})
        if(r.status()===409)expect((await p.request.put(u.path+"/"+key,{headers:u.headers,data})).status()).toBe(200)
        else expect(r.status()).toBe(200)
      }
    }
    async function open(p:Page,name:string){
      await p.reload();await p.getByRole("button",{name,exact:true}).click()
      return p.getByRole("region",{name,exact:true})
    }
    async function draft(form:Locator,title:string){
      await form.getByRole("button",{name:"Thêm đầu mục"}).click()
      await form.getByLabel("Tên đầu mục").fill(title);await form.getByLabel("Ngày nghiệp vụ").fill("2026-09-30")
      await form.getByRole("button",{name:"Lưu nháp đầu mục"}).click()
      await expect(form.getByText("Trạng thái · Nháp")).toBeVisible()
    }
    async function attach(form:Locator,code:string){
      await form.getByLabel("Loại minh chứng").selectOption(code)
      await form.getByLabel("Tải tệp căn cứ").setInputFiles(fileURLToPath(new URL("../../profile/export-profile/evidence/cv-v1.pdf",import.meta.url)))
      await form.getByRole("button",{name:"Tải và xác nhận tệp"}).click()
      await expect(form.getByRole("button",{name:"cv-v1.pdf"}).first()).toBeVisible()
      await expect(form.locator("li").filter({hasText:"cv-v1.pdf"}).filter({hasText:code})).toBeVisible()
    }
    const f09=await open(author,"Nhiệm vụ cấp trên");await draft(f09,"Quan trắc cấp Bộ")
    await f09.getByRole("button",{name:"Thêm thành viên",exact:true}).click()
    await f09.getByLabel("Email thành viên 1").fill(manager.account.email)
    await f09.getByLabel("Tỷ lệ thành viên 1 (%)").fill("30")
    const saved=author.waitForResponse(r=>r.request().method()==="PUT"&&r.url().includes("/extensions/upper-project/"))
    await f09.getByRole("button",{name:"Lưu nháp đầu mục"}).click()
    expect((await (await saved).json()).members).toEqual([{email:manager.account.email,share:30}])
    await expect(f09.getByText("Chủ nhiệm · 70%")).toBeVisible()
    await attach(f09,"REPORT")
    await f09.getByRole("button",{name:"Gửi duyệt đầu mục"}).click()
    await expect(f09.getByText("Trạng thái · Chờ duyệt")).toBeVisible()
    const office=await open(reviewer,"Nhiệm vụ cấp trên")
    await office.getByRole("button",{name:"Quan trắc cấp Bộ"}).click()
    await office.getByRole("button",{name:"Duyệt đầu mục",exact:true}).click()
    await expect(office.getByText(/Thiếu minh chứng.*DECISION/)).toBeVisible()
    await office.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/extension/cap-bo-thieu-quyet-dinh.png",import.meta.url))})
    await office.getByLabel("Lý do trả lại").fill("Bổ sung quyết định");await office.getByRole("button",{name:"Trả lại đầu mục"}).click()
    await expect(office.getByText("Trạng thái · Nháp")).toBeVisible()
    await f09.getByRole("button",{name:"Tải lại đầu mục"}).click()
    await attach(f09,"DECISION")
    await f09.getByRole("button",{name:"Gửi duyệt đầu mục"}).click()
    await expect(f09.getByText("Trạng thái · Chờ duyệt")).toBeVisible()
    await office.getByRole("button",{name:"Tải lại đầu mục"}).click()
    await office.getByRole("button",{name:"Duyệt đầu mục",exact:true}).click()
    await expect(office.getByText("Trạng thái · Đã duyệt")).toBeVisible()
    await expect(office.getByText(manager.account.email+" · Thành viên · 30%")).toBeVisible()
    await office.getByRole("group",{name:"Phân bổ đóng góp"}).screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/extension/phan-bo-dong-gop.png",import.meta.url))})
    for(const [p,need,forbidden] of [[author,"INVITE","REPORT"],[authorB,"REPORT","INVITE"]] as const){
      const act=await open(p,"Hoạt động khoa học");await draft(act,"Hội nghị tháng chín")
      await act.getByRole("button",{name:"Gửi duyệt đầu mục"}).click()
      const msg=act.getByText(/Thiếu minh chứng/)
      await expect(msg).toContainText(need);await expect(msg).not.toContainText(forbidden)
      await attach(act,need)
      const sent=p.waitForResponse(r=>r.request().method()==="POST"&&r.url().endsWith("/decision"))
      await act.getByRole("button",{name:"Gửi duyệt đầu mục"}).click()
      const record=await (await sent).json()
      await expect(act.getByText("Trạng thái · Chờ duyệt")).toBeVisible()
      if(p===author){
        expect((await authorB.request.post("/api/tenants/school-2/extensions/activity/"+record.id+"/decision",{headers:b.headers,data:{action:"approve",revision:record.revision,reason:""}})).status()).toBe(404)
        await act.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/extension/hoi-nghi-cho-duyet.png",import.meta.url))})
        await checkHours(adminA,reviewer,author,authorB,manager,a,b)
      }
    }
  }finally{await Promise.all(pages.map(p=>p.close()))}
})
