import {test,after} from "node:test"
import assert from "node:assert/strict"
import {randomUUID} from "node:crypto"
import {Pool} from "pg"
import {withTenant} from "../../dist/db/tenant-transaction.js"
import {resolveAccount} from "../../dist/modules/iam/account.js"
import {saveEntry,changeEntry} from "../../dist/modules/extension/entries.js"
const pool=new Pool({user:"rms_test_client"}),tenant="00000000-0000-4000-8000-000000000032"
after(()=>pool.end())
const run=(who,fn)=>withTenant(pool,tenant,async db=>fn(db,await resolveAccount(db,{subject:who,email:who+"@example.invalid"})))
test("F09 checks decision evidence on approval while F12 checks the current activity type at submission",async()=>{
  const unit=randomUUID()
  for(const who of ["author","staff"])await run(who,async(db,a)=>{
    if(who==="author")await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Viện A')",[unit])
    await db.query("UPDATE rms.account SET unit_id=$2,user_type=$3 WHERE id=$1",[a.id,unit,who])
  })
  const policy={types:[{code:"MINISTRY",label:"Cấp Bộ",required:["DECISION"]},{code:"PUBLIC",label:"Không yêu cầu quyết định",required:[]}],bodies:[{code:"MIN",label:"Bộ"}],evidence:[{code:"DECISION",label:"Quyết định"},{code:"MINUTES",label:"Biên bản"}]}
  const cmd={title:"Hồ sơ",category:"MINISTRY",body:"MIN",hostId:unit,date:"2026-09-30",revision:0}
  const submit={action:"submit",revision:1,reason:""},approve={action:"approve",revision:2,reason:""}
  const upper=randomUUID(),other=randomUUID(),activity=randomUUID()
  await run("author",(db,a)=>saveEntry(db,a,"upper-project",upper,cmd,policy))
  await run("author",(db,a)=>changeEntry(db,a,"upper-project",upper,submit,policy))
  await assert.rejects(run("staff",(db,a)=>changeEntry(db,a,"upper-project",upper,approve,policy)),e=>e.getStatus()===409&&e.message.includes("DECISION"))
  await run("author",(db,a)=>saveEntry(db,a,"upper-project",other,{...cmd,category:"PUBLIC",hostId:null},policy))
  await run("author",(db,a)=>changeEntry(db,a,"upper-project",other,submit,policy))
  await assert.rejects(run("staff",(db,a)=>changeEntry(db,a,"upper-project",other,{...approve,supportAmount:"100"},policy)),e=>e.getStatus()===400)
  await assert.rejects(run("staff",(db,a)=>changeEntry(db,a,"upper-project",other,{...approve,action:"reject",reason:"Không phù hợp"},policy)),e=>e.getStatus()===400)
  assert.equal((await run("staff",(db,a)=>changeEntry(db,a,"upper-project",other,approve,policy))).status,"APPROVED")
  await run("author",(db,a)=>saveEntry(db,a,"activity",activity,{...cmd,body:""},policy))
  await assert.rejects(run("author",(db,a)=>changeEntry(db,a,"activity",activity,submit,policy)),e=>e.getStatus()===409&&e.message.includes("DECISION"))
  await assert.rejects(run("author",(db,a)=>changeEntry(db,a,"activity",upper,submit,policy)),e=>e.getStatus()===404)
})
