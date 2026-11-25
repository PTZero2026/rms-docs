import assert from "node:assert/strict"
import { test,after } from "node:test"
import { Pool } from "pg"
import { withTenant } from "../../dist/db/tenant-transaction.js"
import { resolveAccount } from "../../dist/modules/iam/account.js"
import { manageAccount,managementLock } from "../../dist/modules/iam/lock-account/service.js"

const pool=new Pool({user:"rms_test_client",max:4})
const tenant="00000000-0000-4000-8000-"+"9".padStart(12,"0")
const run=f=>withTenant(pool,tenant,f)
after(()=>pool.end())
test("two admins cannot lock each other concurrently, replay emits one audit",async()=>{
  const users=["first","second"].map(k=>({subject:"lock-"+k,email:"lock-"+k+"@example.invalid"}))
  const ids=await run(async db=>{
    const rows=[]
    for(const u of users){const acc=await resolveAccount(db,u);rows.push(acc.id);await db.query("UPDATE rms.account SET user_type='admin' WHERE id=$1",[acc.id])}
    return rows
  })
  const change=(idx,target,op)=>run(async db=>{await managementLock(db);const actor=await resolveAccount(db,users[idx]);return manageAccount(db,actor,ids[target],op)})
  await assert.rejects(change(0,0,"lock"),e=>e.getStatus()===400)
  const duo=await Promise.allSettled([change(0,1,"lock"),change(1,0,"lock")])
  const winner=duo.findIndex(r=>r.status==="fulfilled"),other=1-winner
  assert.ok(winner!==-1 && duo[other].status==="rejected" && duo[other].reason.getStatus()===403)
  const repeated=await change(winner,other,"lock")
  assert.equal(repeated.event.id,duo[winner].value.event.id)
  assert.equal(repeated.account.isActive,false)
  const on=await change(winner,other,"unlock")
  assert.equal(on.event.action,"ACCOUNT_UNLOCKED")
  assert.equal(on.account.isActive,true)
  assert.equal((await run(db=>db.query("SELECT count(*)::int AS n FROM rms.audit_log WHERE target_id=$1 AND action='ACCOUNT_LOCKED'",[ids[other]]))).rows[0].n,1)
})
