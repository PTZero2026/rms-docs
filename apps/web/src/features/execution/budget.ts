import {
  change,
  check,
  child,
  date,
  decisionNotice,
  evidence,
  guard,
  linked,
  live,
  officer,
  positive,
  principal,
  related,
  states,
  transition,
} from './model.ts'
import type { Context, Data, Row } from './model.ts'

export function fee(amount: string, rate: string, cap: string) {
  check(
    /^\d{1,3}(\.\d{1,2})?$/.test(rate) && Number(rate) <= 100,
    'Tỷ lệ phí phải từ 0 đến 100%, tối đa hai chữ số thập phân.',
  )
  const parts = rate.split('.')
  const points = BigInt(parts[0]) * 100n + BigInt((parts[1] || '').padEnd(2, '0'))
  const base = (positive(amount) * points) / 10000n
  check(!cap || /^\d+$/.test(cap), 'Trần phí phải là số nguyên VND không âm.')
  return cap && base > BigInt(cap) ? BigInt(cap) : base
}
export function policy(c: Context) {
  return (
    c.rows.find((r) => r.kind === 'executionPolicy')?.fields ?? {
      rate: '5',
      cap: '10000000',
      reconcile: 'false',
    }
  )
}
export function updateFees(c: Context, d: Data) {
  check(c.session.role === 'admin', 'Chỉ quản trị được cấu hình phí.')
  const r = c.rows.find((r) => r.kind === 'executionPolicy')
  check(r, 'Thiếu cấu hình kinh phí.')
  fee('1', d.rate, d.cap)
  return [change(r, r.status, { rate: d.rate, cap: d.cap })]
}
export function allocate(c: Context, p: Row, d: Data) {
  guard(c, p, officer(c, p), ['IN_PROGRESS'])
  const granted = related(c, p, 'assignment').find((r) => r.status === 'EFFECTIVE')
  check(granted, 'Chưa có quyết định giao hiệu lực.')
  check(!related(c, p, 'allocation').length, 'Đề tài đã được xác nhận cấp kinh phí.')
  const sum = positive(d.amount)
  check(sum <= BigInt(granted.fields.amount), 'Kinh phí cấp vượt tổng phê duyệt trong quyết định giao.')
  const config = policy(c)
  let charge = fee(d.amount, config.rate, config.cap)
  if (d.override?.trim()) {
    check(/^\d+$/.test(d.override) && BigInt(d.override) <= sum, 'Phí điều chỉnh phải từ 0 đến tổng cấp.')
    check(d.note?.trim(), 'Nhập căn cứ điều chỉnh phí.')
    charge = BigInt(d.override)
  }
  return [
    linked(
      p,
      'allocation',
      'Xác nhận cấp kinh phí',
      'CONFIRMED',
      { ...d, rate: config.rate, cap: config.cap, fee: String(charge), research: String(sum - charge) },
      p.owner,
      'exec-allocation-' + p.id,
    ),
    ...decisionNotice(c, p, 'F05', 'Đã cấp kinh phí · ' + p.title, p.owner, 'allocation'),
  ]
}
export function balance(c: Context, p: Row) {
  const allocation = related(c, p, 'allocation')[0]
  return (
    BigInt(allocation?.fields.research || 0) -
    related(c, p, 'expense').reduce((s, r) => s + BigInt(r.fields.amount), 0n)
  )
}
export function saveExpense(c: Context, p: Row, d: Data, previous?: Row) {
  guard(c, p, principal(c, p), ['IN_PROGRESS'])
  check(related(c, p, 'allocation').length, 'Chưa có kinh phí được cấp.')
  if (previous) {
    child(c, p, previous, 'expense')
    check(previous.owner === c.session.userId, 'Khoản chi ngoài phạm vi.')
  }
  positive(d.amount)
  date(d.date, 'chi')
  check(d.title?.trim(), 'Nhập nội dung chi.')
  const attachments = (d.evidence || '')
    .split(';')
    .map((t) => t.trim())
    .filter(Boolean)
  attachments.forEach(evidence)
  const code = previous?.fields.code || 'PC-' + crypto.randomUUID().slice(0, 8).toUpperCase()
  return [
    linked(
      p,
      'expense',
      d.title.trim(),
      'UNRECONCILED',
      { ...d, code, evidence: attachments.join('; ') },
      p.owner,
      previous?.id,
    ),
  ]
}
export function voidExpense(c: Context, p: Row, r: Row, reason: string) {
  guard(c, p, principal(c, p), ['IN_PROGRESS'])
  child(c, p, r, 'expense')
  check(r.owner === c.session.userId && reason.trim(), 'Cần lý do hủy khoản chi của mình.')
  return [change(r, 'DELETED', { reason })]
}
export function reconcile(c: Context, p: Row, r: Row, amount: string, reference: string) {
  guard(c, p, officer(c, p), ['IN_PROGRESS', 'PASSED'])
  child(c, p, r, 'expense')
  check(policy(c).reconcile === 'true', 'Đơn vị đang rà soát thủ công.')
  check(reference.trim(), 'Nhập mã giao dịch trên bảng chuyển khoản mô phỏng.')
  check(
    !related(c, p, 'expense').some((x) => x.id !== r.id && x.fields.reference === reference.trim()),
    'Mã giao dịch đã gắn với khoản chi khác.',
  )
  const actual = positive(amount)
  return [
    change(r, actual === BigInt(r.fields.amount) ? 'MATCHED' : 'MISMATCHED', {
      reference: reference.trim(),
      transferAmount: String(actual),
    }),
  ]
}
export function settle(c: Context, p: Row, manual: boolean) {
  live(c, p)
  guard(c, p, officer(c, p), ['PASSED'])
  check(related(c, p, 'allocation').length, 'Chưa có xác nhận cấp kinh phí để quyết toán.')
  const config = policy(c)
  if (config.reconcile === 'true') {
    const blocked = related(c, p, 'expense').filter((r) => r.status !== 'MATCHED')
    check(
      !blocked.length,
      'Cần đối soát ' +
        blocked.map((r) => r.fields.code + ' (' + (states[r.status] || r.status) + ')').join(', ') +
        '.',
    )
  } else check(manual, 'Cần xác nhận đã rà soát thủ công.')
  return [
    transition(p, 'COMPLETED', {
      settledBy: c.session.userId,
      settledOn: '2026-11-21',
      settlementMode: config.reconcile === 'true' ? 'MATCHED' : 'MANUAL',
    }),
    ...decisionNotice(c, p, 'F05', 'Đã quyết toán và đóng · ' + p.title, p.owner, 'settled'),
  ]
}
