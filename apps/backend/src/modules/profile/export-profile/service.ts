import {profileSettings,readProfessional} from "../professional/service.js"
import { ConflictException,NotFoundException } from "@nestjs/common"
import { randomUUID } from "node:crypto"
import type { PoolClient } from "pg"
import type { SessionAccount } from "../../iam/account.js"
import { appendAudit } from "../../audit/append.js"
import { personHours } from "../../teaching-hour/teaching-hours/service.js"
import { profileView as readProfile } from "./data.js"
import { renderProfile,type Template } from "./pdf.js"
export async function profileView(db:PoolClient,actor:SessionAccount,subject:string,withHours=false){
  const data=await readProfile(db,actor,subject)
  if(withHours)data.hours=(await personHours(db,actor,subject)).periods
  return data
}

interface Visibility {
  fields: string[]
  projects: string[]
  outputs: string[]
  hourRecords: string[]
  withHours: boolean
}

async function exportView(db: PoolClient, actor: SessionAccount, subject: string, withHours: boolean, settings: ReturnType<typeof profileSettings>) {
  const profile = await readProfile(db, actor, subject)
  const ledger = withHours ? await personHours(db, actor, subject) : undefined
  if (ledger) profile.hours = ledger.periods
  const visibility: Visibility = {
    fields: settings.visible,
    projects: profile.projects.map(item => item.id),
    outputs: profile.outputs.map(item => item.id),
    hourRecords: ledger?.items.map(item => item.id) ?? [],
    withHours,
  }
  return { profile, visibility }
}

function stillVisible(saved: Visibility, current: Visibility) {
  if (saved.withHours && !current.withHours) return false
  return (["fields", "projects", "outputs", "hourRecords"] as const).every(key => {
    const allowed = new Set(current[key])
    return saved[key].every(value => allowed.has(value))
  })
}

export function effectiveTemplate(value:string|null):Template{
  if(value===null||value==="CV-01.v1")return {code:"CV-01",version:"v1",title:"Lý lịch khoa học"}
  let template:Partial<Template>|null
  try{template=JSON.parse(value)}catch{throw new ConflictException("Mẫu lý lịch chưa hợp lệ.")}
  if(!template||typeof template.code!=="string"||!/^[-A-Za-z0-9_]{1,60}$/.test(template.code)||
    typeof template.version!=="string"||!/^[-A-Za-z0-9_.]{1,48}$/.test(template.version)||
    typeof template.title!=="string"||!template.title.trim()||template.title.length>200)throw new ConflictException("Cần mã, phiên bản và tiêu đề mẫu hợp lệ.")
  return {code:template.code,version:template.version,title:template.title.trim()}
}
export async function exportProfile(db:PoolClient,actor:SessionAccount,subject:string,template:Template,withHours=false,settings=profileSettings(null)){
  const {profile,visibility}=await exportView(db,actor,subject,withHours,settings)
  const args=[template.code,template.version,template.title]
  await db.query("INSERT INTO rms.cv_template_version VALUES(rms.current_tenant(),$1,$2,$3) ON CONFLICT DO NOTHING",args)
  const bound=await db.query("SELECT 1 FROM rms.cv_template_version WHERE code=$1 AND version=$2 AND title=$3",args)
  if(!bound.rowCount)throw new ConflictException("Tiêu đề mẫu đã đổi. Hãy kích hoạt phiên bản mới.")
  const id=randomUUID()
  const details=await readProfessional(db,actor,subject,settings)
  const fields=details.data,format=(d:string)=>d.split("-").reverse().join("/")
  const lines=[details.institution,fields.position,details.units.find(u=>u.id===fields.affiliation)?.name,fields.phone,fields.address,fields.gender,
    fields.birthDate&&format(fields.birthDate),...(fields.qualifications??[]).map(q=>(q.kind==="DEGREE"?"Học vị":"Học hàm")+" · "+q.name+" · "+q.year),
    ...(fields.jobs??[]).map(j=>j.place+" · "+format(j.from)+" – "+(j.to?format(j.to):"Đang công tác"))].filter((v):v is string=>!!v)
  const pdf=await renderProfile(profile,template,new Date(),lines)
  const auditId=await appendAudit(db,actor,"profile",subject,"EXPORT_CV",{exportId:id,...template})
  await db.query("INSERT INTO rms.cv_download(tenant_id,id,subject_id,creator_id,audit_id,code,version,pdf,visibility) VALUES(rms.current_tenant(),$1,$2,$3,$4,$5,$6,$7,$8)",[id,subject,actor.id,auditId,template.code,template.version,pdf,visibility])
  return {id,auditId,...template}
}
export async function downloadProfile(db:PoolClient,actor:SessionAccount,subject:string,id:string,withHours=false,settings=profileSettings(null)):Promise<Buffer>{
  const {rows:[row]}=await db.query<{pdf:Buffer; visibility:Visibility|null}>("SELECT pdf,visibility FROM rms.cv_download WHERE id=$1 AND subject_id=$2 AND creator_id=$3 AND expires_at>now()",[id,subject,actor.id])
  if(!row?.visibility)throw new NotFoundException()
  const current=await exportView(db,actor,subject,withHours,settings)
  if(!stillVisible(row.visibility,current.visibility))throw new NotFoundException()
  return row.pdf
}
