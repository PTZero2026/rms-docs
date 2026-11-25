import {test,expect} from "@playwright/test"
import {fileURLToPath} from "node:url"
import {catalogUser} from "../../catalog/config-override/fixtures"

test("a researcher applies, an admin approves and the existing login receives author rights",async({browser})=>{
  test.skip(process.env.RMS_OIDC_INTEGRATION!=="1")
  test.setTimeout(90000)
  const [person,admin]=await Promise.all([0,1].map(()=>browser.newPage({baseURL:"http://127.0.0.1:4191"})))
  try {
    const [u]=await Promise.all([catalogUser(person,"school-2","ung-vien-author","user"),catalogUser(admin,"school-2","duyet-author","admin")])
    await person.getByRole("button",{name:"Hồ sơ cá nhân",exact:true}).click()
    await person.getByRole("button",{name:"Yêu cầu quyền tác giả",exact:true}).click()
    const form=person.getByRole("region",{name:"Yêu cầu quyền tác giả"})
    await form.getByLabel("Học hàm hoặc học vị").fill("Tiến sĩ")
    await form.getByLabel("Chuyên môn").fill("Thủy văn")
    await form.getByLabel(/Đường dẫn minh chứng/).fill("https://truong.example.invalid/ho-so/luu-vuc")
    await form.getByRole("button",{name:"Gửi yêu cầu lên tác giả"}).click()
    await expect(form.getByRole("heading",{name:/Chờ duyệt/})).toBeVisible()
    await admin.getByRole("button",{name:"Quản lý người dùng"}).click()
    await admin.getByRole("button",{name:"Xét yêu cầu quyền tác giả"}).click()
    const queue=admin.getByRole("region",{name:"Duyệt yêu cầu tác giả"})
    await queue.getByRole("button",{name:"Thẩm định "+u.account.email}).click()
    await queue.getByLabel("Ý kiến thẩm định").fill("Đã đối chiếu chuyên môn và minh chứng.")
    await queue.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/iam/tham-dinh-quyen-tac-gia.png",import.meta.url))})
    await queue.getByRole("button",{name:"Duyệt quyền tác giả"}).click()
    await expect(queue.getByText("Đã duyệt quyền tác giả.")).toBeVisible()
    await form.getByRole("button",{name:"Tải lại yêu cầu"}).click()
    await expect(form.getByRole("heading",{name:/Đã duyệt/})).toBeVisible()
    const me=await person.request.get("/api/tenants/school-2/auth/me",{headers:u.headers})
    expect(me.status()).toBe(200);expect(await me.json()).toMatchObject({userType:"author",permissions:["research.projects","research.proposals","meetings.view"]})
  } finally {await Promise.all([person.close(),admin.close()])}
})
