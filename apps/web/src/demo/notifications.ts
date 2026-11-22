import type { DemoRow } from "./types"
export function inbox(rows: DemoRow[], userId: string) {
  return rows
    .filter((r) => r.kind === "notice" && r.owner === userId)
    .reverse()
    .sort((a, b) => (b.fields.at ?? "").localeCompare(a.fields.at ?? ""))
}
export const eventCatalog: Record<
  string,
  { title: string; important?: boolean; required?: boolean }
> = {
  PROPOSAL_CALL_OPENED: { title: "Kỳ nhận đề xuất đã mở" },
  PROPOSAL_RETURNED_FOR_REVISION: { title: "Đề xuất cần bổ sung", important: true, required: true },
  PROPOSAL_RECEIVED: { title: "Đã tiếp nhận đề xuất" },
  PROPOSAL_REVIEW_APPROVED: { title: "Đề xuất đã được phê duyệt", important: true, required: true },
  PROPOSAL_REVIEW_REJECTED: { title: "Có kết luận xét duyệt", important: true, required: true },
  PROJECT_ASSIGNED: { title: "Đề tài đã được giao", important: true },
  PROGRESS_REPORT_DUE_SOON: { title: "Sắp tới hạn báo cáo" },
  PROGRESS_REPORT_OVERDUE: { title: "Báo cáo đã quá hạn", important: true },
  BUDGET_ALLOCATION_DISBURSED: { title: "Đã ghi nhận cấp kinh phí" },
  BUDGET_RECONCILIATION_MISMATCHED: { title: "Khoản chi cần đối soát", important: true },
  ACCEPTANCE_SCHEDULED: { title: "Đã lập lịch nghiệm thu", important: true },
  ACCEPTANCE_RESULT: { title: "Có kết quả nghiệm thu", important: true, required: true },
  RESEARCH_OUTPUT_APPROVED: { title: "Sản phẩm khoa học đã được duyệt" },
  RESEARCH_OUTPUT_REJECTED: { title: "Sản phẩm cần bổ sung" },
}
export function channels(rows: DemoRow[], key: string, owner?: string) {
  const policy = rows.find((r) => r.kind === "channel-policy" && r.fields.event === key)
  const pref = rows.find(
    (r) => r.kind === "preferences" && r.fields.event === key && r.owner === owner,
  )
  return {
    email:
      policy?.fields.email !== "false" &&
      (eventCatalog[key]?.required || pref?.fields.email !== "false"),
    sms:
      !!eventCatalog[key]?.important &&
      policy?.fields.sms === "true" &&
      pref?.fields.sms !== "false",
  }
}
function eventFor(r: DemoRow) {
  if (r.kind === "project")
    return (
      {
        DRAFT: ["PROPOSAL_RETURNED_FOR_REVISION", "F01"],
        APPROVED: ["PROPOSAL_REVIEW_APPROVED", "F03"],
        REJECTED: ["PROPOSAL_REVIEW_REJECTED", "F03"],
        IN_PROGRESS: ["PROJECT_ASSIGNED", "F04"],
        UNDER_ACCEPTANCE: ["ACCEPTANCE_SCHEDULED", "F06"],
        PASSED: ["ACCEPTANCE_RESULT", "F06"],
        FAILED: ["ACCEPTANCE_RESULT", "F06"],
      } as Record<string, string[]>
    )[r.status]
  if (r.kind === "output" && ["APPROVED", "REJECTED"].includes(r.status))
    return ["RESEARCH_OUTPUT_" + r.status, "F07"]
  if (r.kind === "call" && r.status === "OPEN") return ["PROPOSAL_CALL_OPENED", "F02"]
  if (r.kind === "allocation" && ["DISBURSED", "CONFIRMED"].includes(r.status))
    return ["BUDGET_ALLOCATION_DISBURSED", "F05"]
  if (r.kind === "expense" && r.status === "MISMATCHED")
    return ["BUDGET_RECONCILIATION_MISMATCHED", "F05"]
}
export function eventNotices(before: DemoRow[], updates: DemoRow[], at: string): DemoRow[] {
  const result: DemoRow[] = []
  for (const row of updates) {
    const old = before.find((r) => r.id === row.id)
    if (old?.status === row.status || (!old && row.kind === "project")) continue
    const match = eventFor(row)
    if (!match) continue
    const [key, feature] = match,
      project = before.find((r) => r.id === row.fields.projectId)
    const owner = row.kind === "call" ? "mai" : (project?.owner ?? row.owner)
    if (
      updates.some(
        (r) =>
          r.kind === "notice" &&
          r.owner === owner &&
          (r.fields.targetId === row.id || r.fields.targetId === row.fields.projectId),
      )
    )
      continue
    const text =
      before.find((r) => r.kind === "message-template" && r.fields.event === key)?.fields.value ??
      eventCatalog[key].title
    const notice: DemoRow = {
      id: "notice-" + crypto.randomUUID(),
      kind: "notice",
      title: text.replaceAll("{ho_so}", row.title),
      status: "UNREAD",
      owner,
      unit: row.unit,
      fields: {
        text: row.title,
        event: key,
        feature,
        targetId: row.fields.projectId ?? row.id,
        at,
      },
    }
    result.push(notice)
    const ch = channels(before, key, owner)
    for (const [channel, enabled] of Object.entries(ch))
      if (enabled)
        result.push({
          ...notice,
          id: notice.id + "-" + channel,
          kind: "delivery",
          status: "SENT",
          fields: {
            ...notice.fields,
            channel: channel.toUpperCase(),
            recipient: owner,
            attempts: "1",
          },
        })
  }
  return result
}
