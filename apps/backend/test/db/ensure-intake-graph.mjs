import { defaultWorkflow } from "@rms/api-contracts/workflow"
import { activateGraph } from "../../dist/modules/workflow/kernel.js"

export async function ensureIntakeGraph(db,admin) {
  await db.query("SELECT pg_advisory_xact_lock(hashtextextended(rms.current_tenant()::text,1))")
  const {rowCount}=await db.query("SELECT 1 FROM rms.workflow_active")
  if (!rowCount) await activateGraph(db,admin,defaultWorkflow(),0)
}
