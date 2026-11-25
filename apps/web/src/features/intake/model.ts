import { schoolUnits } from '../../demo/datasets.ts'
import { formatVietnamDate } from '../../format-date.ts'
import type { DemoRow, FeatureProps } from '../../demo/types.ts'
import { defaultEdges, type Edge } from '../../demo/workflow.ts'

export type Context = Pick<FeatureProps, 'rows' | 'session' | 'aiEnabled'>
export const today = '2026-11-21'
export const names: Record<string, string> = {
  mai: 'Lê Thanh Mai',
  linh: 'Nguyễn Khánh Linh',
  minh: 'Phạm Quang Minh',
  an: 'Nguyễn Hoài An',
  ha: 'Trần Thu Hà',
  hue: 'Phan Thu Huệ',
  son: 'Đỗ Minh Sơn',
  thao: 'Vũ Phương Thảo',
}
export const states: Record<string, string> = {
  DRAFT: 'Nháp',
  SUBMITTED: 'Đã nộp',
  UNDER_REVIEW: 'Đang xét duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  CANCELLED: 'Đã hủy',
  OPEN: 'Đang mở',
  CLOSED: 'Đã đóng',
  IN_PROGRESS: 'Đang thực hiện',
  PASSED: 'Đạt',
  FAILED: 'Không đạt',
  ACTIVE: 'Đang hoạt động',
  COLLECTING_SCORES: 'Đang thu phiếu',
  CONCLUDED: 'Đã kết luận',
  PENDING: 'Chờ thẩm định',
  SUPPLEMENT: 'Cần bổ sung',
  EXEMPT: 'Miễn thẩm định',
  ACCEPTED: 'Đã tiếp nhận',
  DISMISSED: 'Đã bỏ qua',
  ARCHIVED: 'Đã lưu trữ',
  COMPLETED: 'Hoàn thành',
  ACCEPTANCE_PENDING: 'Chờ nghiệm thu',
  PENDING_ACCEPTANCE: 'Chờ nghiệm thu',
  UNDER_ACCEPTANCE: 'Đang nghiệm thu',
  SUSPENDED: 'Tạm dừng',
}
export function ensure(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message)
}
export const label = (status: string) => states[status] ?? status
export const ids = (value = '') => value.split(',').filter(Boolean)
export const newId = (kind: string) => 'intake-' + kind + '-' + crypto.randomUUID()
export const dateLabel = (date?: string) => (date ? date.slice(0, 10).split('-').reverse().join('/') : '—')
export function demoTime() {
  const local = new Date().toLocaleTimeString('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour12: false,
  })
  return new Date(today + 'T' + local + '+07:00').toISOString()
}
export const timeLabel = (iso: string) =>
  formatVietnamDate(iso, 'second')
export function scopeUnit(ctx: Context) {
  const account = ctx.rows.find((r) => r.kind === 'account' && r.owner === ctx.session.userId)
  if (account) return account.fields.scopeUnit || ''
  return schoolUnits(ctx.session.tenant, ctx.rows).includes(ctx.session.unit) ? ctx.session.unit : ''
}
export const inScope = (ctx: Context, row: DemoRow) => !scopeUnit(ctx) || row.unit === scopeUnit(ctx)
export const managed = (ctx: Context, row: DemoRow) => ctx.session.role === 'officer' && inScope(ctx, row)
export const author = (ctx: Context, row: DemoRow) =>
  ctx.session.role === 'researcher' && row.owner === ctx.session.userId
export const find = (rows: DemoRow[], kind: string, id?: string) =>
  rows.find((r) => r.kind === kind && r.id === id)
export function record(ctx: Context, kind: string, id: string) {
  const row = find(ctx.rows, kind, id)
  ensure(row, 'Không có bản ghi trong phạm vi truy cập.')
  return row
}
export const change = (row: DemoRow, fields: Record<string, string>, status = row.status): DemoRow => ({
  ...row,
  status,
  fields: { ...row.fields, ...fields },
})
export function canReadProject(ctx: Context, row: DemoRow) {
  if (row.kind !== 'project') return false
  if ((ctx.session.role === 'admin' && inScope(ctx, row)) || managed(ctx, row)) return true
  if (!['researcher', 'student'].includes(ctx.session.role)) return false
  return row.owner === ctx.session.userId || ids(row.fields.memberIds).includes(ctx.session.userId)
}
export function canTransition(ctx: Context, project: DemoRow, status: string) {
  const workflow = ctx.rows.find(
    (r) => r.kind === 'workflow' && r.fields.version === project.fields.workflowVersion,
  )
  const edges: Edge[] = workflow ? JSON.parse(workflow.fields.edges) : defaultEdges
  return (
    project.kind === 'project' &&
    edges.some(
      (edge) => edge.from === project.status && edge.to === status && edge.roles.includes(ctx.session.role),
    )
  )
}
export function transition(
  ctx: Context,
  project: DemoRow,
  status: string,
  fields: Record<string, string> = {},
) {
  ensure(
    canTransition(ctx, project, status),
    'Vai trò và phiên bản quy trình của đề tài chưa cho phép chuyển bước này.',
  )
  return change(project, fields, status)
}
export const receiving = (call?: DemoRow) =>
  Boolean(call && call.status === 'OPEN' && call.fields.start <= today && today <= call.fields.due)
export const callStatus = (call: DemoRow) =>
  call.status === 'OPEN' && call.fields.due < today ? 'CLOSED' : call.status
export function callVisible(ctx: Context, call: DemoRow) {
  return (
    call.kind === 'call' &&
    ((ctx.session.role === 'admin' && inScope(ctx, call)) ||
      managed(ctx, call) ||
      (['researcher', 'student'].includes(ctx.session.role) && callStatus(call) === 'OPEN'))
  )
}
export function activeWorkflow(rows: DemoRow[]) {
  const active = rows.find((r) => r.kind === 'workflow' && r.status === 'ACTIVE')
  return active?.fields.version || 'v1'
}

export function config(rows: DemoRow[], key: string) {
  const matches = rows.filter(
    (r) =>
      r.kind === 'config' && r.fields.key === key && r.status !== 'DELETED' && r.fields.active !== 'false',
  )
  return (
    matches.find((r) => r.fields.scope === 'tenant') ?? matches.find((r) => r.fields.scope === 'shared')
  )?.fields.value
}
