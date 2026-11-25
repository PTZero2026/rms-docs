import { BadRequestException,NotFoundException } from "@nestjs/common"
import type { PoolClient } from "pg"
import type { operations } from "@rms/api-contracts"
import type { SessionAccount } from "../iam/account.js"
import { offset,projectAccess } from "../proposal/access.js"

type Page=operations["listInbox"]["responses"][200]["content"]["application/json"]
type Detail=operations["readNotice"]["responses"][200]["content"]["application/json"]
const titles:Record<string,string>={
  PROGRESS_REPORT_DUE_SOON:"Sắp đến hạn báo cáo tiến độ",PROGRESS_REPORT_OVERDUE:"Báo cáo tiến độ đã quá hạn",
  BUDGET_ALLOCATED:"Đã xác nhận kinh phí đề tài",BUDGET_ADJUSTED:"Đã điều chỉnh kinh phí đề tài",
  CALL_OPENED:"Kỳ nhận đề xuất đã mở","PROJECT.SUBMITTED":"Đã nộp đề xuất","PROJECT.DRAFT":"Đề xuất cần bổ sung",
  "PROJECT.APPROVED":"Đề tài đã được phê duyệt","PROJECT.REJECTED":"Kết quả xét duyệt đề xuất",
  "PROJECT.UNDER_REVIEW":"Đề tài đang xét duyệt","PROJECT.IN_PROGRESS":"Đề tài đang thực hiện",
  "PROJECT.SUSPENDED":"Đề tài đã tạm dừng","PROJECT.COMPLETED":"Đề tài đã hoàn thành"
}
function title(event:string){return Object.hasOwn(titles,event)?titles[event]:"Cập nhật hồ sơ nghiên cứu"}
const inboxSource=` FROM rms.notice n JOIN rms.outbox o ON (o.tenant_id,o.id)=(n.tenant_id,n.event_id)
  LEFT JOIN rms.delivery d ON (d.tenant_id,d.event_id,d.recipient_id)=(n.tenant_id,n.event_id,n.recipient_id) AND d.channel='in_app'
  LEFT JOIN LATERAL rms.delivery_copy(d.id) copy ON true
  WHERE n.recipient_id=$1`
export async function listInbox(db:PoolClient,a:SessionAccount,q:Record<string,unknown>):Promise<Page>{
  const filter=q.filter??"all"
  if(filter!=="all"&&filter!=="unread")throw new BadRequestException()
  const {rows:[page]}=await db.query(`WITH own AS MATERIALIZED (
    SELECT id,event_id,created_at,read_at FROM rms.notice WHERE recipient_id=$1
  ), page AS (
    SELECT * FROM own WHERE $2 OR read_at IS NULL ORDER BY created_at DESC,id DESC OFFSET $3 LIMIT 20
  ), items AS (
    SELECT p.id,p.created_at AS "createdAt",p.read_at AS "readAt",o.event_type AS event,copy.title
    FROM page p JOIN rms.outbox o ON o.tenant_id=rms.current_tenant() AND o.id=p.event_id
    LEFT JOIN rms.delivery d ON d.tenant_id=o.tenant_id AND d.event_id=o.id AND d.recipient_id=$1 AND d.channel='in_app'
    LEFT JOIN LATERAL rms.delivery_copy(d.id) copy ON true
  )
    SELECT count(*)::int AS total,count(*) FILTER(WHERE read_at IS NULL)::int AS unread,
      coalesce((SELECT jsonb_agg(to_jsonb(items) ORDER BY "createdAt" DESC,id DESC) FROM items),'[]'::jsonb) AS items FROM own`,
    [a.id,filter==="all",offset(q.skip)])
  return {...page,items:page.items.map((n:{id:string;event:string;title:string|null;createdAt:string;readAt:string|null})=>({id:n.id,title:n.title??title(n.event),createdAt:n.createdAt,readAt:n.readAt}))}
}
export async function readNotice(db:PoolClient,a:SessionAccount,id:string):Promise<Detail>{
  const {rows:[n]}=await db.query('SELECT n.id,n.created_at,n.read_at,o.event_type,o.target_id,o.payload,d.template_missing,copy.title AS display_title,copy.body AS rendered_body'+inboxSource+' AND n.id=$2 FOR UPDATE OF n',[a.id,id])
  if(!n)throw new NotFoundException()
  const readAt=n.read_at??(await db.query("UPDATE rms.notice SET read_at=now() WHERE id=$1 AND recipient_id=$2 AND read_at IS NULL RETURNING read_at",[id,a.id])).rows[0].read_at
  const project=await projectAccess(db,a,n.target_id).catch(error=>{if(error instanceof NotFoundException)return null;throw error})
  const subject=n.display_title??title(n.event_type)
  const due=n.payload?.dueDate, period=n.payload?.period
  const isReminder=["PROGRESS_REPORT_DUE_SOON","PROGRESS_REPORT_OVERDUE"].includes(n.event_type)
  let body=project && isReminder && Number.isInteger(period)&&typeof due==="string"&&/^\d{4}-\d\d-\d\d$/.test(due)
    ?project.title+" · Kỳ "+period+" · Hạn "+due.split("-").reverse().join("/"):(project?.title??subject)
  body=n.rendered_body??body
  if(project && !n.template_missing && n.event_type==="ROUND_CORRECTION_REQUESTED" && a.userType==="admin"){
    const {rows:[entry]}=await db.query(`SELECT h.reason,h.conclusion,r.kind FROM rms.round_amendment h
      JOIN rms.evaluation_round r ON (r.tenant_id,r.id)=(h.tenant_id,h.round_id)
      WHERE h.round_id=$1 AND h.revision=$2 AND r.project_id=$3 AND h.recipient_id=$4 AND h.action='REFER'
      AND NOT EXISTS(SELECT 1 FROM rms.project_member m WHERE m.project_id=r.project_id AND m.account_id=$4)`,
      [n.payload.roundId,n.payload.revision,project.id,a.id])
    if(entry && project.owner_id!==a.id)body=body+" · "+(entry.kind==="ACCEPTANCE"?"Nghiệm thu":"Xét duyệt")+" · Kết luận đã ghi "+
      (entry.conclusion==="PASSED"?"Đạt":"Không đạt")+" · Lý do đính chính: "+entry.reason
  }
  return {id:n.id,title:subject,body,createdAt:n.created_at.toISOString(),readAt:readAt.toISOString(),targetId:project?.id??null}
}
export async function readAll(db:PoolClient,a:SessionAccount){
  await db.query("UPDATE rms.notice SET read_at=now() WHERE recipient_id=$1 AND read_at IS NULL",[a.id])
}
