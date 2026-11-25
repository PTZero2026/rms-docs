import {test,expect} from "@playwright/test"
import {randomUUID,createHash} from "node:crypto"
import {fileURLToPath} from "node:url"
import {catalogUser} from "../../catalog/config-override/fixtures"
import {provision} from "../../integration/session-fixture"

test("reading cards recheck both rights on use, reopen and generation without leaking an expired passage",async({browser})=>{
  test.skip(process.env.RMS_OIDC_INTEGRATION!=="1")
  test.setTimeout(90000)
  const pages=await Promise.all([0,1,2].map(()=>browser.newPage({baseURL:"http://127.0.0.1:4191"})))
  const [reader,admin,other]=pages
  try{
    const [user,manager,foreign]=await Promise.all(pages.map((p,i)=>catalogUser(p,i===2?"school-1":"school-2",["thu-vien-f07","quan-tri-thu-vien","thu-vien-ngoai-truong"][i],i===1?"admin":"user")))
    const key="FEATURE.AI",data={key,mime_type:"text/plain",content:Buffer.from("true").toString("base64")}
    const enabled=await admin.request.post(manager.path,{headers:manager.headers,data})
    if(enabled.status()===409)expect((await admin.request.put(manager.path+"/"+key,{headers:manager.headers,data})).status()).toBe(200)
    else expect(enabled.status()).toBe(200)
    const id=randomUUID(),doi="10.18637/jss.v059.i10",excerpt="each variable is a column, each observation is a row"
    provision(`INSERT INTO rms.reading_source(tenant_id,id,doi,title,authors,year,version,verified_url,ai_metadata,ai_fulltext)
      SELECT tenant_id,:'id',:'doi','Tidy Data','Hadley Wickham',2014,'author-pdf-v1','https://doi.org/10.18637/jss.v059.i10',true,false FROM rms.account WHERE id=:'user';
      INSERT INTO rms.reading_access SELECT tenant_id,:'id',id,true,true FROM rms.account WHERE id=:'user';
      INSERT INTO rms.reading_passage SELECT tenant_id,id,version,'method','abstract-1','Trang 1 · Tóm tắt',:'excerpt' FROM rms.reading_source WHERE id=:'id'`,{id,doi,user:user.account.id,excerpt})
    await reader.reload();await reader.getByRole("button",{name:"Thư viện DOI",exact:true}).click()
    await reader.getByRole("button",{name:/Tidy Data ·/}).click()
    const panel=reader.getByRole("region",{name:"Trợ lý có dẫn chứng"}),method=panel.getByRole("article").filter({has:reader.getByRole("heading",{name:"Phương pháp"})})
    const observed=async()=>{const r=await reader.request.get("http://127.0.0.1:3193/observed");const messages:string[][]=await r.json();const key=createHash("sha256").update(excerpt).digest("hex");return messages.filter(x=>x.includes(key)).length}
    const before=await observed()
    await panel.getByRole("button",{name:"Lập thẻ đọc"}).click()
    await expect(panel.getByText("Chưa đủ căn cứ",{exact:true})).toHaveCount(2)
    await expect(panel.getByText(/Hadley Wickham.*2014/)).toBeVisible();expect(await observed()).toBe(before)
    provision("UPDATE rms.reading_source SET ai_fulltext=true WHERE id=:'id'",{id})
    const fresh=reader.waitForResponse(r=>r.url().includes("/assistant/product/")&&r.request().method()==="POST")
    await panel.getByRole("button",{name:"Lập thẻ đọc"}).click()
    const card=await (await fresh).json()
    expect(card).toMatchObject({sourceId:id,sourceKind:"product",tenantId:"00000000-0000-4000-8000-000000000002"})
    await expect(method.getByText(excerpt,{exact:true})).toBeVisible()
    await method.getByRole("button",{name:/Mở căn cứ/}).click()
    await expect(method.locator("blockquote")).toContainText(excerpt)
    await method.getByRole("button",{name:"Bỏ trường này"}).click()
    await expect(method.getByText("Đã bỏ gợi ý")).toBeVisible()
    await panel.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/assistant/the-doc-co-can-cu.png",import.meta.url))})
    expect(await observed()).toBe(before+1)
    provision("UPDATE rms.reading_source SET full_until=now()-interval '1 second' WHERE id=:'id'",{id})
    await panel.getByRole("button",{name:"Mở lại bản gần nhất"}).click()
    await expect(panel.getByText("Chưa đủ căn cứ",{exact:true})).toHaveCount(2);await expect(panel.getByText(excerpt)).toHaveCount(0)
    await panel.getByRole("button",{name:"Lập thẻ đọc"}).click();await expect(panel.getByText("Chưa đủ căn cứ",{exact:true})).toHaveCount(2)
    expect(await observed()).toBe(before+1)
    const route="/api/tenants/school-2/assistant/product/"+id+"/"+card.id
    expect((await other.request.get(route.replace("school-2","school-1"),{headers:foreign.headers})).status()).toBe(404)
    provision("UPDATE rms.reading_access SET read_metadata=false,read_full=false WHERE source_id=:'id'",{id})
    await panel.getByRole("button",{name:"Mở lại bản gần nhất"}).click()
    await expect(panel.getByText("Nguồn không còn trong phạm vi xử lý.")).toBeVisible()
    await expect(panel.getByText(/Hadley Wickham/)).toHaveCount(0)
  }finally{await Promise.all(pages.map(p=>p.close()))}
})
