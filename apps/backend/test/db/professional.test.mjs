import {test,after} from "node:test"
import assert from "node:assert/strict"
import {randomUUID} from "node:crypto"
import {Pool} from "pg"
import {withTenant} from "../../dist/db/tenant-transaction.js"
import {resolveAccount} from "../../dist/modules/iam/account.js"
import {profileSettings,readProfessional,saveProfessional} from "../../dist/modules/profile/professional/service.js"
const pool=new Pool({user:"rms_test_client"}),tenant="00000000-0000-4000-8000-000000000036"
after(()=>pool.end())
const run=(who,fn)=>withTenant(pool,tenant,async db=>fn(db,await resolveAccount(db,{subject:who,email:who+"@example.invalid"})))
test("F08 separates degrees from ranks, hides restricted fields and audits an in-scope edit on behalf",async()=>{
  const unit=randomUUID()
  const owner=await run("person",async(db,a)=>{await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Viện')",[unit]);await db.query("UPDATE rms.account SET unit_id=$1 WHERE id=$2",[unit,a.id]);return a.id})
  await run("officer",async(db,a)=>db.query("UPDATE rms.account SET unit_id=$1,user_type='staff' WHERE id=$2",[unit,a.id]))
  const config=profileSettings(JSON.stringify({fields:{address:"hidden",position:"required"},institution:"Đại học Thủy lợi",positions:["Giảng viên"],degrees:["Tiến sĩ"],ranks:["Phó giáo sư"]}))
  const input={revision:0,fullName:"Phạm Ngọc",data:{phone:"0901234567",birthDate:"1985-02-03",position:"Giảng viên",affiliation:unit,
    qualifications:[{kind:"DEGREE",name:"Tiến sĩ",year:2015},{kind:"RANK",name:"Phó giáo sư",year:2021}],jobs:[{place:"Viện A",from:"2020-01-01",to:null}]}}
  for(const data of [{...input.data,position:""},{...input.data,address:"ẩn"},{...input.data,email:"untrusted@example.invalid"},{...input.data,qualifications:[{kind:"DEGREE",name:"Tiến sĩ",year:2099}]},{...input.data,jobs:[{place:"Viện",from:"2022-01-01",to:"2019-01-01"}]}])
    await assert.rejects(run("person",(db,a)=>saveProfessional(db,a,owner,{...input,data},config)),e=>e.getStatus()===400)
  await run("officer",(db,a)=>saveProfessional(db,a,owner,input,config))
  const saved=await run("person",(db,a)=>readProfessional(db,a,owner,config))
  assert.equal(saved.institution,"Đại học Thủy lợi");assert.equal(saved.data.jobs[0].to,null);assert.equal(saved.data.qualifications.length,2);assert.equal(saved.data.address,undefined)
  await assert.rejects(run("other",(db,a)=>readProfessional(db,a,owner,config)),e=>e.getStatus()===404)
  const audit=await run("officer",db=>db.query("SELECT details->>'onBehalf' AS behalf FROM rms.audit_log WHERE action='PROFESSIONAL_PROFILE_UPDATED'"))
  assert.equal(audit.rows[0].behalf,"true")
})
