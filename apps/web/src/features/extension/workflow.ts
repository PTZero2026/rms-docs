import { schoolUnits } from '../../demo/datasets.ts'
import type { DemoRow, Session } from '../../demo/types'
import { unitAllowed } from '../../demo/identity.ts'
import { managingBodies } from './catalogue.ts'
import { catalog, category, checkEvidence, codes, contributors, ensureEnabled, featureInfo, officer, openCall, sourceOf, studentsIn, today, validDate, validateContributors } from './model.ts'
import type { Context, Source } from './model.ts'
import { postHours, reverseHours } from './hours.ts'

export function canRead(s: Session, r: DemoRow) {
  if (officer(s,r)) return true
  if (s.role === 'admin') return false
  if (r.kind === 'student-project' && s.role === 'student') return codes(r.fields.group).includes(s.userId)
  return ['researcher','reviewer'].includes(s.role) && (r.owner === s.userId || contributors(r).some(p => p.id === s.userId))
}
export function canCreate(s: Session, feature: Source) {
  return s.role === 'officer' || (feature === 'F10' ? s.role === 'student' : s.role === 'researcher')
}
export function canEdit(s: Session, r: DemoRow) {
  if (r.kind === 'student-project' && ['APPROVED','IN_PROGRESS'].includes(r.status)) return officer(s,r)
  return r.status === 'DRAFT' && (officer(s,r) || (r.owner === s.userId && canCreate(s,sourceOf(r))))
}
export function newRecord(ctx: Context, feature: Source, id: string): DemoRow {
  const isStudent = feature === 'F10'
  const s = ctx.session
  const units = schoolUnits(s.tenant, ctx.rows)
  const owner = isStudent ? (s.role === 'student' ? s.userId : (s.unit === units[1] ? 'ngoc' : 'linh')) : (s.role === 'researcher' ? s.userId : 'mai')
  const unit = units.includes(s.unit) ? s.unit : units[0]
  const call = ctx.rows.find(r => r.kind === 'ext-student-call' && r.unit === unit && openCall(r))
  const item = catalog(ctx.rows,feature)[0]
  return { id, kind: featureInfo[feature].kind, owner, unit, status: 'DRAFT', title: '', fields: {
    category: item?.fields.code || '', scopeUnit: unit, cycle: '1', start: today, end: '', budget: '', evidence: '{}',
    group: isStudent ? owner : '', callId: isStudent ? call?.id || '' : '',
    contributors: JSON.stringify([{ id: isStudent ? 'mai' : owner, role: isStudent ? 'GV hướng dẫn' : 'Chủ nhiệm', share: 100 }]),
  } }
}
function checkGroup(rows: DemoRow[], row: DemoRow) {
  const call = rows.find(r => r.kind === 'ext-student-call' && r.id === row.fields.callId && r.unit === row.unit)
  if (!call) throw new Error('Chọn đợt đăng ký đúng khoa của nhóm.')
  const group = codes(row.fields.group)
  if (!group.includes(row.owner) || group.some(id => !Object.hasOwn(studentsIn(row.unit),id)) || new Set(group).size !== group.length)
    throw new Error('Chọn trưởng nhóm và thành viên từ danh sách sinh viên đồng bộ.')
  if (group.length < Number(call.fields.min) || group.length > Number(call.fields.max))
    throw new Error('Đợt yêu cầu từ ' + call.fields.min + ' đến ' + call.fields.max + ' sinh viên mỗi nhóm.')
  return call
}
function validate(ctx: Context, row: DemoRow) {
  const { rows } = ctx
  const units = schoolUnits(ctx.session.tenant, ctx.rows)
  const feature = sourceOf(row)
  if (!row.title.trim()) throw new Error('Nhập tên hồ sơ.')
  if (!(feature === 'F09' && !row.unit) && !units.includes(row.unit)) throw new Error('Chọn đơn vị chủ trì.')
  validateContributors(contributors(row), feature === 'F10')
  if (feature === 'F10') {
    checkGroup(rows,row)
    if (!row.fields.objective?.trim() || !row.fields.product?.trim()) throw new Error('Nhập mục tiêu và sản phẩm dự kiến.')
    return
  }
  category(rows,row)
  if (feature === 'F09' && !managingBodies(rows).includes(row.fields.agency)) throw new Error('Chọn cơ quan chủ trì cấp trên.')
  if (!validDate(row.fields.start) || (feature !== 'F12' && (!validDate(row.fields.end) || row.fields.end < row.fields.start)))
    throw new Error('Kiểm tra ngày bắt đầu và ngày kết thúc của hồ sơ.')
  if (feature === 'F12' && (!row.fields.description?.trim() || row.fields.start > today)) throw new Error('Nhập nội dung hoạt động và ngày diễn ra đến hôm nay.')
  if (row.fields.budget && (!Number.isSafeInteger(Number(row.fields.budget)) || Number(row.fields.budget) < 0))
    throw new Error('Kinh phí phải là số nguyên VND từ 0 trở lên.')
}
export function saveDraft(ctx: Context, proposed: DemoRow, reason = '') {
  ensureEnabled(ctx)
  const old = ctx.rows.find(r => r.id === proposed.id)
  const s = ctx.session
  const feature = sourceOf(proposed)
  if (!unitAllowed(proposed,s,ctx.rows) || (old ? !unitAllowed(old,s,ctx.rows) || !canEdit(s,old) || old.kind !== proposed.kind || old.owner !== proposed.owner :
      !canCreate(s,feature) || (s.role !== 'officer' && proposed.owner !== s.userId))) throw new Error('Thiếu quyền sửa hồ sơ này.')
  if (s.role !== 'officer' && proposed.unit && proposed.unit !== s.unit) throw new Error('Chọn đơn vị trong phạm vi của bạn.')
  const row = { ...proposed, title: proposed.title.trim(), status: old?.status || 'DRAFT', fields: { ...proposed.fields } }
  validate(ctx,row)
  if (feature === 'F10') {
    const changed = !old || ['callId','group','objective','product','contributors'].some(k => old.fields[k] !== row.fields[k]) ||
      old.title !== row.title || old.unit !== row.unit
    if (old && old.status !== 'DRAFT' && !reason.trim()) throw new Error('Nhập lý do thay đổi hồ sơ đã phê duyệt.')
    const amended = Boolean(old && ['APPROVED','IN_PROGRESS'].includes(old.status))
    if (amended && changed && old) row.fields.resumeStatus = old.status
    row.fields.mentorConfirmation = changed ? '' : old?.fields.mentorConfirmation || ''
    row.fields.confirmedMentor = changed ? '' : old?.fields.confirmedMentor || ''
    if (amended && changed) row.status = 'MENTOR_PENDING'
    if (reason.trim()) row.fields.reason = reason.trim()
  }
  row.fields.memberIds = (feature === 'F10' ? [...codes(row.fields.group), ...contributors(row).map(p => p.id)] : contributors(row).map(p => p.id)).join(',')
  row.fields.statusSemantic = semantic(row.status)
  return row
}

