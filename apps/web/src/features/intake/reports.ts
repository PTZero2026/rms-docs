import type { DemoRow } from '../../demo/types.ts'
import { demoTime, ensure, label, newId, record, scopeUnit, timeLabel } from './model.ts'
import type { Context } from './model.ts'

export type ReportLine = { id: string; code: string; title: string; unit: string; status: string }
export function reportUnits(ctx: Context) {
  const scope = scopeUnit(ctx)
  if (scope) return [scope]
  return [
    ...new Set(
      ctx.rows
        .filter((r) => r.kind === 'project' || r.kind === 'call')
        .map((r) => r.unit)
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b, 'vi'))
}
export function reportAccess(ctx: Context) {
  return ctx.session.role === 'officer' || ctx.session.role === 'admin'
}
export function makeReport(ctx: Context, callId: string, unit: string): DemoRow {
  const allowed = reportUnits(ctx)
  const units = unit === '*' && !scopeUnit(ctx) ? allowed : [unit]
  ensure(reportAccess(ctx) && units.every((u) => allowed.includes(u)), 'Chọn đơn vị trong phạm vi phụ trách.')
  const call = record(ctx, 'call', callId)
  ensure(
    !scopeUnit(ctx) ||
      call.unit === scopeUnit(ctx) ||
      ctx.rows.some((r) => r.kind === 'project' && r.fields.callId === callId && r.unit === scopeUnit(ctx)),
    'Kỳ nằm ngoài phạm vi phụ trách.',
  )
  const lines = new Map<string, ReportLine>()
  for (const row of ctx.rows) {
    if (
      row.kind !== 'project' ||
      !units.includes(row.unit) ||
      row.fields.callId !== callId ||
      !row.fields.code?.trim()
    )
      continue
    lines.set(row.id, {
      id: row.id,
      code: row.fields.code,
      title: row.title,
      unit: row.unit,
      status: row.status,
    })
  }
  return {
    id: newId('report'),
    kind: 'call-report',
    title: call.title,
    unit: unit === '*' ? 'Các đơn vị được giao' : unit,
    owner: ctx.session.userId,
    status: 'FROZEN',
    fields: {
      units: JSON.stringify(units),
      callId,
      callCode: call.fields.code,
      extractedAt: demoTime(),
      lines: JSON.stringify([...lines.values()].sort((a, b) => a.code.localeCompare(b.code))),
    },
  }
}
export function reportVisible(ctx: Context, r: DemoRow) {
  return (
    r.kind === 'call-report' &&
    reportAccess(ctx) &&
    r.owner === ctx.session.userId &&
    (!scopeUnit(ctx) ||
      (JSON.parse(r.fields.units || '[]') as string[]).every((unit) => unit === scopeUnit(ctx)))
  )
}
export function readReport(ctx: Context, id: string): ReportLine[] {
  const report = record(ctx, 'call-report', id)
  ensure(reportVisible(ctx, report), 'Phạm vi đã thay đổi. Hãy tạo lại báo cáo.')
  const lines: ReportLine[] = JSON.parse(report.fields.lines)
  ensure(
    !scopeUnit(ctx) || lines.every((line) => line.unit === scopeUnit(ctx)),
    'Phạm vi đã thay đổi. Hãy tạo lại báo cáo.',
  )
  return lines
}
export function grouped(lines: ReportLine[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const line of lines) counts.set(line.status, (counts.get(line.status) ?? 0) + 1)
  return counts
}
function csvCell(value: string) {
  const safe = /^[\s]*[=+@-]/.test(value) ? "'" + value : value
  return '"' + safe.replaceAll('"', '""') + '"'
}
export function exportReport(ctx: Context, id: string) {
  const lines = readReport(ctx, id)
  const r = record(ctx, 'call-report', id)
  const table = [
    ['Kỳ', r.fields.callCode, r.title],
    ['Phạm vi', r.unit],
    ['Trích xuất (giờ Việt Nam)', timeLabel(r.fields.extractedAt)],
    ['Tổng đề tài', String(lines.length)],
    ['Trạng thái', 'Số đề tài'],
    ...[...grouped(lines)].map(([state, count]) => [label(state), String(count)]),
    [],
    ['Định danh', 'Mã đề tài', 'Tên đề tài', 'Đơn vị', 'Trạng thái', 'Mã kỳ', 'Thời điểm trích xuất (UTC)'],
    ...lines.map((line) => [
      line.id,
      line.code,
      line.title,
      line.unit,
      label(line.status),
      r.fields.callCode,
      r.fields.extractedAt,
    ]),
  ]
  return '\uFEFF' + table.map((cells) => cells.map(csvCell).join(',')).join('\r\n')
}
