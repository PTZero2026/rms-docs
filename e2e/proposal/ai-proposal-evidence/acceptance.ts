import {expect,type Page} from "@playwright/test"
import {createHash} from "node:crypto"
import {fileURLToPath} from "node:url"
import {provision} from "../../integration/session-fixture"
import {catalogUser} from "../../catalog/config-override/fixtures"

export async function checkDraftEvidence(author:Page,admin:Page,foreign:Page,id:string,auth:{authorization:string},outside:{authorization:string}){
  const manager=await catalogUser(admin,"school-1","quan-tri-can-cu","admin"),key="FEATURE.AI"
  const data={key,mime_type:"text/plain",content:Buffer.from("true").toString("base64")}
  const r=await admin.request.post(manager.path,{headers:manager.headers,data})
  if(r.status()===409)expect((await admin.request.put(manager.path+"/"+key,{headers:manager.headers,data})).status()).toBe(200)
  else expect(r.status()).toBe(200)
  const base="/api/tenants/school-1/assistant/proposal/"+id
  expect((await author.request.post(base,{headers:auth})).status()).toBe(404)
  provision("INSERT INTO rms.proposal_ai_policy SELECT tenant_id,id,true FROM rms.research_project WHERE id=:'id'",{id})
  async function save(text:string){
    await author.getByLabel("Phương pháp (cần khi nộp)").fill(text)
    const done=author.waitForResponse(r=>r.url().includes("/proposal")&&r.request().method()==="PUT")
    await author.getByRole("button",{name:"Lưu nháp đề xuất"}).click()
    expect((await done).status()).toBe(200)
  }
  const evidence="Lấy mẫu tại ba trạm mỗi tháng.",second="Đối chiếu hai phép đo độc lập."
  const text=evidence+"\n"+second
  await save(text)
  const before=await (await author.request.get("/api/tenants/school-1/projects/"+id+"/proposal",{headers:auth})).json()
  const panel=author.getByRole("region",{name:"Trợ lý có dẫn chứng"})
  const created=author.waitForResponse(r=>r.url().endsWith("/assistant/proposal/"+id)&&r.request().method()==="POST")
  await panel.getByRole("button",{name:"Rà bản thuyết minh"}).click()
  const suggestion=await (await created).json()
  const identity={tenantId:"00000000-0000-4000-8000-000000000001",sourceId:id,sourceKind:"proposal"}
  expect(suggestion).toMatchObject(identity)
  const reopened=await author.request.get(base+"/"+suggestion.id,{headers:auth})
  expect(reopened.status()).toBe(200)
  expect(await reopened.json()).toMatchObject({id:suggestion.id,...identity})
  await expect(panel.getByText(evidence,{exact:true})).toBeVisible();await panel.getByRole("button",{name:/Mở căn cứ/}).click()
  await expect(panel.locator("blockquote")).toContainText("Phương pháp · đoạn 1")
  await panel.getByRole("button",{name:"Bỏ trường này"}).click();await expect(panel.getByText("Đã bỏ gợi ý")).toBeVisible()
  await panel.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/assistant/chu-nhiem-ra-thuyet-minh.png",import.meta.url))})
  const after=await (await author.request.get("/api/tenants/school-1/projects/"+id+"/proposal",{headers:auth})).json()
  expect(after.revision).toBe(before.revision);expect(after.document).toEqual(before.document)
  const modelCount=async()=>{const payload:string[][]=await (await author.request.get("http://127.0.0.1:3193/observed")).json();return payload.filter(x=>x.includes(createHash("sha256").update(evidence).digest("hex"))).length}
  const count=await modelCount()
  provision("UPDATE rms.account SET user_type='user' WHERE id=(SELECT owner_id FROM rms.research_project WHERE id=:'id')",{id})
  expect((await author.request.get(base+"/"+suggestion.id,{headers:auth})).status()).toBe(404)
  expect((await author.request.post(base,{headers:auth})).status()).toBe(404)
  expect(await modelCount()).toBe(count)
  provision("UPDATE rms.account SET user_type='author' WHERE id=(SELECT owner_id FROM rms.research_project WHERE id=:'id')",{id})
  provision("UPDATE rms.proposal_ai_policy SET permitted=false WHERE project_id=:'id'",{id})
  expect((await author.request.get(base+"/"+suggestion.id,{headers:auth})).status()).toBe(404)
  expect((await author.request.post(base,{headers:auth})).status()).toBe(404)
  expect((await foreign.request.post(base.replace("school-1","school-2"),{headers:outside})).status()).toBe(404)
  expect(await modelCount()).toBe(count)
  provision("UPDATE rms.proposal_ai_policy SET permitted=true WHERE project_id=:'id'",{id})
  await save("[offline-fixture] Kiểm tra khi dịch vụ ngừng.")
  await expect(panel).toHaveCount(1)
  await panel.getByRole("button",{name:"Rà bản thuyết minh"}).click()
  await expect(panel.getByText("Trợ lý đang gián đoạn. Có thể tiếp tục rà thủ công.")).toBeVisible()
  await save("Lấy mẫu theo tháng.")
}
