import { choose } from "../../lib/choice.mjs"
import {test,expect} from "@playwright/test"
import {existsSync,mkdirSync,writeFileSync} from "node:fs"
import {homedir} from "node:os"
import {execFileSync} from "node:child_process"
import {fileURLToPath} from "node:url"
import {catalogUser} from "../../catalog/config-override/fixtures"
import {provision} from "../../integration/session-fixture"
import {seedProfile} from "./fixtures"

test("F08 binds the printed heading and audit to each effective B01 version",async({browser})=>{
  test.skip(process.env.RMS_OIDC_INTEGRATION!=="1")
  test.setTimeout(90000)
  const pages=await Promise.all([0,1,2,3].map(()=>browser.newPage({baseURL:"http://127.0.0.1:4191"})))
  const [pi,admin,same,foreign]=pages
  try{
    const [owner,manager,other,external]=await Promise.all(pages.map((page,i)=>catalogUser(page,i===3?"school-2":"school-1",["nha-nghien-cuu-f08","quantri-f08","cung-truong-f08","ngoai-truong-f08"][i],i===1?"admin":"user")))
    const id=owner.account.id,base="/api/tenants/school-1/profiles/"+id+"/cv"
    seedProfile(id)
    await pi.getByRole("button",{name:"Lý lịch khoa học",exact:true}).click()
    const cv=pi.getByRole("region",{name:"Lý lịch khoa học"})
    await expect(cv.getByRole("link",{name:"Đo lưu lượng tự động"})).toHaveCount(1)
    await expect(cv.getByText("Bản đang thẩm định")).toHaveCount(0)
    expect((await same.request.get(base,{headers:other.headers})).status()).toBe(404)
    expect((await foreign.request.get(base.replace("school-1","school-2"),{headers:external.headers})).status()).toBe(404)
    const cfg={fields:{address:"hidden",position:"required"},institution:"Đại học Thủy lợi",positions:["Giảng viên"],ranks:["Phó giáo sư"],degrees:["Tiến sĩ"]}
    const setting=await admin.request.post(manager.path,{headers:manager.headers,data:{key:"PROFILE.FIELDS",mime_type:"text/plain",content:Buffer.from(JSON.stringify(cfg)).toString("base64")}})
    expect(setting.status()).toBe(200)
    await cv.getByRole("button",{name:"Thông tin công tác và học vị"}).click()
    const professional=cv.getByRole("form",{name:"Hồ sơ công tác"})
    await expect(professional.getByText("Trường/Viện · Đại học Thủy lợi")).toBeVisible()
    await expect(professional.getByLabel("Địa chỉ liên hệ")).toHaveCount(0)
    await choose(professional.getByLabel("Chức vụ"), "Giảng viên")
    await professional.getByLabel("Ngày sinh").fill("1985-02-03")
    await professional.getByRole("button",{name:"Thêm học vị"}).click()
    await professional.getByLabel("Năm nhận học vị").fill("2015")
    await professional.getByRole("button",{name:"Thêm học hàm"}).click()
    await professional.getByLabel("Năm nhận học hàm").fill("2021")
    await professional.getByRole("button",{name:"Thêm quá trình công tác"}).click()
    await professional.getByLabel("Nơi công tác").fill("Viện Thủy văn")
    await professional.getByLabel("Từ ngày").fill("2020-01-01")
    await professional.getByRole("button",{name:"Lưu hồ sơ công tác"}).click()
    await expect(professional.getByText("Đã lưu hồ sơ công tác.")).toBeVisible()
    await professional.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/profile/hoc-ham-hoc-vi.png",import.meta.url))})
    await cv.getByRole("button",{name:"Thông tin công tác và học vị"}).click()
    provision("UPDATE rms.account SET unit_id=(SELECT unit_id FROM rms.account WHERE id=:'person'),user_type='staff' WHERE id=:'who'",{person:id,who:other.account.id})
    const managed=await same.request.get(base.replace("/cv","/professional"),{headers:other.headers})
    expect(managed.status()).toBe(200)
    const rec=await managed.json()
    expect((await same.request.put(base.replace("/cv","/professional"),{headers:other.headers,data:{revision:rec.revision,fullName:rec.fullName,data:{...rec.data,phone:"0901234567"}}})).status()).toBe(200)
    provision("UPDATE rms.account SET user_type='user',unit_id=NULL WHERE id=:'who'",{who:other.account.id})
    const directory=fileURLToPath(new URL("./evidence/",import.meta.url))
    mkdirSync(directory,{recursive:true})
    const bundled=homedir()+"/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext"
    const reader=process.env.RMS_PDFTOTEXT||(existsSync(bundled)?bundled:"pdftotext")
    const codes=["v1","v2"],titles=["Lý lịch nghiên cứu","Lý lịch khoa học cấp trường"]
    const receipts=[]
    for(const [i,version] of codes.entries()){
      const template={code:"CV-01",version,title:titles[i]},key="PROFILE.TEMPLATE"
      const r=await admin.request.fetch(manager.path+(i?"/"+key:""),{method:i?"PUT":"POST",headers:manager.headers,data:{key,content:Buffer.from(JSON.stringify(template)).toString("base64"),mime_type:"text/plain"}})
      expect(r.status(),await r.text()).toBe(200)
      const result=pi.waitForResponse(r=>r.url().endsWith("/cv/exports")&&r.request().method()==="POST")
      const event=pi.waitForEvent("download")
      await cv.getByRole("button",{name:"Xuất lý lịch PDF"}).click()
      const receipt=await (await result).json(),download=await event
      const file=directory+"cv-"+version+".pdf"
      await download.saveAs(file)
      expect(download.suggestedFilename()).toBe("CV-01-"+version+".pdf")
      const text=execFileSync(reader,["-layout",file,"-"],{encoding:"utf8"})
      expect(text).toContain("Học vị · Tiến sĩ · 2015");expect(text).toContain("Học hàm · Phó giáo sư · 2021");
      expect(text).toContain(titles[i]);expect(text).toContain(version)
      expect(text.match(/Đo lưu lượng tự động/g)).toHaveLength(1);expect(text).not.toContain("Bản đang thẩm định")
      const rows=JSON.parse(execFileSync("psql",["-XAt","-c","SELECT json_agg(row_to_json(a)) FROM (SELECT id,actor_id,target_id,occurred_at,details FROM rms.audit_log WHERE id='"+receipt.auditId+"'::uuid AND action='EXPORT_CV') a"],{encoding:"utf8"}))
      expect(rows).toHaveLength(1);expect(rows[0]).toMatchObject({actor_id:id,target_id:id,details:{...template,exportId:receipt.id}})
      expect((await same.request.get(base+"/exports/"+receipt.id+"/file",{headers:other.headers})).status()).toBe(404)
      receipts.push(rows[0])
    }
    writeFileSync(directory+"exports.json",JSON.stringify(receipts,null,2)+"\n")
    await cv.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/profile/nha-nghien-cuu-xuat-pdf.png",import.meta.url))})
  }finally{await Promise.all(pages.map(p=>p.close()))}
})
