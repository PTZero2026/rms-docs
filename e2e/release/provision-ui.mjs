import assert from "node:assert/strict"
import {spawn,execFileSync} from "node:child_process"
import {once} from "node:events"
import {randomUUID} from "node:crypto"
import {fileURLToPath} from "node:url"
import {setTimeout as wait} from "node:timers/promises"
import {writeFile} from "node:fs/promises"
import {expect} from "@playwright/test"
import {provision,signIn} from "../integration/session-fixture.ts"

const local=s=>fileURLToPath(new URL(s,import.meta.url))
export async function checkAdminProvision(browser){
  const root=local("../../"),web=local("../../apps/web/"),baseURL="http://127.0.0.1:4197",api="http://127.0.0.1:3197"
  assert.match(process.env.PGHOST??"",/^\/tmp\/rms-pg\.[A-Za-z0-9]+$/)
  assert.equal(process.env.PGDATABASE,"rms_test")
  const services=[],pages=[]
  async function start(args,cwd,extra,url){
    if(await fetch(url,{signal:AbortSignal.timeout(500)}).catch(()=>null))throw Error("Fixture port is already bound")
    const p=spawn(process.execPath,args,{cwd,env:{...process.env,...extra},stdio:"ignore"})
    services.push(p)
    for(let i=0;i<80;i++){
      if(p.exitCode!==null)throw Error("Provision fixture exited before ready")
      if((await fetch(url,{signal:AbortSignal.timeout(500)}).catch(()=>null))?.ok)return
      await wait(150)
    }
    throw Error("Provision fixture startup timeout")
  }
  try{
    await start(["apps/backend/dist/main.js"],root,{HOST:"127.0.0.1",PORT:"3197",DATABASE_URL:"postgresql://rms_test_client@localhost/rms_test?host="+process.env.PGHOST},api+"/api/health")
    await start(["node_modules/vite/bin/vite.js","preview","--host","127.0.0.1","--port","4197","--strictPort"],web,{RMS_API_ORIGIN:api},baseURL)
    for(let i=0;i<2;i++)pages.push(await browser.newPage({baseURL}))
    const [admin,applicant]=pages,slug="school-1",unit=randomUUID()
    const manager=await signIn(admin,slug,"iam-admin@rehearsal.invalid")
    provision("INSERT INTO rms.unit(tenant_id,id,name) SELECT tenant_id,:'unit','Viện nghiên cứu' FROM rms.account WHERE id=:'a'; UPDATE rms.account SET unit_id=:'unit',user_type='admin' WHERE id=:'a'",{a:manager.account.id,unit})
    await admin.getByRole("button",{name:"Tải lại thông tin"}).click()
    await admin.getByRole("button",{name:"Quản lý người dùng"}).click()
    await admin.getByText("Cấp tài khoản mới",{exact:true}).click()
    const form=admin.locator("form").filter({has:admin.getByRole("heading",{name:"Cấp tài khoản",exact:true})})
    const email="tac-gia-duoc-cap@example.invalid"
    await form.getByLabel("Email tài khoản").fill(email)
    await form.getByLabel("Họ tên người được cấp").fill("Nguyễn Hải An")
    await form.getByLabel("Đơn vị công tác").selectOption(unit)
    await form.getByLabel("Vai trò tài khoản").selectOption("author")
    const posted=admin.waitForResponse(r=>r.url().endsWith("/admin/users")&&r.request().method()==="POST")
    await form.getByRole("button",{name:"Tạo tài khoản",exact:true}).click()
    const created=await posted
    expect(created.status(),await created.text()).toBe(200)
    const user=await created.json()
    await expect(form.getByText("Đã cấp tài khoản "+email)).toBeVisible()
    await form.screenshot({path:local("../../docs/reviews/screenshots/iam/cap-truoc-tai-khoan.png")})
    const replay=await admin.request.post(created.url(),{headers:{authorization:(await created.request().allHeaders()).authorization},data:created.request().postDataJSON()})
    expect(replay.status()).toBe(200);expect((await replay.json()).id).toBe(user.id)
    const first=await signIn(applicant,slug,email)
    expect(first.account).toMatchObject({id:user.id,userType:"author",unitId:unit,isNew:false})
    expect(first.account.permissions.length).toBe(3)
    const count=execFileSync("psql",["-XAt","-c","SELECT count(*) FROM rms.audit_log WHERE action='ADMIN_CREATE_USER' AND target_id='"+user.id+"'"],{encoding:"utf8"}).trim()
    expect(count).toBe("1")
    await writeFile(local("./provision-result.json"),JSON.stringify({at:new Date().toISOString(),issuer:"school-1",adminHttpStatus:created.status(),replayStatus:replay.status(),sameAccountAtFirstOtp:true,permissions:first.account.permissions.length,creationAuditRows:Number(count)},null,2)+"\n")
  }finally{
    await Promise.all(pages.map(p=>p.close()))
    for(const p of services.reverse())if(p.exitCode===null&&p.signalCode===null){const done=once(p,"exit");p.kill("SIGTERM");await done}
  }
}
