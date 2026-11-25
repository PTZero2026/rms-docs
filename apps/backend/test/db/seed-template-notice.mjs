import {randomUUID} from "node:crypto"
import {createRequire} from "node:module"
import {Pool} from "pg"
import {withTenant} from "../../dist/db/tenant-transaction.js"
import {notifyRecipients} from "../../dist/modules/notification/emit.js"
import {deliverNext} from "../../dist/modules/notification/worker.js"

if(!/^\/tmp\/rms-pg\.[A-Za-z0-9]+$/.test(process.env.PGHOST??""))throw Error("Requires a disposable RMS database")
const tenant="00000000-0000-4000-8000-"+String(2).padStart(12,"0")
const [admin,officer]=process.argv.slice(2)
const app=new Pool({user:"rms_test_client"}),worker=new Pool({user:"rms_test_worker"})
const smtp=createRequire(new URL("../../../worker/package.json",import.meta.url))("nodemailer")
  .createTransport({host:"127.0.0.1",port:1026,ignoreTLS:true})
try {
  const audit=randomUUID(),project=randomUUID(),unit=randomUUID()
  await withTenant(app,tenant,async db=>{
    await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Khoa môi trường')",[unit])
    await db.query("UPDATE rms.account SET unit_id=$1 WHERE id=$2",[unit,officer])
    await db.query("INSERT INTO rms.research_project(tenant_id,id,unit_id,owner_id,title) VALUES(rms.current_tenant(),$1,$2,$3,'Chất lượng nước hồ')",[project,unit,admin])
    await db.query("INSERT INTO rms.audit_log(tenant_id,id,actor_id,target_id,target_type,action) VALUES(rms.current_tenant(),$1,$2,$3,'project','TEST_NOTICE')",[audit,admin,project])
    await notifyRecipients(db,"PROGRESS_REPORT_OVERDUE",project,audit,[officer],{period:4,dueDate:"2026-12-09"})
  })
  while(await deliverNext(worker,async ({to,subject,text,messageId})=>{
    await smtp.sendMail({to,subject,text,messageId,from:"rms@example.invalid"})
  },tenant)){}
  const {rows:[notice]}=await withTenant(app,tenant,db=>db.query(`SELECT n.id FROM rms.notice n JOIN rms.outbox o
    ON (o.tenant_id,o.id)=(n.tenant_id,n.event_id) WHERE o.audit_id=$1 AND n.recipient_id=$2`,[audit,officer]))
  if(!notice)throw Error("The worker did not create the officer's notice")
  process.stdout.write(notice.id)
}finally{smtp.close();await Promise.all([worker.end(),app.end()])}
