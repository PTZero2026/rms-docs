import { randomUUID } from "node:crypto"
import { Pool } from "pg"
import { withTenant } from "../../dist/db/tenant-transaction.js"
import { ensureIntakeGraph } from "./ensure-intake-graph.mjs"
import { resolveAccount } from "../../dist/modules/iam/account.js"
import { saveCall,changeCall } from "../../dist/modules/call/service.js"
import { createDraft,actOnProposal } from "../../dist/modules/proposal/service.js"

if(!process.env.PGHOST?.startsWith("/tmp/rms-pg."))throw Error("Disposable test database required")
const [head,local,authorA,authorB]=process.argv.slice(2)
const tenant="00000000-0000-4000-8000-"+"1".padStart(12,"0"),pool=new Pool({user:"rms_test_client"}),setup=new Pool()
try{
  const result=await withTenant(pool,tenant,async db=>{
    const [a,b,field,form,criteria]=Array.from({length:5},()=>randomUUID())
    for(const [id,name] of [[a,"Khoa Công trình"],[b,"Khoa Kỹ thuật"]])await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,$2)",[id,name])
    const account=async(id,role,unit)=>{
      const {rows:[u]}=await db.query("UPDATE rms.account SET user_type=$2,unit_id=$3 WHERE id=$1 RETURNING email,subject",[id,role,unit])
      return resolveAccount(db,u)
    }
    await ensureIntakeGraph(db,await account(head,"admin",a))
    const staff=await account(head,"staff",a),pi=await account(authorA,"author",a),second=await account(authorB,"author",b)
    await account(local,"staff",a)
    for(const [id,kind] of [[field,"field"],[form,"form"],[criteria,"criteria"]])
      await db.query("INSERT INTO rms.intake_reference(tenant_id,id,kind,name) VALUES(rms.current_tenant(),$1,$2,$3)",[id,kind,"Báo cáo kỳ "+kind])
    const time=new Date()
    const d=await saveCall(db,staff,{code:"K-BC13",name:"Đối chứng tiếp nhận",startDate:"2026-01-01",endDate:"2099-12-31",fieldIds:[field],templateId:form,criteriaId:criteria})
    await changeCall(db,staff,d.id,{action:"open",revision:d.revision},time)
    let returned
    for(const [name,actor] of [["A1",pi],["A2",pi],["A3",pi],["B1",second]]){
      const draft=await createDraft(db,actor,d.id,{title:name,fieldId:field,months:3,budget:0,document:{},memberIds:[]},time)
      if(name==="A3")continue
      const accepted=await actOnProposal(db,actor,draft.id,{action:"submit",revision:draft.revision},time)
      if(name==="B1")continue
      const correction=await actOnProposal(db,staff,draft.id,{action:"return",revision:accepted.revision,reason:"Kiểm tra phụ lục"},time)
      if(name==="A1")await actOnProposal(db,actor,draft.id,{action:"submit",revision:correction.revision},time)
      else returned={id:draft.id,revision:correction.revision}
    }
    return {a,b,call:d.id,returned}
  })
  await setup.query("INSERT INTO rms.report_unit_grant VALUES($1,$2,$3)",[tenant,head,result.b])
  process.stdout.write(JSON.stringify(result))
}finally{await Promise.all([pool.end(),setup.end()])}
