import {Pool} from "pg"
import {randomUUID} from "node:crypto"
import {withTenant} from "../../dist/db/tenant-transaction.js"
import {resolveAccount} from "../../dist/modules/iam/account.js"
import {saveCall,changeCall} from "../../dist/modules/call/service.js"
import {createDraft} from "../../dist/modules/proposal/service.js"
import {ensureIntakeGraph} from "./ensure-intake-graph.mjs"
if(!/^\/tmp\/rms-pg\./.test(process.env.PGHOST??""))throw Error("Private test cluster required")
const pool=new Pool({user:"rms_test_client"}),users=process.argv.slice(2)
try{
  const result=[]
  for(let school=0;school<2;school++){
    const tenant="00000000-0000-4000-8000-"+String(school+1).padStart(12,"0")
    result.push(await withTenant(pool,tenant,async db=>{
      const unit=randomUUID(),second=randomUUID(),field=randomUUID(),form=randomUUID(),criteria=randomUUID()
      await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'N13-A1'),(rms.current_tenant(),$2,'N13-A2')",[unit,second])
      async function set(id,role,unitId){
        const {rows:[who]}=await db.query("UPDATE rms.account SET user_type=$2,unit_id=$3 WHERE id=$1 RETURNING email,subject",[id,role,unitId])
        return resolveAccount(db,who)
      }
      const admin=await set(users[school*2],"admin",unit)
      await ensureIntakeGraph(db,admin)
      const officer=await set(admin.id,"staff",unit),pi=await set(users[school*2+1],"author",unit)
      const guest=await resolveAccount(db,{subject:"load-fixture-2",email:"load-fixture-2@example.invalid"})
      const other=await set(guest.id,"author",second)
      for(const [id,k] of [[field,"field"],[form,"form"],[criteria,"criteria"]])await db.query("INSERT INTO rms.intake_reference(tenant_id,id,kind,name) VALUES(rms.current_tenant(),$1,$2,$3)",[id,k,k])
      const calls=[]
      for(let i=0;i<10;i++){
        const c=await saveCall(db,officer,{code:"N13-"+school+"-"+i,name:"Kỳ tải "+i,startDate:"2020-01-01",endDate:"2099-12-31",fieldIds:[field],templateId:form,criteriaId:criteria})
        await changeCall(db,officer,c.id,{action:"open",revision:c.revision});calls.push(c.id)
      }
      let project
      for(let i=0;i<1000;i++){
        const draft=await createDraft(db,i%5===4?other:pi,calls[i%10],{title:"N13 hồ sơ "+i,fieldId:field,months:6,budget:1000000,document:{},memberIds:[]})
        project??=draft.id
      }
      await db.query(`INSERT INTO rms.audit_log(tenant_id,actor_id,target_id,target_type,action,details)
        SELECT p.tenant_id,$1,p.id,'project','PERF_FIXTURE',jsonb_build_object('step',v)
        FROM rms.research_project p CROSS JOIN generate_series(1,5) v WHERE p.call_id=ANY($2::uuid[])`,[officer.id,calls])
      return {call:calls[0],field,project,unit}
    }))
  }
  console.log(JSON.stringify(result))
}finally{await pool.end()}
