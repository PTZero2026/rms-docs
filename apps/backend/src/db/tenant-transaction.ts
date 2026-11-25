import type { Pool, PoolClient } from "pg"

// The caller supplies the tenant resolved from the authenticated request.
export async function withTenant<T>(
  pool: Pool,
  tenantId: string,
  operation: (db: PoolClient) => Promise<T>,
): Promise<T> {
  const db = await pool.connect()
  let discardConnection = false
  try {
    await db.query("BEGIN")
    await db.query("SELECT set_config('rms.tenant_id', $1::uuid::text, true)", [tenantId])
    const result = await operation(db)
    await db.query("COMMIT")
    return result
  } catch (error) {
    try {
      await db.query("ROLLBACK")
    } catch {
      discardConnection = true
    }
    throw error
  } finally {
    db.release(discardConnection)
  }
}
