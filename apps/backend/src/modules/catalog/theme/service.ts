import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common"
import type { PoolClient } from "pg"
import type { operations } from "@rms/api-contracts"
import { defaultTheme, themeIssues } from "@rms/api-contracts/theme"
import { appendAudit } from "../../audit/append.js"
import type { SessionAccount } from "../../iam/account.js"

type Active = operations["getActiveTheme"]["responses"][200]["content"]["application/json"]
type Editor = operations["getThemeEditor"]["responses"][200]["content"]["application/json"]
export type Save = operations["saveThemeDraft"]["requestBody"]["content"]["application/json"]
export type Apply = operations["publishTheme"]["requestBody"]["content"]["application/json"]
export type Rollback = operations["rollbackTheme"]["requestBody"]["content"]["application/json"]
const fallback = { revision: 1, tokens: defaultTheme }
function admin(actor:SessionAccount) {
  if (actor.userType!=="admin") throw new ForbiddenException()
}
export async function getActive(db:PoolClient):Promise<Active> {
  return (await db.query("SELECT revision,tokens FROM rms.theme_release ORDER BY revision DESC LIMIT 1")).rows[0] ?? fallback
}
export async function getEditor(db:PoolClient,actor:SessionAccount):Promise<Editor> {
  admin(actor)
  const { rows: [snapshot] } = await db.query(`
    SELECT (SELECT jsonb_build_object('revision',revision,'tokens',tokens) FROM rms.theme_release ORDER BY revision DESC LIMIT 1) AS active,
           (SELECT jsonb_agg(revision ORDER BY revision DESC) FROM rms.theme_release) AS revisions,
           (SELECT jsonb_build_object('serial',serial,'basedOn',based_on,'tokens',tokens) FROM rms.theme_draft) AS draft`)
  return { active:snapshot.active??fallback, history:[...(snapshot.revisions??[]),1], draft:snapshot.draft }
}
async function lockEditor(db:PoolClient,actor:SessionAccount,revision:number) {
  admin(actor)
  if (!Number.isSafeInteger(revision) || revision<1) throw new BadRequestException("Phiên bản không hợp lệ.")
  await db.query("SELECT pg_advisory_xact_lock(hashtextextended(rms.current_tenant()::text,2))")
  const editor = await getEditor(db,actor)
  if (editor.active.revision!==revision) throw new ConflictException("Giao diện đã thay đổi. Hãy tải lại.")
  return editor
}
export async function saveDraft(db:PoolClient,actor:SessionAccount,input:Save) {
  const editor = await lockEditor(db,actor,input?.expectedRevision)
  if ((editor.draft?.serial??0)!==input.expectedDraft) throw new ConflictException("Nháp đã thay đổi.")
  const invalid = themeIssues(input.tokens)
  if (invalid.length) throw new BadRequestException({message:"Kiểm tra lại các trường giao diện.",fields:invalid})
  await db.query(`INSERT INTO rms.theme_draft(tenant_id,serial,based_on,tokens,actor_id)
    VALUES(rms.current_tenant(),$1,$2,$3,$4) ON CONFLICT(tenant_id) DO UPDATE
    SET serial=excluded.serial,based_on=excluded.based_on,tokens=excluded.tokens,actor_id=excluded.actor_id`,
    [input.expectedDraft+1,input.expectedRevision,input.tokens,actor.id])
  return getEditor(db,actor)
}
async function release(db:PoolClient,actor:SessionAccount,active:Active,source:number|null) {
  const {rows:[row]} = await db.query(`INSERT INTO rms.theme_release(tenant_id,revision,tokens,source_revision,actor_id)
    VALUES(rms.current_tenant(),$1,$2,$3,$4) RETURNING tenant_id`,[active.revision,active.tokens,source,actor.id])
  await appendAudit(db,actor,"theme",row.tenant_id,source===null?"THEME_APPLIED":"THEME_ROLLED_BACK",{revision:active.revision,source})
  return active
}
export async function applyDraft(db:PoolClient,actor:SessionAccount,input:Apply):Promise<Active> {
  const {draft} = await lockEditor(db,actor,input?.expectedRevision)
  if (!draft || draft.serial!==input.expectedDraft || draft.basedOn!==input.expectedRevision) throw new ConflictException("Nháp không còn khớp với bản hiện hành.")
  await db.query("DELETE FROM rms.theme_draft")
  return release(db,actor,{revision:input.expectedRevision+1,tokens:draft.tokens},null)
}
export async function rollbackTheme(db:PoolClient,actor:SessionAccount,input:Rollback):Promise<Active> {
  await lockEditor(db,actor,input?.expectedRevision)
  if (!Number.isSafeInteger(input.sourceRevision) || input.sourceRevision<1 || input.sourceRevision>=input.expectedRevision) throw new BadRequestException("Chọn một phiên bản trước đó.")
  const previous = input.sourceRevision===1 ? fallback : (await db.query("SELECT tokens FROM rms.theme_release WHERE revision=$1",[input.sourceRevision])).rows[0]
  if(!previous) throw new NotFoundException()
  return release(db,actor,{revision:input.expectedRevision+1,tokens:previous.tokens},input.sourceRevision)
}
