import test from "node:test"
import assert from "node:assert/strict"
import { applyTransaction, defaultEdges, validateGraph } from "./workflow.ts"
const session = {
  tenant: "tlu",
  role: "researcher",
  userId: "mai",
  name: "Lê Thanh Mai",
  unit: "Khoa Công trình",
}
const row = {
  id: "a",
  kind: "project",
  title: "Quan trắc",
  owner: "mai",
  unit: session.unit,
  status: "DRAFT",
  fields: { workflowVersion: "v1" },
}
const template = {
  ...row,
  kind: "workflow",
  id: "wf-v1",
  status: "ARCHIVED",
  fields: { version: "v1", edges: JSON.stringify(defaultEdges) },
}
const state = { rows: [row, template], audit: [] }
test("nộp đề tài theo phiên bản đã ghim và ghi đúng một sự kiện", () => {
  const updated = { ...row, status: "SUBMITTED", fields: { workflowVersion: "v2", code: "DT-01" } }
  const next = applyTransaction(state, session, "Nộp đề xuất", [updated], updated)
  assert.equal(next.rows[0].fields.workflowVersion, "v1")
  assert.equal(next.audit.length, 1)
  assert.equal(next.audit[0].actor, session.name)
  assert.equal(next.audit[0].from, "DRAFT")
  assert.equal(next.audit[0].to, "SUBMITTED")
})
test("chặn bước nhảy sai và giữ nhật ký ban đầu", () => {
  assert.throws(() =>
    applyTransaction(state, session, "Đóng đề tài", [{ ...row, status: "COMPLETED" }], row),
  )
  assert.equal(state.audit.length, 0)
})
test("từ chối actor thiếu quyền với cạnh hợp lệ", () => {
  assert.throws(() =>
    applyTransaction(
      state,
      { ...session, role: "student" },
      "Nộp đề xuất",
      [{ ...row, status: "SUBMITTED" }],
      row,
    ),
  )
})
test("nháp mới dùng phiên bản đang hiệu lực", () => {
  const active = {
    ...template,
    id: "v2",
    status: "ACTIVE",
    fields: { ...template.fields, version: "v2" },
  }
  const next = applyTransaction({ rows: [active], audit: [] }, session, "Lưu nháp", [row], row)
  assert.equal(next.rows[1].fields.workflowVersion, "v2")
})
test("đồ thị thiếu semantic hoặc bước không tới được không thể kích hoạt", () => {
  assert.throws(() => validateGraph([{ from: "DRAFT", to: "", roles: ["officer"] }]))
  assert.throws(() =>
    validateGraph([
      { from: "DRAFT", to: "SUBMITTED", roles: ["researcher"] },
      { from: "PASSED", to: "COMPLETED", roles: ["officer"] },
    ]),
  )
})

test("hủy hồ sơ đã nộp cần chủ nhiệm và lý do", () => {
  const sent = { ...row, status: "SUBMITTED" }
  const next = { ...sent, status: "CANCELLED" }
  assert.throws(() =>
    applyTransaction({ rows: [sent, template], audit: [] }, session, "Hủy", [next]),
  )
  const result = applyTransaction({ rows: [sent, template], audit: [] }, session, "Hủy", [
    { ...next, fields: { ...next.fields, reason: "Trùng đề xuất." } },
  ])
  assert.equal(result.audit[0].to, "CANCELLED")
  assert.equal(result.audit[0].reason, "Trùng đề xuất.")
  assert.equal(result.audit[0].actorId, session.userId)
})
test("chuyển nhiều đề tài ghi một sự kiện trên từng đề tài", () => {
  const second = { ...row, id: "b" }
  const next = applyTransaction(
    { rows: [row, second, template], audit: [] },
    session,
    "Nộp hồ sơ",
    [row, second].map((r) => ({ ...r, status: "SUBMITTED" })),
  )
  assert.deepEqual(
    next.audit.map((e) => e.recordId),
    ["a", "b"],
  )
})
test("không kích hoạt đồ thị thiếu đường kết thúc hoặc vai trò không tồn tại", () => {
  assert.throws(() => validateGraph([{ from: "DRAFT", to: "SUBMITTED", roles: ["researcher"] }]))
  assert.throws(() => validateGraph([{ from: "DRAFT", to: "COMPLETED", roles: ["other"] }]))
  validateGraph(defaultEdges)
})
