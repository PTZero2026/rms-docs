import {BadRequestException,ConflictException,ForbiddenException,NotFoundException} from "@nestjs/common"
import type {operations} from "@rms/api-contracts"
import type {PoolClient} from "pg"
import type {SessionAccount} from "../iam/account.js"
import {validateNoticeTokens} from "./templates.js"
import {appendAudit} from "../audit/append.js"

type Rule=operations["notificationPolicies"]["responses"][200]["content"]["application/json"][number]
type Preference=operations["saveNoticePreference"]["requestBody"]["content"]["application/json"]
type Input=operations["saveNoticeRule"]["requestBody"]["content"]["application/json"]
export async function preferences(db:PoolClient,a:SessionAccount) {
  return (await db.query<Rule>(`SELECT k.code,k.default_title AS label,k.mandatory,k.high_priority AS "highPriority",coalesce(r.email,true) AS email,
    (k.high_priority AND coalesce(r.sms,k.default_sms)) AS sms,coalesce(p.sms,true) AS "ownSms",
    (rms.sms_number(me.phone) IS NOT NULL) AS "hasPhone",coalesce(r.title,k.default_title) AS title,coalesce(r.mail_subject,k.default_title) AS "mailSubject",
    (k.mandatory OR coalesce(p.email,true)) AS "ownEmail",coalesce(r.revision,0) AS revision FROM rms.notice_kind k
    JOIN rms.account me ON me.id=$1 LEFT JOIN rms.notice_rule r ON r.code=k.code LEFT JOIN rms.notice_preference p ON p.code=k.code AND p.recipient_id=$1 ORDER BY k.code`,[a.id])).rows
}
export async function savePreference(db:PoolClient,a:SessionAccount,input:Preference) {
  if(!input||typeof input.code!=="string"||typeof input.email!=="boolean"||(input.sms!==undefined&&typeof input.sms!=="boolean"))throw new BadRequestException()
  const {rows:[kind]}=await db.query("SELECT mandatory,high_priority FROM rms.notice_kind WHERE code=$1",[input.code])
  if(!kind)throw new NotFoundException()
  if(kind.mandatory&&!input.email)throw new BadRequestException("Email của nhóm sự kiện này là bắt buộc.")
  if(input.sms&&!kind.high_priority)throw new BadRequestException("SMS chỉ dành cho sự kiện ưu tiên cao.")
  const changed=await db.query(`INSERT INTO rms.notice_preference(tenant_id,recipient_id,code,email,sms) VALUES(rms.current_tenant(),$1,$2,$3,coalesce($4,true))
    ON CONFLICT(tenant_id,recipient_id,code) DO UPDATE SET email=EXCLUDED.email,sms=coalesce($4,rms.notice_preference.sms)
    WHERE rms.notice_preference.email<>EXCLUDED.email OR rms.notice_preference.sms<>coalesce($4,rms.notice_preference.sms)`,[a.id,input.code,input.email,input.sms??null])
  if(changed.rowCount)await appendAudit(db,a,"account",a.id,"NOTIFICATION_PREFERENCE_CHANGED",{code:input.code,email:input.email,sms:input.sms})
  return preferences(db,a)
}
export async function saveRule(db:PoolClient,a:SessionAccount,input:Input){
  if(a.userType!=="admin")throw new ForbiddenException()
  const valid=(v:unknown)=>typeof v==="string"&&!!v.trim()&&v.length<=180&&!/[\r\n]/.test(v)
  if(!input||typeof input.code!=="string"||typeof input.email!=="boolean"||(input.sms!==undefined&&typeof input.sms!=="boolean")||!valid(input.title)||!valid(input.mailSubject)||!Number.isInteger(input.revision)||input.revision<0)
    throw new BadRequestException("Kiểm tra nhóm sự kiện, tiêu đề và phiên bản.")
  const {rows:[before]}=await db.query(`SELECT coalesce(r.email,true) AS email,coalesce(r.title,k.default_title) AS title,
    coalesce(r.mail_subject,k.default_title) AS "mailSubject",coalesce(r.sms,k.default_sms) AS sms,k.high_priority AS "highPriority" FROM rms.notice_kind k
    LEFT JOIN rms.notice_rule r ON r.tenant_id=rms.current_tenant() AND r.code=k.code WHERE k.code=$1`,[input.code])
  if(!before)throw new NotFoundException()
  if(input.sms&&!before.highPriority)throw new BadRequestException("SMS chỉ dành cho sự kiện ưu tiên cao.")
  validateNoticeTokens(input.title,input.code)
  validateNoticeTokens(input.mailSubject,input.code)
  const values=[input.code,input.email,input.title.trim(),input.mailSubject.trim(),input.sms??before.sms]
  const change=input.revision===0?
    await db.query("INSERT INTO rms.notice_rule(tenant_id,code,email,title,mail_subject,sms) VALUES(rms.current_tenant(),$1,$2,$3,$4,$5) ON CONFLICT DO NOTHING",values):
    await db.query("UPDATE rms.notice_rule SET email=$2,title=$3,mail_subject=$4,sms=$5,revision=revision+1 WHERE code=$1 AND revision=$6",[...values,input.revision])
  if(!change.rowCount)throw new ConflictException("Ma trận đã được cập nhật. Hãy tải lại.")
  await appendAudit(db,a,"notification-policy",a.id,"NOTIFICATION_POLICY_CHANGED",{code:input.code,email:input.email,revision:input.revision+1,
    before:{email:before.email,title:before.title,mailSubject:before.mailSubject,sms:input.sms===undefined?undefined:before.sms},
    after:{email:input.email,sms:input.sms,title:input.title.trim(),mailSubject:input.mailSubject.trim()}})
  return preferences(db,a)
}