export const actionNames = {
  submit: 'Gửi duyệt', approve: 'Phê duyệt', return: 'Trả lại bổ sung', reject: 'Từ chối', revoke: 'Thu hồi',
  invite: 'Mời GVHD xác nhận', mentorAccept: 'Đồng ý hướng dẫn', mentorReturn: 'Yêu cầu sửa đăng ký', mentorDecline: 'Từ chối hướng dẫn',
  start: 'Bắt đầu thực hiện', sendResult: 'Nộp kết quả', mentorFinal: 'Xác nhận hồ sơ kết quả', returnResult: 'Trả hồ sơ kết quả',
  pass: 'Nghiệm thu đạt', fail: 'Nghiệm thu không đạt', close: 'Đóng đề tài', reopen: 'Cho làm lại', cancel: 'Hủy đề tài',
  approveResult: 'Xác nhận kết quả', checkpoint: 'Ghi nhận tiến độ',
  councilReview: 'Chuyển hội đồng xét đề cương', councilFinal: 'Chuyển hội đồng nghiệm thu',
}
export type Action = keyof typeof actionNames
export const needsReason: Action[] = ['return','reject','revoke','mentorReturn','mentorDecline','returnResult','fail','reopen','cancel']
export function actions(s: Session, r: DemoRow): Action[] {
  if (!canRead(s,r)) return []
  const staff = officer(s,r)
  const owner = s.userId === r.owner && (s.role === 'student' || s.role === 'researcher')
  const student = r.kind === 'student-project'
  const mentor = student && ['researcher','reviewer'].includes(s.role) && contributors(r).some(p => p.id === s.userId)
  const handles = owner || staff
  const full = r.fields.mode === 'FULL_LIFECYCLE'
  switch (r.status) {
    case 'DRAFT': return handles ? student ? ['invite','submit','cancel'] : ['submit'] : []
    case 'MENTOR_PENDING': return mentor ? ['mentorAccept','mentorReturn','mentorDecline'] : []
    case 'PENDING_APPROVAL': return staff ? r.kind === 'activity' ? ['approve','return','reject'] : ['approve','return'] : []
    case 'SUBMITTED': return staff ? [full ? 'councilReview' : 'approve','return','cancel'] : []
    case 'UNDER_REVIEW': return staff ? ['approve','return'] : []
    case 'APPROVED':
      if (student) return handles ? ['start'] : []
      if (r.kind === 'activity') return staff ? ['revoke'] : []
      return [...(handles ? ['sendResult' as const] : []), ...(staff ? ['revoke' as const] : [])]
    case 'IN_PROGRESS': return [...(handles || mentor ? ['sendResult' as const,'checkpoint' as const] : []), ...(staff ? ['cancel' as const] : [])]
    case 'FINAL_REVIEW': return mentor && r.fields.confirmedMentor === s.userId ? ['mentorFinal','returnResult'] : []
    case 'FINAL_SUBMITTED': return staff ? full ? ['councilFinal','returnResult'] : ['pass','fail','returnResult'] : []
    case 'UNDER_ACCEPTANCE': return staff ? ['pass','fail','returnResult'] : []
    case 'RESULT_PENDING': return staff ? ['approveResult','returnResult','revoke'] : []
    case 'PASSED': return staff ? ['close'] : []
    case 'FAILED': return staff ? ['reopen'] : []
    case 'COMPLETED': return !student && staff ? ['revoke'] : []
    default: return []
  }
}
function semantic(status: string) {
  const map: Record<string,string> = { MENTOR_PENDING: 'DRAFT', PENDING_APPROVAL: 'SUBMITTED',
    FINAL_REVIEW: 'IN_PROGRESS', FINAL_SUBMITTED: 'PENDING_ACCEPTANCE', RESULT_PENDING: 'APPROVED' }
  return map[status] || status
}
export type Decision = { reason?: string; result?: string; evidence?: string; support?: string; deadline?: string; minutes?: string }
export function transition(ctx: Context, record: DemoRow, action: Action, input: Decision = {}): DemoRow[] {
  ensureEnabled(ctx)
  const row = ctx.rows.find(r => r.id === record.id && r.kind === record.kind)
  if (!row || !unitAllowed(row,ctx.session,ctx.rows) || !actions(ctx.session,row).includes(action)) throw new Error('Bạn chưa có quyền thực hiện ở bước này.')
  const f = { ...row.fields }
  const reason = (input.reason || '').trim()
  if (needsReason.includes(action) && !reason) throw new Error('Nhập lý do để lưu quyết định.')
  const student = row.kind === 'student-project'
  let status = row.status
  let post = false
  let extra: DemoRow[] = []
  if (['approve','pass','fail'].includes(action) && ['UNDER_REVIEW','UNDER_ACCEPTANCE'].includes(row.status)) {
    if (!input.minutes?.trim()) throw new Error('Nhập số hoặc tên biên bản hội đồng làm căn cứ quyết định.')
    f[row.status === 'UNDER_REVIEW' ? 'reviewMinutes' : 'finalMinutes'] = input.minutes.trim()
  }
  switch (action) {
    case 'checkpoint':
      if (!input.result?.trim()) throw new Error('Nhập nội dung báo cáo tiến độ.')
      f.progress = input.result.trim(); f.progressDate = today; break
    case 'councilReview': status = 'UNDER_REVIEW'; break
    case 'councilFinal': status = 'UNDER_ACCEPTANCE'; break
    case 'invite':
    case 'submit':
    case 'approve':
      validate(ctx,row)
      if (student && action !== 'approve') {
        if (!f.resumeStatus && !openCall(checkGroup(ctx.rows,row))) throw new Error('Đợt đăng ký đã đóng hoặc ngoài thời hạn.')
        if (action === 'submit' && (f.mentorConfirmation !== row.id || !contributors(row).some(p => p.id === f.confirmedMentor)))
          throw new Error('Cần GVHD xác nhận hướng dẫn cho đúng hồ sơ này trước khi nộp.')
      }
      if (row.kind === 'applied-project' && !f.partner?.trim()) throw new Error('Bổ sung đối tác ngoài của dự án trước khi gửi duyệt.')
      if (action !== 'invite') checkEvidence(ctx.rows,row,'declaration')
      if (action === 'invite') { status = 'MENTOR_PENDING'; f.mentorConfirmation = ''; f.confirmedMentor = '' }
      if (action === 'submit') {
        status = student ? 'SUBMITTED' : 'PENDING_APPROVAL'
        if (student) f.mode = checkGroup(ctx.rows,row).fields.mode || 'SIMPLIFIED'
      }
      if (action === 'approve') {
        status = 'APPROVED'
        f.approvedBy = ctx.session.userId
        if (row.kind === 'activity') {
          const grant = input.support?.trim() || '0'
          if (!Number.isSafeInteger(Number(grant)) || Number(grant) < 0) throw new Error('Nhập kinh phí hỗ trợ bằng số nguyên VND từ 0 trở lên.')
          f.support = grant
        }
        if (!student) f.hourTrigger = category(ctx.rows,row).fields.trigger
        post = f.hourTrigger === 'approval'
      }
      break
    case 'mentorAccept':
      f.mentorConfirmation = row.id
      f.confirmedMentor = ctx.session.userId
      status = ['APPROVED','IN_PROGRESS'].includes(f.resumeStatus) ? f.resumeStatus : 'DRAFT'
      f.resumeStatus = ''
      break
    case 'return': case 'mentorReturn': case 'mentorDecline': f.mentorConfirmation = ''; f.confirmedMentor = ''; status = 'DRAFT'; break
    case 'reject': status = 'REJECTED'; break
    case 'start': status = 'IN_PROGRESS'; break
    case 'sendResult': {
      if (student && f.mode === 'FULL_LIFECYCLE' && !f.progress) throw new Error('Cần ghi nhận tiến độ trước khi nộp kết quả.')
      const call = student ? checkGroup(ctx.rows,row) : undefined
      if (student && (f.reworkDeadline || call?.fields.finalDue || today) < today) throw new Error('Đã hết thời hạn nộp kết quả.')
      if (!input.result?.trim()) throw new Error('Nhập tóm tắt kết quả.')
      f.resultSummary = input.result.trim()
      f.evidence = JSON.stringify({ ...JSON.parse(f.evidence || '{}'), ...JSON.parse(input.evidence || '{}') })
      checkEvidence(ctx.rows,{ ...row, fields: f },'result')
      f.finalMentor = ''
      status = student ? 'FINAL_REVIEW' : 'RESULT_PENDING'
      break
    }
    case 'mentorFinal': f.finalMentor = ctx.session.userId; status = 'FINAL_SUBMITTED'; break
    case 'returnResult': f.finalMentor = ''; status = student ? 'IN_PROGRESS' : 'APPROVED'; break
    case 'pass': case 'fail':
      if (!f.finalMentor || f.finalMentor !== f.confirmedMentor) throw new Error('Thiếu xác nhận kết quả của GVHD.')
      checkEvidence(ctx.rows,row,'result')
      status = action === 'pass' ? 'PASSED' : 'FAILED'
      f.conclusion = reason || 'Hồ sơ kết quả đạt yêu cầu.'
      break
    case 'close': status = 'COMPLETED'; post = true; break
    case 'approveResult': checkEvidence(ctx.rows,row,'result'); status = 'COMPLETED'; post = (f.hourTrigger || category(ctx.rows,row).fields.trigger) === 'result'; break
    case 'cancel': status = 'CANCELLED'; break
    case 'reopen':
      if (!input.deadline || !validDate(input.deadline) || input.deadline < today) throw new Error('Chọn hạn làm lại từ hôm nay trở đi.')
      f.reworkDeadline = input.deadline; status = 'IN_PROGRESS'; break
    case 'revoke':
      extra = reverseHours(ctx.rows,row,reason,ctx.session.userId)
      f.cycle = String(Number(f.cycle || 1) + 1)
      f.sourceOccurredAt = ''; f.support = ''; f.approvedBy = ''; status = 'DRAFT'; break
  }
  if (reason) f.reason = reason
  if (post) f.sourceOccurredAt = today
  f.statusSemantic = semantic(status)
  const next = { ...row, fields: f, status }
  return [next, ...extra, ...(post ? postHours(ctx.rows,next) : [])]
}

