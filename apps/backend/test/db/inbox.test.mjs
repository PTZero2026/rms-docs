import test,{after} from "node:test"
import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { Pool } from "pg"
import { withTenant } from "../../dist/db/tenant-transaction.js"
import { resolveAccount } from "../../dist/modules/iam/account.js"
import { appendAudit } from "../../dist/modules/audit/append.js"
import { deliverNext } from "../../dist/modules/notification/worker.js"
import { listInbox,readNotice,readAll } from "../../dist/modules/notification/inbox.js"
import { dashboard } from "../../dist/modules/home/overview.js"

const pool=new Pool({user:"rms_test_client"}),worker=new Pool({user:"rms_test_worker"})
after(()=>Promise.all([pool.end(),worker.end()]))
const tenant="00000000-0000-4000-8000-000000000024"
const as=(who,f,t=tenant)=>withTenant(pool,t,async db=>f(db,await resolveAccount(db,{subject:who,email:who+"@example.invalid"})))
test("read state is private and idempotent even when the underlying project is unavailable",async()=>{
  for(const who of ["mai","mai","lan"])await as(who,async(db,a)=>{
    const target=randomUUID(),audit=await appendAudit(db,a,"project",target,"TEST_NOTIFICATION")
    await db.query("INSERT INTO rms.outbox VALUES(rms.current_tenant(),$1,$2,'PROGRESS_REPORT_DUE_SOON',ARRAY['notify'],$3,$4)",[randomUUID(),target,audit,{ownerId:a.id}])
  })
  while(await deliverNext(worker,async()=>{},tenant)){}
  const list=()=>as("mai",(db,a)=>listInbox(db,a,{filter:"unread"}))
  const page=await list()
  assert.equal(page.unread,2);assert.equal(page.items.length,2)
  const id=page.items[0].id
  for(const [who,t] of [["lan",tenant],["mai",tenant.slice(0,-1)+"3"]])
    await assert.rejects(as(who,(db,a)=>readNotice(db,a,id),t),e=>e.getStatus()===404)
  const open=()=>as("mai",(db,a)=>readNotice(db,a,id))
  const first=await open()
  assert.equal(first.targetId,null);assert.ok(first.readAt);assert.equal((await open()).readAt,first.readAt)
  assert.equal((await list()).unread,1)
  await as("mai",readAll);assert.equal((await list()).items.length,0)
  assert.equal((await as("lan",(db,a)=>listInbox(db,a,{}))).unread,1)
})

test("B06 returns the five newest personal B04 notices and leaves the inbox unread",async()=>{
  const own=[]
  for(const who of [...Array(7).fill("home-reader"),"another-reader"]){
    const event=randomUUID(),target=randomUUID()
    await as(who,async(db,actor)=>{
      const audit=await appendAudit(db,actor,"project",target,"TEST_NOTIFICATION")
      await db.query("INSERT INTO rms.outbox VALUES(rms.current_tenant(),$1,$2,'CALL_OPENED',ARRAY['notify'],$3,$4)",[event,target,audit,{ownerId:actor.id}])
    })
    while(await deliverNext(worker,async()=>{},tenant)){}
    const notice=await as(who,async(db,actor)=>(await db.query("SELECT id FROM rms.notice WHERE event_id=$1 AND recipient_id=$2",[event,actor.id])).rows[0])
    assert.ok(notice)
    if(who==="home-reader")own.push(notice.id)
  }
  const summary=await as("home-reader",(db,actor)=>dashboard(db,actor,["activity"],[]))
  assert.deepEqual(summary.notices.map(n=>n.id),own.slice(2).reverse())
  assert.equal((await as("home-reader",(db,actor)=>listInbox(db,actor,{filter:"unread"}))).unread,7)
  assert.equal((await as("another-reader",(db,actor)=>dashboard(db,actor,["activity"],[]))).notices.length,1)
})
