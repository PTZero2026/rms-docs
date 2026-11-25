import { test,expect } from "@playwright/test"
import { createHash } from "node:crypto"
import { fileURLToPath } from "node:url"
import { catalogUser } from "./fixtures"
import { provision } from "../../integration/session-fixture"
import { checkConfigReplicas } from "./replicas"

test("RV-02 reads the effective key on the first request in both realms",async({browser})=>{
  test.skip(process.env.RMS_OIDC_INTEGRATION!=="1")
  test.setTimeout(90000)
  const pages=await Promise.all([0,1,2].map(()=>browser.newPage({baseURL:"http://127.0.0.1:4191"})))
  const [operator,a,b]=pages
  try {
    const [ops,admin,user]=await Promise.all([catalogUser(operator,"school-1","vanhanh-cauhinh","operator"),catalogUser(a,"school-1","quantri-cauhinh","admin"),catalogUser(b,"school-2","thanhvien-cauhinh","user")])
    const key="KY.XET", body={key,content:Buffer.from("Kỳ chung").toString("base64"),mime_type:"text/plain"}
    const seed=await operator.request.post(ops.path,{headers:ops.headers,data:body})
    expect(seed.status()).toBe(200)
    for(const [page,actor] of [[a,admin],[b,user]] as const) {
      const one=await page.request.get(actor.path+"/"+key,{headers:actor.headers})
      expect(await one.text()).toBe("Kỳ chung")
      const two=await page.request.get(actor.path+"/"+key,{headers:actor.headers})
      if(process.env.RMS_REDIS_SOCKET || process.env.RMS_REDIS_URL)expect(two.headers()["x-cache"]).toBe("HIT")
    }
    await a.getByRole("button",{name:"Cấu hình hệ thống"}).click()
    await a.getByRole("row").filter({has:a.getByRole("cell",{name:key,exact:true})}).getByRole("button",{name:"Tạo bản riêng"}).click()
    await a.getByLabel("Nội dung",{exact:true}).fill("Kỳ riêng A")
    await a.getByRole("button",{name:"Lưu cấu hình"}).click()
    await expect(a.getByText("Đã lưu cấu hình.",{exact:true})).toBeVisible()
    await expect(a.locator("pre")).toHaveText("Kỳ riêng A")
    await b.getByRole("button",{name:"Cấu hình hệ thống"}).click()
    await b.getByRole("row").filter({has:b.getByRole("cell",{name:key,exact:true})}).getByRole("button",{name:"Đọc hiệu lực"}).click()
    await expect(b.locator("pre")).toHaveText("Kỳ chung")
    await expect(b.getByRole("button",{name:"Thêm cấu hình"})).toHaveCount(0)
    const shot=(name:string)=>fileURLToPath(new URL("../../../docs/reviews/screenshots/catalog/"+name+".png",import.meta.url))
    await a.screenshot({path:shot("truong-a-ban-rieng"),fullPage:true})
    await b.screenshot({path:shot("truong-b-ban-chung"),fullPage:true})
    expect((await b.request.post(user.path,{headers:user.headers,data:body})).status()).toBe(403)
    expect((await b.request.get(admin.path+"/"+key,{headers:user.headers})).status()).toBe(401)
    const adapter=admin.path.replace("configurations","values")+"/"+key
    const mirror=await a.request.get(adapter,{headers:admin.headers})
    expect(mirror.status()).toBe(200)
    expect(Buffer.from((await mirror.json()).content,"base64").toString()).toBe("Kỳ riêng A")
    const changed={...body,content:Buffer.from("Kỳ A đợt 2").toString("base64")}
    expect((await a.request.put(adapter,{headers:admin.headers,data:changed})).status()).toBe(200)
    const reread=await a.request.get(adapter,{headers:admin.headers})
    expect(Buffer.from((await reread.json()).content,"base64").toString()).toBe("Kỳ A đợt 2")
    expect(await (await b.request.get(user.path+"/"+key,{headers:user.headers})).text()).toBe("Kỳ chung")
    const large=Buffer.alloc(6*1024*1024,7)
    const identifier="TEP.6M"
    const send=async(buffer:Buffer)=>a.request.post(admin.path,{headers:admin.headers,multipart:{key:identifier,content:{name:"sample.bin",mimeType:"application/octet-stream",buffer}}})
    expect((await send(large)).status()).toBe(200)
    const actual=await a.request.get(admin.path+"/"+identifier,{headers:admin.headers})
    const digest=(v:Buffer)=>createHash("sha256").update(v).digest("hex")
    expect(digest(await actual.body())).toBe(digest(large))
    expect((await send(Buffer.alloc(20*1024*1024+1))).status()).toBe(413)
    await checkConfigReplicas(a.request, ops, admin, user)
    provision("UPDATE rms.account SET user_type='user' WHERE id=:'id'::uuid",{id:admin.account.id})
    expect((await a.request.put(admin.path+"/"+key,{headers:admin.headers,data:body})).status()).toBe(403)
    provision("UPDATE rms.account SET is_active=false WHERE id=:'id'::uuid",{id:user.account.id})
    expect((await b.request.get(user.path+"/"+key,{headers:user.headers})).status()).toBe(403)
    const unchanged=await operator.request.get(ops.path+"/"+key,{headers:ops.headers})
    expect(await unchanged.text()).toBe("Kỳ chung")
  }finally{await Promise.all(pages.map(p=>p.close()))}
})
