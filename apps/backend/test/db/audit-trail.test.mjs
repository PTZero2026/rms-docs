import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { test,after } from "node:test"
import { Pool } from "pg"
import { withTenant } from "../../dist/db/tenant-transaction.js"
import { resolveAccount } from "../../dist/modules/iam/account.js"
import { appendAudit } from "../../dist/modules/audit/append.js"
import { projectTrail } from "../../dist/modules/audit/audit-trail/service.js"

const pool=new Pool({user:"rms_test_client",max:4}), tenant=n=>"00000000-0000-4000-8000-"+String(n).padStart(12,"0")
after(()=>pool.end())
test("a transferred staff member loses the old history; authorized reader sees original actor and unit",async()=>{
  const id=randomUUID(),first=randomUUID(),second=randomUUID()
  const u={subject:"audit-u",email:"audit-u@example.invalid"},v={subject:"audit-v",email:"audit-v@example.invalid"}
  const run=(n,work)=>withTenant(pool,tenant(n),work)
  await run(4,async db=>{
    await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Khoa A'),(rms.current_tenant(),$2,'Khoa B')",[first,second])
    for(const identity of [u,v]){
      const actor=await resolveAccount(db,identity)
      await db.query("UPDATE rms.account SET user_type='staff',unit_id=$2 WHERE id=$1",[actor.id,first])
    }
    await db.query("INSERT INTO rms.research_project(tenant_id,id,unit_id,title) VALUES(rms.current_tenant(),$1,$2,'Đối chiếu RV-04')",[id,first])
    await appendAudit(db,await resolveAccount(db,u),"project",id,"WORKFLOW_TRANSITION",{from:"in_review",to:"approved"})
  })
  await assert.rejects(run(4,async db=>{await appendAudit(db,await resolveAccount(db,u),"project",id,"ROLLED_BACK");throw Error("rollback")}),/rollback/)
  const read=(n,identity,query={})=>run(n,async db=>projectTrail(db,await resolveAccount(db,identity),id,query))
  assert.equal((await read(4,u)).total,1)
  await run(4,db=>db.query("UPDATE rms.account SET unit_id=$2 WHERE subject=$1",[u.subject,second]))
  await assert.rejects(read(4,u),e=>e.getStatus()===404)
  await assert.rejects(read(3,v),e=>e.getStatus()===404)
  const visible=await read(4,v)
  assert.equal(visible.items.length,1)
  assert.deepEqual([visible.items[0].actorLabel,visible.items[0].unitLabel,visible.items[0].before,visible.items[0].after],[u.email,"Khoa A","in_review","approved"])
  assert.equal((await read(4,v,{from:"2100-01-01T00:00:00Z"})).total,0)
  await assert.rejects(run(4,db=>db.query("UPDATE rms.audit_log SET action='EDIT' WHERE target_id=$1",[id])),{code:"42501"})
})
