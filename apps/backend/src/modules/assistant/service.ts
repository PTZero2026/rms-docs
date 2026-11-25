import {BadRequestException,ConflictException,NotFoundException} from "@nestjs/common"
import type {PoolClient} from "pg"
import type {operations} from "@rms/api-contracts"
import type {SessionAccount} from "../iam/account.js"
import {appendAudit} from "../audit/append.js"
import {hash,source,type Kind} from "./source.js"
import {promptVersion,type Selector} from "./model.js"

type Card=operations["readSourceSuggestion"]["responses"][200]["content"]["application/json"]
type Decision=operations["decideSourceSuggestion"]["requestBody"]["content"]["application/json"]
const column=(k:Kind)=>k==="product"?"reading_id":"proposal_id"
export async function history(db:PoolClient,a:SessionAccount,k:Kind,id:string){
  await source(db,a,k,id)
  return (await db.query<{id:string;at:string}>("SELECT id,created_at AS at FROM rms.ai_suggestion WHERE actor_id=$1 AND "+column(k)+"=$2 ORDER BY created_at DESC,id LIMIT 20",[a.id,id])).rows
}
export async function generateSuggestion(db:PoolClient,a:SessionAccount,k:Kind,id:string,model:Selector){
  const current=await source(db,a,k,id)
  const ids=current.rows.length?await model.select(current.rows):[]
  const citations=current.rows.filter(p=>ids.includes(p.id)).map(p=>({id:p.id,key:p.key,digest:hash(p.text)}))
  const {rows:[r]}=await db.query("INSERT INTO rms.ai_suggestion(tenant_id,actor_id,"+column(k)+",source_version,template_version,model,prompt,citations) VALUES(rms.current_tenant(),$1,$2,$3,$4,$5,$6,$7) RETURNING id",[a.id,id,current.version,current.template,model.version,promptVersion,JSON.stringify(citations)])
  await appendAudit(db,a,k,id,"AI_DRAFT_CREATED",{suggestion:r.id,sourceVersion:current.version,template:current.template,model:model.version,prompt:promptVersion})
  return readSuggestion(db,a,k,id,r.id)
}
export async function readSuggestion(db:PoolClient,a:SessionAccount,k:Kind,id:string,suggestion:string):Promise<Card>{
  const data=await source(db,a,k,id)
  const sourceColumn=column(k)
  const {rows:[r]}=await db.query(`SELECT tenant_id,${sourceColumn} AS source_id,source_version,template_version,model,prompt,citations
    FROM rms.ai_suggestion WHERE actor_id=$1 AND ${sourceColumn}=$2 AND id=$3`,[a.id,id,suggestion])
  if(!r)throw new NotFoundException()
  const decisions=await db.query("SELECT field,choice FROM rms.ai_decision WHERE suggestion_id=$1",[suggestion])
  const valid=data.version===r.source_version&&data.template===r.template_version
  const fields=data.fields.map(f=>{
    const passage=valid&&data.rows.find(p=>p.key===f.key&&r.citations.some((c:{id:string;digest:string})=>c.id===p.id&&c.digest===hash(p.text)))
    return {...f,text:passage?passage.text:null,location:passage?passage.location:null,choice:decisions.rows.find(d=>d.field===f.key)?.choice??null}
  })
  return {id:suggestion,tenantId:r.tenant_id,sourceKind:k,sourceId:r.source_id,sourceVersion:r.source_version,
    templateVersion:r.template_version,model:r.model,prompt:r.prompt,metadata:data.metadata,fields}
}
export async function decideSuggestion(db:PoolClient,a:SessionAccount,k:Kind,id:string,suggestion:string,decision:Decision){
  const prior=await readSuggestion(db,a,k,id,suggestion)
  const field=prior.fields.find(f=>f.key===decision?.field)
  if(!field||!["use","discard"].includes(decision.choice))throw new BadRequestException("Chọn trường và quyết định hợp lệ.")
  if(decision.choice==="use"&&!field.text)throw new ConflictException("Nguồn không còn đủ căn cứ.")
  const changed=await db.query(`INSERT INTO rms.ai_decision VALUES(rms.current_tenant(),$1,$2,$3) ON CONFLICT(tenant_id,suggestion_id,field)
    DO UPDATE SET choice=EXCLUDED.choice WHERE rms.ai_decision.choice<>EXCLUDED.choice`,[suggestion,decision.field,decision.choice])
  if(changed.rowCount)await appendAudit(db,a,k,id,"AI_FIELD_DECIDED",{suggestion,...decision})
  return readSuggestion(db,a,k,id,suggestion)
}
