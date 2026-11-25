import {calendarDay as day} from "@rms/api-contracts/teaching-calendar"
import {BadRequestException,ConflictException,ForbiddenException,NotFoundException} from "@nestjs/common"
import type {operations} from "@rms/api-contracts"
import type {PoolClient} from "pg"
import {visiblePerson} from "../../profile/export-profile/data.js"
import type {SessionAccount} from "../../iam/account.js"
import {appendAudit} from "../../audit/append.js"

export type Formula=operations["publishTeachingFormula"]["requestBody"]["content"]["application/json"]
export type Adjustment=operations["adjustTeachingHours"]["requestBody"]["content"]["application/json"]
type Ledger=operations["getPersonHours"]["responses"][200]["content"]["application/json"]
const validCode=(s:unknown)=>typeof s==="string"&&/^[-A-Za-z0-9_.]{1,80}$/.test(s)
export async function listFormulas(db:PoolClient,a:SessionAccount){
  if(!["admin","staff"].includes(a.userType))throw new ForbiddenException()
  return (await db.query<Formula>(`SELECT kind,category,role,period_type AS "periodType",valid_from::text AS "from",valid_to::text AS "to",hours::text,version,min_vnd::text AS "minVnd",max_vnd::text AS "maxVnd" FROM rms.hour_formula ORDER BY kind,category,role,valid_from,min_vnd`)).rows
}
export async function publishFormula(db:PoolClient,a:SessionAccount,f:Formula){
  if(a.userType!=="admin")throw new ForbiddenException()
  if(!f||!["activity","upper-project","applied-project","student-project","product"].includes(f.kind)||![f.category,f.role,f.version].every(validCode)||!["ACADEMIC_YEAR","FISCAL_YEAR"].includes(f.periodType)||
    !day(f.from)||!day(f.to)||f.to<f.from||typeof f.hours!=="string"||!/^\d{1,9}(\.\d{1,2})?$/.test(f.hours))throw new BadRequestException("Định mức hoặc khoảng hiệu lực chưa hợp lệ.")
  const min=f.minVnd===undefined?"0":f.minVnd,max=f.maxVnd??null
  const money=(v:unknown):v is string=>typeof v==="string"&&/^\d{1,18}$/.test(v)
  if(!money(min)||max!==null&&(!money(max)||BigInt(max)<=BigInt(min))||f.kind!=="applied-project"&&(BigInt(min)!==0n||max!==null))
    throw new BadRequestException("Kiểm tra cận dưới và cận trên của khoảng kinh phí F11.")
  const key=[f.kind,f.category,f.role,f.periodType]
  await db.query("SELECT pg_advisory_xact_lock(hashtextextended(rms.current_tenant()::text||$1,0))",[JSON.stringify(key)])
  const collision=await db.query(`SELECT FROM rms.hour_formula WHERE (kind,category,role,period_type)=($1,$2,$3,$4)
    AND ((version=$7 AND min_vnd=$8::bigint) OR (valid_from<=$6::date AND valid_to>=$5::date
      AND (max_vnd IS NULL OR max_vnd>$8::bigint) AND ($9::bigint IS NULL OR min_vnd<$9::bigint)))`,[...key,f.from,f.to,f.version,min,max])
  if(collision.rowCount)throw new ConflictException("Phiên bản hoặc khoảng hiệu lực bị trùng.")
  const {rows:[created]}=await db.query("INSERT INTO rms.hour_formula(tenant_id,kind,category,role,period_type,valid_from,valid_to,hours,version,min_vnd,max_vnd) VALUES(rms.current_tenant(),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id",[...key,f.from,f.to,f.hours,f.version,min,max])
  await appendAudit(db,a,"hour-formula",created.id,"HOUR_FORMULA_PUBLISHED",{...f})
  return f
}
export async function enqueueApproved(db:PoolClient,kind:string,id:string){
  await db.query(`INSERT INTO rms.hour_request(tenant_id,source_id,source_revision,unit_id,kind,category,source_date,recipient,role,share)
    SELECT e.tenant_id,e.id,e.revision,e.unit_id,e.kind,e.category,e.source_date,participant.id,participant.role,participant.share
    FROM rms.extension_entry e CROSS JOIN LATERAL (
      SELECT e.owner_id AS id,CASE WHEN e.kind='activity' THEN 'LECTURER' ELSE 'PRINCIPAL' END AS role,
        100-coalesce(sum(m.share),0)::int AS share FROM rms.extension_member m WHERE (m.tenant_id,m.entry_id)=(e.tenant_id,e.id)
      UNION ALL
      SELECT m.account_id,'MEMBER',m.share FROM rms.extension_member m WHERE (m.tenant_id,m.entry_id)=(e.tenant_id,e.id)
    ) participant WHERE e.id=$1 AND e.kind=$2 AND e.status='APPROVED' ON CONFLICT DO NOTHING`,[id,kind])
}
export async function enqueueAppliedHours(db:PoolClient,id:string){
  await db.query(`INSERT INTO rms.hour_request(tenant_id,source_id,source_revision,unit_id,kind,category,source_date,recipient,role,share,amount_vnd)
    SELECT p.tenant_id,p.id,p.approval_revision,p.unit_id,'applied-project',p.category,
      CASE WHEN p.hour_trigger='ON_RESULT_APPROVED' THEN p.result_date ELSE (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date END,
      contributor.id,contributor.role,contributor.share,p.total_budget_vnd
    FROM rms.applied_project p CROSS JOIN LATERAL (
      SELECT p.owner_id AS id,'PRINCIPAL' AS role,100-coalesce(sum(m.share),0)::int AS share
        FROM rms.applied_member m WHERE (m.tenant_id,m.project_id)=(p.tenant_id,p.id)
      UNION ALL SELECT m.account_id,m.role,m.share FROM rms.applied_member m WHERE (m.tenant_id,m.project_id)=(p.tenant_id,p.id)
    ) contributor WHERE p.id=$1 AND p.status='APPROVED' AND p.approval_revision IS NOT NULL AND
      ((p.hour_trigger='ON_PROJECT_APPROVED' AND p.approval_revision=p.revision) OR
       (p.hour_trigger='ON_RESULT_APPROVED' AND p.result_status='CONFIRMED')) ON CONFLICT DO NOTHING`,[id])
}
export async function enqueueStudentHours(db:PoolClient,id:string){
  await db.query(`INSERT INTO rms.hour_request(tenant_id,source_id,source_revision,unit_id,kind,category,source_date,recipient,role,share)
    SELECT tenant_id,id,revision,unit_id,'student-project',hour_category,acceptance_date,mentor_id,'MENTOR',100
    FROM rms.student_project WHERE id=$1 AND status='COMPLETED' AND hours_requested
    ON CONFLICT(tenant_id,kind,source_id,source_revision,recipient,role) DO NOTHING`,[id])
}
const totals=`WITH visible AS (SELECT r.id,r.hours,q.source_id,q.source_date,q.role,q.share,r.period_type,r.period_code,f.version,coalesce(e.title,p.title,s.title,o.title) AS title,
 r.hours+coalesce((SELECT sum(d.delta) FROM rms.hour_adjustment d WHERE (d.tenant_id,d.record_id)=(r.tenant_id,r.id)),0) AS adjusted
 FROM rms.hour_record r JOIN rms.hour_request q ON (q.tenant_id,q.id)=(r.tenant_id,r.request_id)
 JOIN rms.hour_formula f ON (f.tenant_id,f.id)=(r.tenant_id,r.formula_id)
 LEFT JOIN rms.extension_entry e ON (e.tenant_id,e.id)=(q.tenant_id,q.extension_id)
 LEFT JOIN rms.applied_project p ON (p.tenant_id,p.id)=(q.tenant_id,q.applied_id)
 LEFT JOIN rms.student_project s ON (s.tenant_id,s.id)=(q.tenant_id,q.student_id)
 LEFT JOIN rms.research_output o ON (o.tenant_id,o.id)=(q.tenant_id,q.product_id)
 WHERE q.recipient=$1 AND ($2 OR q.unit_id=$3)) `
