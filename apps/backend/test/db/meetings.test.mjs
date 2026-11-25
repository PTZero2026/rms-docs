import {test,after} from "node:test"
import assert from "node:assert/strict"
import {randomUUID} from "node:crypto"
import {Pool} from "pg"
import {withTenant} from "../../dist/db/tenant-transaction.js"
import {resolveAccount} from "../../dist/modules/iam/account.js"

const pool=new Pool({user:"rms_test_client"})
after(()=>pool.end())
const tenant="00000000-0000-4000-8000-"+String(35).padStart(12,"0")
const as=(who,fn)=>withTenant(pool,tenant,async db=>fn(db,await resolveAccount(db,{subject:"minutes-"+who,email:who+"-minutes@example.invalid"})))
test("committee minutes are versioned per meeting and require the current secretary or an eligible reader",async()=>{
  const m=await import("../../dist/modules/review/meetings/service.js")
  const units=randomUUID(),project=randomUUID(),committee=randomUUID(),round=randomUUID(),other=randomUUID()
  const people={}
  for(const who of ["secretary","reader","outside","owner"])people[who]=await as(who,async(_db,a)=>a.id)
  await as("owner",async db=>{
    await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Khoa')",[units])
    await db.query("INSERT INTO rms.research_project(tenant_id,id,unit_id,title,owner_id) VALUES(rms.current_tenant(),$1,$2,'Đề tài họp',$3)",[project,units,people.owner])
    for(const id of [committee,other])await db.query("INSERT INTO rms.committee(tenant_id,id,unit_id,name,kind) VALUES(rms.current_tenant(),$1,$2,'Hội đồng','PROPOSAL_REVIEW')",[id,units])
    await db.query("INSERT INTO rms.committee_seat VALUES(rms.current_tenant(),$1,$2,'SECRETARY'),(rms.current_tenant(),$1,$3,'MEMBER'),(rms.current_tenant(),$4,$5,'SECRETARY')",[committee,people.secretary,people.reader,other,people.outside])
    await db.query("INSERT INTO rms.evaluation_round(tenant_id,id,project_id,committee_id,kind,criteria,ethics) VALUES(rms.current_tenant(),$1,$2,$3,'PROPOSAL_REVIEW','{}','EXEMPT')",[round,project,committee])
  })
  const cmd={id:randomUUID(),title:"Phiên xét tháng 11",date:"2026-11-24"}
  const status=n=>e=>e.getStatus?.()===n
  await assert.rejects(as("reader",(db,a)=>m.createMeeting(db,a,round,cmd)),status(403))
  const created=await as("secretary",(db,a)=>m.createMeeting(db,a,round,cmd))
  assert.equal(created.id,cmd.id)
  assert.equal((await as("secretary",(db,a)=>m.createMeeting(db,a,round,cmd))).id,cmd.id)
  const store={form:async()=>({url:"http://localhost",fields:{}}),promote:async()=>{},download:async()=>({url:"http://localhost",ttlSeconds:5})}
  const request={filename:"bien-ban.pdf",mime:"application/pdf",size:120,sha256:"0".repeat(64),resourceVersion:0}
  const files=[]
  for(const revision of [0,1]){
    const intent=await as("secretary",(db,a)=>m.issueMinutes(db,a,cmd.id,{...request,resourceVersion:revision},store))
    await as("secretary",(db,a)=>m.finishMinutes(db,a,cmd.id,intent.id,store))
    await as("secretary",(db,a)=>m.finishMinutes(db,a,cmd.id,intent.id,store))
    files.push(intent.id)
  }
  const meetings=await as("reader",(db,a)=>m.meetings(db,a,round))
  assert.deepEqual(meetings[0].files.map(f=>[f.revision,f.actorId]),[[2,people.secretary],[1,people.secretary]])
  assert.equal((await as("reader",(db,a)=>m.downloadMinutes(db,a,cmd.id,files[0],store))).ttlSeconds,5)
  for(const who of ["owner","outside"])await assert.rejects(as(who,(db,a)=>m.downloadMinutes(db,a,cmd.id,files[0],store)),status(404))
  await as("reader",db=>db.query("INSERT INTO rms.project_member VALUES(rms.current_tenant(),$1,$2,false)",[project,people.reader]))
  await assert.rejects(as("reader",(db,a)=>m.meetings(db,a,round)),status(404))
  assert.equal((await as("owner",db=>db.query("SELECT count(*)::int AS n FROM rms.audit_log WHERE action='MEETING_MINUTES_ATTACHED' AND target_id=$1",[cmd.id]))).rows[0].n,2)
})
