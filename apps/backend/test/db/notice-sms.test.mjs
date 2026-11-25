import {after,test} from "node:test"
import assert from "node:assert/strict"
import {createServer} from "node:http"
import {randomUUID} from "node:crypto"
import {Pool} from "pg"
import {withTenant} from "../../dist/db/tenant-transaction.js"
import {resolveAccount} from "../../dist/modules/iam/account.js"
import {saveRule,savePreference,preferences} from "../../dist/modules/notification/policy.js"
import {saveTemplate} from "../../dist/modules/notification/templates.js"
import {appendAudit} from "../../dist/modules/audit/append.js"
import {notifyRecipients} from "../../dist/modules/notification/emit.js"
import {deliverNext} from "../../dist/modules/notification/worker.js"

const app=new Pool({user:"rms_test_client"}), worker=new Pool({user:"rms_test_worker"})
after(()=>Promise.all([app.end(),worker.end()]))
const school="00000000-0000-4000-8000-000000000041"
const as=(name,fn)=>withTenant(app,school,async db=>fn(db,await resolveAccount(db,{subject:name,email:name+"@example.invalid"})))
const high="PROJECT_ASSIGNED",normal="PROPOSAL_RECEIVED"
test("B04 TC-05/06/18 · SMS priority, consent, current phone, provider acceptance and ambiguous response",async()=>{
  const {smsGateway}=await import("../../dist/modules/notification/sms.js")
  assert.throws(()=>smsGateway("http://sms.example.invalid/send",randomUUID()))
  const received=[]
  let response=202
  const server=createServer(async(req,res)=>{
    let data=""
    for await(const chunk of req)data+=chunk
    received.push({body:JSON.parse(data),key:req.headers["idempotency-key"],auth:req.headers.authorization})
    res.writeHead(response).end()
  })
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve))
  try{
    const secret=randomUUID(),send=smsGateway("http://127.0.0.1:"+server.address().port+"/send",secret)
    const phone="+12025550123",project=randomUUID()
    const owner=await as("recipient",async(db,a)=>{
      await db.query("UPDATE rms.account SET phone=$2 WHERE id=$1",[a.id,phone])
      return a.id
    })
    const blank=await as("no-number",async(_db,a)=>a.id)
    await as("admin",(db,a)=>db.query("UPDATE rms.account SET user_type='admin' WHERE id=$1",[a.id]))
    const emit=code=>as("admin",async(db,a)=>{
      const audit=await appendAudit(db,a,"project",project,"TEST_SMS")
      await notifyRecipients(db,code,project,audit,[owner,blank])
      return (await db.query("SELECT id FROM rms.outbox WHERE audit_id=$1",[audit])).rows[0].id
    })
    const rows=id=>as("admin",async db=>(await db.query("SELECT id,channel,status,last_error,recipient_id,template_missing FROM rms.delivery WHERE event_id=$1 ORDER BY channel",[id])).rows)
    const drain=async()=>{while(await deliverNext(worker,async()=>{},school,undefined,send)){}}
    const matrix=async(code,sms)=>as("admin",async(db,a)=>{
      const rule=(await preferences(db,a)).find(row=>row.code===code)
      return saveRule(db,a,{...rule,sms})
    })
    await assert.rejects(matrix(normal,true),e=>e.getStatus()===400)
    // Emulate a legacy or imported rule with SMS erroneously active on a normal event.
    await matrix(normal,false)
    await as("admin",db=>db.query("UPDATE rms.notice_rule SET sms=true WHERE code=$1",[normal]))
    assert.deepEqual((await rows(await emit(normal))).map(r=>r.channel),["in_app","in_app","smtp","smtp"])
    await matrix(high,false)
    assert.equal((await rows(await emit(high))).length,4)
    await matrix(high,true)
    await as("recipient",(db,a)=>savePreference(db,a,{code:high,email:true,sms:false}))
    assert.equal((await rows(await emit(high))).length,4)
    await as("recipient",(db,a)=>savePreference(db,a,{code:high,email:true,sms:true}))
    const template=await as("admin",async(db,a)=>{
      const rule=(await preferences(db,a)).find(r=>r.code===high)
      return saveTemplate(db,a,high,"sms",{title:"Tin RMS",body:"SMS · {{event}}",revision:rule.revision})
    })
    const unsubscribed=await emit(high)
    await as("recipient",(db,a)=>savePreference(db,a,{code:high,email:true,sms:false}))
    await drain()
    assert.equal((await rows(unsubscribed)).find(r=>r.channel==="sms").status,"skipped")
    await as("recipient",(db,a)=>savePreference(db,a,{code:high,email:true,sms:true}))
    const sent=await emit("PROJECT.IN_PROGRESS")
    await drain()
    const sms=(await rows(sent)).filter(r=>r.channel==="sms")
    assert.equal(sms.length,1)
    assert.equal(sms[0].recipient_id,owner)
    assert.equal(sms[0].status,"sent")
    assert.deepEqual(received,[{body:{to:phone,text:"SMS · Đề tài đã được giao thực hiện"},key:sms[0].id,auth:"Bearer "+secret}])
    await as("admin",(db,a)=>saveTemplate(db,a,high,"sms",{title:null,body:null,revision:template.revision}))
    const skipped=await emit(high)
    await as("recipient",(db,a)=>db.query("UPDATE rms.account SET phone='' WHERE id=$1",[a.id]))
    await drain()
    assert.equal((await rows(skipped)).find(r=>r.channel==="sms").status,"skipped")
    assert.equal(received.length,1)
    await as("recipient",(db,a)=>db.query("UPDATE rms.account SET phone=$2 WHERE id=$1",[a.id,phone]))
    response=503
    const uncertain=await emit(high)
    await drain()
    const pending=(await rows(uncertain)).find(r=>r.channel==="sms")
    assert.equal(pending.status,"reconcile")
    assert.equal(pending.template_missing,true)
    assert.match(received.at(-1).body.text,/Đăng nhập RMS/)
    response=422
    const invalid=await emit(high)
    await drain()
    const failed=(await rows(invalid)).find(r=>r.channel==="sms")
    assert.equal(failed.status,"failed")
    const {resendDeliveries}=await import("../../dist/modules/notification/deliveries.js")
    await as("admin",(db,a)=>resendDeliveries(db,a,{items:[{id:failed.id,revision:0}]}))
    response=202
    await drain()
    assert.equal(received.at(-1).key,failed.id)
    assert.equal((await rows(invalid)).find(r=>r.channel==="sms").status,"sent")
    const held=await emit(high)
    while(await deliverNext(worker,async()=>{},school)){}
    const deferred=(await rows(held)).find(r=>r.channel==="sms")
    assert.equal(deferred.status,"ready")
    assert.equal(deferred.last_error,"sms_gateway_unconfigured")
    response=429
    const rejected=await emit(high)
    await drain()
    assert.equal((await rows(rejected)).find(r=>r.channel==="sms").status,"ready")
  }finally{await new Promise(resolve=>server.close(resolve))}
})
