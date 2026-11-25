import assert from "node:assert/strict"
import { after,test } from "node:test"
import { randomUUID, createHash, randomBytes } from "node:crypto"
import { Pool } from "pg"
import { createClient } from "redis"
import { ConfigurationStore } from "../dist/store.js"
import { parseInput } from "../dist/content.js"

const pool=new Pool({connectionString:process.env.RMS_CONFIG_DATABASE_URL,max:4})
const owner=new Pool({database:"rms_config_test"})
const redis=process.env.RMS_REDIS_SOCKET ? createClient({socket:{path:process.env.RMS_REDIS_SOCKET}}) : undefined
if(redis) await redis.connect()
const cache=new Map()
const local={get:async k=>cache.get(k),setEx:async(k,_ttl,v)=>cache.set(k,v),del:async k=>cache.delete(k)}
const store=new ConfigurationStore(pool,redis??local)
const identity=(scope)=>({tenantId:randomUUID(),actorId:randomUUID(),scope,canWrite:true})
const a=identity("tenant"), b=identity("tenant"), shared=identity("shared")
after(async()=>{if(redis) await redis.quit(); await pool.end();await owner.end()})

test("two schools resolve scoped revisions on the first read, with atomic metadata audit",async()=>{
  const key="RV02-"+randomUUID()
  const save=async(actor,value,create)=>store.save(actor,key,await parseInput(key,{content:value},"text",create),create)
  await save(shared,"chung",true)
  assert.equal((await store.read(a,key)).cache,"MISS")
  assert.equal((await store.read(a,key)).cache,"HIT")
  assert.equal((await store.read(b,key)).bytes.toString(),"chung")
  await save(a,"riêng A",true)
  await assert.rejects(save(a,"trùng",true),e=>e.getStatus()===409)
  assert.equal((await store.read(a,key.toLowerCase())).bytes.toString(),"riêng A")
  assert.equal((await store.read(b,key)).bytes.toString(),"chung")
  await save(shared,"chung mới",false)
  assert.equal((await store.read(b,key)).bytes.toString(),"chung mới")
  assert.equal((await store.list(b,{keyword:key})).total,1)
  assert.equal((await store.list(a,{keyword:key})).total,2)
  await assert.rejects(save({...a,canWrite:false},"cấm",false),e=>e.getStatus()===403)
  await store.remove(a,key)
  const fallback=await store.read(a,key)
  assert.equal(fallback.bytes.toString(),"chung mới")
  assert.equal(fallback.cache,"MISS")
  const content=await parseInput(key,{content:"dry"},"text",true)
  const before=await owner.query("SELECT count(*) FROM catalog.audit WHERE key=$1",[key.toLowerCase()])
  await store.save(a,key,content,true,true)
  // A failing audit write must roll back the preceding INSERT.
  await assert.rejects(store.save({...a,actorId:null},key,content,true),e=>e.code==="23502")
  const after=await owner.query("SELECT count(*) FROM catalog.audit WHERE key=$1",[key.toLowerCase()])
  assert.deepEqual(after.rows,before.rows)
  assert.equal((await store.read(a,key)).meta.scope,"shared")
  await store.remove(shared,key)
  await assert.rejects(store.read(b,key),e=>e.getStatus()===404)
})

test("6 MiB binary round trip preserves checksum and bypasses the cache",async()=>{
  const key="blob-"+randomUUID(), bytes=randomBytes(6*1024*1024)
  await store.save(a,key,await parseInput(key,{content:bytes,mime_type:"application/octet-stream"},"multipart",true),true)
  const read=await store.read(a,key)
  const digest=v=>createHash("sha256").update(v).digest("hex")
  assert.equal(digest(read.bytes),digest(bytes))
  assert.equal((await store.read(a,key)).cache,"MISS")
  await assert.rejects(store.read(b,key),e=>e.getStatus()===404)
  await assert.rejects(store.read(shared,key),e=>e.getStatus()===404)
  await store.remove(a,key)
})

