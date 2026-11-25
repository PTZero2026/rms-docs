import { test,expect } from "@playwright/test"
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { provision,signIn } from "../../integration/session-fixture"

test("RV-04 a saved project link checks the current unit and keeps the original actor snapshot",async({browser})=>{
  test.skip(process.env.RMS_OIDC_INTEGRATION!=="1")
  const pages=await Promise.all([0,1,2].map(()=>browser.newPage({baseURL:"http://127.0.0.1:4191"})))
  const [u,v,b]=pages
  try{
    const [actor,viewer,outsider]=await Promise.all([signIn(u,"school-1","chuyenvien-u@example.invalid"),signIn(v,"school-1","chuyenvien-v@example.invalid"),signIn(b,"school-2","chuyenvien-b@example.invalid")])
    const seed=fileURLToPath(new URL("../../../apps/backend/test/db/seed-audit-case.mjs",import.meta.url))
    const {id,other}=JSON.parse(execFileSync(process.execPath,[seed,actor.account.id,viewer.account.id],{encoding:"utf8"}))
    provision("UPDATE rms.account SET user_type='staff' WHERE id=:'id'::uuid",{id:outsider.account.id})
    const link="/app/school-1?project="+id
    await u.goto(link)
    await expect(u.getByText("Đã đối chiếu biên bản.",{exact:true})).toBeVisible()
    provision("UPDATE rms.account SET unit_id=:'other'::uuid WHERE id=:'id'::uuid",{id:actor.account.id,other})
    await u.goto(link)
    await expect(u.getByRole("alert")).toContainText("Không thể mở lịch sử")
    await expect(u.getByText("Đề tài theo dõi chất lượng nước",{exact:true})).toHaveCount(0)
    await v.goto(link)
    await expect(v.getByText("chuyenvien-u@example.invalid · Khoa Nghiên cứu",{exact:true})).toBeVisible()
    const shot=(name:string)=>fileURLToPath(new URL("../../../docs/reviews/screenshots/audit/"+name+".png",import.meta.url))
    await v.screenshot({path:shot("lich-su-duoc-phep"),fullPage:true})
    await u.screenshot({path:shot("sau-chuyen-khoa"),fullPage:true})
    await b.goto("/app/school-2?project="+id)
    await expect(b.getByRole("alert")).toContainText("Không thể mở lịch sử")
    await expect(b.getByText("Đã đối chiếu biên bản.",{exact:true})).toHaveCount(0)
    await v.getByRole("button",{name:"Về danh sách hồ sơ"}).click()
    await expect(v.getByRole("link",{name:"Đề tài theo dõi chất lượng nước"})).toBeVisible()
  }finally{await Promise.all(pages.map(p=>p.close()))}
})
