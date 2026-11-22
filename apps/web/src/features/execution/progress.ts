import {
  change,
  check,
  child,
  date,
  decisionNotice,
  evidence,
  guard,
  linked,
  notice,
  now,
  officer,
  positive,
  principal,
  related,
  setting,
  today,
  transition,
} from './model.ts'
import type { Context, Data, Row } from './model.ts'

export function assign(c: Context, p: Row, d: Data) {
  guard(c, p, officer(c, p), ['APPROVED'])
  check(!related(c, p, 'assignment').some((r) => r.status === 'EFFECTIVE'), 'Đã có quyết định hiệu lực.')
  check(d.decision?.trim(), 'Nhập số quyết định hoặc hợp đồng.')
  date(d.signed, 'ký')
  date(d.effective, 'hiệu lực')
  date(d.start, 'bắt đầu')
  date(d.end, 'kết thúc')
  check(
    d.signed <= d.effective && d.effective <= today && d.start <= d.end,
    'Kiểm tra ngày ký, ngày hiệu lực và khoảng thực hiện.',
  )
  const amount = positive(d.amount, 'Kinh phí giao')
  evidence(d.evidence)
  const start = new Date(d.start),
    end = new Date(d.end)
  end.setUTCDate(end.getUTCDate() + 1)
  const months = Math.round((end.getTime() - start.getTime()) / (86400000 * 30.4375))
  const adjusted =
    (p.fields.requestedBudget && amount.toString() !== p.fields.requestedBudget) ||
    (p.fields.durationMonths && months !== Number(p.fields.durationMonths))
  check(!adjusted || d.note?.trim(), 'Nhập lý do điều chỉnh thời hạn hoặc kinh phí so với đề xuất.')
  let commitments = p.fields.commitments
  if (!commitments) {
    const promised: Record<string, number> = {}
    for (const type of ['ARTICLE', 'PATENT', 'SOFTWARE', 'REPORT', 'BOOK']) {
      const count = d['count' + type]
      if (count && count !== '0') {
        check(/^\d{1,3}$/.test(count), 'Số lượng cam kết phải là số nguyên từ 0 đến 999.')
        promised[type] = Number(count)
      }
    }
    check(Object.keys(promised).length, 'Cần xác nhận ít nhất một loại sản phẩm cam kết trong quyết định giao.')
    commitments = JSON.stringify(promised)
  }
  return [
    transition(p, 'IN_PROGRESS', { approvedBudget: amount.toString(), commitments }),
    linked(
      p,
      'assignment',
      d.decision,
      'EFFECTIVE',
      { ...d, amount: amount.toString() },
      p.owner,
      'exec-assignment-' + p.id,
    ),
    ...decisionNotice(c, p, 'F04', 'Đã giao thực hiện · ' + p.title, p.owner, 'assigned'),
  ]
}
export function schedule(c: Context, p: Row, d: Data, previous?: Row) {
  guard(c, p, officer(c, p), ['IN_PROGRESS'])
  if (previous) {
    child(c, p, previous, 'report')
    check(previous.status === 'PENDING_SUBMISSION', 'Kỳ đã nhận báo cáo.')
  }
  const period = positive(d.period, 'Số kỳ').toString()
  date(d.dueDate, 'đến hạn')
  check(
    !related(c, p, 'report').some((r) => r.id !== previous?.id && r.fields.period === period),
    'Số kỳ đã tồn tại trong đề tài.',
  )
  const title = 'Kỳ ' + period + (d.topic?.trim() ? ' · ' + d.topic.trim() : '')
  return [
    linked(
      p,
      'report',
      title,
      'PENDING_SUBMISSION',
      { period, dueDate: d.dueDate, topic: d.topic || '' },
      p.owner,
      previous?.id || 'exec-report-' + p.id + '-' + period,
    ),
  ]
}
export function isLate(r: Row) {
  if (['PENDING_SUBMISSION', 'REVISION_REQUESTED'].includes(r.status)) return r.fields.dueDate < today
  return (r.fields.submittedAt || '').slice(0, 10) > r.fields.dueDate
}
export function submitReport(c: Context, p: Row, r: Row, d: Data) {
  guard(c, p, principal(c, p), ['IN_PROGRESS'])
  child(c, p, r, 'report')
  check(['PENDING_SUBMISSION', 'REVISION_REQUESTED'].includes(r.status), 'Kỳ này không nhận báo cáo.')
  check(d.content?.trim(), 'Nhập nội dung thực hiện.')
  evidence(d.evidence)
  const version = String(Number(r.fields.version || 0) + 1)
  return [
    change(r, 'SUBMITTED', {
      content: d.content.trim(),
      evidence: d.evidence,
      submittedAt: now,
      late: String(today > r.fields.dueDate),
      version,
    }),
    ...decisionNotice(c, p, 'F04', 'Báo cáo chờ duyệt · ' + r.title, 'an', r.id + '-submit-' + version),
  ]
}
export function reviewReport(
  c: Context,
  p: Row,
  r: Row,
  status: 'PASSED' | 'REVISION_REQUESTED',
  comment: string,
) {
  guard(c, p, officer(c, p) && p.owner !== c.session.userId, ['IN_PROGRESS'])
  child(c, p, r, 'report')
  check(
    r.status === 'SUBMITTED' || (r.status === 'PASSED' && status === 'REVISION_REQUESTED'),
    'Kỳ báo cáo chưa thể duyệt.',
  )
  check(status === 'PASSED' || comment.trim(), 'Nhập nhận xét hoặc lý do mở lại.')
  return [
    change(r, status, { officerComment: comment }),
    ...decisionNotice(
      c,
      p,
      'F04',
      r.title + (status === 'PASSED' ? ' đã đạt' : ' cần chỉnh sửa'),
      p.owner,
      r.id + status + r.fields.version,
    ),
  ]
}
export function pauseResume(c: Context, p: Row, reason: string) {
  guard(c, p, officer(c, p), ['IN_PROGRESS', 'SUSPENDED'])
  check(reason.trim(), 'Nhập lý do thay đổi tiến độ.')
  return [transition(p, p.status === 'SUSPENDED' ? 'IN_PROGRESS' : 'SUSPENDED', { reason })]
}
export function reminderDays(c: Context) {
  return Number(setting(c, 'PROGRESS.REMINDER_DAYS_BEFORE_DUE', setting(c, 'NOTICE.DAYS', '7')))
}
export function reminders(c: Context, p: Row, days = reminderDays(c)) {
  guard(c, p, officer(c, p), ['IN_PROGRESS'])
  const due = related(c, p, 'report')
    .filter(
      (r) =>
        ['PENDING_SUBMISSION', 'REVISION_REQUESTED'].includes(r.status) &&
        (Date.parse(r.fields.dueDate) - Date.parse(today)) / 86400000 === days,
    )
    .map((r) =>
      notice(
        p,
        'F04',
        'Sắp đến hạn ' + r.title + ' · ' + p.fields.code,
        p.owner,
        [c.session.tenant, r.id, r.fields.dueDate, days].join('-'),
        { periodId: r.id, dueDate: r.fields.dueDate, event: 'PROGRESS_REPORT_DUE_SOON' },
      ),
    )
  const event = 'PROGRESS_REPORT_DUE_SOON'
  const channel = c.rows.find((r) => r.kind === 'channel-policy' && r.fields.event === event)
  const preference = c.rows.find(
    (r) => r.kind === 'preferences' && r.fields.event === event && r.owner === p.owner,
  )
  return due.flatMap((n) => {
    const updates = c.rows.some((r) => r.id === n.id) ? [] : [n]
    if (channel?.fields.email === 'false' || preference?.fields.email === 'false') return updates
    const id = n.id + '-email'
    const previous = c.rows.find((r) => r.id === id)
    if (!previous || previous.status === 'ERROR') {
      updates.push({
        ...n,
        id,
        kind: 'delivery',
        status: 'SENT',
        fields: {
          ...n.fields,
          noticeId: n.id,
          channel: 'EMAIL',
          recipient: p.owner,
          attempts: String(Number(previous?.fields.attempts || 0) + 1),
          detail: 'Giao mô phỏng trong trình duyệt',
        },
      })
    }
    return updates
  })
}
