import assert from "node:assert/strict"
import { after, test } from "node:test"
import { Pool } from "pg"
import { withTenant } from "../../dist/db/tenant-transaction.js"
import { resolveAccount } from "../../dist/modules/iam/account.js"

const pool = new Pool({ user: "rms_test_client", max: 4 })
after(() => pool.end())
const a = "00000000-0000-4000-8000-" + "3".padStart(12,"0")
const b = "00000000-0000-4000-8000-" + "4".padStart(12,"0")
const identity = { subject: "fixture-u", email:"Scientist@example.invalid" }
test("concurrent first login, realm boundary, email collision and immediate account lock", async () => {
  const sync = (tenant, subject = identity) => withTenant(pool, tenant, db => resolveAccount(db, subject))
  const first = await Promise.all([sync(a),sync(a)])
  assert.deepEqual(first.map(r => r.isNew).sort(), [false,true])
  assert.equal(first[0].id,first[1].id)
  assert.equal(first[0].userType,"user")
  assert.deepEqual(first[0].permissions, ["meetings.view"])
  assert.equal(first[0].email,"scientist@example.invalid")
  assert.notEqual((await sync(b)).id,first[0].id)
  await assert.rejects(sync(a,{subject:"other",email:"SCIENTIST@EXAMPLE.INVALID"}), error => error.getStatus() === 409)
  await withTenant(pool, a, async db => {
    const log = await db.query("select action from rms.audit_log where target_id=$1",[first[0].id])
    assert.deepEqual(log.rows,[{action:"ACCOUNT_PROVISIONED"}])
    await db.query("update rms.account set is_active=false where id=$1",[first[0].id])
  })
  await assert.rejects(sync(a),error => error.getStatus()===403)
  assert.equal((await sync(b)).isNew,false)
})

test("onboarding grants the first admin once using a separate provisioning role", async () => {
  const login = { subject:"first-admin",email:"admin@example.invalid" }
  const id = (await withTenant(pool,a,db=>resolveAccount(db,login))).id
  const admin = new Pool({max:1})
  try {
    const promote = subject => withTenant(admin,a,async db => {
      await db.query("SET LOCAL ROLE rms_migrate")
      return (await db.query("SELECT rms.bootstrap_admin('school-3',$1) AS id",[subject])).rows[0].id
    })
    assert.equal(await promote(login.subject),id)
    assert.equal(await promote(login.subject),id)
    const other = { subject:"next-admin",email:"next@example.invalid" }
    await withTenant(pool,a,db=>resolveAccount(db,other))
    await assert.rejects(promote(other.subject),{code:"23514"})
    await assert.rejects(withTenant(pool,a,db=>db.query("SELECT rms.bootstrap_admin('school-3',$1)",[other.subject])), {code:"42501"})
    await withTenant(pool,a,async db=>{
      assert.equal((await resolveAccount(db,login)).permissions.length,17)
      const r = await db.query("select count(*)::int as n from rms.audit_log where action='ADMIN_BOOTSTRAPPED'")
      assert.equal(r.rows[0].n,1)
    })
  } finally { await admin.end() }
})
