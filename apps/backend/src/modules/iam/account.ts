import { ConflictException, ForbiddenException } from "@nestjs/common"
import type { PoolClient } from "pg"
import type { operations } from "@rms/api-contracts"

export type SessionAccount = operations["getCurrentAccount"]["responses"][200]["content"]["application/json"]
export interface Identity { subject: string; email: string }

const staff = ["research.proposals","research.reviews","research.evaluations","councils.view","councils.manage",
  "meetings.view","meetings.manage","reports.view","reports.export","users.manage","notifications.send"]
const permissions = {
  user: ["meetings.view"],
  author: ["research.projects","research.proposals","meetings.view"],
  staff,
  admin: [...staff,"research.projects","meetings.report","meetings.settings","certificates.view","certificates.manage","catalog.manage"],
}

export async function resolveAccount(db: PoolClient, identity: Identity): Promise<SessionAccount> {
  const email = identity.email.trim().toLowerCase()
  // First login can race on two app servers. The database arbitrates the
  // unique identities. Never link a different subject by matching email.
  const inserted = await db.query(
    "INSERT INTO rms.account(tenant_id,issuer,subject,email) SELECT id,issuer,$1,$2 FROM rms.tenant WHERE id=rms.current_tenant() AND enabled ON CONFLICT DO NOTHING RETURNING id",
    [identity.subject,email],
  )
  const isNew = inserted.rowCount === 1
  if (!isNew) {
    try {
      const changed = await db.query(
        "UPDATE rms.account SET email=$2 WHERE subject=$1 AND email<>$2 AND is_active AND deleted_at IS NULL RETURNING id,unit_id",
        [identity.subject,email],
      )
      if (changed.rowCount) await db.query(
        "INSERT INTO rms.audit_log(tenant_id,actor_id,actor_unit_id,target_id,target_type,action) VALUES(rms.current_tenant(),$1,$2,$1,'account','EMAIL_SYNCHRONIZED')",
        [changed.rows[0].id,changed.rows[0].unit_id],
      )
    } catch (error) {
      if ((error as {code?:string}).code === "23505") throw new ConflictException("Địa chỉ email đã gắn với danh tính khác.")
      throw error
    }
  }
  const { rows: [row] } = await db.query(
    `SELECT id, email, user_type AS "userType", unit_id AS "unitId", is_active, deleted_at,
            is_profile_complete AS "isProfileComplete"
     FROM rms.account WHERE subject=$1 FOR SHARE`, [identity.subject],
  )
  if (!row) throw new ConflictException("Địa chỉ email đã gắn với danh tính khác.")
  if (!row.is_active || row.deleted_at) throw new ForbiddenException("Tài khoản đã ngừng truy cập.")
  if (isNew) await db.query(
    "INSERT INTO rms.audit_log(tenant_id,actor_id,target_id,target_type,action) VALUES(rms.current_tenant(),$1,$1,'account','ACCOUNT_PROVISIONED')", [row.id],
  )
  return {
    id: row.id, userType: row.userType, email: row.email, unitId: row.unitId,
    isProfileComplete: row.isProfileComplete, permissions: permissions[row.userType as SessionAccount["userType"]], isNew,
  }
}
