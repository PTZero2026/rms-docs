import { BadRequestException,ConflictException,ForbiddenException,NotFoundException } from "@nestjs/common"
import type { PoolClient } from "pg"
import type { operations } from "@rms/api-contracts"
import type { SessionAccount } from "../../iam/account.js"

type Filters=operations["getCallReportFilters"]["responses"][200]["content"]["application/json"]
type Snapshot=operations["getCallReport"]["responses"][200]["content"]["application/json"]
type Input=operations["generateCallReport"]["requestBody"]["content"]["application/json"]
const uuid=/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i
async function scope(db:PoolClient,actor:SessionAccount) {
  if(!actor.permissions.includes("reports.view"))throw new ForbiddenException()
  return (await db.query<Filters["units"][number]>(`SELECT u.id,u.name AS label FROM rms.unit u WHERE $1='admin' OR u.id=$2 OR EXISTS
    (SELECT 1 FROM rms.report_unit_grant g WHERE (g.tenant_id,g.unit_id)=(u.tenant_id,u.id) AND g.account_id=$3) ORDER BY u.name,u.id`,[actor.userType,actor.unitId,actor.id])).rows
}
export async function reportFilters(db:PoolClient,actor:SessionAccount):Promise<Filters>{
  const units=await scope(db,actor)
  const calls=await db.query("SELECT id,code || ' · ' || name AS label FROM rms.proposal_call ORDER BY start_date DESC,code")
  return {calls:calls.rows,units}
}
export async function createReport(db:PoolClient,actor:SessionAccount,input:Input):Promise<Snapshot>{
  const units=await scope(db,actor)
  if(!uuid.test(input?.callId??"") || (input.unitId!==undefined&&!uuid.test(input.unitId)))throw new BadRequestException()
  if(input.unitId&&!units.some(u=>u.id===input.unitId))throw new ForbiddenException("Đơn vị ngoài phạm vi báo cáo.")
  const selected=input.unitId?units.filter(u=>u.id===input.unitId):units
  const {rows:[report]}=await db.query(`INSERT INTO rms.call_report_snapshot(tenant_id,account_id,call_id,call_code,unit_ids,unit_labels,entries)
    SELECT c.tenant_id,$1,c.id,c.code,$3::uuid[],$4::text[],COALESCE((SELECT jsonb_agg(jsonb_build_object('id',p.id,'code',p.project_code,
      'title',p.title,'unitId',u.id,'unit',u.name,'semantic',p.status_semantic) ORDER BY p.project_code,p.id)
      FROM rms.research_project p JOIN rms.unit u ON (u.tenant_id,u.id)=(p.tenant_id,p.unit_id)
      WHERE (p.tenant_id,p.call_id)=(c.tenant_id,c.id) AND p.project_code IS NOT NULL AND p.unit_id=ANY($3::uuid[])),'[]'::jsonb)
    FROM rms.proposal_call c WHERE c.id=$2 RETURNING id`,[actor.id,input.callId,selected.map(u=>u.id),selected.map(u=>u.label)])
  if(!report)throw new NotFoundException()
  return readReport(db,actor,report.id)
}
export async function readReport(db:PoolClient,actor:SessionAccount,id:string):Promise<Snapshot>{
  const allowed=(await scope(db,actor)).map(u=>u.id)
  const {rows:[s]}=await db.query(`SELECT s.id,s.call_id,s.call_code,s.captured_at,s.unit_ids,s.unit_labels,s.entries,s.unit_ids<@$3::uuid[] AND NOT EXISTS
    (SELECT 1 FROM jsonb_array_elements(s.entries) row LEFT JOIN rms.research_project p ON p.tenant_id=s.tenant_id AND p.id=(row->>'id')::uuid
     WHERE p.id IS NULL OR NOT(p.unit_id=ANY($3::uuid[]))) AS permitted
    FROM rms.call_report_snapshot s WHERE s.id=$1 AND s.account_id=$2`,[id,actor.id,allowed])
  if(!s)throw new NotFoundException()
  if(!s.permitted)throw new ConflictException("Phạm vi đã thay đổi. Hãy tạo bản chụp mới.")
  const rows=s.entries as Snapshot["rows"],groups:Record<string,number>={}
  for(const row of rows)groups[row.semantic]=(groups[row.semantic]??0)+1
  return {id,callId:s.call_id,callCode:s.call_code,capturedAt:s.captured_at.toISOString(),units:s.unit_labels,unitIds:s.unit_ids,total:rows.length,groups,rows}
}
function csvCell(content:string){
  // Spreadsheet programs interpret formula prefixes even in quoted CSV fields.
  const safe=/^[\s\uFEFF]*[=+@-]|^[\t\r\n]/u.test(content)?"'"+content:content
  return '"'+safe.replaceAll('"','""')+'"'
}
export async function exportReport(db:PoolClient,actor:SessionAccount,id:string){
  if(!actor.permissions.includes("reports.export"))throw new ForbiddenException()
  const s=await readReport(db,actor,id)
  const lines=[
    ["Kỳ",s.callCode],["Trích xuất (UTC)",s.capturedAt],["Phạm vi",...s.units],["Tổng số",String(s.total)],
    ["Mã bản chụp",s.id],["Trạng thái chuẩn","Số hồ sơ"],
    ...Object.entries(s.groups).map(([state,count])=>[state,String(count)]),
    [],["Mã đề tài","Tên đề tài","Đơn vị","Trạng thái chuẩn","Định danh đề tài"],
    ...s.rows.map(r=>[r.code,r.title,r.unit,r.semantic,r.id]),
  ]
  return "\uFEFF"+lines.map(line=>line.map(csvCell).join(",")).join("\r\n")+"\r\n"
}
