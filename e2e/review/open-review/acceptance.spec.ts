import { choose } from "../../lib/choice.mjs"
import { verifyAcceptance } from "../../acceptance/request-acceptance/acceptance"
import { followExecution } from "../../progress/assign-project/acceptance"
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { expect,test } from "@playwright/test"
import { provision,signIn } from "../../integration/session-fixture"

test("staff opens the review, assigned member submits a weighted ballot, PI reads the final ethics decision",async({browser})=>{
  test.skip(process.env.RMS_OIDC_INTEGRATION!=="1")
  test.setTimeout(100000)
  const pages=await Promise.all([0,1,2,3,4].map(()=>browser.newPage({baseURL:"http://127.0.0.1:4191"})))
  const [operator,author,reviewer,foreign,processOwner]=pages
  try{
    const [staff,pi,member,other]=await Promise.all([
      signIn(operator,"school-1","chuyenvien-hoidong@example.invalid"),signIn(author,"school-1","chunhiem-hoidong@example.invalid"),
      signIn(reviewer,"school-1","phanbien-hoidong@example.invalid"),signIn(foreign,"school-2","chuyenvien-hoidong-b@example.invalid")])
    const configHeaders={authorization:(await staff.res.request().allHeaders()).authorization}
    provision("UPDATE rms.account SET user_type='admin' WHERE id=:'id'::uuid",{id:staff.account.id})
    for(const [key,value] of [["MIN_SUBMITTED_SCORE_SHEETS","1"],["PASSING_SCORE","7"],["PUBLIC_COMMENTS","true"]]){
      const r=await operator.request.post("/api/tenants/school-1/catalog/configurations",{headers:configHeaders,data:{key:"PROPOSAL_REVIEW."+key,content:Buffer.from(value).toString("base64"),mime_type:"application/json"}})
      expect(r.status(),await r.text()).toBe(200)
    }
    for(const [key,value] of [["ACCEPTANCE.MIN_SUBMITTED_SCORE_SHEETS","1"],["ACCEPTANCE.PASSING_SCORE","7"],["budget.managementFeeRate","5"]]){
      const r=await operator.request.post("/api/tenants/school-1/catalog/configurations",{headers:configHeaders,data:{key,content:Buffer.from(value).toString("base64"),mime_type:"text/plain"}})
      expect(r.status(),await r.text()).toBe(200)
    }
    const {project}=JSON.parse(execFileSync(process.execPath,[fileURLToPath(new URL("../../../apps/backend/test/db/seed-review-case.mjs",import.meta.url)),staff.account.id,pi.account.id,member.account.id],{encoding:"utf8"}))
    await operator.getByRole("button",{name:"Tải lại thông tin"}).click()
    await expect(operator.getByText("Vai trò staff",{exact:true})).toBeVisible()
    await operator.getByRole("button",{name:"Xét duyệt hội đồng"}).click()
    await operator.getByText("Lập hội đồng xét duyệt",{exact:true}).click()
    await operator.getByLabel("Tên hội đồng",{exact:true}).fill("Hội đồng Thủy văn")
    await choose(operator.getByLabel("Chức danh "+member.email), "REVIEWER")
    await choose(operator.getByLabel("Chức danh "+pi.email), "MEMBER")
    await operator.getByRole("button",{name:"Lưu hội đồng"}).click()
    await choose(operator.getByLabel("Hồ sơ của kỳ đã đóng"), project)
    await operator.getByRole("button",{name:"Chốt hồ sơ hợp lệ"}).click()
    await operator.getByLabel("Bắt buộc thẩm định đạo đức").check()
    await operator.getByText("Lập hội đồng xét duyệt",{exact:true}).click()
    const opened=operator.waitForResponse(r=>r.url().endsWith("/reviews")&&r.request().method()==="POST")
    await operator.getByRole("button",{name:"Mở đợt chấm"}).click()
    const {id}=await (await opened).json()
    await operator.getByRole("button",{name:"Chốt kết luận khoa học"}).click()
    await expect(operator.getByText("Còn thiếu 1 phiếu hợp lệ.")).toBeVisible()
    const shot=(n:string)=>fileURLToPath(new URL("../../../docs/reviews/screenshots/review/"+n+".png",import.meta.url))
    await operator.getByRole("region",{name:"Xét duyệt hội đồng"}).screenshot({path:shot("chuyen-vien-mo-dot")})
    const reviewerHeaders={authorization:(await member.res.request().allHeaders()).authorization}
    expect((await reviewer.request.post("/api/tenants/school-1/review/rounds/"+id+"/conclusion",{headers:reviewerHeaders})).status()).toBe(403)
    await reviewer.getByRole("button",{name:"Xét duyệt hội đồng"}).click()
    const title="Quan trắc lưu lượng dòng chảy"
    await expect(reviewer.getByRole("heading",{name:title})).toBeVisible()
    await reviewer.getByLabel(/Chất lượng khoa học/).fill("10")
    await reviewer.getByRole("button",{name:"Lưu nháp phiếu"}).click()
    await expect(reviewer.getByText("Đã lưu nháp phiếu.")).toBeVisible()
    const reviewQueue=reviewer.getByRole("region",{name:"Xét duyệt hội đồng"})
    provision("UPDATE rms.account SET is_active=false WHERE id=:'id'",{id:member.account.id})
    const locked=reviewer.waitForResponse(r=>r.request().method()==="PUT"&&r.url().endsWith("/sheet"))
    await reviewQueue.getByRole("button",{name:"Lưu nháp phiếu"}).click()
    expect((await locked).status()).toBe(403)
    await expect(reviewQueue.getByRole("article")).toHaveCount(0)
    await expect(reviewQueue.getByRole("alert")).toBeVisible()
    provision("UPDATE rms.account SET is_active=true WHERE id=:'id'",{id:member.account.id})
    await reviewer.getByRole("button",{name:"Tải lại xét duyệt"}).click()
    await expect(reviewQueue.getByLabel(/Chất lượng khoa học/)).toHaveValue("10")
    await reviewer.getByRole("button",{name:"Gửi phiếu chấm"}).click()
    await expect(reviewer.getByText("Cần đủ điểm cho mọi tiêu chí.")).toBeVisible()
    await reviewer.getByLabel(/Tác động/).fill("2.5")
    await reviewer.getByLabel("Nhận xét chuyên môn").fill("Phương pháp phù hợp với mục tiêu.")
    await reviewer.getByRole("button",{name:"Gửi phiếu chấm"}).click()
    await expect(reviewer.getByText("Điểm phiếu đã gửi · 7")).toBeVisible()
    await reviewer.getByRole("article").screenshot({path:shot("phan-bien-phieu-da-gui")})
    await operator.getByRole("button",{name:"Chốt kết luận khoa học"}).click()
    await expect(operator.getByText("Đã chốt kết luận khoa học.")).toBeVisible()
    await expect(operator.getByText("Trạng thái đề tài · Đang xét duyệt")).toBeVisible()
    await operator.getByLabel("Căn cứ hoặc yêu cầu bổ sung").fill("Bổ sung văn bản đồng thuận theo biên bản 12.")
    await operator.getByRole("button",{name:"Ghi kết quả đạo đức"}).click()
    await expect(operator.getByText("Thẩm định đạo đức · Cần bổ sung")).toBeVisible()
    await author.goto("/app/school-1?project="+project)
    await author.getByRole("button",{name:"Mở thuyết minh"}).click()
    await author.getByRole("button",{name:"Xem kết quả xét duyệt"}).click()
    await expect(author.getByText("Bổ sung văn bản đồng thuận theo biên bản 12.",{exact:true})).toBeVisible()
    await choose(operator.getByLabel("Kết quả của hội đồng đạo đức"), "APPROVED")
    await operator.getByLabel("Căn cứ hoặc yêu cầu bổ sung").fill("Hội đồng thông qua theo biên bản 13.")
    await operator.getByRole("button",{name:"Ghi kết quả đạo đức"}).click()
    await expect(operator.getByText("Trạng thái đề tài · Đã phê duyệt")).toBeVisible()
    const amendment=operator.getByRole("region",{name:"Điều chỉnh kết luận"})
    await expect(amendment.getByRole("button",{name:"Mở lại vòng",exact:true})).toBeDisabled()
    await amendment.getByLabel("Lý do điều chỉnh kết luận").fill("Hội đồng bổ sung biên bản đối chiếu ngưỡng điểm.")
    await amendment.getByRole("button",{name:"Mở lại vòng",exact:true}).click()
    await expect(operator.getByText("Trạng thái đề tài · Đang xét duyệt")).toBeVisible()
    await expect(amendment.getByText(/Kết luận trước · Đạt · 1 phiếu/)).toBeVisible()
    await expect(amendment.getByText(/Đã mở lại vòng/)).toContainText(/\d{2}\/\d{2}\/\d{4}/)
    await amendment.screenshot({path:shot("mo-lai-ket-luan")})
    await operator.getByRole("button",{name:"Chốt kết luận khoa học"}).click()
    await expect(operator.getByText("Trạng thái đề tài · Đã phê duyệt")).toBeVisible()
    await author.getByRole("button",{name:"Xem kết quả xét duyệt"}).click()
    await expect(author.getByText("Đề tài · Đã phê duyệt")).toBeVisible()
    await expect(author.getByRole("list",{name:"Nhận xét công bố"})).toHaveText("Phương pháp phù hợp với mục tiêu.")
    await author.getByText("Đề tài · Đã phê duyệt").locator("..").screenshot({path:shot("chu-nhiem-ket-qua")})
    const alien={authorization:(await other.res.request().allHeaders()).authorization}
    expect((await foreign.request.get("/api/tenants/school-2/projects/"+project+"/review-result",{headers:alien})).status()).toBe(404)
    expect((await foreign.request.put("/api/tenants/school-2/review/rounds/"+id+"/sheet",{headers:alien,data:{points:{},comment:"",submit:false}})).status()).toBe(404)
    if(process.env.RMS_BROWSER_FIXTURE_BUCKET){
      const owner=await signIn(processOwner,"school-1","chu-quy-trinh-hoidong@example.invalid")
      provision("UPDATE rms.account SET user_type='admin' WHERE id=:'id'::uuid",{id:owner.account.id})
      await followExecution(operator,author,project)
      await verifyAcceptance(operator,author,reviewer,project,member.account.id,member.email,"00000000-0000-4000-8000-"+String(1).padStart(12,"0"),owner.email)
    }
  }finally{await Promise.all(pages.map(p=>p.close()))}
})
