import type { DemoRow } from '../../demo/types.ts'
import {
  callStatus,
  change,
  config,
  demoTime,
  ensure,
  find,
  ids,
  managed,
  names,
  newId,
  record,
  scopeUnit,
  transition,
} from './model.ts'
import type { Context } from './model.ts'

export const criteria = [
  { title: 'Giá trị khoa học', weight: 0.5 },
  { title: 'Tính khả thi', weight: 0.3 },
  { title: 'Khả năng ứng dụng', weight: 0.2 },
]
export const reviewerPool = ['minh', 'hue', 'son']
export const councilRoles = {
  CHAIR: 'Chủ tịch',
  REVIEWER: 'Phản biện',
  MEMBER: 'Ủy viên',
  SECRETARY: 'Thư ký',
}
export type Seat = { user: string; role: keyof typeof councilRoles }
export function saveCouncil(
  ctx: Context,
  title: string,
  code: string,
  seats: Seat[],
  id?: string,
): DemoRow {
  const old = id ? record(ctx, 'council', id) : undefined
  ensure(
    ctx.session.role === 'officer' && (!old || managed(ctx, old)),
    'Chỉ chuyên viên phụ trách được lập hội đồng.',
  )
  ensure(title.trim() && code.trim(), 'Nhập tên và mã hội đồng.')
  ensure(
    !ctx.rows.some((r) => r.kind === 'council' && r.id !== id && r.fields.code === code.trim()),
    'Mã hội đồng đã tồn tại.',
  )
  ensure(
    seats.length && seats.every((s) => reviewerPool.includes(s.user) && s.role in councilRoles),
    'Chọn thành viên và chức danh.',
  )
  ensure(
    new Set(seats.map((s) => s.user)).size === seats.length,
    'Một người chỉ giữ một ghế trong hội đồng.',
  )
  return {
    id: id ?? newId('council'),
    kind: 'council',
    title: title.trim(),
    owner: ctx.session.userId,
    unit: old?.unit || scopeUnit(ctx) || ctx.session.unit,
    status: 'ACTIVE',
    fields: {
      code: code.trim(),
      type: 'PROPOSAL_REVIEW',
      seats: JSON.stringify(seats),
      memberIds: seats.map((s) => s.user).join(','),
    },
  }
}
export const roundFor = (rows: DemoRow[], projectId: string) =>
  rows.find((r) => r.kind === 'review-round' && r.fields.projectId === projectId)
export function eligible(p: DemoRow, r: DemoRow, rows: DemoRow[] = []) {
  const council = find(rows, 'council', r.fields.councilId)
  const roster =
    council && r.status === 'COLLECTING_SCORES'
      ? ids(council.fields.memberIds)
      : ids(r.fields.memberIds)
  return ids(r.fields.memberIds).filter(
    (uid) => roster.includes(uid) && uid !== p.owner && !ids(p.fields.memberIds).includes(uid),
  )
}
export function councilUpdates(ctx: Context, council: DemoRow) {
  const nextRows = [...ctx.rows.filter((r) => r.id !== council.id), council]
  const changed: DemoRow[] = [council]
  for (const round of ctx.rows) {
    if (
      round.kind !== 'review-round' ||
      round.status !== 'COLLECTING_SCORES' ||
      round.fields.councilId !== council.id ||
      !managed(ctx, round)
    )
      continue
    const p = find(ctx.rows, 'project', round.fields.projectId)
    if (!p) continue
    const reviewerIds = eligible(p, round, nextRows).join(',')
    if (reviewerIds !== round.fields.reviewerIds) changed.push(change(round, { reviewerIds }))
  }
  return changed
}
export const reviewerAccess = (ctx: Context, p: DemoRow, r?: DemoRow) =>
  Boolean(
    ctx.session.role === 'reviewer' &&
    r?.status === 'COLLECTING_SCORES' &&
    r.fields.projectId === p.id &&
    eligible(p, r, ctx.rows).includes(ctx.session.userId),
  )
