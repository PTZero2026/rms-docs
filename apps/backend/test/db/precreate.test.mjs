import {test,after} from "node:test"
import assert from "node:assert/strict"
import {randomUUID} from "node:crypto"
import {Pool} from "pg"
import {withTenant} from "../../dist/db/tenant-transaction.js"
import {resolveAccount} from "../../dist/modules/iam/account.js"
import {reserveAccount,completeAccount} from "../../dist/modules/iam/provision-account/service.js"
const pool=new Pool({user:"rms_test_client"}),tenant="00000000-0000-4000-8000-000000000035"
after(()=>pool.end())
const run=(who,fn)=>withTenant(pool,tenant,async db=>fn(db,await resolveAccount(db,{subject:who,email:who+"@example.invalid"})))
test("precreation checks admin before upstream and replays the same command only for its original owner",async()=>{
  const unit=randomUUID(),cmd={commandId:randomUUID(),email:"Invited@example.invalid",fullName:"Người nhận",unitId:unit,userType:"author"}
  await assert.rejects(run("basic",(db,a)=>reserveAccount(db,a,cmd)),e=>e.getStatus()===403)
  await run("admin",async(db,a)=>{await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Khoa')",[unit]);await db.query("UPDATE rms.account SET user_type='admin' WHERE id=$1",[a.id])})
  await run("admin",(db,a)=>reserveAccount(db,a,cmd))
  const sub=randomUUID(),res=await run("admin",(db,a)=>completeAccount(db,a,cmd,sub))
  assert.equal(res.email,"invited@example.invalid");assert.equal(res.userType,"author")
  const replay=await run("admin",(db,a)=>reserveAccount(db,a,cmd))
  assert.equal(replay.account.id,res.id)
  await assert.rejects(run("admin",(db,a)=>reserveAccount(db,a,{...cmd,commandId:randomUUID()})),e=>e.getStatus()===409)
})
