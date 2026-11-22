import type { DemoRow, FeatureProps } from '../../demo/types.ts'

export type Row = DemoRow
export type Context = Pick<FeatureProps, 'rows' | 'session' | 'aiEnabled' | 'e4Enabled'>
export type Data = Record<string, string>
export const today = '2026-11-21'
export const now = '2026-11-21T02:00:00.000Z'
export const typeNames: Data = {
  ARTICLE: 'Bài báo',
  PATENT: 'Sáng chế',
  SOFTWARE: 'Phần mềm',
  REPORT: 'Báo cáo kỹ thuật',
  BOOK: 'Sách chuyên khảo',
}
export const people: Data = {
  mai: 'Lê Thanh Mai',
  linh: 'Nguyễn Khánh Linh',
  an: 'Nguyễn Hoài An',
  minh: 'Phạm Quang Minh',
  ha: 'Trần Thu Hà',
  thao: 'Vũ Phương Thảo',
}
export const states: Data = {
  APPROVED: 'Đã duyệt',
  IN_PROGRESS: 'Đang thực hiện',
  SUSPENDED: 'Tạm dừng',
  PENDING_ACCEPTANCE: 'Chờ nghiệm thu',
  UNDER_ACCEPTANCE: 'Đang nghiệm thu',
  PASSED: 'Đạt',
  FAILED: 'Không đạt',
  COMPLETED: 'Đã đóng',
  PENDING_SUBMISSION: 'Chờ nộp',
  SUBMITTED: 'Đã nộp',
  REVISION_REQUESTED: 'Cần chỉnh sửa',
  DRAFT: 'Bản nháp',
  PENDING_APPROVAL: 'Chờ duyệt',
  REJECTED: 'Từ chối',
  EFFECTIVE: 'Có hiệu lực',
  MATCHED: 'Khớp số liệu',
  MISMATCHED: 'Sai lệch',
  UNRECONCILED: 'Chưa đối soát',
  CONFIRMED: 'Đã xác nhận',
  ACTIVE: 'Đang sử dụng',
  COLLECTING_SCORES: 'Đang thu phiếu',
  CONCLUDED: 'Đã kết luận',
}
export function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}
export function date(value: string, label: string) {
  const stamp = Date.parse(value)
  check(
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      Number.isFinite(stamp) &&
      new Date(stamp).toISOString().startsWith(value),
    'Ngày ' + label + ' chưa hợp lệ.',
  )
  return value
}
export function fmtDate(value?: string) {
  return value ? value.slice(0, 10).split('-').reverse().join('/') : '—'
}
export function vnd(value: bigint | string) {
  return BigInt(value || '0').toLocaleString('vi-VN') + ' ₫'
}
export function positive(value: string, label = 'Số tiền') {
  check(/^\d+$/.test(value) && BigInt(value) > 0n, label + ' phải là số nguyên dương.')
  return BigInt(value)
}
export function ids(value?: string) {
  return (value || '')
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter(Boolean)
}
export function member(p: Row, userId: string) {
  return ids(p.fields.memberIds || p.fields.members).includes(userId)
}
export function principal(c: Context, p: Row) {
  return ['researcher', 'student'].includes(c.session.role) && p.owner === c.session.userId
}
export function unitAllowed(c: Context, r: Row) {
  const account = c.rows.find((x) => x.kind === 'account' && x.owner === c.session.userId)
  const scope = account ? account.fields.scopeUnit : c.session.unit
  return !scope || scope === r.unit
}
export function officer(c: Context, p: Row) {
  return c.session.role === 'officer' && unitAllowed(c, p)
}
export function scoped(c: Context, p: Row) {
  return c.session.role === 'officer'
    ? officer(c, p)
    : p.owner === c.session.userId || member(p, c.session.userId)
}
export function live(c: Context, r: Row) {
  check(c.rows.find((x) => x.id === r.id) === r, 'Hồ sơ đã thay đổi. Vui lòng mở lại.')
}
export function guard(c: Context, p: Row, allowed: boolean, statuses: string[] = []) {
  live(c, p)
  check(p.kind === 'project' && allowed, 'Bạn không có quyền thao tác hồ sơ này.')
  check(!statuses.length || statuses.includes(p.status), 'Trạng thái đề tài chưa cho phép thao tác này.')
}
export function related(c: Context, p: Row, kind: string) {
  return c.rows.filter(
    (r) => r.kind === kind && r.fields.projectId === p.id && r.unit === p.unit && r.status !== 'DELETED',
  )
}
export function child(c: Context, p: Row, r: Row, kind: string) {
  live(c, r)
  check(related(c, p, kind).includes(r), 'Bản ghi không thuộc đề tài.')
}
export function row(
  kind: string,
  title: string,
  status: string,
  owner: string,
  unit: string,
  fields: Data,
  id = 'exec-' + kind + '-' + crypto.randomUUID(),
): Row {
  return { id, kind, title, status, owner, unit, fields }
}
export function linked(
  p: Row,
  kind: string,
  title: string,
  status: string,
  fields: Data,
  owner = p.owner,
  id?: string,
) {
  return row(kind, title, status, owner, p.unit, { ...fields, projectId: p.id }, id)
}
export function change(r: Row, status: string, fields: Data = {}): Row {
  return { ...r, status, fields: { ...r.fields, ...fields } }
}
const transitions: Record<string, string[]> = {
  APPROVED: ['IN_PROGRESS'],
  IN_PROGRESS: ['SUSPENDED', 'PENDING_ACCEPTANCE'],
  SUSPENDED: ['IN_PROGRESS'],
  PENDING_ACCEPTANCE: ['UNDER_ACCEPTANCE'],
  UNDER_ACCEPTANCE: ['PASSED', 'FAILED'],
  PASSED: ['COMPLETED', 'UNDER_ACCEPTANCE'],
  FAILED: ['IN_PROGRESS', 'UNDER_ACCEPTANCE'],
}
export function transition(p: Row, status: string, fields: Data = {}) {
  check(p.kind === 'project' && transitions[p.status]?.includes(status), 'Bước chuyển trạng thái không hợp lệ.')
  return change(p, status, fields)
}
export function notice(
  p: Row,
  feature: string,
  title: string,
  recipient: string,
  key: string,
  fields: Data = {},
) {
  return row(
    'notice',
    title,
    'UNREAD',
    recipient,
    p.unit,
    { feature, targetId: p.id, at: now, text: p.title, ...fields },
    ['exec-notice', feature, p.id, recipient, key].join('-'),
  )
}
export function decisionNotice(
  c: Context,
  p: Row,
  feature: string,
  title: string,
  recipient: string,
  key: string,
) {
  const n = notice(p, feature, title, recipient, key)
  return c.rows.some((r) => r.id === n.id) ? [] : [n]
}
export function setting(c: Context, key: string, fallback: string) {
  const configs = c.rows.filter(
    (r) => r.kind === 'config' && r.fields.key === key && r.fields.active !== 'false',
  )
  const configured =
    configs.find((r) => r.fields.scope === 'tenant') ?? configs.find((r) => r.fields.scope === 'shared')
  if (configured) return configured.fields.value
  const match = c.rows.find(
    (r) => r.kind === 'setting' && (r.fields.key === key || r.id === key) && r.status !== 'DISABLED',
  )
  return match?.fields.value ?? fallback
}
export function evidence(name: string) {
  check(
    name?.trim() &&
      !name.includes('/') &&
      !/[\\\r\n]/.test(name) &&
      /\.(pdf|docx?|xlsx?|png|jpe?g|csv|zip)$/i.test(name),
    'Chọn minh chứng có quyền sử dụng (PDF, Word, Excel, ảnh, CSV hoặc ZIP).',
  )
}
