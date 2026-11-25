import {test,expect} from "@playwright/test"
import {execFile} from "node:child_process"
import {promisify} from "node:util"
import {randomUUID} from "node:crypto"
import {fileURLToPath} from "node:url"
import {catalogUser} from "../../catalog/config-override/fixtures"
import {provision} from "../../integration/session-fixture"
import {checkWithdrawal} from "../../proposal/cancel-proposal/acceptance"

test("F02 officer sees an expired call close in the worker and can reopen it with a reason",async({browser})=>{
  test.skip(process.env.RMS_OIDC_INTEGRATION!=="1")
  const page=await browser.newPage({baseURL:"http://127.0.0.1:4191",viewport:{width:960,height:850}})
  const author=await browser.newPage({baseURL:"http://127.0.0.1:4191",viewport:{width:850,height:720}})
  try{
    const [{headers,account},principal]=await Promise.all([
      catalogUser(page,"school-1","chuyen-vien-ky-het-han","user"),
      catalogUser(author,"school-1","chu-nhiem-ky-het-han","user")
    ])
    await promisify(execFile)(process.execPath,[fileURLToPath(new URL("../../../apps/backend/test/db/seed-intake-case.mjs",import.meta.url)),account.id,principal.account.id])
    const field=randomUUID(),form=randomUUID(),criteria=randomUUID()
    provision(`INSERT INTO rms.intake_reference(tenant_id,id,kind,name)
      SELECT a.tenant_id,r.* FROM rms.account a CROSS JOIN (VALUES
        (:'field'::uuid,'field','Lĩnh vực quan trắc'),(:'form'::uuid,'form','Mẫu đề xuất quan trắc'),
        (:'criteria'::uuid,'criteria','Tiêu chí quan trắc')) r WHERE a.id=:'actor';`,{actor:account.id,field,form,criteria})
    const calls="/api/tenants/school-1/calls",code="KG-QUAN-TRAC"
    const localDay=(days:number)=>new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Ho_Chi_Minh",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(Date.now()+days*86400000))
    const extensionDate=localDay(2)
    const created=await page.request.post(calls,{headers,data:{code,name:"Kỳ nghiên cứu quan trắc",startDate:localDay(-30),
      endDate:extensionDate,templateId:form,criteriaId:criteria,fieldIds:[field]}})
    expect(created.status()).toBe(200)
    const {id,revision}=await created.json()
    expect((await page.request.post(calls+"/"+id+"/actions",{headers,data:{action:"open",revision}})).status()).toBe(200)
    const draft=await author.request.post(calls+"/"+id+"/proposals",{headers:principal.headers,data:{
      title:"Khảo sát thử nghiệm",fieldId:field,months:3,budget:0,document:{},memberIds:[]}})
    expect(draft.status()).toBe(200)
    const proposal=await draft.json()
    const proposalPath="/api/tenants/school-1/projects/"+proposal.id+"/proposal"
    const showDraft=async()=>{
      await author.goto("/app/school-1?project="+proposal.id)
      await author.getByRole("button",{name:"Mở thuyết minh"}).click()
      await expect(author.getByLabel("Tên đề xuất")).toHaveValue("Khảo sát thử nghiệm")
    }
    // Shorten only the client countdown. The later checks use the real DB window and worker.
    await author.route("**"+proposalPath,async route=>{
      const upstream=await route.fetch()
      const data=await upstream.json()
      await route.fulfill({response:upstream,json:{...data,submitUntil:new Date(Date.now()+1500).toISOString()}})
    })
    await showDraft()
    const submitButton=author.getByRole("button",{name:"Nộp đề xuất",exact:true})
    await expect(submitButton).toBeEnabled()
    await expect(submitButton).toBeDisabled()
    await author.unroute("**"+proposalPath)
    await showDraft()
    await expect(submitButton).toBeEnabled()
    provision("UPDATE rms.proposal_call SET end_date=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date-1 WHERE id=:'id'",{id})
    await page.reload()
    await page.getByRole("button",{name:"Kỳ nhận đề xuất",exact:true}).click()
    await page.getByLabel("Tìm tên hoặc mã kỳ").fill(code)
    await expect(page.getByText("Chưa có kỳ phù hợp",{exact:true})).toBeVisible()
    const filter=page.getByRole("group",{name:"Phạm vi tra kỳ"})
    await filter.getByRole("button",{name:"Tất cả"}).click()
    await page.getByRole("button",{name:/KG-QUAN-TRAC · Đã mở/}).click()
    const socket=process.env.PGHOST!
    expect(socket).toMatch(/^\/tmp\/rms-pg\.[a-zA-Z0-9]+$/)
    const {stdout}=await promisify(execFile)(process.execPath,[fileURLToPath(new URL("../../../apps/worker/src/main.mjs",import.meta.url)),"--once"],
      {env:{...process.env,WORKER_DATABASE_URL:"postgresql://rms_test_worker@localhost/rms_test?host="+socket,
        FORCE_COLOR:"0",RMS_CONFIG_ORIGIN:"",RMS_SMS_GATEWAY_URL:"",RMS_SMS_GATEWAY_TOKEN:"",SMTP_HOST:"127.0.0.1",SMTP_PORT:"1026"}})
    expect(stdout).toMatch(/Expired proposal calls closed [1-9]/)
    expect((await author.request.get(calls+"/"+id,{headers:principal.headers})).status()).toBe(404)
    const submission=author.waitForResponse(r=>r.url().endsWith("/proposal/actions"))
    await submitButton.click()
    const rejected=await submission
    expect(rejected.status()).toBe(409)
    expect((await rejected.json()).message).toContain("Đã hết hạn nộp của kỳ")
    await expect(submitButton).toBeDisabled()
    await showDraft()
    await expect(submitButton).toBeDisabled()
    await expect(author.getByText("Kỳ hiện không nhận đề xuất.")).toBeVisible()
    await author.getByText("Kỳ hiện không nhận đề xuất.").scrollIntoViewIfNeeded()
    await author.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/calls/chu-nhiem-het-han.png",import.meta.url))})
    await page.getByRole("button",{name:"Đóng kỳ",exact:true}).click()
    await expect(page.getByText("Kỳ đã thay đổi. Hãy tải lại.")).toBeVisible()
    await filter.getByRole("button",{name:"Đang nhận"}).click()
    await filter.getByRole("button",{name:"Tất cả"}).click()
    await page.getByRole("button",{name:/KG-QUAN-TRAC · Đã đóng/}).click()
    const actions=page.getByRole("group",{name:"Thao tác với kỳ"})
    await expect(actions.getByRole("button",{name:"Gia hạn kỳ"})).toBeDisabled()
    const detail=page.locator("section").filter({has:page.getByRole("heading",{name:"Kỳ nghiên cứu quan trắc",exact:true})}).last()
    await detail.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/calls/ky-tu-dong-dong.png",import.meta.url))})
    await actions.getByLabel("Hạn mới").fill(extensionDate)
    await actions.getByLabel("Lý do hủy hoặc gia hạn").fill("Phòng KHCN bổ sung hai ngày nhận hồ sơ.")
    await actions.getByRole("button",{name:"Gia hạn kỳ"}).click()
    await expect(page.getByText("Đã cập nhật trạng thái kỳ.")).toBeVisible()
    await filter.getByRole("button",{name:"Đang nhận"}).click()
    await expect(page.getByRole("button",{name:/KG-QUAN-TRAC · Đã mở/})).toBeVisible()
    await showDraft()
    await expect(submitButton).toBeEnabled()
    const submitted=author.waitForResponse(r=>r.url().endsWith("/proposal/actions"))
    await submitButton.click()
    const accepted=await submitted
    expect(accepted.status()).toBe(200)
    const codeAfter=(await accepted.json()).projectCode
    expect(codeAfter).toBeTruthy()
    await expect(author.getByText("Mã đề tài "+codeAfter)).toBeVisible()
    await checkWithdrawal(page,author,proposal.id,codeAfter)
  }finally{await Promise.all([page.close(),author.close()])}
})
