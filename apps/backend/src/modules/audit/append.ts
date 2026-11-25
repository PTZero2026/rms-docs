import type { PoolClient } from "pg"
import type { SessionAccount } from "../iam/account.js"

export async function appendAudit(db: PoolClient, actor: SessionAccount, targetType: string, targetId: string,
  action: string, details: Record<string,unknown> = {}): Promise<string> {
  const {rows:[entry]} = await db.query(
    `INSERT INTO rms.audit_log(tenant_id,actor_id,actor_unit_id,target_id,target_type,action,details)
     VALUES(rms.current_tenant(),$1,$2,$3,$4,$5,$6) RETURNING id`,
    [actor.id,actor.unitId,targetId,targetType,action,details],
  )
  return entry.id
}
