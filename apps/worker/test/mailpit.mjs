import assert from "node:assert/strict"
import {createServer} from "node:http"
import {randomUUID} from "node:crypto"
import { execFile } from "node:child_process"
import { promisify } from "node:util"
import { Pool } from "pg"

import {withTenant} from "../../backend/dist/db/tenant-transaction.js"
import {resolveAccount} from "../../backend/dist/modules/iam/account.js"
import {appendAudit} from "../../backend/dist/modules/audit/append.js"
import {notifyRecipients} from "../../backend/dist/modules/notification/emit.js"
import {saveTemplate} from "../../backend/dist/modules/notification/templates.js"

const socket=process.env.PGHOST
if (!socket?.startsWith("/tmp/rms-pg.") || process.env.PGDATABASE!=="rms_test") throw Error("Requires disposable PostgreSQL fixture")
const db=new Pool()
const app=new Pool({user:"rms_test_client"})
const once=(extra={})=>promisify(execFile)(process.execPath,[new URL("../src/main.mjs",import.meta.url).pathname,"--once"],{
  env:{...process.env,WORKER_DATABASE_URL:"postgresql://rms_test_worker@localhost/rms_test?host="+socket,
    SMTP_HOST:"127.0.0.1",SMTP_PORT:"1026",SMTP_FROM:"rms@example.invalid",RMS_SMS_GATEWAY_URL:"",RMS_SMS_GATEWAY_TOKEN:"",...extra},
})
async function verifyMessage(event,subject,body) {
  // Other suites enqueue real workflow events in this same disposable cluster.
  // Process the initial ready backlog until this event reaches both destinations.
  const {rows:[{limit}]}=await db.query("SELECT count(*)::int+1 AS limit FROM rms.delivery WHERE status IN ('ready','leased')")
  for(let i=0;i<limit;i++){
    const pending=await db.query("SELECT 1 FROM rms.delivery WHERE event_id=$1 AND status<>'sent' LIMIT 1",[event.event_id])
    if(!pending.rowCount)break
    await once()
  }
  const deliveries=await db.query("select status,attempts from rms.delivery where event_id=$1",[event.event_id])
  assert.deepEqual(deliveries.rows,[{status:"sent",attempts:1},{status:"sent",attempts:1}])
  assert.equal((await db.query("select count(*)::int n from rms.notice where event_id=$1",[event.event_id])).rows[0].n,1)
  const search=new URL("http://127.0.0.1:8026/api/v1/search")
  search.searchParams.set("query","message-id:"+event.id+"@rms.invalid")
  const res=await fetch(search)
  assert.equal(res.status,200)
  const list=await res.json()
  assert.equal(list.messages.length,1)
  const message=await (await fetch("http://127.0.0.1:8026/api/v1/message/"+list.messages[0].ID)).json()
  assert.equal(message.To[0].Address,"workflow@example.invalid")
  assert.equal(message.Subject,subject)
  assert.equal(message.Text.trim(),body)
}
async function verifySms(tenant,project) {
  const phone="+12025550124", token=randomUUID()
  const id=await withTenant(app,tenant,async tx=>{
    const actor=await resolveAccount(tx,{subject:"workflow-admin",email:"workflow@example.invalid"})
    await tx.query("UPDATE rms.account SET phone=$1 WHERE id=$2",[phone,actor.id])
    const audit=await appendAudit(tx,actor,"project",project,"TEST_SMS_CLI")
    await notifyRecipients(tx,"PROJECT_ASSIGNED",project,audit,[actor.id])
    return (await tx.query("SELECT d.id FROM rms.delivery d JOIN rms.outbox o ON (o.tenant_id,o.id)=(d.tenant_id,d.event_id) WHERE o.audit_id=$1 AND d.channel='sms'",[audit])).rows[0].id
  })
  const requests=[]
  const server=createServer(async(req,res)=>{
    let raw=""
    for await (const chunk of req)raw+=chunk
    requests.push({auth:req.headers.authorization,key:req.headers["idempotency-key"],data:JSON.parse(raw)})
    res.writeHead(202).end()
  })
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve))
  try{
    // Select this fixture before other schools' ready work in this disposable cluster.
    await db.query("UPDATE rms.delivery SET available_at='-infinity' WHERE id=$1",[id])
    await once({RMS_SMS_GATEWAY_URL:"http://127.0.0.1:"+server.address().port+"/send",RMS_SMS_GATEWAY_TOKEN:token})
    assert.deepEqual(requests,[{auth:"Bearer "+token,key:id,data:{to:phone,text:"Đề tài đã được giao thực hiện. Đăng nhập RMS để xem thông báo."}}])
    assert.deepEqual((await db.query("SELECT status,attempts FROM rms.delivery WHERE id=$1",[id])).rows,[{status:"sent",attempts:1}])
  }finally{await new Promise(resolve=>server.close(resolve))}
}
try {
  const {rows:[event]}=await db.query(`select d.tenant_id,o.target_id,d.event_id,d.id,d.display_title,o.audit_id from rms.delivery d join rms.outbox o on (o.tenant_id,o.id)=(d.tenant_id,d.event_id)
    join rms.tenant t on t.id=d.tenant_id where t.slug='school-5' and d.channel='smtp' and d.status='ready' limit 1`)
  assert.ok(event?.audit_id)
  await verifyMessage(event,event.display_title??"Thông báo RMS","Có cập nhật mới. Đăng nhập RMS để xem thông báo trong phạm vi của bạn.")
  const custom=await withTenant(app,event.tenant_id,async tx=>{
    const actor=await resolveAccount(tx,{subject:"workflow-admin",email:"workflow@example.invalid"})
    await saveTemplate(tx,actor,"PROGRESS_REPORT_OVERDUE","smtp",{revision:0,title:"Đến hạn · {{projectName}}",
      body:"Kỳ {{period}} phải nộp trước {{dueDate}}."})
    const audit=await appendAudit(tx,actor,"project",event.target_id,"TEST_TEMPLATE")
    await notifyRecipients(tx,"PROGRESS_REPORT_OVERDUE",event.target_id,audit,[actor.id],{period:3,dueDate:"2026-12-11"})
    return (await tx.query(`SELECT d.id,d.event_id,p.title FROM rms.outbox o JOIN rms.delivery d ON (d.tenant_id,d.event_id)=(o.tenant_id,o.id)
      JOIN rms.research_project p ON (p.tenant_id,p.id)=(o.tenant_id,o.target_id) WHERE o.audit_id=$1 AND d.channel='smtp'`,[audit])).rows[0]
  })
  await verifyMessage(custom,"Đến hạn · "+custom.title,"Kỳ 3 phải nộp trước 11/12/2026.")
  await verifySms(event.tenant_id,event.target_id)
  console.log("Worker CLI → PostgreSQL → SMS loopback: one accepted request with the correct destination, content and delivery ID.")
  console.log("Worker CLI → PostgreSQL → Mailpit: default and custom channel templates matched subject, body and recipient.")
} finally {await Promise.all([app.end(),db.end()])}
