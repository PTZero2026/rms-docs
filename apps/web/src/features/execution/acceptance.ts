import {
  change,
  check,
  date,
  decisionNotice,
  evidence,
  guard,
  ids,
  linked,
  member,
  officer,
  principal,
  related,
  setting,
  today,
  transition,
  typeNames,
} from './model.ts'
import type { Context, Data, Row } from './model.ts'

export function promisedOutputs(c: Context, p: Row) {
  let counts: Record<string, unknown> = {}
  try {
    counts = JSON.parse(p.fields.commitments || '{}') || {}
  } catch {
    /* Show missing commitment details below. */
  }
  const approved = related(c, p, 'output').filter((r) => r.status === 'APPROVED')
  return Object.entries(counts).map(([type, target]) => ({
    type,
    label: typeNames[type] || 'Loại chưa hợp lệ',
    target: Number(target),
    valid: Boolean(typeNames[type]) && Number.isSafeInteger(Number(target)) && Number(target) > 0,
    count: new Set(approved.filter((r) => r.fields.type === type).map((r) => r.id)).size,
  }))
}
export function gate(c: Context, p: Row) {
  const reports = related(c, p, 'report').sort((a, b) => Number(b.fields.period) - Number(a.fields.period))
  const gaps: string[] = []
  if (reports[0]?.status !== 'PASSED') gaps.push('Kỳ báo cáo cuối chưa đạt')
  const promises = promisedOutputs(c, p)
  if (!promises.length) gaps.push('Thiếu danh sách sản phẩm cam kết theo loại')
  for (const entry of promises) {
    if (!entry.valid) gaps.push('Cam kết sản phẩm chưa hợp lệ')
    else if (entry.count < entry.target) gaps.push('Thiếu ' + (entry.target - entry.count) + ' ' + entry.label)
  }
  return gaps
}
export function takeIntoAcceptance(c: Context, p: Row, file: string) {
  guard(c, p, principal(c, p) || officer(c, p), ['IN_PROGRESS'])
  const gaps = gate(c, p)
  check(!gaps.length, gaps.join('. '))
  evidence(file)
  return [
    transition(p, 'PENDING_ACCEPTANCE', { finalEvidence: file }),
    ...decisionNotice(
      c,
      p,
      'F06',
      'Hồ sơ chờ nghiệm thu · ' + p.title,
      'an',
      'request-' + (p.fields.redoCount || 0),
    ),
  ]
}
export function committee(c: Context, p: Row, d: Data) {
  guard(c, p, officer(c, p), ['PENDING_ACCEPTANCE'])
  const members = [...new Set(ids(d.members))]
  check(d.decision?.trim() && members.length, 'Cần số quyết định và thành viên hội đồng.')
  check(
    members.every(
      (id) => c.rows.some((r) => r.kind === 'profile' && r.owner === id) && id !== p.owner && !member(p, id),
    ),
    'Thành viên không hợp lệ hoặc có xung đột lợi ích.',
  )
  return [
    linked(
      p,
      'committee',
      'Hội đồng nghiệm thu',
      'ACTIVE',
      { type: 'ACCEPTANCE', members: members.join(','), decision: d.decision },
      c.session.userId,
      related(c, p, 'committee')[0]?.id || 'exec-committee-' + p.id,
    ),
  ]
}
export function activeRound(c: Context, p: Row) {
  return related(c, p, 'round').find((r) => r.id === p.fields.roundId && r.fields.type === 'ACCEPTANCE')
}
export function eligible(c: Context, p: Row) {
  const round = activeRound(c, p)
  return (
    c.session.role === 'reviewer' &&
    p.status === 'UNDER_ACCEPTANCE' &&
    round?.status === 'COLLECTING_SCORES' &&
    ids(round.fields.members).includes(c.session.userId) &&
    p.owner !== c.session.userId &&
    !member(p, c.session.userId)
  )
}
export function openRound(c: Context, p: Row, d: Data) {
  guard(c, p, officer(c, p), ['PENDING_ACCEPTANCE'])
  const team = related(c, p, 'committee').find((r) => r.status === 'ACTIVE' && r.fields.type === 'ACCEPTANCE')
  const members = ids(team?.fields.members).filter((id) => id !== p.owner && !member(p, id))
  const minimum = Number(setting(c, 'ACCEPTANCE.MIN_SUBMITTED_SCORE_SHEETS', '1'))
  check(
    minimum >= 1 && members.length >= minimum,
    'Hội đồng chưa đủ thành viên độc lập cho số phiếu tối thiểu.',
  )
  date(d.date, 'họp')
  const round = linked(
    p,
    'round',
    'Đợt nghiệm thu ' + p.fields.code,
    'COLLECTING_SCORES',
    {
      type: 'ACCEPTANCE',
      criteria: 'NT-2026-v1',
      members: members.join(','),
      minimum: String(minimum),
      threshold: setting(c, 'ACCEPTANCE.PASSING_SCORE', '70'),
      date: d.date,
    },
    c.session.userId,
  )
  return [
    transition(p, 'UNDER_ACCEPTANCE', { roundId: round.id }),
    round,
    ...[p.owner, ...members].flatMap((id) =>
      decisionNotice(c, p, 'F06', 'Đã mở đợt nghiệm thu · ' + p.title, id, round.id),
    ),
  ]
}
export function ballots(c: Context, p: Row) {
  const round = activeRound(c, p)
  if (!round) return []
  const votes = related(c, p, 'ballot').filter(
    (r) =>
      r.fields.type === 'ACCEPTANCE' &&
      r.fields.roundId === round.id &&
      r.status === 'SUBMITTED' &&
      ids(round.fields.members).includes(r.owner) &&
      r.owner !== p.owner &&
      !member(p, r.owner),
  )
  return [...new Map(votes.map((r) => [r.owner, r])).values()]
}
export function submitBallot(c: Context, p: Row, d: Data, draft = false) {
  guard(c, p, Boolean(eligible(c, p)), ['UNDER_ACCEPTANCE'])
  const round = activeRound(c, p)!
  check(!ballots(c, p).some((r) => r.owner === c.session.userId), 'Phiếu đã gửi và khóa.')
  const input = [d.science, d.impact]
  check(
    input.every((s) => (draft && !s) || (/^\d+(\.\d{1,2})?$/.test(s) && Number(s) <= 100)),
    'Nhập đủ hai điểm từ 0 đến 100.',
  )
  const science = Math.round(Number(d.science || 0) * 100)
  const impact = Math.round(Number(d.impact || 0) * 100)
  const total = (Math.round((science * 60 + impact * 40) / 100) / 100).toFixed(2)
  return [
    linked(
      p,
      'ballot',
      'Phiếu nghiệm thu · ' + p.fields.code,
      draft ? 'DRAFT' : 'SUBMITTED',
      { ...d, total, type: 'ACCEPTANCE', roundId: round.id },
      c.session.userId,
      round.id + '-' + c.session.userId,
    ),
  ]
}
export function conclude(c: Context, p: Row) {
  guard(c, p, officer(c, p), ['UNDER_ACCEPTANCE'])
  const round = activeRound(c, p)
  check(round?.status === 'COLLECTING_SCORES', 'Đợt nghiệm thu không còn mở.')
  const votes = ballots(c, p),
    missing = Number(round.fields.minimum) - votes.length
  check(missing <= 0, 'Thiếu ' + missing + ' phiếu nghiệm thu đã gửi.')
  const hundredths = votes.reduce((sum, r) => sum + Math.round(Number(r.fields.total) * 100), 0)
  const mean = (Math.round(hundredths / votes.length) / 100).toFixed(2)
  const result = Number(mean) >= Number(round.fields.threshold) ? 'PASSED' : 'FAILED'
  return [
    transition(p, result),
    change(round, 'CONCLUDED', { aggregate: mean, conclusion: result }),
    ...decisionNotice(c, p, 'F06', 'Đã kết luận nghiệm thu · ' + p.title, p.owner, round.id + '-concluded'),
  ]
}
export function redo(c: Context, p: Row, d: Data) {
  guard(c, p, officer(c, p), ['FAILED'])
  const count = Number(p.fields.redoCount || 0)
  check(count < Number(setting(c, 'ACCEPTANCE.MAX_REDO_COUNT', '1')), 'Đã hết số lần làm lại.')
  date(d.deadline, 'hạn làm lại')
  check(d.reason?.trim() && d.deadline > today, 'Cần lý do và hạn làm lại sau hôm nay.')
  // Preserve the previous report and create a new final period for the revised dossier.
  const period = 1 + Math.max(0, ...related(c, p, 'report').map((r) => Number(r.fields.period)))
  return [
    transition(p, 'IN_PROGRESS', { ...d, redoCount: String(count + 1) }),
    linked(p, 'report', 'Kỳ ' + period + ' · Báo cáo làm lại', 'PENDING_SUBMISSION', {
      period: String(period),
      dueDate: d.deadline,
    }),
  ]
}
export function reopenRound(c: Context, p: Row, reason: string) {
  guard(c, p, officer(c, p), ['PASSED', 'FAILED'])
  const round = activeRound(c, p)
  check(round?.status === 'CONCLUDED' && reason.trim(), 'Cần đợt đã kết luận và lý do mở lại.')
  const next = linked(
    p,
    'round',
    'Đợt đánh giá lại',
    'COLLECTING_SCORES',
    { ...round.fields, aggregate: '', conclusion: '', reason, previousId: round.id },
    c.session.userId,
  )
  return [transition(p, 'UNDER_ACCEPTANCE', { roundId: next.id }), next]
}
