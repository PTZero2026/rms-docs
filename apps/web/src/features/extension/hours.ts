import type { DemoRow, Session } from '../../demo/types'
import { category, codes, contributors, ensureEnabled, scoped, sourceOf, today, unitScope, validDate, validateContributors } from './model.ts'
import type { Context, Contributor } from './model.ts'

export const periodLabels: Record<string,string> = { ACADEMIC_YEAR: 'Năm học', FISCAL_YEAR: 'Năm tài khóa' }
export function canReadHours(s: Session, row: DemoRow) {
  if (row.kind !== 'hours') return false
  if (s.role === 'admin' || s.role === 'officer') return unitScope(s, row)
  return (s.role === 'researcher' || s.role === 'reviewer') && row.owner === s.userId
}
export function calendar(rows: DemoRow[]) {
  return rows.find(r => r.kind === 'ext-calendar')?.fields ?? { periodType: 'ACADEMIC_YEAR', academicMonth: '9', fiscalMonth: '1' }
}
export function periodCode(date: string, type: string, month: number) {
  const start = Number(date.slice(0,4)) - (Number(date.slice(5,7)) < month ? 1 : 0)
  return type === 'ACADEMIC_YEAR' ? start + '-' + (start + 1) : String(start)
}
export function ruleKey(rows: DemoRow[], source: DemoRow) {
  return source.kind === 'student-project' ? 'STUDENT_MENTOR' : category(rows,source).fields.formula
}
export function rounded(n: number) { return Math.round((n + Number.EPSILON) * 100) / 100 }
export function totalBase(formula: DemoRow, value: number) {
  const f = formula.fields
  if (f.bands) {
    const bands = JSON.parse(f.bands) as [number,number][]
    const match = bands.findLast(([min]) => value >= min)
    if (!match) throw new Error('Thiếu bậc kinh phí áp dụng cho hợp đồng.')
    return match[1]
  }
  return Number(f.base) * Number(f.multiplier || 1)
}
export function postHours(rows: DemoRow[], source: DemoRow): DemoRow[] {
  const feature = sourceOf(source)
  const key = source.id + ':' + (source.fields.cycle || '1')
  if (alreadyPosted(rows,source,key)) return []
  const trigger = feature === 'F10' ? 'result' : source.fields.hourTrigger || category(rows,source).fields.trigger
  const eligible = trigger === 'result' ? source.status === 'COMPLETED' : ['APPROVED','RESULT_PENDING','COMPLETED'].includes(source.status)
  if (!eligible) throw new Error('Nguồn chưa đủ điều kiện quy đổi giờ giảng.')
  const list = contributors(source)
  validateContributors(list, feature === 'F10')
  return allocate(rows,source,feature,ruleKey(rows,source),key,source.fields.sourceOccurredAt,list)
}
function alreadyPosted(rows: DemoRow[], source: DemoRow, key: string) {
  return rows.some(r => r.kind === 'hours' && r.fields.sourceId === source.id && r.fields.eventKey === key)
}
export function postOutput(ctx: Context, sourceId: string, activity: string, date: string, shares: Record<string,string>) {
  ensureEnabled(ctx)
  const source = ctx.rows.find(r => r.id === sourceId && r.kind === 'output')
  if (!source || !scoped(ctx,source) || ctx.session.role !== 'officer' || !unitScope(ctx.session,source)) throw new Error('Thiếu quyền quy đổi sản phẩm.')
  if (source.status !== 'APPROVED' || source.fields.access !== 'FULL' || !source.fields.evidence) throw new Error('Sản phẩm cần được duyệt và có minh chứng hợp lệ.')
  const key = source.id + ':published'
  if (alreadyPosted(ctx.rows,source,key)) return []
  const validTypes = source.fields.type === 'PATENT' ? ['PATENT','UTILITY_SOLUTION'] : source.fields.type === 'ARTICLE' ? ['SCIE_Q1','SCIE_Q2'] : []
  if (!validTypes.includes(activity)) throw new Error('Chọn phân loại phù hợp với sản phẩm đã duyệt.')
  if (!validDate(date) || date > today || (source.fields.reviewedAt && date !== source.fields.reviewedAt.slice(0,10)))
    throw new Error('Kiểm tra ngày nghiệp vụ theo căn cứ duyệt sản phẩm.')
  const authors = [...new Set(codes(source.fields.authors))]
  const list = authors.map((id,i) => ({id,role: i ? 'Đồng tác giả' : 'Tác giả chính',share:Number(shares[id])}))
  if (!list.length || list.some(p => !Number.isFinite(p.share) || p.share <= 0) || Math.abs(list.reduce((a,p) => a+p.share,0) - 100) > 0.00001)
    throw new Error('Phân bổ đủ 100% cho tác giả của sản phẩm.')
  return allocate(ctx.rows,source,'F07',activity,key,date,list)
}
// Distribute any spare hundredths to the largest fractional shares, in roster order on a tie.
function splitHours(total: number, list: Contributor[]) {
  const hundredths = Math.round(total * 100)
  const quotas = list.map(person => hundredths * person.share / 100)
  const amounts = quotas.map(Math.floor)
  const spare = hundredths - amounts.reduce((sum,amount) => sum + amount,0)
  const priority = quotas.map((q,index) => ({index,remainder:q - amounts[index]}))
    .sort((a,b) => b.remainder - a.remainder || a.index - b.index)
  for (const { index } of priority.slice(0,spare)) amounts[index] += 1
  return amounts.map(n => n / 100)
}
export function recalculatedHours(formula: DemoRow, record: DemoRow) {
  const total = rounded(totalBase(formula,Number(record.fields.contractValue || 0)))
  const allocation = record.fields.allocation
  if (!allocation) return rounded(total * Number(record.fields.share) / 100)
  const team: Contributor[] = JSON.parse(allocation)
  return splitHours(total,team)[team.findIndex(p => p.id === record.owner)]
}
function allocate(rows: DemoRow[], source: DemoRow, feature: string, activity: string, key: string, date: string, list: Contributor[]) {
  if (!validDate(date)) throw new Error('Thiếu ngày nghiệp vụ của sự kiện nguồn.')
  const config = calendar(rows)
  const formula = rows.find(r => r.kind === 'ext-formula' && r.status === 'ACTIVE' && r.fields.activity === activity &&
    r.fields.periodType === config.periodType && r.fields.validFrom <= date && date <= r.fields.validTo)
  if (!formula) throw new Error('Chưa có định mức hiệu lực tại ngày nghiệp vụ cho loại hoạt động và kỳ đã chọn.')
  const total = rounded(totalBase(formula, Number(source.fields.budget || 0)))
  const code = periodCode(date, config.periodType, Number(config.periodType === 'ACADEMIC_YEAR' ? config.academicMonth : config.fiscalMonth))
  const amounts = splitHours(total,list)
  return list.map((p, index) => {
    const amount = amounts[index]
    return {
      id: 'ext-hour-' + key + '-' + p.id, kind: 'hours', title: source.title, status: 'POSTED', owner: p.id, unit: source.unit || source.fields.scopeUnit,
      fields: { sourceId: source.id, sourceFeature: feature, sourceType: source.kind, sourceOccurredAt: date, eventKey: key,
        formulaVersion: formula.fields.version, formulaId: formula.id, allocation: JSON.stringify(list), activity, role: p.role, share: String(p.share),
        hours: String(amount), totalBase: String(total), contractValue: source.fields.budget || '0',
        recognitionPeriodCode: code, recognitionPeriodType: config.periodType, period: code },
    }
  })
}
export function balance(rows: DemoRow[], record: DemoRow) {
  return rounded(rows.filter(r => r.kind === 'hours' && (r.id === record.id || r.fields.originalId === record.id))
    .reduce((sum,r) => sum + Number(r.fields.hours), 0))
}
function adjustment(rows: DemoRow[], base: DemoRow, amount: number, reason: string, by: string): DemoRow {
  const ordinal = rows.filter(r => r.kind === 'hours' && r.fields.originalId === base.id).length + 1
  return { ...base, id: 'ext-delta-' + base.id + '-' + ordinal, status: 'ADJUSTMENT',
    fields: { ...base.fields, hours: String(amount), originalId: base.id, reason: reason.trim(), adjustedBy: by, adjustedAt: today } }
}
export function adjustHours(ctx: Context, row: DemoRow, input: string, reason: string) {
  ensureEnabled(ctx)
  const base = ctx.rows.find(r => r.id === row.id && r.kind === 'hours' && r.status === 'POSTED')
  if (!base || !scoped(ctx,base) || !canReadHours(ctx.session,base) || !['admin','officer'].includes(ctx.session.role)) throw new Error('Thiếu quyền điều chỉnh dòng giờ này.')
  if (!reason.trim()) throw new Error('Nhập lý do điều chỉnh.')
  const n = Number(input)
  if (!Number.isFinite(n) || !n || rounded(n) !== n || rounded(balance(ctx.rows,base) + n) < 0)
    throw new Error('Nhập chênh lệch khác 0, tối đa hai chữ số thập phân và giữ tổng giờ từ 0 trở lên.')
  if (ctx.rows.some(r => r.fields.originalId === base.id && r.fields.revoked === 'true'))
    throw new Error('Nguồn đã thu hồi. Chọn dòng của lần duyệt mới.')
  return adjustment(ctx.rows,base,n,reason,ctx.session.userId)
}
export function reverseHours(rows: DemoRow[], source: DemoRow, reason: string, by: string) {
  const key = source.id + ':' + (source.fields.cycle || '1')
  return rows.filter(r => r.kind === 'hours' && r.status === 'POSTED' && r.fields.sourceId === source.id && r.fields.eventKey === key)
    .map(r => {
      const delta = adjustment(rows,r, -balance(rows,r), reason, by)
      delta.fields.revoked = 'true'
      return delta
    })
}
export function saveFormula(ctx: Context, row: DemoRow) {
  ensureEnabled(ctx)
  if (ctx.session.role !== 'admin' || row.kind !== 'ext-formula') throw new Error('Thiếu quyền cấu hình công thức.')
  const f = row.fields
  if (ctx.rows.some(r => r.id === row.id)) throw new Error('Tạo phiên bản mới để giữ nguyên định mức đã lưu.')
  if (!row.title.trim() || !f.activity || !f.version.trim() || !Object.hasOwn(periodLabels,f.periodType) ||
      !validDate(f.validFrom) || !validDate(f.validTo) || f.validTo < f.validFrom) throw new Error('Kiểm tra tên phiên bản, loại kỳ và khoảng hiệu lực.')
  if (!f.base?.trim() || !Number.isFinite(Number(f.base)) || Number(f.base) <= 0 || !Number.isFinite(Number(f.multiplier || 1)) || Number(f.multiplier || 1) <= 0)
    throw new Error('Giờ cơ sở và hệ số phải lớn hơn 0.')
  if (f.bands) {
    const pairs: [number, number][] = JSON.parse(f.bands)
    if (!Array.isArray(pairs) || pairs[0]?.[0] !== 0 || pairs.some(([min,h],i) => !Number.isSafeInteger(min) || !Number.isFinite(h) || h <= 0 || (i > 0 && min <= pairs[i-1][0])))
      throw new Error('Các bậc kinh phí phải tăng dần từ 0, định mức từng bậc phải dương.')
  }
  if (f.activity === 'SCIE_Q2' && row.status === 'ACTIVE' && !f.poDecision?.trim()) throw new Error('Cần căn cứ xác nhận hệ số Q2 của PO.')
  const same = ctx.rows.filter(r => r.kind === row.kind && r.fields.activity === f.activity && r.fields.periodType === f.periodType)
  if (row.status === 'ACTIVE' && same.some(r => r.status === 'ACTIVE' && r.fields.validFrom <= f.validTo && f.validFrom <= r.fields.validTo))
    throw new Error('Khoảng hiệu lực chồng lấn với công thức đang áp dụng.')
  if (same.some(r => r.fields.version === f.version)) throw new Error('Phiên bản này đã tồn tại.')
  return row
}

