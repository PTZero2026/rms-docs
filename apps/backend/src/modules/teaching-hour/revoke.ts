import type {PoolClient} from "pg"
import type {SessionAccount} from "../iam/account.js"
import {appendAudit} from "../audit/append.js"

export async function revokeSourceHours(db:PoolClient,actor:SessionAccount,kind:string,source:string,revision:number,reason:string){
  // The worker locks the same request before posting a record. Once this update
  // returns, a preceding worker has committed, or a later worker will skip it.
  const requests=await db.query<{id:string}>(`UPDATE rms.hour_request SET revoked_at=now(),revoked_by=$4,
    revocation_reason=$5,processed_at=coalesce(processed_at,now()) WHERE kind=$1 AND source_id=$2
    AND source_revision=$3 AND revoked_at IS NULL RETURNING id`,[kind,source,revision,actor.id,reason])
  if(!requests.rowCount)return
  const records=await db.query<{id:string}>("SELECT id FROM rms.hour_record WHERE request_id=ANY($1::uuid[]) ORDER BY id",[requests.rows.map(q=>q.id)])
  for(const record of records.rows){
    await db.query("SELECT pg_advisory_xact_lock(hashtextextended(rms.current_tenant()::text||$1,0))",[record.id])
    const changed=await db.query(`WITH net AS (
        SELECT r.hours+coalesce(sum(a.delta),0) AS hours FROM rms.hour_record r LEFT JOIN rms.hour_adjustment a
          ON (a.tenant_id,a.record_id)=(r.tenant_id,r.id) WHERE r.id=$1 GROUP BY r.hours)
      INSERT INTO rms.hour_adjustment(tenant_id,id,record_id,actor_id,delta,reason)
      SELECT rms.current_tenant(),gen_random_uuid(),$1,$2,-hours,$3 FROM net WHERE hours<>0 RETURNING id,delta`,[record.id,actor.id,reason])
    await appendAudit(db,actor,"teaching-hour",record.id,"TEACHING_HOURS_REVOKED",{source,revision,reason,adjustment:changed.rows[0]?.id??null,delta:changed.rows[0]?.delta??"0.00"})
  }
}
