import { randomUUID } from "node:crypto"
import { Pool } from "pg"
import { withTenant } from "../../dist/db/tenant-transaction.js"
import { resolveAccount } from "../../dist/modules/iam/account.js"
import { ensureIntakeGraph } from "./ensure-intake-graph.mjs"
import { changeCall,saveCall } from "../../dist/modules/call/service.js"
import { actOnProposal,createDraft } from "../../dist/modules/proposal/service.js"

if(!process.env.PGHOST?.startsWith("/tmp/rms-pg."))throw Error("Disposable test database required")
const [operator,pi,voter]=process.argv.slice(2)
const pool=new Pool({user:"rms_test_client"})
try{
  const result=await withTenant(pool,"00000000-0000-4000-8000-"+"1".padStart(12,"0"),async db=>{
    const [unit,field,form,criteria]=Array.from({length:4},()=>randomUUID())
    await db.query("INSERT INTO rms.unit VALUES(rms.current_tenant(),$1,'Khoa Thủy văn')",[unit])
    const account=async(id,role)=>{
      const {rows:[u]}=await db.query("UPDATE rms.account SET user_type=$2,unit_id=$3 WHERE id=$1 RETURNING email,subject",[id,role,unit])
      return resolveAccount(db,u)
    }
    await ensureIntakeGraph(db,await account(operator,"admin"))
    const staff=await account(operator,"staff"),author=await account(pi,"author")
    await account(voter,"user")
    for(const [id,kind,body] of [[field,"field",{}],[form,"form",{fields:[{key:"method",label:"Phương pháp",required:true}]}],
      [criteria,"criteria",{type:"PROPOSAL_REVIEW",items:[{key:"quality",label:"Chất lượng khoa học",weight:0.6,maxScore:10},{key:"impact",label:"Tác động",weight:0.4,maxScore:10}]}]])
      await db.query("INSERT INTO rms.intake_reference(tenant_id,id,kind,name,definition) VALUES(rms.current_tenant(),$1,$2,$3,$4)",[id,kind,"Thủy văn "+kind,body])
    const at=new Date("2026-11-20T08:00:00Z")
    const call=await saveCall(db,staff,{code:"KG-THUYVAN",name:"Kỳ thủy văn",startDate:"2026-11-01",endDate:"2026-11-30",fieldIds:[field],templateId:form,criteriaId:criteria})
    const opened=await changeCall(db,staff,call.id,{action:"open",revision:call.revision},at)
    const p=await createDraft(db,author,call.id,{title:"Quan trắc lưu lượng dòng chảy",months:12,budget:50000000,fieldId:field,document:{method:"Quan trắc theo chuỗi thời gian."},memberIds:[]},at)
    await actOnProposal(db,author,p.id,{action:"submit",revision:p.revision},at)
    await changeCall(db,staff,call.id,{action:"close",revision:opened.revision},at)
    return {project:p.id}
  })
  process.stdout.write(JSON.stringify(result))
}finally{await pool.end()}
