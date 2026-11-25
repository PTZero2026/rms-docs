import type {PoolClient} from "pg"
import type {operations} from "@rms/api-contracts"
import type {SessionAccount} from "../iam/account.js"
import {listInbox} from "../notification/inbox.js"
import {personHours} from "../teaching-hour/teaching-hours/service.js"

type View=operations["getHomeOverview"]["responses"][200]["content"]["application/json"]
type Layout=operations["getHomeLayout"]["responses"][200]["content"]["application/json"]
export type WidgetData=operations["getHomeWidget"]["responses"][200]["content"]["application/json"]
type Widget=Layout["widgets"][number]
export {layoutKey,widgetsFor} from "@rms/api-contracts/home-layout"

export function homeLayout(a:SessionAccount,widgets:Widget[]):Layout {
  const shortcuts:Layout["shortcuts"]=[]
  if(widgets.includes("shortcuts")){
    shortcuts.push("profile")
    if(a.userType!=="user")shortcuts.push("calls")
    if(a.permissions.includes("reports.view"))shortcuts.push("reports")
  }
  return {widgets,shortcuts}
}

export async function homeProfile(db:PoolClient,a:SessionAccount,required:readonly string[]){
  const {rows:[professional]}=await db.query(`SELECT a.full_name,a.phone,coalesce(p.data,'{}') AS data FROM rms.account a
    LEFT JOIN rms.professional_profile p ON (p.tenant_id,p.account_id)=(a.tenant_id,a.id) WHERE a.id=$1`,[a.id])
  const fields={...professional.data,phone:professional.phone}
  const profileIncomplete=!professional.full_name.trim()||required.some(k=>Array.isArray(fields[k])?!fields[k].length:!String(fields[k]??"").trim())
  return {name:professional.full_name.trim()||a.email,profileIncomplete}
}

async function projectCounters(db:PoolClient,a:SessionAccount):Promise<View["counters"]>{
  const {rows:[r]}=await db.query(`SELECT count(*) FILTER(WHERE status_semantic='IN_PROGRESS')::int AS active,
    count(*) FILTER(WHERE status_semantic='SUBMITTED' AND d.finalized_at IS NULL)::int AS submitted FROM rms.research_project p
    LEFT JOIN rms.proposal_document d ON (d.tenant_id,d.project_id)=(p.tenant_id,p.id)
    WHERE $1='admin' OR ($1='staff' AND unit_id=$2) OR ($1='author' AND owner_id=$3)`,[a.userType,a.unitId,a.id])
  const counters=[{code:"active",label:a.userType==="author"?"Đề tài tôi đang thực hiện":"Đề tài đang thực hiện trong phạm vi",value:r.active}]
  if(a.userType==="admin"||a.userType==="staff")counters.push({code:"submitted",label:"Hồ sơ chờ tiếp nhận",value:r.submitted})
  return counters
}

async function teachingCounters(db:PoolClient,a:SessionAccount):Promise<View["counters"]>{
  const ledger=await personHours(db,a,a.id)
  // Terms and years can overlap. Add each underlying record once.
  const hours=ledger.items.reduce((total,item)=>total+Math.round(Number(item.adjusted)*100),0)/100
  return [{code:"hours",label:"Giờ giảng đã ghi nhận",value:hours}]
}

async function recentNotices(db:PoolClient,a:SessionAccount){
  return (await listInbox(db,a,{})).items.slice(0,5)
}

export async function dataWidget(db:PoolClient,a:SessionAccount,widget:Exclude<WidgetData["widget"],"profile">):Promise<WidgetData>{
  if(widget==="activity")return {widget,notices:await recentNotices(db,a)}
  const counters=widget==="projects"?await projectCounters(db,a):await teachingCounters(db,a)
  return {widget,counters,capturedAt:new Date().toISOString()}
}

export async function dashboard(db:PoolClient,a:SessionAccount,widgets:Widget[],required:readonly string[]):Promise<View>{
  const profile=await homeProfile(db,a,required)
  const counters=widgets.includes("projects")?await projectCounters(db,a):[]
  if(widgets.includes("teaching"))counters.push(...await teachingCounters(db,a))
  const notices=widgets.includes("activity")?await recentNotices(db,a):[]
  return {...homeLayout(a,widgets),...profile,counters,notices,capturedAt:new Date().toISOString()}
}
