import {ConflictException,NotFoundException} from "@nestjs/common"
import {createHash} from "node:crypto"
import type {PoolClient} from "pg"
import type {operations} from "@rms/api-contracts"
import type {SessionAccount} from "../iam/account.js"
import {projectAccess} from "../proposal/access.js"

type Card=operations["readSourceSuggestion"]["responses"][200]["content"]["application/json"]
export type Kind="product"|"proposal"
export type Passage={id:string;key:string;label:string;text:string;location:string}
type Source={version:string;template:string;metadata:Card["metadata"];fields:{key:string;label:string}[];rows:Passage[]}
export const hash=(s:string)=>createHash("sha256").update(s).digest("hex")
export function kind(s:string):Kind{if(s==="product"||s==="proposal")return s;throw new NotFoundException()}
const readScope=`FROM rms.reading_source s JOIN rms.reading_access a ON (a.tenant_id,a.source_id)=(s.tenant_id,s.id)
 WHERE a.account_id=$1 AND a.read_metadata AND s.ai_metadata`
export async function library(db:PoolClient,a:SessionAccount){
  return (await db.query<{id:string;doi:string;title:string}>("SELECT s.id,s.doi,s.title "+readScope+" ORDER BY s.title,s.id",[a.id])).rows
}
export async function source(db:PoolClient,a:SessionAccount,k:Kind,id:string):Promise<Source>{
  if(k==="product"){
    const {rows:[r]}=await db.query(`SELECT s.id,s.doi,s.title,s.authors,s.year,s.version,s.verified_url AS url,
      a.read_full AND s.ai_fulltext AND (s.full_until IS NULL OR s.full_until>clock_timestamp()) AS full `+readScope+" AND s.id=$2",[a.id,id])
    if(!r)throw new NotFoundException()
    const fields=[{key:"method",label:"Phương pháp"},{key:"result",label:"Kết quả"}]
    const rows=r.full?(await db.query<Passage>(`SELECT field||'/'||position AS id,field AS key,CASE WHEN field='method' THEN 'Research method' ELSE 'Research result' END AS label,excerpt AS text,label AS location FROM rms.reading_passage p
      WHERE source_id=$1 AND version=$2 AND EXISTS (SELECT 1 `+readScope.replace("a.account_id=$1","a.account_id=$3")+ ` AND s.id=p.source_id AND s.version=p.version AND a.read_full AND s.ai_fulltext AND (s.full_until IS NULL OR s.full_until>clock_timestamp())) ORDER BY field,position LIMIT 100`,[id,r.version,a.id])).rows:[]
    return {version:r.version,template:"reading-card-v1",metadata:{doi:r.doi,title:r.title,authors:r.authors,year:r.year,url:r.url},fields,rows}
  }
  const p=await projectAccess(db,a,id)
  if(a.id!==p.owner_id||a.userType!=="author")throw new NotFoundException()
  if(!["DRAFT","RETURNED"].includes(p.status_semantic))throw new ConflictException("Chỉ rà thuyết minh ở bước soạn thảo.")
  const {rows:[d]}=await db.query(`SELECT d.document,d.form_snapshot FROM rms.proposal_document d
    JOIN rms.proposal_ai_policy g ON (d.tenant_id,d.project_id)=(g.tenant_id,g.project_id) AND g.permitted WHERE d.project_id=$1`,[id])
  if(!d)throw new NotFoundException("Nguồn chưa được phép xử lý.")
  const fields=(d.form_snapshot?.definition?.fields??[]).filter((f:{required:boolean})=>f.required).map((f:{key:string;label:string})=>({key:f.key,label:f.label})) as Source["fields"]
  const rows:Passage[]=[]
  for(const f of fields){
    const value=d.document[f.key]
    if(typeof value!=="string")continue
    for(const [i,text] of value.split(/\n+/u).map(v=>v.trim()).entries()){
      if(text&&rows.length<100)rows.push({id:f.key+"/"+(i+1),key:f.key,label:f.label,text:text.slice(0,2000),location:f.label+" · đoạn "+(i+1)})
    }
  }
  return {version:"r"+p.row_version,template:"form-"+hash(JSON.stringify(d.form_snapshot)).slice(0,16),fields,rows,metadata:null}
}
