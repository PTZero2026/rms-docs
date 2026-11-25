import { choose } from "../../lib/choice.mjs"
import {checkDraftEvidence} from "../../proposal/ai-proposal-evidence/acceptance"
import {checkInactivePrincipal} from "../../iam/lock-account/inactive-principal"
import { execFileSync } from "node:child_process"
import { randomUUID } from "node:crypto"
import { fileURLToPath } from "node:url"
import { expect,test } from "@playwright/test"
import { verifyReturnedWork } from "../../home/open-work-item/acceptance"
import { provision,signIn } from "../../integration/session-fixture"

test("RV-05 operator replaces a retired reference before the call becomes visible to an author",async({browser})=>{
  test.skip(process.env.RMS_OIDC_INTEGRATION!=="1")
  test.setTimeout(90000)
  const pages=await Promise.all([0,1,2,3].map(()=>browser.newPage({baseURL:"http://127.0.0.1:4191"})))
  const [admin,author,b]=pages
  try{
    const [op,pi,foreign]=await Promise.all([signIn(admin,"school-1","canbo-mo-ky@example.invalid"),signIn(author,"school-1","chunhiem-traky@example.invalid"),signIn(b,"school-2","canbo-chua-quyen@example.invalid")])
    const refs={f:randomUUID(),form:randomUUID(),old:randomUUID(),fresh:randomUUID(),op:op.account.id,pi:pi.account.id}
    provision(`BEGIN;
      UPDATE rms.account SET user_type='staff' WHERE id=:'op'::uuid;
      UPDATE rms.account SET user_type='author' WHERE id=:'pi'::uuid;
      SELECT tenant_id AS t FROM rms.account WHERE id=:'op'::uuid \\gset
      INSERT INTO rms.intake_reference(tenant_id,id,kind,name,definition) VALUES
      (:'t',:'f','field','Môi trường','{}'),(:'t',:'form','form','Thuyết minh cơ sở','{"fields":[{"key":"method","label":"Phương pháp","required":true}]}'),
      (:'t',:'old','criteria','Bộ năm trước','{}'),(:'t',:'fresh','criteria','Bộ hiện hành','{}');
      COMMIT;`,refs)
    execFileSync(process.execPath,[fileURLToPath(new URL("../../../apps/backend/test/db/seed-intake-case.mjs",import.meta.url)),op.account.id,pi.account.id])
    for(const [page,role] of [[admin,"staff"],[author,"author"]] as const){
      await page.getByRole("button",{name:"Tải lại thông tin"}).click()
      await expect(page.getByText("Vai trò "+role,{exact:true})).toBeVisible()
      await page.getByRole("button",{name:"Kỳ nhận đề xuất",exact:true}).click()
    }
    await admin.getByRole("button",{name:"Tạo kỳ nháp"}).click()
    const today=new Date().toISOString().slice(0,10),end=new Date(Date.now()+30*86400000).toISOString().slice(0,10)
    await admin.getByLabel("Mã kỳ",{exact:true}).fill("KG-THU")
    await admin.getByLabel("Tên kỳ",{exact:true}).fill("Kỳ nghiên cứu cơ sở")
    await admin.getByLabel("Ngày bắt đầu").fill(today)
    await admin.getByLabel("Hạn nhận",{exact:true}).fill(end)
    await admin.getByLabel("Môi trường",{exact:true}).check()
    await choose(admin.getByRole("combobox",{name:"Biểu mẫu",exact:true}), refs.form)
    await choose(admin.getByRole("combobox",{name:"Bộ tiêu chí",exact:true}), refs.old)
    await admin.getByRole("button",{name:"Lưu kỳ nháp"}).click()
    await expect(admin.getByText("Đã lưu kỳ nháp.",{exact:true})).toBeVisible()
    await author.getByLabel("Tìm tên hoặc mã kỳ").fill("KG-THU")
    await expect(author.getByText("Chưa có kỳ phù hợp",{exact:true})).toBeVisible()
    for(const page of [author,admin]){
      const group=page.getByRole("radiogroup",{name:"Phạm vi tra kỳ"})
      const refreshed=page.waitForResponse(r=>r.url().includes("/calls?")&&r.url().includes("group=all"))
      await group.getByRole("radio",{name:"Tất cả",exact:true}).click()
      await refreshed
      await expect(page.getByRole("button",{name:/KG-THU.*Kỳ nghiên cứu cơ sở/})).toHaveCount(page===admin?1:0)
      await group.getByRole("radio",{name:"Đang nhận",exact:true}).click()
    }
    provision("UPDATE rms.intake_reference SET active=false WHERE id=:'old'::uuid",refs)
    await admin.getByRole("button",{name:"Mở kỳ",exact:true}).click()
    await expect(admin.getByText("Bộ tiêu chí đã hết hiệu lực: Bộ năm trước",{exact:true})).toBeVisible()
    await admin.getByRole("button",{name:"Sửa kỳ nháp"}).click()
    await choose(admin.getByRole("combobox",{name:"Bộ tiêu chí",exact:true}), refs.fresh)
    await admin.getByRole("button",{name:"Lưu kỳ nháp"}).click()
    const pending=admin.waitForResponse(r=>r.url().endsWith("/actions"))
    await admin.getByRole("button",{name:"Mở kỳ",exact:true}).click()
    const opened=await pending
    expect(opened.status()).toBe(200)
    const {id}=await opened.json()
    await admin.getByRole("button",{name:"Đóng kỳ",exact:true}).click()
    await expect(admin.getByText(/KG-THU · Đã đóng ·/)).toBeVisible()
    await expect(admin.getByRole("button",{name:"Gia hạn kỳ"})).toBeDisabled()
    const extendedEnd=new Date(Date.now()+35*86400000).toISOString().slice(0,10)
    await admin.getByLabel("Hạn mới").fill(extendedEnd)
    await admin.getByLabel("Lý do hủy hoặc gia hạn").fill("Mở lại để bổ sung hồ sơ theo lịch khoa.")
    const extension=admin.waitForResponse(r=>r.url().endsWith("/actions"))
    await admin.getByRole("button",{name:"Gia hạn kỳ"}).click()
    expect((await (await extension).json()).status).toBe("OPEN")
    expect((await b.request.get("/api/tenants/school-2/calls/"+id,{headers:{authorization:(await foreign.res.request().allHeaders()).authorization}})).status()).toBe(404)
    await author.setViewportSize({width:390,height:844})
    await author.getByLabel("Tìm tên hoặc mã kỳ").fill("kg-thu")
    await author.getByRole("button",{name:/KG-THU.*Kỳ nghiên cứu cơ sở/}).click()
    await expect(author.getByText("Biểu mẫu Thuyết minh cơ sở",{exact:true})).toBeVisible()
    await expect(author.getByText(new RegExp(extendedEnd.split("-").reverse().join("/"))).first()).toBeVisible()
    const shot=(n:string)=>fileURLToPath(new URL("../../../docs/reviews/screenshots/calls/"+n+".png",import.meta.url))
    await admin.screenshot({path:shot("chuyen-vien-mo-ky"),fullPage:true})
    await author.screenshot({path:shot("chu-nhiem-tra-ky"),fullPage:true})
    await author.getByLabel("Tìm tên hoặc mã kỳ").fill("khong-ton-tai")
    await expect(author.getByText("Chưa có kỳ phù hợp",{exact:true})).toBeVisible()
    await author.getByLabel("Tìm tên hoặc mã kỳ").fill("")
    await expect(author.getByRole("button",{name:/KG-THU.*Kỳ nghiên cứu cơ sở/})).toBeVisible()
    for(const width of [320,360,390]){await author.setViewportSize({width,height:844});expect(await author.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)}
    await author.getByRole("button",{name:"Lập đề xuất"}).click()
    await author.getByLabel("Tên đề xuất",{exact:true}).fill("Đánh giá chất lượng nước")
    const first=author.waitForResponse(r=>r.url().endsWith("/proposals")&&r.request().method()==="POST")
    await author.getByRole("button",{name:"Lưu nháp đề xuất"}).click()
    const created=await first
    expect(created.status()).toBe(200)
    const draft=await created.json()
    expect(draft.projectCode).toBeNull();expect(draft.members.filter((m:{principal:boolean})=>m.principal)).toHaveLength(1)
    const link="/app/school-1?project="+draft.id
    await author.goto(link)
    await author.getByRole("button",{name:"Mở thuyết minh"}).click()
    await expect(author.getByLabel("Tên đề xuất")).toHaveValue("Đánh giá chất lượng nước")
    await author.getByRole("button",{name:"Nộp đề xuất",exact:true}).click()
    await expect(author.getByText(/Còn thiếu .*Phương pháp/)).toBeVisible()
    await choose(author.getByRole("combobox",{name:"Lĩnh vực đề tài"}), refs.f)
    await author.getByLabel("Thời gian thực hiện (tháng)").fill("12")
    await author.getByLabel("Kinh phí đề xuất (VND)").fill("10000000")
    await author.getByLabel("Phương pháp (cần khi nộp)").fill("Lấy mẫu theo tháng.")
    await author.getByRole("button",{name:"Lưu nháp đề xuất"}).click()
    await expect(author.getByText("Đã lưu nháp.",{exact:true})).toBeVisible()
    await checkDraftEvidence(author,pages[3],b,draft.id,{authorization:(await pi.res.request().allHeaders()).authorization},{authorization:(await foreign.res.request().allHeaders()).authorization})
    const acceptedResponse=author.waitForResponse(r=>r.url().endsWith("/proposal/actions"))
    await author.getByRole("button",{name:"Nộp đề xuất",exact:true}).click()
    const accepted=await (await acceptedResponse).json()
    expect(accepted.semantic).toBe("SUBMITTED")
    await expect(author.getByLabel("Tên đề xuất")).toBeDisabled()
    await author.screenshot({path:shot("chu-nhiem-da-nop"),fullPage:true})
    await admin.goto(link)
    await admin.getByRole("button",{name:"Mở thuyết minh"}).click()
    await admin.getByLabel("Lý do cần bổ sung").fill(" ")
    await admin.getByRole("button",{name:"Trả hồ sơ bổ sung"}).click()
    await expect(admin.getByText("Cần ghi lý do trả hồ sơ.",{exact:true})).toBeVisible()
    await admin.getByLabel("Lý do cần bổ sung").fill("Bổ sung địa điểm lấy mẫu.")
    await admin.getByRole("button",{name:"Trả hồ sơ bổ sung"}).click()
    await expect(admin.getByText("Đã trả hồ sơ cho chủ nhiệm.",{exact:true})).toBeVisible()
    await admin.screenshot({path:shot("chuyen-vien-tra-ho-so"),fullPage:true})
    await verifyReturnedWork(author,b,draft.id,pi.account.id,(await foreign.res.request().allHeaders()).authorization)
    await author.goto(link)
    await author.getByRole("button",{name:"Mở thuyết minh"}).click()
    await expect(author.getByText("Lý do trả hồ sơ · Bổ sung địa điểm lấy mẫu.",{exact:true})).toBeVisible()
    await author.getByLabel("Phương pháp (cần khi nộp)").fill("Lấy mẫu theo tháng tại trạm A.")
    await author.getByRole("button",{name:"Lưu nháp đề xuất"}).click()
    await expect(author.getByText("Đã lưu nháp.",{exact:true})).toBeVisible()
    const resub=author.waitForResponse(r=>r.url().endsWith("/proposal/actions"))
    await author.getByRole("button",{name:"Nộp đề xuất",exact:true}).click()
    expect((await (await resub).json()).projectCode).toBe(accepted.projectCode)
    const foreignHeaders={authorization:(await foreign.res.request().allHeaders()).authorization}
    expect((await b.request.get("/api/tenants/school-2/projects/"+draft.id+"/proposal",{headers:foreignHeaders})).status()).toBe(404)
    await checkInactivePrincipal(pages[3],admin,author,draft.id,{id:pi.account.id,email:pi.email},
      (await op.res.request().allHeaders()).authorization,(await pi.res.request().allHeaders()).authorization)
  }finally{await Promise.all(pages.map(p=>p.close()))}
})
