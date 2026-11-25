import { randomUUID } from "node:crypto"
import { Pool } from "pg"
import { createRequire } from "node:module"
import { withTenant } from "../../dist/db/tenant-transaction.js"
import { deliverNext } from "../../dist/modules/notification/worker.js"
import { scanDeadlines } from "../../dist/modules/notification/deadline-reminder/consumer.js"

if(!process.env.PGHOST?.startsWith("/tmp/rms-pg."))throw Error("Disposable test database required")
const app=new Pool({user:"rms_test_client"}),worker=new Pool({user:"rms_test_worker"})
const tenant="00000000-0000-4000-8000-000000000001"
const clock=new Date("2026-12-02T17:00:00Z")
const requireWorker=createRequire(new URL("../../../worker/package.json",import.meta.url))
const smtp=requireWorker("nodemailer").createTransport({host:"127.0.0.1",port:1026,ignoreTLS:true})
try {
  const unit=randomUUID()
  await withTenant(app,tenant,async db=>{
    await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Khoa nhắc hạn')",[unit])
    for(const ownerId of process.argv.slice(2)){
      const target=randomUUID(),audit=randomUUID()
      await db.query("UPDATE rms.account SET user_type='author',unit_id=$1 WHERE id=$2",[unit,ownerId])
      await db.query("INSERT INTO rms.research_project(tenant_id,id,unit_id,title,owner_id,status,status_semantic) VALUES(rms.current_tenant(),$1,$2,'Đánh giá lưu lượng nước',$3,'IN_PROGRESS','IN_PROGRESS')",[target,unit,ownerId])
      await db.query("INSERT INTO rms.progress_period(tenant_id,project_id,period,due_date) VALUES(rms.current_tenant(),$1,2,'2026-12-10')",[target])
      await db.query("INSERT INTO rms.audit_log(tenant_id,id,actor_id,target_id,target_type,action) VALUES(rms.current_tenant(),$1,$2,$3,'call','FIXTURE_CALL_OPENED')",[audit,ownerId,randomUUID()])
      await db.query("INSERT INTO rms.outbox(tenant_id,id,target_id,event_type,effects,audit_id,payload) VALUES(rms.current_tenant(),$1,$2,'CALL_OPENED',ARRAY['notify'],$3,$4)",[randomUUID(),randomUUID(),audit,{ownerId}])
    }
  })
  const scan=()=>scanDeadlines(worker,"http://127.0.0.1:3192",process.env.RMS_REMINDER_SERVICE_SECRET,clock)
  const first=await scan(),repeat=await scan()
  if(first.failed||repeat.failed||repeat.enqueued)throw Error("Unexpected deadline scan result")
  while(await deliverNext(worker,async m=>{await smtp.sendMail({...m,from:"rms@example.invalid",subject:"Thông báo RMS",text:"Đăng nhập RMS để xem thông báo."})},tenant)){}
  process.stdout.write(JSON.stringify({first,repeat}))
}finally{smtp.close();await Promise.all([app.end(),worker.end()])}