export function openRound(ctx: Context, id: string, councilId: string, ethics = false) {
  const p = record(ctx, 'project', id)
  ensure(managed(ctx, p), 'Chỉ chuyên viên phụ trách được mở đợt.')
  if (roundFor(ctx.rows, id)?.status === 'COLLECTING_SCORES' && p.status === 'UNDER_REVIEW')
    return []
  ensure(
    p.status === 'SUBMITTED' && p.fields.finalized === 'true',
    'Cần hồ sơ đã nộp và chốt danh sách.',
  )
  const call = record(ctx, 'call', p.fields.callId)
  ensure(callStatus(call) === 'CLOSED', 'Đóng kỳ nhận đề xuất trước khi mở đợt chấm.')
  const rubric = find(ctx.rows, 'intake-reference', call.fields.criteria)
  ensure(
    rubric?.fields.category === 'criteria' && rubric.fields.type === 'PROPOSAL_REVIEW',
    'Kỳ chưa gán bộ tiêu chí xét duyệt hợp lệ.',
  )
  const council = record(ctx, 'council', councilId)
  ensure(
    managed(ctx, council) &&
      council.fields.type === 'PROPOSAL_REVIEW' &&
      eligible(p, council).length,
    'Cần hội đồng có thành viên đủ quyền chấm.',
  )
  const round: DemoRow = {
    id: 'intake-round-' + id,
    kind: 'review-round',
    title: council.title,
    unit: p.unit,
    owner: ctx.session.userId,
    status: 'COLLECTING_SCORES',
    fields: {
      projectId: id,
      councilId,
      criteria: rubric.id,
      memberIds: council.fields.memberIds,
      reviewerIds: eligible(p, council).join(','),
      min: rubric.fields.min,
      passing: rubric.fields.passing,
      publicComments: rubric.fields.publicComments,
      publicScore: rubric.fields.publicScore,
      ethics: ethics ? 'PENDING' : 'EXEMPT',
      openedAt: demoTime(),
    },
  }
  return [
    transition(ctx, p, 'UNDER_REVIEW'),
    round,
    notice(p, 'UNDER_REVIEW', 'Đề tài đã vào vòng xét duyệt'),
  ]
}
export function score(
  ctx: Context,
  id: string,
  points: string[],
  comment: string,
  action: 'draft' | 'submit',
): DemoRow {
  const p = record(ctx, 'project', id)
  const r = roundFor(ctx.rows, id)
  ensure(r && reviewerAccess(ctx, p, r), 'Phiếu nằm ngoài phạm vi được chấm.')
  const uid = ctx.session.userId
  const sheetId = 'intake-score-' + r.id + '-' + uid
  const previous = ctx.rows.find(
    (s) => s.kind === 'score' && s.owner === uid && s.fields.roundId === r.id,
  )
  ensure(previous?.status !== 'SUBMITTED', 'Phiếu đã gửi và đã khóa.')
  ensure(points.length === criteria.length, 'Cần đủ các tiêu chí.')
  let total = 0
  points.forEach((value, index) => {
    if (!value.trim() && action === 'draft') return
    ensure(
      value.trim() && Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 10,
      'Nhập điểm từ 0 đến 10 cho ' + criteria[index].title + '.',
    )
    total += Number(value) * criteria[index].weight
  })
  return {
    id: previous?.id ?? sheetId,
    kind: 'score',
    title: 'Phiếu chấm ' + (names[uid] || uid),
    status: action === 'submit' ? 'SUBMITTED' : 'DRAFT',
    owner: uid,
    unit: p.unit,
    fields: {
      roundId: r.id,
      projectId: id,
      points: JSON.stringify(points),
      total: total.toFixed(2),
      comment,
    },
  }
}
export function summarize(rows: DemoRow[], p: DemoRow, r: DemoRow) {
  const closed = r.status === 'CONCLUDED'
  const valid =
    closed && r.fields.eligibleVoters ? ids(r.fields.eligibleVoters) : eligible(p, r, rows)
  const counted =
    closed && r.fields.countedSheets ? new Set(ids(r.fields.countedSheets)) : undefined
  const sheets = rows.filter(
    (s) =>
      s.kind === 'score' &&
      s.fields.roundId === r.id &&
      s.status === 'SUBMITTED' &&
      valid.includes(s.owner) &&
      (!counted || counted.has(s.id)),
  )
  const count = sheets.length
  const mean = count
    ? Number((sheets.reduce((sum, s) => sum + Number(s.fields.total), 0) / count).toFixed(2))
    : 0
  const minimum = Number(
    closed
      ? r.fields.min
      : (config(rows, 'PROPOSAL_REVIEW.MIN_SUBMITTED_SCORE_SHEETS') ?? r.fields.min),
  )
  const passing = Number(
    closed ? r.fields.passing : (config(rows, 'PROPOSAL_REVIEW.PASSING_SCORE') ?? r.fields.passing),
  )
  const policyValid =
    Number.isInteger(minimum) &&
    minimum > 0 &&
    Number.isFinite(passing) &&
    passing >= 0 &&
    passing <= 10
  return {
    sheets,
    count,
    eligible: valid.length,
    mean,
    minimum,
    passing,
    policyValid,
    missing: Math.max(0, minimum - count),
  }
}
function notice(p: DemoRow, status: string, title: string): DemoRow {
  return {
    id: 'intake-notice-' + p.id + '-' + status,
    kind: 'notice',
    owner: p.owner,
    unit: p.unit,
    title: title + ' · ' + p.title,
    status: 'UNREAD',
    fields: { text: p.title, projectId: p.id, feature: 'F01', targetId: p.id, at: demoTime() },
  }
}
function decide(ctx: Context, p: DemoRow, r: DemoRow): DemoRow[] {
  if (
    r.fields.conclusion !== 'FAILED' &&
    (r.fields.conclusion !== 'PASSED' || ['PENDING', 'SUPPLEMENT'].includes(r.fields.ethics))
  )
    return [r]
  const rejected = r.fields.conclusion === 'FAILED' || r.fields.ethics === 'REJECTED'
  const status = rejected ? 'REJECTED' : 'APPROVED'
  if (p.status === status) return [r]
  return [transition(ctx, p, status), r]
}
export function conclude(ctx: Context, id: string) {
  const p = record(ctx, 'project', id)
  const r = roundFor(ctx.rows, id)
  ensure(
    managed(ctx, p) &&
      r?.status === 'COLLECTING_SCORES' &&
      ['APPROVED', 'REJECTED', 'UNDER_REVIEW'].includes(p.status),
    'Không thể chốt kết luận ở bước này.',
  )
  const stats = summarize(ctx.rows, p, r)
  ensure(stats.policyValid, 'Kiểm tra cấu hình số phiếu tối thiểu và ngưỡng đạt tại B01.')
  ensure(!stats.missing, 'Còn thiếu ' + stats.missing + ' phiếu hợp lệ.')
  return decide(
    ctx,
    p,
    change(
      r,
      {
        aggregate: String(stats.mean),
        passing: String(stats.passing),
        min: String(stats.minimum),
        eligibleVoters: eligible(p, r, ctx.rows).join(','),
        countedSheets: stats.sheets.map((sheet) => sheet.id).join(','),
        reviewerIds: '',
        conclusion: stats.mean >= stats.passing ? 'PASSED' : 'FAILED',
        concludedAt: demoTime(),
      },
      'CONCLUDED',
    ),
  )
}
export function recordEthics(
  ctx: Context,
  id: string,
  result: 'SUPPLEMENT' | 'APPROVED' | 'REJECTED',
  note: string,
) {
  const p = record(ctx, 'project', id)
  const r = roundFor(ctx.rows, id)
  ensure(
    managed(ctx, p) && r && r.fields.ethics !== 'EXEMPT',
    'Không có thẩm định đạo đức trong phạm vi phụ trách.',
  )
  if (r.fields.ethics === result && r.fields.ethicsNote === note.trim()) return []
  ensure(
    p.status === 'UNDER_REVIEW' && ['PENDING', 'SUPPLEMENT'].includes(r.fields.ethics),
    'Đã có quyết định cuối.',
  )
  ensure(note.trim(), 'Nhập căn cứ hoặc nội dung yêu cầu bổ sung.')
  return decide(ctx, p, change(r, { ethics: result, ethicsNote: note.trim() }))
}
export function reopen(ctx: Context, id: string, reason: string) {
  const p = record(ctx, 'project', id)
  const r = roundFor(ctx.rows, id)
  ensure(
    managed(ctx, p) &&
      r?.status === 'CONCLUDED' &&
      ['APPROVED', 'REJECTED', 'UNDER_REVIEW'].includes(p.status),
    'Không thể mở lại đợt này.',
  )
  ensure(reason.trim(), 'Nhập lý do mở lại đợt.')
  const opened = change(
    r,
    {
      reason: reason.trim(),
      reviewerIds: eligible(p, r, ctx.rows).join(','),
      conclusion: '',
      aggregate: '',
      concludedAt: '',
    },
    'COLLECTING_SCORES',
  )
  return [opened]
}
