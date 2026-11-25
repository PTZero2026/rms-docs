import assert from "node:assert/strict"
import {randomUUID} from "node:crypto"
import {after,test} from "node:test"
import {Pool} from "pg"
import {withTenant} from "../../dist/db/tenant-transaction.js"
import {resolveAccount} from "../../dist/modules/iam/account.js"
import {changeCall} from "../../dist/modules/call/service.js"

const app=new Pool({user:"rms_test_client"}),worker=new Pool({user:"rms_test_worker"})
after(()=>Promise.all([app.end(),worker.end()]))
const school=n=>"00000000-0000-4000-8000-"+String(n).padStart(12,"0")
const main=school(42),other=school(43)
const lastInstant="2020-11-30T16:59:59.999Z",midnight="2020-11-30T17:00:00Z"
const close=(tenant,at)=>withTenant(worker,tenant,async db=>(await db.query("SELECT rms.close_expired_calls($1) AS n",[at])).rows[0].n)
const query=(tenant,sql,args=[])=>withTenant(app,tenant,db=>db.query(sql,args))
const create=async(tenant,status,end="2020-11-30")=>{
  const code=randomUUID()
  return (await query(tenant,`INSERT INTO rms.proposal_call(tenant_id,code,name,start_date,end_date,status)
    VALUES(rms.current_tenant(),$1,$1,'2020-11-01',$2,$3) RETURNING id`,[code,end,status])).rows[0].id
}
const state=async(tenant,id)=>(await query(tenant,"SELECT status,revision FROM rms.proposal_call WHERE id=$1",[id])).rows[0]

test("F02/TC-06 closes at Vietnamese midnight once per call and honors a concurrent extension",async()=>{
  const expiring=await create(main,"OPEN"),foreign=await create(other,"OPEN")
  const draft=await create(main,"DRAFT"),cancelled=await create(main,"CANCELLED"),today=await create(main,"OPEN","2020-12-01")
  const future=await create(main,"OPEN","2100-12-01")
  assert.equal(await close(main,lastInstant),0)
  assert.equal((await state(main,expiring)).status,"OPEN")
  await assert.rejects(withTenant(worker,main,async db=>{
    assert.equal((await db.query("SELECT rms.close_expired_calls($1) AS n",[midnight])).rows[0].n,1)
    throw Error("fixture rollback")
  }),/fixture rollback/)
  assert.deepEqual(await state(main,expiring),{status:"OPEN",revision:1})
  assert.deepEqual((await Promise.all([close(main,midnight),close(main,midnight)])).sort(),[0,1])
  assert.deepEqual(await state(main,expiring),{status:"CLOSED",revision:2})
  assert.equal((await state(other,foreign)).status,"OPEN")
  assert.equal((await state(main,draft)).status,"DRAFT")
  assert.equal((await state(main,cancelled)).status,"CANCELLED")
  assert.equal((await state(main,today)).status,"OPEN")
  const {rows:audit}=await query(main,"SELECT action,actor_service,details FROM rms.audit_log WHERE target_type='call' AND target_id=$1",[expiring])
  assert.equal(audit.length,1)
  assert.equal(audit[0].action,"CALL_CLOSED")
  assert.equal(audit[0].actor_service,"call-expiry-worker")
  assert.equal(audit[0].details.from,"OPEN")
  assert.equal(audit[0].details.to,"CLOSED")
  assert.equal(audit[0].details.end,"2020-11-30")
  await assert.rejects(query(main,"SELECT rms.close_expired_calls(now())"),{code:"42501"})
  await assert.rejects(withTenant(worker,main,db=>db.query("SELECT id FROM rms.proposal_call")),{code:"42501"})
  const operator={subject:"call-expiry-op",email:"call-expiry-op@example.invalid"}
  const asOfficer=fn=>withTenant(app,main,async db=>fn(db,await resolveAccount(db,operator)))
  await asOfficer((db,a)=>db.query("UPDATE rms.account SET user_type='staff' WHERE id=$1",[a.id]))
  await assert.rejects(asOfficer((db,a)=>changeCall(db,a,expiring,{action:"close",revision:1},new Date(midnight))),e=>e.getStatus()===409)
  const extended=await create(main,"OPEN")
  await asOfficer(async(db,a)=>{
    await changeCall(db,a,extended,{action:"extend",revision:1,endDate:"2020-12-12"},new Date(midnight))
    assert.equal(await close(main,midnight),0)
  })
  assert.equal(await close(main,midnight),0)
  assert.deepEqual(await state(main,extended),{status:"OPEN",revision:2})
  const setup=new Pool()
  try{
    await setup.query("UPDATE rms.tenant SET enabled=false WHERE id=$1",[other])
    assert.equal(await close(other,midnight),0)
    assert.equal((await state(other,foreign)).status,"OPEN")
  }finally{await setup.end()}
  await close(main,"2200-01-01T00:00:00Z")
  assert.equal((await state(main,future)).status,"OPEN")
  await query(main,`INSERT INTO rms.proposal_call(tenant_id,code,name,start_date,end_date,status)
    SELECT rms.current_tenant(),'batch-expiry-'||i,'Kỳ thử theo lô','2020-11-01','2020-11-30','OPEN'
    FROM generate_series(1,201) AS i`)
  assert.equal(await close(main,midnight),200)
  assert.equal(await close(main,midnight),1)
  assert.equal(await close(main,midnight),0)
  const {rows:[batch]}=await query(main,`SELECT count(*)::int AS audits,count(DISTINCT l.target_id)::int AS calls
    FROM rms.audit_log l JOIN rms.proposal_call c ON (c.tenant_id,c.id)=(l.tenant_id,l.target_id)
    WHERE c.code LIKE 'batch-expiry-%' AND c.revision=2 AND l.action='CALL_CLOSED'`)
  assert.deepEqual(batch,{audits:201,calls:201})
})
