import assert from "node:assert/strict"
import { after,test } from "node:test"
import { Pool } from "pg"
import { alternateTheme, defaultTheme } from "@rms/api-contracts/theme"
import { withTenant } from "../../dist/db/tenant-transaction.js"
import { resolveAccount } from "../../dist/modules/iam/account.js"
import { getActive, getEditor, saveDraft, applyDraft, rollbackTheme } from "../../dist/modules/catalog/theme/service.js"

const pool = new Pool({user:"rms_test_client",max:4})
after(()=>pool.end())
const id = n=>"00000000-0000-4000-8000-"+String(n).padStart(12,"0")
const run = (n,fn)=>withTenant(pool,id(n),async db=>fn(db,await resolveAccount(db,{subject:"theme",email:"theme@example.invalid"})))
test("draft stays private; two publishers yield one revision, rollback preserves history",async()=>{
  for(const n of [6,7]) await run(n,async(db,actor)=>{
    await assert.rejects(getEditor(db,actor),e=>e.getStatus()===403)
    await db.query("UPDATE rms.account SET user_type='admin' WHERE id=$1",[actor.id])
  })
  await run(6,(db,a)=>saveDraft(db,a,{tokens:alternateTheme,expectedRevision:1,expectedDraft:0}))
  assert.deepEqual(await run(6,getActive),{revision:1,tokens:defaultTheme})
  assert.equal((await run(7,getEditor)).draft,null)
  const publish=()=>run(6,(db,a)=>applyDraft(db,a,{expectedRevision:1,expectedDraft:1}))
  const results=await Promise.allSettled([publish(),publish()])
  assert.equal(results.filter(r=>r.status==="fulfilled").length,1)
  assert.equal(results.find(r=>r.status==="rejected").reason.getStatus(),409)
  assert.deepEqual(await run(6,getActive),{revision:2,tokens:alternateTheme})
  assert.deepEqual(await run(7,getActive),{revision:1,tokens:defaultTheme})
  await run(6,(db,a)=>rollbackTheme(db,a,{expectedRevision:2,sourceRevision:1}))
  const editor=await run(6,getEditor)
  assert.deepEqual(editor.active,{revision:3,tokens:defaultTheme})
  assert.deepEqual(editor.history,[3,2,1])
  await run(6,async db=>{
    const result=await db.query("select action from rms.audit_log where target_type='theme' order by occurred_at")
    assert.deepEqual(result.rows.map(x=>x.action),["THEME_APPLIED","THEME_ROLLED_BACK"])
  })
})
