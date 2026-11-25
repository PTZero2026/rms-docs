import { randomUUID } from "node:crypto"
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { test,expect } from "@playwright/test"
import { signIn,provision } from "../../integration/session-fixture"

test("home separates task ids from target ids, uses the source date and respects the school's widget settings",async({browser})=>{
  test.skip(process.env.RMS_OIDC_INTEGRATION!=="1")
  test.setTimeout(90000)
  const pages=await Promise.all([360,390,1280].map(width=>browser.newPage({baseURL:"http://127.0.0.1:4191",viewport:{width,height:850}})))
  const [principal,admin,foreign]=pages,slug="school-2",tenant="00000000-0000-4000-8000-000000000002"
  try{
    const [pi,op,outside]=await Promise.all([signIn(principal,slug,"chu-nhiem-congviec@example.invalid"),signIn(admin,slug,"quan-tri-congviec@example.invalid"),signIn(foreign,"school-1","nguoi-khac-congviec@example.invalid")])
    const vars={tenant,pi:pi.account.id,op:op.account.id,unit:randomUUID(),project:randomUUID(),other:randomUUID(),round:randomUUID(),committee:randomUUID()}
    provision(`BEGIN;
      INSERT INTO rms.unit VALUES(:'tenant',:'unit','Khoa Thủy văn');
      UPDATE rms.account SET user_type='author',unit_id=:'unit' WHERE id=:'pi';
      UPDATE rms.account SET user_type='admin',unit_id=:'unit' WHERE id=:'op';
      INSERT INTO rms.research_project(tenant_id,id,unit_id,title,owner_id,status_semantic) VALUES
        (:'tenant',:'project',:'unit','Nghiên cứu dòng chảy',:'pi','IN_PROGRESS'),(:'tenant',:'other',:'unit','Nghiên cứu độc lập',:'op','UNDER_REVIEW');
      INSERT INTO rms.progress_period(tenant_id,project_id,period,due_date)
        SELECT :'tenant',:'project',k,(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date+delta FROM (VALUES (2,-3),(3,7),(4,0)) test(k,delta);
      INSERT INTO rms.proposal_document(tenant_id,project_id,form_snapshot) VALUES(:'tenant',:'other','{}');
      INSERT INTO rms.committee(tenant_id,id,unit_id,name,kind) VALUES(:'tenant',:'committee',:'unit','Hội đồng nước','PROPOSAL_REVIEW');
      INSERT INTO rms.committee_seat VALUES(:'tenant',:'committee',:'pi','REVIEWER');
      INSERT INTO rms.evaluation_round(tenant_id,id,project_id,committee_id,kind,criteria,ethics)
        VALUES(:'tenant',:'round',:'other',:'committee','PROPOSAL_REVIEW','{"definition":{"items":[]}}','EXEMPT');
      COMMIT;`,vars)
    const counts=()=>execFileSync("psql",["-XAt","-c","SELECT count(*) FROM rms.audit_log WHERE target_id IN ('"+vars.project+"','"+vars.round+"')"],{encoding:"utf8"}).trim()
    const before=counts()
    let work=""
    for(const width of [360,390]){
      await principal.setViewportSize({width,height:850})
      await principal.goto("/app/"+slug)
      const list=principal.getByRole("region",{name:"Việc cần làm"})
      await expect(list.getByText("4 việc · 1 quá hạn")).toBeVisible()
      await expect(list.getByText("Chưa có hạn")).toBeVisible()
      await list.getByRole("radio",{name:"Quá hạn",exact:true}).click()
      await expect(list.getByRole("link")).toHaveCount(1)
      const item=list.getByRole("link",{name:/Báo cáo kỳ 2/})
      work=(await item.getAttribute("href"))!
      if(width===360)await list.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/home/chu-nhiem-ky-qua-han.png",import.meta.url))})
      await item.click()
      await expect(principal.getByRole("group",{name:"Báo cáo kỳ 2",exact:true})).toBeVisible()
      await expect(principal.getByText("Nghiên cứu dòng chảy · Đang thực hiện",{exact:true})).toBeVisible()
      await principal.getByRole("link",{name:"Về danh sách việc"}).click()
      await expect(list.getByRole("link",{name:/Báo cáo kỳ 4/})).toBeVisible()
      expect(await principal.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    }
    expect(counts()).toBe(before)
    const ids=work.split("=")[1],headers={authorization:(await pi.res.request().allHeaders()).authorization}
    for(const [p,school,actor] of [[admin,slug,op],[foreign,"school-1",outside]] as const){
      const h={authorization:(await actor.res.request().allHeaders()).authorization}
      expect((await p.request.get("/api/tenants/"+school+"/home/work/"+ids,{headers:h})).status()).toBe(404)
    }
    await admin.reload()
    await admin.getByRole("button",{name:"Cấu hình hệ thống",exact:true}).click()
    const settings=admin.getByRole("region",{name:"Quản lý cấu hình"})
    await settings.getByRole("button",{name:"Thêm cấu hình"}).click()
    await settings.getByLabel("Mã cấu hình").fill("HOME.RESEARCHER")
    await settings.getByLabel("Loại nội dung",{exact:true}).fill("text/plain")
    await settings.getByLabel("Nội dung",{exact:true}).fill("projects,activity")
    await settings.getByRole("button",{name:"Lưu cấu hình",exact:true}).click()
    const detail=settings.getByRole("region",{name:"Nội dung cấu hình"})
    await expect(detail.locator("pre")).toHaveText("projects,activity")
    const audit=execFileSync("psql",["-XAt","-d","rms_config_test","-v","ON_ERROR_STOP=1","-v","actor="+op.account.id,"-v","tenant="+tenant],{
      input:"SELECT count(*) FROM catalog.audit a JOIN catalog.configuration c ON c.revision=a.revision AND c.tenant_id=a.tenant_id WHERE a.tenant_id=:'tenant' AND a.actor_id=:'actor' AND a.key='home.researcher' AND a.action='CREATE' AND c.content=convert_to('projects,activity','UTF8');",
      encoding:"utf8",
    })
    expect(audit.trim()).toBe("1")
    const refreshed=principal.waitForResponse(r=>r.url().endsWith("/home/layout"))
    await principal.reload()
    expect(await (await refreshed).json()).toMatchObject({widgets:["projects","activity"]})
    expect(await (await principal.request.get("/api/tenants/"+slug+"/home/work?group=all",{headers})).json()).toEqual({visible:false,total:0,overdue:0,items:[]})
    const home=principal.getByRole("region",{name:"Trang chủ cá nhân"})
    await expect(home.getByRole("region",{name:"Số liệu nhanh"})).toBeVisible()
    await expect(home.getByRole("region",{name:"Thông báo gần đây"})).toBeVisible()
    await expect(home.getByText(/Cập nhật/)).toHaveText(/\d{2}\/\d{2}\/\d{4}/)
    await home.screenshot({path:fileURLToPath(new URL("../../../docs/reviews/screenshots/home/bo-cuc-ca-nhan.png",import.meta.url))})
    await expect(principal.getByRole("region",{name:"Việc cần làm"})).toHaveCount(0)
    expect((await principal.request.get("/api/tenants/"+slug+"/home/work/"+ids,{headers})).status()).toBe(404)
  }finally{await Promise.all(pages.map(p=>p.close()))}
})
