import type { DemoRow } from "./types"

export function sourceVersion(row: DemoRow) {
  return row.fields.sourceVersion || row.fields.revision || "1"
}

export function sourceAllowed(rows: DemoRow[], row: DemoRow) {
  const version = sourceVersion(row)
  const policy = rows.find(
    (r) =>
      r.kind === "config" &&
      r.fields.scope === "tenant" &&
      r.fields.key === "AI.SOURCE." + row.id &&
      r.status !== "DELETED" &&
      r.fields.active !== "false",
  )
  if (policy) return policy.fields.value === version
  return row.fields.aiAllowed === "true" && row.fields.aiGrantVersion === version
}
