import {after,test} from "node:test"
import assert from "node:assert/strict"
import {randomUUID} from "node:crypto"
import {Pool} from "pg"
import {withTenant} from "../../dist/db/tenant-transaction.js"
import {resolveAccount} from "../../dist/modules/iam/account.js"
import {saveEntry,changeEntry,entry} from "../../dist/modules/extension/entries.js"
import {enqueueApproved} from "../../dist/modules/teaching-hour/teaching-hours/service.js"

const pool=new Pool({user:"rms_test_client"}),tenant="00000000-0000-4000-8000-000000000038"
after(()=>pool.end())
const run=(name,fn)=>withTenant(pool,tenant,async db=>fn(db,await resolveAccount(db,{subject:name,email:name+"@example.invalid"})))
const rules={types:[{code:"COMMUNITY",label:"Phục vụ cộng đồng",required:[]}],evidence:[],bodies:[]}

test("F12 records optional VND support only upon approval, reverses it on revocation and keeps a reasoned rejection",async()=>{
  const unit=randomUUID(),id=randomUUID()
  await run("staff-f12",async(db,a)=>{
    await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Khoa Xã hội')",[unit])
    await db.query("UPDATE rms.account SET unit_id=$1,user_type='staff' WHERE id=$2",[unit,a.id])
  })
  await run("lecturer-f12",(db,a)=>db.query("UPDATE rms.account SET unit_id=$1,user_type='author' WHERE id=$2",[unit,a.id]))
  const read=()=>run("lecturer-f12",(db,a)=>entry(db,a,"activity",id))
  const decide=(who,action,revision,reason="",extra={})=>run(who,(db,a)=>changeEntry(db,a,"activity",id,{action,revision,reason,...extra},rules))
  const {revision}=await run("lecturer-f12",(db,a)=>saveEntry(db,a,"activity",id,{title:"Hội thảo cộng đồng",category:"COMMUNITY",hostId:null,date:"2026-09-30",body:"",revision:0},rules))
  await assert.rejects(decide("lecturer-f12","submit",revision,"",{supportAmount:"2500000"}),e=>e.getStatus?.()===400)
  const pending=await decide("lecturer-f12","submit",revision)
  assert.equal(pending.supportAmount,null)
  await assert.rejects(decide("lecturer-f12","approve",pending.revision,"",{supportAmount:"1"}),e=>e.getStatus?.()===403)
  for(const invalid of ["-100","25.5","9007199254740992",2500000])
    await assert.rejects(decide("staff-f12","approve",pending.revision,"",{supportAmount:invalid}),e=>e.getStatus?.()===400)
  assert.equal((await read()).revision,pending.revision)
  const choices=await Promise.allSettled(["2500000","3000000"].map(supportAmount=>decide("staff-f12","approve",pending.revision,"",{supportAmount})))
  const success=choices.filter(r=>r.status==="fulfilled")
  assert.equal(success.length,1)
  assert.equal(choices.find(r=>r.status==="rejected").reason.getStatus(),409)
  const approved=success[0].value
  assert.ok(["2500000","3000000"].includes(approved.supportAmount))
  assert.equal((await read()).supportAmount,approved.supportAmount)
  await assert.rejects(run("outside-f12",(db,a)=>entry(db,a,"activity",id)),e=>e.getStatus?.()===404)
  await run("staff-f12",db=>enqueueApproved(db,"activity",id))
  const draft=await decide("staff-f12","revoke",approved.revision,"Thu hồi theo biên bản")
  assert.equal(draft.supportAmount,null)
  const again=await decide("lecturer-f12","submit",draft.revision)
  const withoutSupport=await decide("staff-f12","approve",again.revision)
  assert.equal(withoutSupport.supportAmount,null)
  const returned=await decide("staff-f12","revoke",withoutSupport.revision,"Đính chính hồ sơ")
  const resubmitted=await decide("lecturer-f12","submit",returned.revision)
  await assert.rejects(decide("staff-f12","reject",resubmitted.revision,"  "),e=>e.getStatus?.()===400)
  const rejected=await decide("staff-f12","reject",resubmitted.revision,"Hoạt động ngoài chương trình")
  assert.equal(rejected.status,"REJECTED")
  assert.equal(rejected.supportAmount,null)
  await assert.rejects(decide("lecturer-f12","submit",rejected.revision),e=>e.getStatus?.()===409)
  await run("staff-f12",async db=>{
    const audit=await db.query("SELECT action,details FROM rms.audit_log WHERE target_id=$1 AND action IN ('ENTRY_APPROVED','ENTRY_REVOKED','ENTRY_REJECTED') ORDER BY occurred_at,id",[id])
    assert.equal(audit.rows.length,5)
    assert.deepEqual(audit.rows.slice(0,2).map(r=>[r.details.fromSupportAmount,r.details.toSupportAmount]),[[null,approved.supportAmount],[approved.supportAmount,null]])
    assert.equal(audit.rows.at(-1).details.reason,"Hoạt động ngoài chương trình")
    assert.equal((await db.query("SELECT FROM rms.hour_request WHERE source_id=$1 AND revoked_at IS NULL",[id])).rowCount,0)
  })
})
