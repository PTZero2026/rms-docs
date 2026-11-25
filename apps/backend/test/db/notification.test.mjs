import test, { after } from "node:test"
import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { Pool } from "pg"
import { withTenant } from "../../dist/db/tenant-transaction.js"
import { resolveAccount } from "../../dist/modules/iam/account.js"
import { appendAudit } from "../../dist/modules/audit/append.js"
import { deliverNext } from "../../dist/modules/notification/worker.js"

const app=new Pool({user:"rms_test_client"}),worker=new Pool({user:"rms_test_worker"})
after(()=>Promise.all([app.end(),worker.end()]))
const tenant="00000000-0000-4000-8000-"+"8".padStart(12,"0")
test("committed event survives worker restart, one delivery per channel, uncertain SMTP waits for review",async()=>{
  const eventId=randomUUID()
  await withTenant(app,tenant,async db=>{
    const actor=await resolveAccount(db,{subject:"recipient",email:"notice@example.invalid"})
    const project=randomUUID()
    const audit=await appendAudit(db,actor,"project",project,"WORKFLOW_TRANSITION")
    await db.query(`insert into rms.outbox(tenant_id,id,target_id,event_type,effects,audit_id,payload)
      values(rms.current_tenant(),$1,$2,'PROJECT.SUBMITTED',ARRAY['notify'],$3,$4)`,[eventId,project,audit,{ownerId:actor.id}])
  })
  let sends=0
  const smtp=async()=>{sends++;throw Error("uncertain result")}
  for(let i=0;i<10;i++) if(!await deliverNext(worker,smtp,tenant)) break
  assert.equal(sends,1)
  await withTenant(app,tenant,async db=>{
    assert.equal((await db.query("select count(*)::int n from rms.notice where event_id=$1",[eventId])).rows[0].n,1)
    const r=await db.query("select channel,status,attempts from rms.delivery where event_id=$1 order by channel",[eventId])
    assert.deepEqual(r.rows,[{channel:"in_app",status:"sent",attempts:1},{channel:"smtp",status:"reconcile",attempts:1}])
  })
  const ops=new Pool({user:"rms_test_dispatch_ops"})
  try {
    const {rows:[failure]}=await ops.query("SELECT * FROM rms.delivery_failures($1)",[tenant])
    assert.deepEqual([failure.event_id,failure.status,failure.error_code],[eventId,"reconcile","smtp_unknown"])
    await assert.rejects(withTenant(app,tenant,db=>db.query("SELECT rms.review_delivery($1,$2,'confirmed-not-delivered','test')",[tenant,failure.id])),{code:"42501"})
    await ops.query("SELECT rms.review_delivery($1,$2,'confirmed-not-delivered','Local inbox has no message for this ID')",[tenant,failure.id])
    const resumed=await withTenant(app,tenant,db=>db.query("SELECT retry_revision,attempts,status FROM rms.delivery WHERE id=$1",[failure.id]))
    assert.deepEqual(resumed.rows,[{retry_revision:1,attempts:0,status:"ready"}])
    const received=[]
    await deliverNext(worker,async mail=>{received.push(mail)},tenant)
    assert.deepEqual(received,[{to:"notice@example.invalid",messageId:"<"+failure.id+"@rms.invalid>",eventId,subject:"Đã nộp đề xuất",text:"Có cập nhật mới. Đăng nhập RMS để xem thông báo trong phạm vi của bạn."}])
    assert.equal(await deliverNext(worker,async()=>assert.fail("unexpected duplicate"),tenant),false)
  } finally {await ops.end()}
  await assert.rejects(withTenant(worker,tenant,db=>db.query("select * from rms.research_project")),{code:"42501"})
})

