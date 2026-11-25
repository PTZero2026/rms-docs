import {expect,test} from "@playwright/test"
import {randomUUID} from "node:crypto"
import {fileURLToPath} from "node:url"
import {provision} from "../../integration/session-fixture"
import {catalogUser} from "../config-override/fixtures"

test("F07 uses the school's product labels and rechecks a retired type at submission",async({browser})=>{
  test.skip(process.env.RMS_OIDC_INTEGRATION!=="1")
  const pages=await Promise.all([1,2].map(()=>browser.newPage({baseURL:"http://127.0.0.1:4191"})))
  const [author,manager]=pages
  try{
    const [pi,admin]=await Promise.all([catalogUser(author,"school-2","tac-gia-ban-do","user"),catalogUser(manager,"school-2","quan-tri-loai-san-pham","admin")])
    const unit=randomUUID(),id=randomUUID()
    provision(`INSERT INTO rms.unit SELECT tenant_id,:'unit','Viện Bản đồ' FROM rms.account WHERE id=:'pi';
      UPDATE rms.account SET user_type='author',unit_id=:'unit' WHERE id=:'pi';
      INSERT INTO rms.research_project(tenant_id,id,unit_id,title,owner_id,status_semantic)
      SELECT tenant_id,:'id',unit_id,'Khảo sát lưu vực',id,'IN_PROGRESS' FROM rms.account WHERE id=:'pi'`,{unit,id,pi:pi.account.id})
    const key="PRODUCT.ACTIVE_TYPES"
    const active=[{code:"BASIN_MAP",label:"Bản đồ nghiên cứu"}]
    async function configure(value:unknown){
      const data={key,content:Buffer.from(JSON.stringify(value)).toString("base64"),mime_type:"text/plain"}
      const response=await manager.request.post(admin.path,{headers:admin.headers,data})
      if(response.status()===409)expect((await manager.request.put(admin.path+"/"+key,{headers:admin.headers,data})).status()).toBe(200)
      else expect(response.status()).toBe(200)
    }
    await configure(active)
    await author.goto("/app/school-2?project="+id)
    await author.getByRole("button",{name:"Sản phẩm khoa học",exact:true}).click()
    const panel=author.getByRole("region",{name:"Sản phẩm đề tài"})
    await panel.getByRole("button",{name:"Kê khai sản phẩm"}).click()
    await expect(panel.getByLabel("Loại sản phẩm").locator("option")).toHaveText(["Bản đồ nghiên cứu"])
    await panel.getByLabel("Tên sản phẩm").fill("Bản đồ lưu vực Cầu")
    await panel.getByLabel("Thông tin công bố").fill("Bản đồ nghiên cứu địa hình lưu vực")
    if(process.env.RMS_BROWSER_FIXTURE_BUCKET){
      await panel.getByLabel("Tải tệp căn cứ").setInputFiles(fileURLToPath(new URL("../../review/meeting-minutes/evidence/bien-ban-hop.pdf",import.meta.url)))
      await panel.getByRole("button",{name:"Tải và xác nhận tệp"}).click()
      await expect(panel.getByText("Đã xác nhận tệp bien-ban-hop.pdf")).toBeVisible()
    }
    await panel.getByRole("button",{name:"Lưu nháp sản phẩm"}).click()
    await expect(panel.getByText(/Bản đồ nghiên cứu · .* · Nháp/)).toBeVisible()
    await configure(["ARTICLE"])
    await panel.getByRole("button",{name:"Gửi duyệt sản phẩm"}).click()
    await expect(panel.getByRole("alert")).toContainText("Loại sản phẩm đã ngừng dùng")
    if(process.env.RMS_BROWSER_FIXTURE_BUCKET){
      await configure(active)
      await author.reload()
      await author.getByRole("button",{name:"Sản phẩm khoa học",exact:true}).click()
      await panel.getByRole("button",{name:"Gửi duyệt sản phẩm"}).click()
      await expect(panel.getByText(/Bản đồ nghiên cứu · .* · Chờ duyệt/)).toBeVisible()
      await panel.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/product/loai-san-pham-cua-truong.png",import.meta.url))})
    }
    await configure(["ARTICLE","PATENT","SOFTWARE","REPORT","BOOK"])
  }finally{await Promise.all(pages.map(p=>p.close()))}
})
