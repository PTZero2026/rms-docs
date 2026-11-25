import { choose } from "../../lib/choice.mjs"
import {test,expect,type Page} from "@playwright/test"
import {randomUUID,createHash} from "node:crypto"
import {readFileSync} from "node:fs"
import {fileURLToPath} from "node:url"
import {signIn,provision} from "../../integration/session-fixture"

test("an assigned secretary versions meeting minutes and readers outside that committee cannot open the file",async({browser})=>{
  test.skip(!process.env.RMS_BROWSER_FIXTURE_BUCKET)
  test.setTimeout(90000)
  const pages=await Promise.all([0,1,2].map(()=>browser.newPage({baseURL:"http://127.0.0.1:4191"})))
  const [secretary,reader,other]=pages,slug="school-2"
  try{
    const [s,r,o]=await Promise.all(pages.map((p,i)=>signIn(p,slug,"hop-hoi-dong-"+i+"@example.invalid")))
    const ids={s:s.account.id,r:r.account.id,o:o.account.id,unit:randomUUID(),project:randomUUID(),round:randomUUID(),one:randomUUID(),two:randomUUID()}
    provision(`BEGIN;
      INSERT INTO rms.unit SELECT tenant_id,:'unit','Khoa phiên họp' FROM rms.account WHERE id=:'s';
      INSERT INTO rms.research_project(tenant_id,id,unit_id,title,owner_id)
        SELECT tenant_id,:'project',:'unit','Nước và môi trường',:'o' FROM rms.account WHERE id=:'s';
      INSERT INTO rms.committee(tenant_id,id,unit_id,name,kind)
        SELECT tenant_id,x.id,:'unit',x.name,'PROPOSAL_REVIEW' FROM rms.account CROSS JOIN (VALUES (:'one'::uuid,'Hội đồng A'),(:'two'::uuid,'Hội đồng B')) x(id,name) WHERE rms.account.id=:'s';
      INSERT INTO rms.committee_seat SELECT tenant_id,x.c,x.a,x.role FROM rms.account CROSS JOIN (VALUES
        (:'one'::uuid,:'s'::uuid,'SECRETARY'),(:'one'::uuid,:'r'::uuid,'MEMBER'),(:'two'::uuid,:'o'::uuid,'SECRETARY')) x(c,a,role) WHERE rms.account.id=:'s';
      INSERT INTO rms.evaluation_round(tenant_id,id,project_id,committee_id,kind,criteria,ethics)
        SELECT tenant_id,:'round',:'project',:'one','PROPOSAL_REVIEW','{"definition":{"items":[]}}','EXEMPT' FROM rms.account WHERE id=:'s';
      COMMIT;`,ids)
    async function minutes(p:Page){
      await p.getByRole("button",{name:"Xét duyệt hội đồng",exact:true}).click()
      const panel=p.getByRole("region",{name:"Biên bản cuộc họp"})
      await panel.getByRole("button",{name:"Biên bản cuộc họp"}).click()
      await choose(panel.getByLabel("Vòng hội đồng"), ids.round)
      return panel
    }
    const panel=await minutes(secretary)
    await panel.getByLabel("Tên cuộc họp").fill("Phiên họp xét hồ sơ tháng 11")
    await panel.getByLabel("Ngày họp").fill("2026-11-24")
    const created=secretary.waitForResponse(x=>x.url().endsWith("/meetings")&&x.request().method()==="POST")
    await panel.getByRole("button",{name:"Ghi cuộc họp"}).click()
    const meeting=(await (await created).json()).id
    const document=fileURLToPath(new URL("./evidence/bien-ban-hop.pdf",import.meta.url))
    for(const v of [1,2]){
      await panel.getByLabel("Tải tệp căn cứ").setInputFiles(document)
      await panel.getByRole("button",{name:"Tải và xác nhận tệp"}).click()
      await expect(panel.getByRole("button",{name:"bien-ban-hop.pdf · bản "+v})).toBeVisible()
    }
    await secretary.reload()
    const reopened=await minutes(secretary)
    await expect(reopened.getByRole("button",{name:"bien-ban-hop.pdf · bản 2"})).toBeVisible()
    await reopened.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/review/thu-ky-bien-ban.png",import.meta.url))})
    const read=await minutes(reader)
    await expect(read.getByRole("button",{name:"bien-ban-hop.pdf · bản 1"})).toBeVisible()
    await expect(read.getByLabel("Tải tệp căn cứ")).toHaveCount(0)
    const headers={authorization:(await r.res.request().allHeaders()).authorization}
    const list=await reader.request.get("/api/tenants/"+slug+"/review/rounds/"+ids.round+"/meetings",{headers})
    const [record]=await list.json()
    expect(record).toMatchObject({id:meeting,revision:2})
    expect(record.files.map((f:{actorId:string;revision:number})=>[f.actorId,f.revision])).toEqual([[s.account.id,2],[s.account.id,1]])
    const url="/api/tenants/"+slug+"/review/meetings/"+meeting+"/files/"+record.files[1].id+"/download"
    const download=await reader.request.get(url,{headers})
    expect(download.status()).toBe(200)
    const bytes=await (await reader.request.get((await download.json()).url)).body()
    const hash=(b:Buffer)=>createHash("sha256").update(b).digest("hex")
    expect(hash(bytes)).toBe(hash(readFileSync(document)))
    expect((await other.request.get(url,{headers:{authorization:(await o.res.request().allHeaders()).authorization}})).status()).toBe(404)
  }finally{await Promise.all(pages.map(p=>p.close()))}
})
