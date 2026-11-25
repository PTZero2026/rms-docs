import assert from "node:assert/strict"
import {after,test} from "node:test"
import {Pool} from "pg"
import {withTenant} from "../../dist/db/tenant-transaction.js"
import {resolveAccount} from "../../dist/modules/iam/account.js"
import {managementLock} from "../../dist/modules/iam/lock-account/service.js"
import {submitRequest,listRequests,reviewRequest} from "../../dist/modules/iam/author-request/service.js"

const pool=new Pool({user:"rms_test_client"})
const tenant="00000000-0000-4000-8000-000000000036"
const run=(who,fn)=>withTenant(pool,tenant,async db=>{
  await managementLock(db)
  return fn(db,await resolveAccount(db,{subject:who,email:who+"@example.invalid"}))
})
after(()=>pool.end())

test("an admin decision on a pending application changes the role and audit atomically",async()=>{
  const data={academicTitle:"Tiến sĩ",specialty:"Thủy văn",evidenceFileUrls:["https://school.example.invalid/minh-chung/1"]}
  await run("reviewer",async(db,a)=>db.query("UPDATE rms.account SET user_type='admin' WHERE id=$1",[a.id]))
  const submit=()=>run("applicant",(db,a)=>submitRequest(db,a,data))
  const [first,retry]=await Promise.all([submit(),submit()])
  assert.equal(first.id,retry.id)
  assert.equal(first.status,"PENDING")
  assert.deepEqual(await run("another",(db,a)=>listRequests(db,a,false)),[])
  await assert.rejects(run("another",(db,a)=>listRequests(db,a,true)),e=>e.getStatus()===403)
  await assert.rejects(run("applicant",(db,a)=>reviewRequest(db,a,first.id,true,"")),e=>e.getStatus()===403)
  await assert.rejects(run("reviewer",(db,a)=>reviewRequest(db,a,first.id,false,"")),e=>e.getStatus()===400)
  const rejected=await run("reviewer",(db,a)=>reviewRequest(db,a,first.id,false,"Bổ sung minh chứng"))
  assert.equal(rejected.status,"REJECTED")
  const next=await submit()
  assert.notEqual(next.id,first.id)
  const decide=()=>run("reviewer",(db,a)=>reviewRequest(db,a,next.id,true,"Đủ điều kiện"))
  const decision=await decide()
  assert.equal(decision.status,"APPROVED")
  assert.deepEqual((await decide()).reviewedAt,decision.reviewedAt)
  await run("applicant",async(db,a)=>{
    assert.equal(a.userType,"author")
    assert.equal(a.permissions.length,3)
    const log=await db.query("SELECT count(*)::int AS n FROM rms.audit_log WHERE action='ADMIN_CHANGE_USER_ROLE' AND target_id=$1",[a.id])
    assert.equal(log.rows[0].n,1)
  })
})
