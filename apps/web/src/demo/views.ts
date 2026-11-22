import type { DemoRow, FeatureProps, Session } from "./types"
import { unitAllowed } from "./identity.ts"
import { callVisible, canReadProject } from "../features/intake/model.ts"
import { reviewerAccess, roundFor } from "../features/intake/reviews.ts"
import { eligible as acceptanceReviewer } from "../features/execution/acceptance.ts"
import { viewOutput } from "../features/execution/products.ts"
import { viewProfile } from "../features/execution/profiles.ts"
import { canRead } from "../features/extension/workflow.ts"
import { canReadHours } from "../features/extension/hours.ts"
import { configValue } from "./base-seed"

export function rowVisible(row: DemoRow, session: Session, rows: DemoRow[]) {
  const ctx = { session, rows, aiEnabled: false, e4Enabled: false }
  if (row.status === "DELETED") return false
  if (row.kind === "notice" || row.kind === "preferences") return row.owner === session.userId
  if (row.kind === "account" || row.kind === "upgrade")
    return row.owner === session.userId || session.role === "admin"
  if (row.kind === "call") return callVisible(ctx, row)
  if (row.kind === "project")
    return (
      canReadProject(ctx, row) ||
      (session.role === "reviewer" &&
        ((row.status === "UNDER_REVIEW" && reviewerAccess(ctx, row, roundFor(rows, row.id))) ||
          !!acceptanceReviewer(ctx, row)))
    )
  if (row.kind === "output") return viewOutput(ctx, row)
  if (row.kind === "profile") return viewProfile(ctx, row)
  if (
    ["upper-project", "student-project", "applied-project", "activity", "hours"].includes(row.kind)
  ) {
    if (configValue(rows, "FEATURE.E4") !== "true" || !unitAllowed(row, session, rows)) return false
    return row.kind === "hours" ? canReadHours(session, row) : canRead(session, row)
  }
  if (["config", "workflow", "channel-policy", "message-template"].includes(row.kind))
    return session.role === "admin"
  if (["ballot", "score"].includes(row.kind)) return row.owner === session.userId
  if (row.kind === "delivery")
    return (
      session.role === "admin" || (session.role === "officer" && unitAllowed(row, session, rows))
    )
  if (session.role === "admin" || session.role === "officer") return unitAllowed(row, session, rows)
  if (row.fields.projectId) {
    const project = rows.find(
      (r) => r.kind === "project" && r.id === row.fields.projectId && row.unit === r.unit,
    )
    return !!project && canReadProject(ctx, project)
  }
  return row.owner === session.userId
}
export function featureOf(row: DemoRow, session: Session) {
  if (row.kind === "project") {
    if (session.role === "admin") return "F01"
    if (row.status === "UNDER_REVIEW" && session.role === "researcher") return "F01"
    if (
      ["PASSED", "COMPLETED"].includes(row.status) &&
      session.role === "researcher" &&
      row.owner !== session.userId
    )
      return "F04"
    if (row.status === "APPROVED" && session.role === "officer") return "F04"
  }
  if (session.role === "admin" && ["report", "expense", "allocation"].includes(row.kind)) return ""
  if (
    ["expense", "allocation"].includes(row.kind) &&
    session.role !== "officer" &&
    row.owner !== session.userId
  )
    return ""
  if (row.kind === "project")
    return ["IN_PROGRESS", "SUSPENDED"].includes(row.status)
      ? "F04"
      : ["PENDING_ACCEPTANCE", "UNDER_ACCEPTANCE", "FAILED"].includes(row.status)
        ? "F06"
        : ["PASSED", "COMPLETED"].includes(row.status)
          ? "F05"
          : row.status === "UNDER_REVIEW"
            ? "F03"
            : "F01"
  const types: Record<string, string> = {
    call: "F02",
    report: "F04",
    output: "F07",
    profile: "F08",
    expense: "F05",
    allocation: "F05",
    account: "B03",
    config: "B01",
    workflow: "P01",
    notice: "B04",
    hours: "P03",
    "upper-project": "F09",
    "student-project": "F10",
    "applied-project": "F11",
    activity: "F12",
  }
  return types[row.kind]
}
export function sourceId(row: DemoRow) {
  return ["report", "expense", "allocation"].includes(row.kind)
    ? (row.fields.projectId ?? row.id)
    : row.id
}
export function dashboardTasks(p: FeatureProps, visible: DemoRow[]) {
  return visible
    .flatMap((r) => {
      let label = "",
        feature = "",
        id = r.id,
        date = ""
      if (
        r.kind === "report" &&
        r.status === "PENDING_SUBMISSION" &&
        r.owner === p.session.userId
      ) {
        label = "Nộp báo cáo tiến độ"
        feature = "F04"
        id = r.fields.projectId
        date = r.fields.dueDate
      }
      if (r.kind === "project" && r.status === "DRAFT" && r.owner === p.session.userId) {
        label = r.fields.code ? "Bổ sung thuyết minh" : "Hoàn thiện đề xuất"
        feature = "F01"
        date = p.rows.find((x) => x.id === r.fields.callId)?.fields.due ?? ""
      }
      if (p.session.role === "officer" && r.kind === "project" && r.status === "SUBMITTED") {
        label = "Kiểm tra hồ sơ"
        feature = "F01"
      }
      if (p.session.role === "officer" && r.kind === "project" && r.status === "APPROVED") {
        label = "Giao đề tài"
        feature = "F04"
      }
      if (
        p.session.role === "reviewer" &&
        r.kind === "project" &&
        ["UNDER_REVIEW", "UNDER_ACCEPTANCE"].includes(r.status)
      ) {
        const roundId = r.status === "UNDER_REVIEW" ? roundFor(p.rows, r.id)?.id : r.fields.roundId
        const sent = p.rows.some(
          (v) =>
            ["score", "ballot"].includes(v.kind) &&
            v.owner === p.session.userId &&
            v.fields.roundId === roundId &&
            v.status === "SUBMITTED",
        )
        if (!sent) {
          label = "Chấm phiếu hội đồng"
          feature = featureOf(r, p.session)
        }
      }
      if (p.session.role === "admin" && r.kind === "upgrade" && r.status === "PENDING") {
        label = "Xét yêu cầu nâng quyền"
        feature = "B03"
        id = "requests"
      }
      if (
        r.kind === "student-project" &&
        r.owner === p.session.userId &&
        r.status === "DRAFT" &&
        p.e4Enabled
      ) {
        label = "Hoàn thiện đăng ký"
        feature = "F10"
      }
      return label ? [{ id: r.id, title: r.title, detail: label, feature, target: id, date }] : []
    })
    .sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"))
}
