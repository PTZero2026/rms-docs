import {BadRequestException, ConflictException, ForbiddenException, NotFoundException} from "@nestjs/common"
import type {PoolClient} from "pg"
import type {operations} from "@rms/api-contracts"
import type {SessionAccount} from "../iam/account.js"
import {appendAudit} from "../audit/append.js"

type Template = operations["getNoticeTemplate"]["responses"][200]["content"]["application/json"]
export type TemplateDraft = operations["saveNoticeTemplate"]["requestBody"]["content"]["application/json"]
const conflict = () => new ConflictException("Mẫu hoặc ma trận đã thay đổi. Tải bản hiện hành trước khi lưu.")

function variablesFor(code:string) {
  const variables = ["event"]
  if (code !== "PROPOSAL_CALL_OPENED") variables.push("projectName","link")
  if (["PROGRESS_REPORT_DUE_SOON","PROGRESS_REPORT_OVERDUE"].includes(code)) variables.push("period","dueDate")
  if (["PROPOSAL_REVIEW_APPROVED","PROPOSAL_REVIEW_REJECTED","RESEARCH_OUTPUT_APPROVED","RESEARCH_OUTPUT_REJECTED","ACCEPTANCE_RESULT"].includes(code)) variables.push("result")
  return variables
}

export function validateNoticeTokens(value:string, code:string) {
  const names = variablesFor(code)
  const remainder = value.replace(/\{\{([a-zA-Z]+)\}\}/g, (_, name:string) => {
    if (!names.includes(name)) throw new BadRequestException("Biến không hợp lệ cho sự kiện này: "+name)
    return ""
  })
  if (remainder.includes("{{") || remainder.includes("}}")) throw new BadRequestException("Kiểm tra dấu ngoặc của biến.")
}

function draftFor(input:TemplateDraft, code:string) {
  if (!input || !Number.isSafeInteger(input.revision) || input.revision<0 ||
      Object.keys(input).some(name=>!["title","body","revision"].includes(name))) throw new BadRequestException("Kiểm tra phiên bản và nội dung mẫu.")
  if (input.title===null && input.body===null) return {title:null,body:null}
  if (typeof input.title!=="string" || !input.title.trim() || input.title.length>180 || /[\r\n]/.test(input.title) || input.title.includes("\u0000") ||
      typeof input.body!=="string" || !input.body.trim() || input.body.length>4000 || input.body.includes("\u0000"))
    throw new BadRequestException("Cần tiêu đề một dòng tối đa 180 ký tự và nội dung tối đa 4.000 ký tự.")
  validateNoticeTokens(input.title,code)
  validateNoticeTokens(input.body,code)
  return {title:input.title.trim(),body:input.body.trim()}
}

export async function readTemplate(db:PoolClient, actor:SessionAccount, code:string, channel:string):Promise<Template> {
  if (!["staff","admin"].includes(actor.userType)) throw new ForbiddenException()
  if (channel!=="in_app" && channel!=="smtp" && channel!=="sms") throw new NotFoundException()
  const {rows:[row]}=await db.query(`SELECT coalesce(r.revision,0) AS revision,
    CASE WHEN $2='smtp' THEN coalesce(r.mail_subject,k.default_title) WHEN $2='sms' THEN coalesce(r.sms_title,k.default_title) ELSE coalesce(r.title,k.default_title) END AS title,
    CASE WHEN $2='smtp' THEN coalesce(r.mail_body,k.default_mail_body) WHEN $2='sms' THEN coalesce(r.sms_body,k.default_sms_body) ELSE coalesce(r.body,k.default_body) END AS body
    FROM rms.notice_kind k LEFT JOIN rms.notice_rule r ON r.tenant_id=rms.current_tenant() AND r.code=k.code
    WHERE k.code=$1 AND ($2<>'sms' OR k.high_priority)`,[code,channel])
  if (!row) throw new NotFoundException()
  return {code,channel,title:row.body?row.title:null,body:row.body||null,revision:row.revision,variables:variablesFor(code)}
}

export async function previewTemplate(db:PoolClient, actor:SessionAccount, code:string, channel:string, input:TemplateDraft) {
  const template=await readTemplate(db,actor,code,channel)
  const draft=draftFor(input,code)
  if (draft.title===null) throw new BadRequestException("Nhập nội dung để xem trước.")
  const {rows:[kind]}=await db.query("SELECT default_title FROM rms.notice_kind WHERE code=$1",[template.code])
  const sample={event:kind.default_title,projectName:"Khảo sát nguồn nước",period:"2",dueDate:"15/12/2026",
    result:code==="ACCEPTANCE_RESULT"?"Đạt":code==="RESEARCH_OUTPUT_REJECTED"?"Cần điều chỉnh":code.endsWith("REJECTED")?"Không được duyệt":"Đã phê duyệt",link:"/app/truong-mau?project=ho-so-mau"}
  const {rows:[rendered]}=await db.query<{title:string;body:string}>(
    "SELECT rms.render_notice($1,$3) AS title,rms.render_notice($2,$3) AS body",[draft.title,draft.body,sample])
  return rendered
}

export async function saveTemplate(db:PoolClient, actor:SessionAccount, code:string, channel:string, input:TemplateDraft) {
  if (actor.userType!=="admin") throw new ForbiddenException()
  const before=await readTemplate(db,actor,code,channel)
  const after=draftFor(input,code)
  if (before.revision!==input.revision) throw conflict()
  const {rowCount}=await db.query(`INSERT INTO rms.notice_rule AS r(tenant_id,code,email,title,mail_subject,body,mail_body,sms_title,sms_body)
    SELECT rms.current_tenant(),k.code,true,
      CASE WHEN $2='in_app' THEN coalesce($3,k.default_title) ELSE k.default_title END,
      CASE WHEN $2='smtp' THEN coalesce($3,k.default_title) ELSE k.default_title END,
      CASE WHEN $2='in_app' THEN $4 END,CASE WHEN $2='smtp' THEN $4 END,
      CASE WHEN $2='sms' THEN $3 END,CASE WHEN $2='sms' THEN $4 END
    FROM rms.notice_kind k WHERE k.code=$1
    ON CONFLICT (tenant_id,code) DO UPDATE SET
      title=CASE WHEN $2='in_app' THEN excluded.title ELSE r.title END,
      mail_subject=CASE WHEN $2='smtp' THEN excluded.mail_subject ELSE r.mail_subject END,
      body=CASE WHEN $2='in_app' THEN excluded.body ELSE r.body END,
      mail_body=CASE WHEN $2='smtp' THEN excluded.mail_body ELSE r.mail_body END,
      sms_title=CASE WHEN $2='sms' THEN excluded.sms_title ELSE r.sms_title END,
      sms_body=CASE WHEN $2='sms' THEN excluded.sms_body ELSE r.sms_body END,
      revision=r.revision+1 WHERE r.revision=$5`,[code,channel,after.title,after.body??"",before.revision])
  if (!rowCount) throw conflict()
  await appendAudit(db,actor,"notification-policy",actor.id,"NOTICE_TEMPLATE_CHANGED",{code,channel,
    before:{title:before.title,body:before.body},after,revision:before.revision+1})
  return readTemplate(db,actor,code,channel)
}
