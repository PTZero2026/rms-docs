import type { DemoRow, FeatureProps, Session } from '../../demo/types'

import { categories } from './catalogue.ts'
import { personas, unitAllowed } from '../../demo/identity.ts'

export type Context = Pick<FeatureProps, 'session' | 'rows' | 'e4Enabled'>
export const today = '2026-11-21'
export const units = ['Khoa Công trình', 'Khoa Môi trường']
export const teachers: Record<string, string> = { mai: personas.researcher.name, minh: personas.reviewer.name, thao: 'Vũ Phương Thảo' }
export const students: Record<string, string> = { linh: personas.student.name, phuc: 'SV Phúc', yen: 'SV Yến', 'sv-nam': 'SV Nam', 'sv-lan': 'SV Lan', vu: 'SV Vũ', ngoc: 'Đỗ Bảo Ngọc', 'sv-an': 'SV An' }
export function studentsIn(unit: string) {
  const environment = ['ngoc','sv-an']
  return Object.fromEntries(Object.entries(students).filter(([id]) => unit === units[1] ? environment.includes(id) : !environment.includes(id)))
}
export const names: Record<string, string> = { ...teachers, ...students, an: personas.officer.name, ha: personas.admin.name }
export const featureInfo = {
  F09: { kind: 'upper-project', title: 'Đề tài cấp trên', create: 'Kê khai đề tài', category: 'Cấp đề tài' },
  F10: { kind: 'student-project', title: 'Đề tài sinh viên', create: 'Đăng ký đề tài', category: 'Đợt đăng ký' },
  F11: { kind: 'applied-project', title: 'Dự án phục vụ sản xuất', create: 'Kê khai dự án', category: 'Loại dự án' },
  F12: { kind: 'activity', title: 'Hoạt động khoa học', create: 'Kê khai hoạt động', category: 'Loại hoạt động' },
} as const
export type Source = keyof typeof featureInfo
export function sourceOf(row: DemoRow): Source {
  const key = (Object.keys(featureInfo) as Source[]).find(k => featureInfo[k].kind === row.kind)
  if (!key) throw new Error('Hồ sơ không thuộc phân hệ này.')
  return key
}
export const statuses: Record<string,string> = {
  DRAFT: 'Nháp', MENTOR_PENDING: 'Chờ xác nhận hướng dẫn', SUBMITTED: 'Chờ sơ duyệt',
  APPROVED: 'Đã duyệt', PENDING_APPROVAL: 'Chờ duyệt', IN_PROGRESS: 'Đang thực hiện',
  FINAL_REVIEW: 'Chờ GVHD xác nhận kết quả', FINAL_SUBMITTED: 'Chờ nghiệm thu',
  UNDER_REVIEW: 'Hội đồng xét đề cương', UNDER_ACCEPTANCE: 'Hội đồng nghiệm thu',
  PASSED: 'Đạt', FAILED: 'Không đạt', COMPLETED: 'Đã hoàn thành', CANCELLED: 'Đã hủy',
  RESULT_PENDING: 'Chờ duyệt kết quả', REJECTED: 'Đã từ chối', POSTED: 'Ghi nhận', ADJUSTMENT: 'Điều chỉnh',
}
export const evidenceLabels: Record<string,string> = {
  DECISION: 'Quyết định giao nhiệm vụ', CONTRACT: 'Hợp đồng', ACCEPTANCE_MINUTES: 'Biên bản nghiệm thu',
  HANDOVER_RECORD: 'Biên bản bàn giao', FINAL_REPORT: 'Báo cáo tổng kết', PRODUCT: 'Sản phẩm nghiên cứu',
  ASSIGNMENT: 'Tờ trình cử đi', PROGRAM: 'Chương trình hội nghị', PARTICIPATION: 'Xác nhận tham gia',
  PATENT: 'Văn bằng bảo hộ', OTHER: 'Minh chứng khác',
}
export function codes(value = '') { return value.split(',').filter(Boolean) }
export function entries(row: DemoRow): Record<string,string> { return JSON.parse(row.fields.evidence || '{}') }
export type Contributor = { id: string; role: string; share: number }
export function contributors(row: DemoRow): Contributor[] { return JSON.parse(row.fields.contributors || '[]') }
export function catalog(rows: DemoRow[], feature: Source) {
  return categories(rows,feature)
}
export function category(rows: DemoRow[], row: DemoRow) {
  const item = catalog(rows, sourceOf(row)).find(c => c.fields.code === row.fields.category)
  if (!item) throw new Error('Chọn một loại đang áp dụng trong danh mục của trường.')
  return item
}
export function requiredEvidence(rows: DemoRow[], row: DemoRow, stage: 'declaration'|'result') {
  const policy = row.kind === 'student-project' ? rows.find(r => r.kind === 'ext-student-call' && r.id === row.fields.callId) : category(rows, row)
  if (!policy) throw new Error('Chọn đợt đăng ký của đề tài.')
  return codes(policy.fields[stage])
}
export function checkEvidence(rows: DemoRow[], row: DemoRow, stage: 'declaration'|'result') {
  const metadata = entries(row)
  const missing = requiredEvidence(rows, row, stage).filter(code => !metadata[code]?.trim())
  if (missing.length) throw new Error('Cần bổ sung minh chứng: ' + missing.map(c => (evidenceLabels[c] || c) + ' (' + c + ')').join(', ') + '.')
}
export function ensureEnabled(ctx: Context) { if (!ctx.e4Enabled) throw new Error('Trường chưa bật nhóm chức năng mở rộng.') }
export function unitScope(s: Session, row: DemoRow) { return !units.includes(s.unit) || s.unit === row.unit || (!row.unit && row.fields.scopeUnit === s.unit) }
export function scoped(ctx: Context, row: DemoRow) { return unitAllowed(row,ctx.session,ctx.rows) }
export function officer(s: Session, row: DemoRow) { return s.role === 'officer' && unitScope(s, row) }
export function dateLabel(iso?: string) { return iso ? iso.slice(0, 10).split('-').reverse().join('/') : '—' }
export function validDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date)) && new Date(date).toISOString().startsWith(date)
}
export function money(value: string) { return Number(value || 0).toLocaleString('vi-VN') + ' ₫' }
export function uid(prefix: string) { return 'ext-' + prefix + '-' + crypto.randomUUID() }
export function openCall(call: DemoRow) {
  return call.status === 'OPEN' && call.fields.start <= today && today <= call.fields.end
}
export function validateContributors(list: Contributor[], studentProject = false) {
  if (!list.length || new Set(list.map(p => p.id)).size !== list.length ||
      list.some(p => !Object.hasOwn(teachers,p.id) || !Number.isFinite(p.share) || p.share <= 0) ||
      Math.abs(list.reduce((sum,p) => sum + p.share,0) - 100) > 0.00001) {
    throw new Error('Chọn giảng viên riêng biệt và phân bổ đủ 100% đóng góp.')
  }
  if (studentProject ? list.some(p => p.role !== 'GV hướng dẫn') :
      list.filter(p => p.role === 'Chủ nhiệm').length !== 1 || list.some(p => !['Chủ nhiệm','Thành viên','Điều phối'].includes(p.role))) {
    throw new Error('Kiểm tra vai trò và người phụ trách của nhóm.')
  }
}

