import assert from "node:assert/strict"
import { after, test } from "node:test"
import { Pool } from "pg"
import { withTenant } from "../../dist/db/tenant-transaction.js"

const pool = new Pool({ max: 1, user: "rms_test_client" })
after(() => pool.end())
const uuid = n => "00000000-0000-4000-8000-" + String(n).padStart(12, "0")
const [a,b,onlyA,unit,project] = [1,2,3,4,5].map(uuid)
const visible = "select title, pg_backend_pid() as pid from rms.research_project"

test("RLS isolates a reused connection, unscoped access, writes and references", async () => {
  for (const [tenant, title] of [[a, "A"], [b, "B"]]) {
    await withTenant(pool, tenant, async db => {
      await db.query("insert into rms.unit(tenant_id,id,name) values ($1,$2,$3)", [tenant,unit,title])
      await db.query("insert into rms.research_project(tenant_id,id,unit_id,title) values ($1,$2,$3,$4)", [tenant,project,unit,title])
    })
  }
  const pid = (await pool.query("select pg_backend_pid() as pid")).rows[0].pid
  for (let i = 0; i < 100; i++) {
    for (const [tenant, title] of [[a, "A"], [b, "B"]]) {
      const rows = await withTenant(pool, tenant, async db => (await db.query(visible)).rows)
      assert.deepEqual(rows, [{ title, pid }])
    }
  }
  assert.deepEqual((await pool.query(visible)).rows, [])
  const insertUnit = "insert into rms.unit(tenant_id,id,name) values ($1,$2,'A')"
  const unscoped = await pool.connect()
  try {
    await assert.rejects(unscoped.query(insertUnit, [a, onlyA]), { code: "42501" })
  } finally {
    unscoped.release()
  }
  await assert.rejects(withTenant(pool, b, db => db.query(insertUnit, [a, onlyA])), { code: "42501" })
  await withTenant(pool, a, db => db.query(insertUnit,[a, onlyA]))
  await assert.rejects(withTenant(pool, b, db => db.query("update rms.research_project set unit_id=$1 where id=$2", [onlyA,project])), { code: "23503" })
  await assert.rejects(withTenant(pool, a, async db => {
    await db.query("update rms.research_project set title='changed'")
    throw Error("cancel")
  }), /cancel/)
  assert.deepEqual((await pool.query(visible)).rows, [])
  assert.deepEqual(await withTenant(pool, a, async db => (await db.query(visible)).rows), [{title:"A",pid}])
  assert.deepEqual((await pool.query("select rolsuper, rolbypassrls from pg_roles where rolname=current_user")).rows, [{rolsuper:false,rolbypassrls:false}])
})