export async function personHours(db:PoolClient,a:SessionAccount,id:string):Promise<Ledger>{
  await visiblePerson(db,a,id)
  const params=[id,a.id===id||a.userType==="admin",a.unitId]
  const items=await db.query<Ledger["items"][number]>(totals+'SELECT id,source_id AS "sourceId",title,source_date::text AS date,role,share,hours::text,adjusted::numeric(14,2)::text,version,period_code AS period FROM visible ORDER BY source_date DESC,id',params)
  const periods=await db.query<Ledger["periods"][number]>(totals+"SELECT period_type AS type,period_code AS code,sum(adjusted)::numeric(18,2)::text AS total FROM visible GROUP BY period_type,period_code ORDER BY period_code DESC",params)
  return {items:items.rows,periods:periods.rows}
}
export async function adjustHours(db:PoolClient,a:SessionAccount,id:string,cmd:Adjustment){
  if(!["staff","admin"].includes(a.userType))throw new ForbiddenException()
  if(!cmd||typeof cmd.id!=="string"||!/^([a-f\d]{8})(-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(cmd.id)||typeof cmd.delta!=="string"||!/^[-]?\d{1,8}(\.\d{1,2})?$/.test(cmd.delta)||Number(cmd.delta)===0||
    typeof cmd.reason!=="string"||!cmd.reason.trim()||cmd.reason.length>2000)throw new BadRequestException("Cần số giờ điều chỉnh và lý do.")
  await db.query("SELECT pg_advisory_xact_lock(hashtextextended(rms.current_tenant()::text||$1,0))",[id])
  const {rows:[row]}=await db.query(`SELECT q.recipient,q.revoked_at,r.hours FROM rms.hour_record r JOIN rms.hour_request q ON (q.tenant_id,q.id)=(r.tenant_id,r.request_id)
    WHERE r.id=$1 AND ($2='admin' OR q.unit_id=$3)`,[id,a.userType,a.unitId])
  if(!row)throw new NotFoundException()
  await visiblePerson(db,a,row.recipient)
  const prior=await db.query("SELECT record_id=$2 AND delta=$3::numeric AND actor_id=$4 AND reason=$5 AS same FROM rms.hour_adjustment WHERE id=$1",[cmd.id,id,cmd.delta,a.id,cmd.reason.trim()])
  if(prior.rowCount){if(!prior.rows[0].same)throw new ConflictException("Mã điều chỉnh đã được dùng.");return personHours(db,a,row.recipient)}
  if(row.revoked_at)throw new ConflictException("Nguồn giờ giảng đã được thu hồi.")
  const ok=await db.query("SELECT $1::numeric+coalesce(sum(delta),0)+$2::numeric>=0 AS valid FROM rms.hour_adjustment WHERE record_id=$3",[row.hours,cmd.delta,id])
  if(!ok.rows[0].valid)throw new BadRequestException("Tổng sau điều chỉnh phải từ 0 trở lên.")
  await db.query("INSERT INTO rms.hour_adjustment(tenant_id,id,record_id,delta,reason,actor_id) VALUES(rms.current_tenant(),$1,$2,$3,$4,$5)",[cmd.id,id,cmd.delta,cmd.reason.trim(),a.id])
  await appendAudit(db,a,"teaching-hour",id,"TEACHING_HOURS_ADJUSTED",{adjustment:cmd.id,delta:cmd.delta,reason:cmd.reason.trim()})
  return personHours(db,a,row.recipient)
}
