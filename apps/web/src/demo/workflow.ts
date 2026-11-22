import type { AuditEvent, DemoRow, Role, Session } from "./types"
export type Snapshot = { rows: DemoRow[]; audit: AuditEvent[] }
export type Edge = { from: string; to: string; roles: Role[]; reason?: boolean }
const staff: Role[] = ["officer"]
export const defaultEdges: Edge[] = [
  { from: "DRAFT", to: "SUBMITTED", roles: ["researcher"] },
  { from: "SUBMITTED", to: "DRAFT", roles: staff, reason: true },
  { from: "SUBMITTED", to: "UNDER_REVIEW", roles: staff },
  { from: "UNDER_REVIEW", to: "APPROVED", roles: staff },
  { from: "UNDER_REVIEW", to: "REJECTED", roles: staff },
  { from: "APPROVED", to: "IN_PROGRESS", roles: staff },
  { from: "IN_PROGRESS", to: "SUSPENDED", roles: staff },
  { from: "SUSPENDED", to: "IN_PROGRESS", roles: staff },
  { from: "IN_PROGRESS", to: "PENDING_ACCEPTANCE", roles: ["researcher"] },
  { from: "PENDING_ACCEPTANCE", to: "UNDER_ACCEPTANCE", roles: staff },
  { from: "UNDER_ACCEPTANCE", to: "PASSED", roles: staff },
  { from: "UNDER_ACCEPTANCE", to: "FAILED", roles: staff },
  { from: "FAILED", to: "IN_PROGRESS", roles: staff },
  { from: "PASSED", to: "COMPLETED", roles: staff },
  { from: "DRAFT", to: "CANCELLED", roles: ["researcher", "officer"], reason: true },
  { from: "SUBMITTED", to: "CANCELLED", roles: ["researcher", "officer"], reason: true },
]
export function validateGraph(edges: Edge[]) {
  const semantics = new Set(defaultEdges.flatMap((e) => [e.from, e.to]))
  const roles = new Set(["researcher", "officer", "reviewer", "student", "admin", "user"])
  if (
    !edges.length ||
    edges.some(
      (e) =>
        !semantics.has(e.from) ||
        !semantics.has(e.to) ||
        !e.roles?.length ||
        e.roles.some((role) => !roles.has(role)) ||
        e.from === e.to,
    )
  )
    throw new Error("Mỗi bước cần trạng thái chuẩn, bước đích và vai trò xử lý.")
  const keys = edges.map((e) => e.from + "→" + e.to)
  if (new Set(keys).size !== keys.length) throw new Error("Có hai chuyển bước trùng nhau.")
  const seen = new Set(["DRAFT"])
  for (let n = 0; n < edges.length; n++)
    for (const edge of edges) if (seen.has(edge.from)) seen.add(edge.to)
  if (edges.some((e) => !seen.has(e.from))) throw new Error("Có bước không đi tới được từ Nháp.")
  const terminal = new Set(
    ["COMPLETED", "REJECTED", "CANCELLED"].filter((status) => seen.has(status)),
  )
  if (!terminal.size) throw Error("Cần ít nhất một kết thúc có thể đi tới từ Nháp.")
  for (let n = 0; n < edges.length; n++)
    for (const edge of edges) if (terminal.has(edge.to)) terminal.add(edge.from)
  if ([...seen].some((status) => !terminal.has(status)))
    throw Error("Có bước không dẫn tới trạng thái kết thúc.")
}
export function applyTransaction(
  state: Snapshot,
  session: Session,
  action: string,
  updates: DemoRow[],
  subject?: DemoRow,
): Snapshot {
  const original = new Map(state.rows.map((row) => [row.id, row]))
  const primary = subject ?? updates[0]
  if (!primary) throw new Error("Vui lòng chọn hồ sơ.")
  const active = state.rows.find((row) => row.kind === "workflow" && row.status === "ACTIVE")
  for (const next of updates) {
    let record = next
    if (next.kind === "project") {
      const old = original.get(next.id)
      const version = old?.fields.workflowVersion ?? active?.fields.version ?? "v1"
      if (old && old.status !== next.status) {
        const template = state.rows.find(
          (r) => r.kind === "workflow" && r.fields.version === version,
        )
        const edges: Edge[] = template ? JSON.parse(template.fields.edges) : defaultEdges
        const edge = edges.find((e) => e.from === old.status && e.to === next.status)
        if (!edge || !edge.roles.includes(session.role))
          throw new Error("Vai trò hoặc bước hiện tại chưa cho phép thao tác này.")
        if (
          edge.reason &&
          !Object.entries(next.fields).some(
            ([k, v]) => /reason|comment|note|feedback|revision/i.test(k) && v.trim(),
          )
        )
          throw new Error("Nhập lý do để chuyển bước.")
      }
      record = { ...next, fields: { ...next.fields, workflowVersion: version } }
    }
    original.set(record.id, record)
  }
  const before = new Map(state.rows.map((row) => [row.id, row]))
  const subjects = new Map([[primary.id, primary]])
  for (const next of updates) {
    const prior = before.get(next.id)
    if (prior && prior.status !== next.status && next.kind === "project")
      subjects.set(next.id, next)
  }
  const at = new Date().toISOString()
  const events: AuditEvent[] = [...subjects.values()].map((row) => {
    const beforeRow = before.get(row.id)
    const afterRow = original.get(row.id)
    const explanation = Object.entries(afterRow?.fields ?? {}).find(
      ([key, value]) =>
        /^(reason|comment|returnReason|revisionNote)$/i.test(key) &&
        value.trim() &&
        value !== beforeRow?.fields[key],
    )
    return {
      id: crypto.randomUUID(),
      at,
      actor: session.name,
      actorId: session.userId,
      workflowVersion: afterRow?.fields.workflowVersion,
      reason: explanation?.[1],
      unit: session.unit,
      recordId: row.id,
      title: row.title,
      action,
      from: before.get(row.id)?.status,
      to: afterRow?.status,
    }
  })
  return { rows: [...original.values()], audit: [...state.audit, ...events] }
}