test("B01 can commit and read during cache errors and replaces stale bytes after cache recovery", async () => {
  const entries = new Map()
  let offline = false
  function connected() { if (offline) throw Error("Test cache unavailable") }
  const client = new ConfigurationStore(pool, {
    async get(key) { connected(); return entries.get(key) ?? null },
    async setEx(key, ttl, bytes) { connected(); assert.equal(ttl, 300); entries.set(key, bytes) },
    async del(key) { connected(); entries.delete(key) },
  })
  const key = "outage-" + randomUUID()
  const save = async (text, create) => client.save(a, key, await parseInput(key, { content:text }, "text", create), create)
  await save("v1", true)
  await client.read(a, key)
  assert.equal((await client.read(a, key)).cache, "HIT")
  offline = true
  await save("v2", false)
  const fallback = await client.read(a, key)
  assert.equal(fallback.bytes.toString(), "v2")
  assert.equal(fallback.cache, "MISS")
  offline = false
  const recovered = await client.read(a, key)
  assert.equal(recovered.bytes.toString(), "v2")
  assert.equal(recovered.cache, "MISS")
  assert.equal((await client.read(a, key)).cache, "HIT")
  assert.equal(entries.size, 1)
})

test("B01 created and modified date filters include the entire Vietnam day within tenant scope", async () => {
  const prefix = "day-" + randomUUID()
  const samples = [
    ["before", "2026-12-31T16:59:59.999999Z"],
    ["start", "2026-12-31T17:00:00Z"],
    ["end", "2027-01-01T16:59:59.999999Z"],
    ["after", "2027-01-01T17:00:00Z"],
  ]
  for (const [index, [label, created]] of samples.entries()) {
    const updated = samples[samples.length - index - 1][1].replace("2027-01-01", "2027-02-01").replace("2026-12-31", "2027-01-31")
    await owner.query(
      "INSERT INTO catalog.configuration (tenant_id,key,content,mime,encoding,created_at,updated_at) VALUES ($1,$2,$3,'text/plain','utf-8',$4,$5)",
      [a.tenantId, prefix + label, Buffer.from(label), created, updated],
    )
  }
  const values = async (scope, filters) => {
    const { items, total } = await store.list(scope, { keyword: prefix, ...filters })
    assert.equal(total, items.length)
    return items.map(row => row.key.slice(prefix.length)).sort()
  }
  for (const field of ["created", "modified"]) {
    const localDay = field === "created" ? "2027-01-01" : "2027-02-01"
    const day = { [field + "From"]: localDay, [field + "To"]: localDay }
    assert.deepEqual(await values(a, day), ["end", "start"])
    assert.deepEqual(await values(b, day), [])
    const midnight = localDay + "T00:00:00+07:00"
    const exact = { [field + "From"]: midnight, [field + "To"]: new Date(midnight).toISOString() }
    assert.deepEqual(await values(a, exact), [field === "created" ? "start" : "end"])
    await assert.rejects(values(a, { [field + "To"]: "2027-02-29" }), e => e.getStatus?.() === 400)
  }
})

