import assert from "node:assert/strict"
import {after,test} from "node:test"
import {randomUUID} from "node:crypto"
import {Pool} from "pg"
import {withTenant} from "../../dist/db/tenant-transaction.js"
import {resolveAccount} from "../../dist/modules/iam/account.js"
import {appendAudit} from "../../dist/modules/audit/append.js"
import {notifyRecipients} from "../../dist/modules/notification/emit.js"
import {listDeliveries} from "../../dist/modules/notification/deliveries.js"
import {listInbox,readNotice} from "../../dist/modules/notification/inbox.js"
import {deliverNext} from "../../dist/modules/notification/worker.js"

const pool = new Pool({user:"rms_test_client"})
const worker = new Pool({user:"rms_test_worker"})
after(async()=>{await Promise.all([pool.end(),worker.end()])})
const school = "00000000-0000-4000-8000-" + String(40).padStart(12,"0")
const other = "00000000-0000-4000-8000-" + String(38).padStart(12,"0")
const code = "PROGRESS_REPORT_DUE_SOON"
const as = (who, work, tenant=school) => withTenant(pool,tenant,async db=>
  work(db,await resolveAccount(db,{subject:"tmpl-"+who,email:"tmpl-"+who+"@example.invalid"})))

test("B04 templates freeze each channel, validate its variables and recheck source access",async()=>{
  const {readTemplate,saveTemplate,previewTemplate} = await import("../../dist/modules/notification/templates.js")
  const unit=randomUUID(),project=randomUUID()
  const title="Nước {{dueDate}}"
  const recipient=await as("reader",async(db,a)=>{
    await db.query("UPDATE rms.account SET user_type='author' WHERE id=$1",[a.id])
    await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Khoa A')",[unit])
    await db.query("INSERT INTO rms.research_project(tenant_id,id,unit_id,owner_id,title) VALUES(rms.current_tenant(),$1,$2,$3,$4)",[project,unit,a.id,title])
    return a.id
  })
  for(const t of [school,other])await as("admin",async(db,a)=>db.query("UPDATE rms.account SET user_type='admin' WHERE id=$1",[a.id]),t)
  await as("staff",async(db,a)=>db.query("UPDATE rms.account SET user_type='staff',unit_id=$2 WHERE id=$1",[a.id,unit]))
  const get=(who,channel,t=school)=>as(who,(db,a)=>readTemplate(db,a,code,channel),t)
  const save=(who,channel,input)=>as(who,(db,a)=>saveTemplate(db,a,code,channel,input))
  const inbox={revision:0,title:"Kỳ {{period}}",body:"{{projectName}} đến hạn {{dueDate}}"}
  const mail={title:"Nhắc {{projectName}}",body:"Email kỳ {{period}} · {{dueDate}}"}
  const original=await get("staff","in_app")
  await assert.rejects(get("reader","smtp"),e=>e.getStatus()===403)
  await assert.rejects(save("staff","in_app",inbox),e=>e.getStatus()===403)
  await assert.rejects(save("admin","in_app",{...inbox,body:"{{recipientEmail}}"}),e=>e.getStatus()===400)
  const preview=await as("admin",(db,a)=>previewTemplate(db,a,code,"in_app",inbox))
  assert.ok(preview.body.includes("15/12/2026"))
  const first=await save("admin","in_app",inbox)
  await assert.rejects(save("admin","in_app",inbox),e=>e.getStatus()===409)
  const second=await save("admin","smtp",{...mail,revision:first.revision})
  assert.deepEqual(await get("admin","in_app",other),original)
  const emit=()=>as("admin",async(db,a)=>{
    const audit=await appendAudit(db,a,"project",project,"TEST_TEMPLATE")
    await notifyRecipients(db,code,project,audit,[recipient],{period:3,dueDate:"2026-12-11"})
    return (await db.query("SELECT id FROM rms.outbox WHERE audit_id=$1",[audit])).rows[0].id
  })
  const id=await emit()
  const removed=await save("admin","in_app",{revision:second.revision,title:null,body:null})
  await save("admin","smtp",{...mail,revision:removed.revision,body:"Thư mới"})
  const missing=await emit()
  const sent=new Map()
  async function drain(){while(await deliverNext(worker,async message=>sent.set(message.eventId,message),school)){}}
  await drain()
  assert.equal(sent.get(id).subject,"Nhắc "+title)
  assert.equal(sent.get(id).text,"Email kỳ 3 · 11/12/2026")
  assert.equal(sent.get(missing).text,"Thư mới")
  const open=event=>as("reader",async(db,a)=>{
    const result=await db.query("SELECT id FROM rms.notice WHERE event_id=$1 AND recipient_id=$2",[event,a.id])
    return readNotice(db,a,result.rows[0].id)
  })
  assert.equal((await open(id)).body,title+" đến hạn 11/12/2026")
  assert.equal((await open(missing)).body,"Có cập nhật mới. Đăng nhập RMS để xem thông báo trong phạm vi của bạn.")
  await as("admin",async(db,a)=>{
    const logPage=await listDeliveries(db,a,{})
    assert.equal(logPage.items.filter(entry=>entry.templateMissing).length,1)
    assert.equal(logPage.items.find(entry=>entry.templateMissing).channel,"in_app")
    const rows=await db.query("SELECT channel,template_missing FROM rms.delivery WHERE event_id=$1 ORDER BY channel",[missing])
    assert.deepEqual(rows.rows,[{channel:"in_app",template_missing:true},{channel:"smtp",template_missing:false}])
    const log=await db.query("SELECT details FROM rms.audit_log WHERE action='NOTICE_TEMPLATE_CHANGED' AND details->>'channel'='in_app' ORDER BY occurred_at")
    assert.equal(log.rows.at(-1).details.before.body,inbox.body)
    assert.equal(log.rows.at(-1).details.after.body,null)
  })
  await as("admin",async(db,a)=>{
    await saveTemplate(db,a,"ACCEPTANCE_RESULT","in_app",{revision:0,title:"Nghiệm thu {{result}}",body:"{{projectName}} · {{result}}"})
    for(const semantic of ["PASSED","FAILED"]){
      const audit=await appendAudit(db,a,"project",project,"TEST_CONCLUSION")
      await notifyRecipients(db,"PROJECT."+semantic,project,audit,[recipient])
      const {rows:[copy]}=await db.query(`SELECT copy.title,copy.body FROM rms.outbox o JOIN rms.delivery d ON (o.tenant_id,o.id)=(d.tenant_id,d.event_id)
        CROSS JOIN LATERAL rms.delivery_copy(d.id) copy WHERE o.audit_id=$1 AND d.channel='in_app'`,[audit])
      const label=semantic==="PASSED"?"Đạt":"Không đạt"
      assert.deepEqual(copy,{title:"Nghiệm thu "+label,body:title+" · "+label})
    }
  })
  const late=await emit()
  await as("reader",async(db,a)=>db.query("UPDATE rms.account SET user_type='user' WHERE id=$1",[a.id]))
  await drain()
  assert.ok(!sent.get(late).subject.includes(title))
  assert.ok(!(await open(id)).body.includes(title))
  const list=await as("reader",(db,a)=>listInbox(db,a,{}))
  assert.ok(!list.items.some(row=>row.title==="Kỳ 3"))
})
