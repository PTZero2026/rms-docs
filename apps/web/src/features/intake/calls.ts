import type { DemoRow } from '../../demo/types.ts'
import {
  callStatus,
  config,
  change,
  ensure,
  ids,
  managed,
  newId,
  record,
  scopeUnit,
  today,
} from './model.ts'
import type { Context } from './model.ts'

export type CallForm = {
  title: string
  code: string
  start: string
  due: string
  disciplines: string
  template: string
  criteria: string
}
export const blankCall: CallForm = {
  title: '',
  code: '',
  start: today,
  due: '',
  disciplines: '',
  template: '',
  criteria: '',
}
export const references = (rows: DemoRow[], category: string) =>
  rows
    .filter((r) => r.kind === 'intake-reference' && r.fields.category === category)
    .map((r) => ({
      ...r,
      status: config(rows, 'CATALOG.' + r.id + '.STATUS') ?? r.status,
    }))
export const referenceName = (rows: DemoRow[], id: string) =>
  rows.find((r) => r.id === id)?.title ?? 'Chưa chọn'
function validDate(value: string) {
  const date = new Date(value + 'T00:00:00Z')
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  )
}
function validateDates(start: string, due: string) {
  ensure(validDate(start) && validDate(due), 'Chọn ngày bắt đầu và hạn nhận hợp lệ.')
  ensure(due >= start, 'Hạn nhận phải từ ngày bắt đầu trở đi.')
}
export function saveCall(ctx: Context, form: CallForm, id?: string): DemoRow {
  const existing = id ? record(ctx, 'call', id) : undefined
  ensure(
    ctx.session.role === 'officer' &&
      (!existing || (managed(ctx, existing) && existing.status === 'DRAFT')),
    'Chỉ chuyên viên phụ trách được sửa kỳ nháp.',
  )
  ensure(form.title.trim() && form.code.trim(), 'Nhập tên và mã kỳ.')
  validateDates(form.start, form.due)
  const code = form.code.trim().toUpperCase()
  ensure(
    !ctx.rows.some((r) => r.kind === 'call' && r.id !== id && r.fields.code === code),
    'Mã kỳ đã được sử dụng.',
  )
  const { title, ...fields } = form
  return {
    id: id ?? newId('call'),
    kind: 'call',
    status: 'DRAFT',
    owner: ctx.session.userId,
    unit: existing?.unit || scopeUnit(ctx) || ctx.session.unit,
    title: title.trim(),
    fields: { ...existing?.fields, ...fields, code },
  }
}
export function changeCall(
  ctx: Context,
  id: string,
  action: 'open' | 'close' | 'cancel' | 'extend',
  due = '',
) {
  const call = record(ctx, 'call', id)
  ensure(managed(ctx, call), 'Kỳ nằm ngoài phạm vi phụ trách.')
  const status = callStatus(call)
  if (action === 'open') {
    ensure(status === 'DRAFT', 'Chỉ mở kỳ đang ở Nháp.')
    validateDates(call.fields.start, call.fields.due)
    ensure(call.fields.due >= today, 'Kỳ đã hết hạn nhận.')
    const groups = [
      ['discipline', 'Lĩnh vực', ids(call.fields.disciplines)],
      ['template', 'Biểu mẫu', [call.fields.template]],
      ['criteria', 'Bộ tiêu chí', [call.fields.criteria]],
    ] as const
    for (const [category, name, selected] of groups) {
      ensure(
        selected.length &&
          selected.every((key) =>
            references(ctx.rows, category).some((r) => r.id === key && r.status === 'ACTIVE'),
          ),
        name + ' thiếu hoặc đã hết hiệu lực. Hãy sửa cấu hình kỳ.',
      )
    }
    return change(call, {}, 'OPEN')
  }
  if (action === 'extend') {
    ensure(['OPEN', 'CLOSED'].includes(status), 'Chỉ gia hạn kỳ đã mở hoặc đã đóng.')
    validateDates(call.fields.start, due)
    ensure(due > today && due > call.fields.due, 'Hạn mới phải sau hôm nay và sau hạn hiện tại.')
    return change(call, { due }, 'OPEN')
  }
  if (action === 'close') {
    ensure(call.status === 'OPEN', 'Chỉ đóng kỳ đang mở.')
    return change(call, {}, 'CLOSED')
  }
  ensure(['OPEN', 'DRAFT'].includes(status), 'Kỳ đã kết thúc.')
  ensure(
    !ctx.rows.some(
      (r) =>
        r.kind === 'project' &&
        r.fields.callId === id &&
        (r.fields.code || r.status === 'SUBMITTED'),
    ),
    'Kỳ đã có hồ sơ nộp. Hãy đóng kỳ để bảo toàn hồ sơ.',
  )
  return change(call, {}, 'CANCELLED')
}