test("HOME-11 preserves inherited settings and ordered audit snapshots across both editors",async()=>{
  const school=identity("tenant"),other=identity("tenant"),operator=identity("shared")
  const key="HOME.OFFICER"
  const layout=(actor)=>store.homeLayout(actor,"staff",0)
  const save=(actor,revision,widgets)=>store.saveHomeLayout(actor,"staff",{revision,widgets})
  const generic=(actor,value,create)=>store.save(actor,key,{bytes:Buffer.from(value),mime:"text/plain",encoding:"utf-8"},create)
  const original=await layout(school)
  assert.equal(original.source,"default")
  assert.deepEqual(original.widgets,["tasks","projects","activity","shortcuts"])
  await generic(operator,"activity,tasks",true)
  try {
    const inherited=await layout(school)
    assert.equal(inherited.source,"shared")
    await assert.rejects(save(school,original.revision,["tasks"]),e=>e.getStatus()===409)
    await save(school,inherited.revision,["projects","activity"])
    const first=await layout(school)
    assert.equal(first.source,"tenant")
    assert.deepEqual(first.history[0].before,["activity","tasks"])
    assert.deepEqual(first.history[0].after,["projects","activity"])
    assert.equal(first.history[0].actorId,school.actorId)
    assert.deepEqual((await layout(other)).history,[])
    await assert.rejects(layout({...school,canWrite:false}),e=>e.getStatus()===403)
    await assert.rejects(layout(operator),e=>e.getStatus()===403)
    await assert.rejects(save(operator,first.revision,["tasks"]),e=>e.getStatus()===403)
    for(const widgets of [["tasks","tasks"],["unknown"]])
      await assert.rejects(save(school,first.revision,widgets),e=>e.getStatus()===400)
    const saves=await Promise.allSettled([["shortcuts"],["teaching","activity"]].map(w=>save(school,first.revision,w)))
    assert.equal(saves.filter(r=>r.status==="fulfilled").length,1)
    assert.equal(saves.find(r=>r.status==="rejected").reason.getStatus(),409)
    const second=await layout(school)
    assert.equal(second.total,2)
    assert.deepEqual(second.history[0].before,first.widgets)
    await generic(school,"tasks,projects",false)
    const third=await layout(school)
    assert.deepEqual(third.history[0].before,second.widgets)
    assert.deepEqual(third.history[0].after,["tasks","projects"])
    assert.deepEqual(third.history[2].after,first.widgets)
    await save(school,third.revision,[])
    assert.deepEqual((await layout(school)).widgets,[])
    await store.remove(school,key)
    const deleted=await layout(school)
    assert.deepEqual(deleted.history[0].before,[])
    assert.deepEqual(deleted.history[0].after,inherited.widgets)
    assert.deepEqual(deleted.widgets,inherited.widgets)
    assert.deepEqual((await layout(other)).widgets,inherited.widgets)
    await assert.rejects(save({...school,actorId:null},deleted.revision,["activity"]),error=>error.code==="23502")
    assert.deepEqual(await layout(school),deleted)
  } finally {await store.remove(operator,key)}
})

test("HOME-11 pages tenant history and identifies records created before migration", async () => {
  const school = identity("tenant")
  const other = identity("tenant")
  const key = "home.admin"
  const historic = await owner.query(
    `INSERT INTO catalog.audit (tenant_id,actor_id,action,key,revision,occurred_at)
     VALUES ($1,$2,'UPDATE',$3,$4,'2000-01-01') RETURNING id`,
    [school.tenantId, school.actorId, key, randomUUID()],
  )
  await store.saveHomeLayout(other, "admin", { revision:null, widgets:["activity"] })
  let revision = null
  for (let i = 0; i < 11; i++) {
    const updated = await store.saveHomeLayout(school, "admin", { revision, widgets:i % 2 ? ["tasks"] : ["activity"] })
    revision = updated.revision
  }
  const first = await store.homeLayout(school, "admin", 0)
  const second = await store.homeLayout(school, "admin", 10)
  assert.equal(first.total, 12)
  assert.equal(first.history.length, 10)
  assert.equal(second.history.length, 2)
  assert.equal(new Set([...first.history, ...second.history].map(entry => entry.id)).size, 12)
  const legacy = second.history[1]
  assert.equal(legacy.id, historic.rows[0].id)
  assert.deepEqual([legacy.before, legacy.after, legacy.actorEmail], [null, null, null])

  const runtime = await pool.connect()
  try {
    await runtime.query("BEGIN")
    await runtime.query("SELECT set_config('rms.tenant_id',$1,true), set_config('rms.catalog_scope','tenant',true)", [other.tenantId])
    const visible = () => runtime.query("SELECT tenant_id,key FROM catalog.audit")
    assert.equal((await visible()).rowCount, 0)
    await runtime.query("SELECT set_config('rms.home_layout_admin','on',true)")
    assert.deepEqual((await visible()).rows, [{tenant_id:other.tenantId, key}])
    const permissions = await runtime.query(`SELECT has_table_privilege(current_user,'catalog.audit','UPDATE') AS edit,
      has_table_privilege(current_user,'catalog.audit','DELETE') AS remove`)
    assert.deepEqual(permissions.rows, [{edit:false, remove:false}])
  } finally {
    await runtime.query("ROLLBACK")
    runtime.release()
  }
})
