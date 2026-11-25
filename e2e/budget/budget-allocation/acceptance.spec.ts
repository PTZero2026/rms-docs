import { test,expect,type Page } from "@playwright/test"
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { signIn,provision } from "../../integration/session-fixture"

test("F05 reflects the finance cap, receipts, overspend and two settlement modes in a real session",async({browser})=>{
  test.skip(process.env.RMS_OIDC_INTEGRATION!=="1")
  test.setTimeout(110000)
  const pages=await Promise.all([0,1,2,3].map(()=>browser.newPage({baseURL:"http://127.0.0.1:4191"})))
  const [officer,pi,admin,foreign]=pages
  try{
    const actors=await Promise.all(pages.map((p,i)=>signIn(p,i===3?"school-1":"school-2",["ke-toan-f05","chu-nhiem-f05","quan-tri-f05","truong-khac-f05"][i]+"@example.invalid")))
    const headers=async(i:number)=>({authorization:(await actors[i].res.request().allHeaders()).authorization})
    provision("UPDATE rms.account SET user_type='admin' WHERE id=:'id'",{id:actors[2].account.id})
    async function setting(key:string,value:string,update=false){
      const base="/api/tenants/school-2/catalog/configurations",full="budget."+key
      const r=await admin.request.fetch(update?base+"/"+full:base,{method:update?"PUT":"POST",headers:await headers(2),
        data:{key:full,content:Buffer.from(value).toString("base64"),mime_type:"text/plain"}})
      expect(r.status(),await r.text()).toBe(200)
    }
    await setting("managementFeeRate","5");await setting("managementFeeCap","10000000")
    const ids:string[]=JSON.parse(execFileSync(process.execPath,[fileURLToPath(new URL("../../../apps/backend/test/db/seed-budget-case.mjs",import.meta.url)),actors[0].account.id,actors[1].account.id],{encoding:"utf8"}))
    const open=async(p:Page,id:string)=>{
      await p.goto("/app/school-2?project="+id)
      await p.getByRole("button",{name:"Kinh phí đề tài",exact:true}).click()
      return p.getByRole("region",{name:"Sổ kinh phí"})
    }
    for(const [i,id] of ids.entries()){
      const book=await open(officer,id)
      await book.getByRole("button",{name:"Xác nhận cấp kinh phí",exact:true}).click()
      await expect(book.getByText(i?"Kinh phí thực hiện · 290.000.000 ₫":"Kinh phí thực hiện · 95.000.000 ₫")).toBeVisible()
      if(i)await book.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/budget/chuyen-vien-tran-phi.png",import.meta.url))})
    }
    const [id,manual]=ids
    await setting("managementFeeRate","6",true)
    const author=await open(pi,id)
    await expect(author.getByText("Phí quản lý · 5.000.000 ₫ · Tỷ lệ 5.00%")).toBeVisible()
    expect((await pi.request.post("/api/tenants/school-2/projects/"+id+"/budget/allocation",{headers:await headers(1),data:{amount:"10",override:null,note:""}})).status()).toBe(403)
    expect((await foreign.request.get("/api/tenants/school-1/projects/"+id+"/budget",{headers:await headers(3)})).status()).toBe(404)
    async function fill(title:string,amount:string){
      await author.getByLabel("Nội dung chi").fill(title)
      await author.getByLabel("Số tiền chi (VND)").fill(amount)
      await author.getByLabel("Ngày chi",{exact:true}).fill("2026-11-23")
    }
    await fill("Khảo sát trạm đo","0")
    await author.getByRole("button",{name:"Lưu khoản chi",exact:true}).click()
    await expect(author.getByRole("alert")).toContainText("Số tiền")
    await fill("Khảo sát trạm đo","93000000")
    if(process.env.RMS_BROWSER_FIXTURE_BUCKET){
      await author.getByLabel("Tải tệp căn cứ").setInputFiles({name:"Phieu-chi.pdf",mimeType:"application/pdf",buffer:Buffer.from("%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF\n")})
      await author.getByRole("button",{name:"Tải và xác nhận tệp"}).click()
      await expect(author.getByText("Đã xác nhận tệp Phieu-chi.pdf")).toBeVisible()
    }
    await author.getByRole("button",{name:"Lưu khoản chi",exact:true}).click()
    await expect(author.getByText("Còn lại · 2.000.000 ₫")).toBeVisible()
    await fill("Thuê thiết bị","2000000")
    await author.getByRole("button",{name:"Lưu khoản chi",exact:true}).click()
    await expect(author.getByText("Còn lại · 0 ₫")).toBeVisible()
    await author.getByRole("article").filter({hasText:"Thuê thiết bị"}).getByRole("button",{name:"Sửa khoản chi"}).click()
    await author.getByLabel("Số tiền chi (VND)").fill("3000000")
    await author.getByRole("button",{name:"Lưu khoản chi",exact:true}).click()
    await expect(author.getByText("Vượt kinh phí 1.000.000 ₫")).toBeVisible()
    await author.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/budget/chu-nhiem-khoan-chi.png",import.meta.url))})
    // Both fixtures now carry the acceptance outcome F06 supplies at this integration boundary.
    for(const project of ids)provision("UPDATE rms.research_project SET status='PASSED',status_semantic='PASSED' WHERE id=:'id'; UPDATE rms.workflow_instance SET current_step='PASSED' WHERE project_id=:'id'",{id:project})
    const pilot=await open(officer,manual)
    await pilot.getByRole("button",{name:"Quyết toán và đóng đề tài"}).click()
    await expect(pilot.getByRole("alert")).toContainText("rà thủ công")
    await pilot.getByLabel("Đã rà soát thủ công").check()
    await pilot.getByRole("button",{name:"Quyết toán và đóng đề tài"}).click()
    await expect(pilot.getByText("Đã quyết toán và khóa sổ · Rà thủ công")).toBeVisible()
    await setting("reconciliationEnabled","true")
    const book=await open(officer,id)
    await book.getByRole("button",{name:"Quyết toán và đóng đề tài"}).click()
    await expect(book.getByRole("alert")).toContainText("UNRECONCILED")
    for(const [label,value,ref] of [["Khảo sát trạm đo","93000000","BANK-18"],["Thuê thiết bị","3000000","BANK-19"]]){
      const row=book.getByRole("article").filter({hasText:label})
      await row.getByRole("button",{name:"Đối soát khoản chi"}).click()
      await row.getByLabel("Mã giao dịch").fill(ref)
      await row.getByLabel("Số tiền chuyển (VND)").fill(value)
      await row.getByRole("button",{name:"Lưu đối soát"}).click()
      await expect(row.getByText(/· Khớp/)).toBeVisible()
    }
    await book.getByRole("button",{name:"Quyết toán và đóng đề tài"}).click()
    await expect(book.getByText("Đã quyết toán và khóa sổ · Đã đối soát")).toBeVisible()
    await book.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/budget/chuyen-vien-khoa-so.png",import.meta.url))})
  }finally{await Promise.all(pages.map(p=>p.close()))}
})