test("B04 retries failed SMTP deliveries in the current project scope with one audit per accepted row",async()=>{
  const {listDeliveries,resendDeliveries}=await import("../../dist/modules/notification/deliveries.js")
  const school="00000000-0000-4000-8000-"+"37".padStart(12,"0"),unit=randomUUID(),other=randomUUID()
  const run=(who,fn)=>withTenant(app,school,async db=>fn(db,await resolveAccount(db,{subject:who,email:who+"@example.invalid"})))
  const ids=await run("b04-staff",async(db,a)=>{
    await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Khoa A'),(rms.current_tenant(),$2,'Khoa B')",[unit,other])
    await db.query("UPDATE rms.account SET user_type='staff',unit_id=$2 WHERE id=$1",[a.id,unit])
    const recipient=await resolveAccount(db,{subject:"b04-author",email:"b04-author@example.invalid"})
    const sources=[]
    for(const u of [unit,unit,other,unit]){
      const project=randomUUID(),event=randomUUID()
      await db.query("INSERT INTO rms.research_project(tenant_id,id,unit_id,title) VALUES(rms.current_tenant(),$1,$2,'Đề tài thử')",[project,u])
      const audit=await appendAudit(db,a,"project",project,"TEST_EVENT")
      await db.query("INSERT INTO rms.outbox(tenant_id,id,target_id,event_type,effects,audit_id,payload) VALUES(rms.current_tenant(),$1,$2,'PROJECT.SUBMITTED',ARRAY['notify'],$3,$4)",[event,project,audit,{ownerId:recipient.id}])
      const {rows:[delivery]}=await db.query("SELECT id FROM rms.delivery WHERE event_id=$1 AND channel='smtp'",[event])
      sources.push(delivery.id)
    }
    return sources
  })
  await withTenant(worker,school,db=>db.query("UPDATE rms.delivery SET status=CASE WHEN id=$1 THEN 'reconcile' ELSE 'failed' END,last_error=CASE WHEN id=$1 THEN 'smtp_unknown' ELSE 'smtp_rejected' END,attempts=5 WHERE id=ANY($2::uuid[])",[ids[3],ids]))
  const search=who=>run(who,(db,a)=>listDeliveries(db,a,{filter:"failed"}))
  assert.deepEqual((await search("b04-staff")).items.map(x=>x.id).sort(),ids.slice(0,2).sort())
  await assert.rejects(search("b04-author"),e=>e.getStatus?.()===403)
  const retry=(items,who="b04-staff")=>run(who,(db,a)=>resendDeliveries(db,a,{items:items.map(id=>({id,revision:0}))}))
  for(const invalid of [ids[2],ids[3]])await assert.rejects(retry([ids[0],invalid]),e=>[404,409].includes(e.getStatus?.()))
  assert.equal((await search("b04-staff")).total,2)
  const raced=await Promise.allSettled([retry(ids.slice(0,2)),retry(ids.slice(0,2))])
  assert.equal(raced.filter(x=>x.status==="fulfilled").length,1)
  const fresh=await run("b04-staff",db=>db.query("SELECT status,attempts,retry_revision,last_error FROM rms.delivery WHERE id=ANY($1::uuid[])",[ids.slice(0,2)]))
  assert.deepEqual(fresh.rows,Array(2).fill({status:"ready",attempts:0,retry_revision:1,last_error:null}))
  const audit=await run("b04-staff",db=>db.query("SELECT details FROM rms.audit_log WHERE action='NOTIFICATION_RESENT' AND target_id=ANY($1::uuid[])",[ids]))
  assert.equal(audit.rowCount,2);assert.ok(audit.rows.every(row=>row.details.attempts===5))
  const delivered=[]
  while(await deliverNext(worker,async mail=>{delivered.push(mail.messageId)},school)){}
  assert.deepEqual(delivered.sort(),ids.slice(0,2).map(id=>"<"+id+"@rms.invalid>").sort())
})

test("B04 keeps SMTP untouched while B01 is unavailable and stops after the school's configured attempts",async()=>{
  const school="00000000-0000-4000-8000-"+"38".padStart(12,"0")
  const id=await withTenant(app,school,async db=>{
    const a=await resolveAccount(db,{subject:"retry-policy",email:"retry-policy@example.invalid"})
    const event=randomUUID(),target=randomUUID(),audit=await appendAudit(db,a,"project",target,"TEST_MAIL")
    await db.query("INSERT INTO rms.outbox(tenant_id,id,target_id,event_type,effects,audit_id,payload) VALUES(rms.current_tenant(),$1,$2,'PROJECT.SUBMITTED',ARRAY['notify'],$3,$4)",[event,target,audit,{ownerId:a.id}])
    return (await db.query("SELECT id FROM rms.delivery WHERE event_id=$1 AND channel='smtp'",[event])).rows[0].id
  })
  const state=()=>withTenant(app,school,db=>db.query("SELECT status,attempts,last_error,extract(epoch FROM available_at-now())::int AS wait FROM rms.delivery WHERE id=$1",[id]).then(r=>r.rows[0]))
  const due=()=>withTenant(worker,school,db=>db.query("UPDATE rms.delivery SET available_at=now()-interval '1 minute' WHERE id=$1",[id]))
  let attempts=0
  const reject=async()=>{attempts++;throw Object.assign(Error("fixture response"),{responseCode:451})}
  while(await deliverNext(worker,reject,school,async()=>{throw Error("B01 fixture unavailable")})){}
  const delayed=await state()
  assert.equal(attempts,0);assert.equal(delayed.status,"ready");assert.equal(delayed.attempts,0)
  assert.equal(delayed.last_error,"retry_policy_unavailable")
  const policy=async tenantId=>{assert.equal(tenantId,school);return {maxAttempts:2,baseSeconds:7}}
  await due();await deliverNext(worker,reject,school,policy)
  const pending=await state()
  assert.equal(pending.status,"ready");assert.equal(pending.attempts,1);assert.ok(pending.wait>=5&&pending.wait<=7)
  await due();await deliverNext(worker,reject,school,policy)
  const final=await state()
  assert.equal(final.status,"failed");assert.equal(final.attempts,2);assert.equal(final.last_error,"smtp_rejected")
})
