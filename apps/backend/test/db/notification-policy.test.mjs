import assert from "node:assert/strict"
import {after,test} from "node:test"
import {randomUUID} from "node:crypto"
import {Pool} from "pg"
import {withTenant} from "../../dist/db/tenant-transaction.js"
import {resolveAccount} from "../../dist/modules/iam/account.js"
import {appendAudit} from "../../dist/modules/audit/append.js"
import {notifyRecipients} from "../../dist/modules/notification/emit.js"
import {preferences,savePreference,saveRule} from "../../dist/modules/notification/policy.js"

const pool=new Pool({user:"rms_test_client"}),tenant="00000000-0000-4000-8000-000000000035"
after(()=>pool.end())
const run=(who,fn)=>withTenant(pool,tenant,async db=>fn(db,await resolveAccount(db,{subject:who,email:who+"@example.invalid"})))
test("B04 snapshots the tenant rule and mandatory email policy before creating deliveries",async()=>{
  const owner=await run("policy-user",async(db,a)=>a.id)
  await run("policy-admin",(db,a)=>db.query("UPDATE rms.account SET user_type='admin' WHERE id=$1",[a.id]))
  const notify=key=>run("policy-admin",async(db,a)=>{
    const id=randomUUID(),audit=await appendAudit(db,a,"project",id,"TEST_EVENT")
    await notifyRecipients(db,key,id,audit,[owner])
    return (await db.query("SELECT d.channel,d.display_title,d.template_missing FROM rms.delivery d JOIN rms.outbox o ON (d.tenant_id,d.event_id)=(o.tenant_id,o.id) WHERE o.target_id=$1 ORDER BY d.channel",[id])).rows
  })
  await run("policy-user",(db,a)=>savePreference(db,a,{code:"PROGRESS_REPORT_DUE_SOON",email:false}))
  assert.deepEqual((await notify("PROGRESS_REPORT_DUE_SOON")).map(r=>r.channel),["in_app"])
  await assert.rejects(run("policy-user",(db,a)=>savePreference(db,a,{code:"PROGRESS_REPORT_OVERDUE",email:false})),e=>e.getStatus()===400)
  const rule={code:"PROGRESS_REPORT_OVERDUE",email:false,title:"Nhắc kỳ quá hạn",mailSubject:"Thông báo quá hạn",revision:0}
  await assert.rejects(run("policy-user",(db,a)=>saveRule(db,a,rule)),e=>e.getStatus()===403)
  await run("policy-admin",(db,a)=>saveRule(db,a,rule))
  const {rows:[audit]}=await run("policy-admin",db=>db.query("SELECT details FROM rms.audit_log WHERE action='NOTIFICATION_POLICY_CHANGED' AND details->>'code'=$1 ORDER BY occurred_at DESC LIMIT 1",[rule.code]))
  assert.deepEqual(audit.details.before,{email:true,title:"Báo cáo tiến độ đã quá hạn",mailSubject:"Báo cáo tiến độ đã quá hạn"})
  assert.deepEqual(audit.details.after,{email:false,title:rule.title,mailSubject:rule.mailSubject})
  const deliveries=await notify("PROGRESS_REPORT_OVERDUE")
  assert.deepEqual(deliveries,[{channel:"in_app",display_title:rule.title,template_missing:false}])
  const overview=await run("policy-user",(db,a)=>preferences(db,a))
  assert.equal(overview.find(r=>r.code===rule.code).mandatory,true)
  assert.equal((await notify("PROJECT.APPROVED")).length,2)
  const fallback=await notify("UNCONFIGURED_EVENT")
  assert.ok(fallback.every(r=>r.template_missing&&r.display_title==="Cập nhật hồ sơ nghiên cứu"))
})
