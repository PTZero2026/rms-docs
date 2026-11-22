import type { DemoRow } from '../../demo/types.ts'
import {
  activeWorkflow,
  author,
  change,
  demoTime,
  ensure,
  find,
  ids,
  managed,
  newId,
  receiving,
  record,
  transition,
} from './model.ts'
import type { Context } from './model.ts'

export type ProposalForm = {
  title: string
  callId: string
  discipline: string
  objective: string
  method: string
  outcome: string
  memberIds: string
  durationMonths: string
  requestedBudget: string
  attachment: string
  attachments: string
  assignments: string
}
export const blankProposal: ProposalForm = {
  title: '',
  callId: '',
  discipline: '',
  objective: '',
  method: '',
  outcome: '',
  memberIds: '',
  durationMonths: '',
  requestedBudget: '',
  attachment: '',
  attachments: '',
  assignments: '',
}
export function proposalForm(project: DemoRow): ProposalForm {
  const form = { ...blankProposal }
  for (const key of Object.keys(form) as (keyof ProposalForm)[]) form[key] = project.fields[key] || ''
  return { ...form, title: project.title }
}
export function saveDraft(ctx: Context, form: ProposalForm, id?: string): DemoRow {
  ensure(ctx.session.role === 'researcher', 'Chỉ chủ nhiệm được lập đề xuất.')
  const old = id ? record(ctx, 'project', id) : undefined
  ensure(!old || (author(ctx, old) && old.status === 'DRAFT'), 'Hồ sơ chỉ cho chủ nhiệm sửa khi còn nháp.')
  const call = record(ctx, 'call', form.callId)
  ensure(old ? call.id === old.fields.callId : receiving(call), 'Chọn một kỳ đang nhận đề xuất.')
  const members = ids(form.memberIds)
  ensure(
    !members.includes(ctx.session.userId) && new Set(members).size === members.length,
    'Thành viên đã có trong đề tài.',
  )
  const { title, ...fields } = form
  return {
    id: old?.id ?? newId('project'),
    kind: 'project',
    owner: ctx.session.userId,
    unit: old?.unit ?? ctx.session.unit,
    title: title.trim(),
    status: 'DRAFT',
    fields: {
      code: '',
      workflowVersion: activeWorkflow(ctx.rows),
      ...old?.fields,
      ...fields,
      revision: String(old ? Number(old.fields.revision || '1') + 1 : 1),
      due: call.fields.due,
    },
  }
}
export function submissionIssues(project: DemoRow, call?: DemoRow) {
  const f = project.fields
  const issues: string[] = []
  if (!receiving(call)) issues.push('Kỳ chưa mở hoặc đã hết hạn nhận.')
  if (!project.title.trim()) issues.push('Nhập tên đề tài.')
  if (!f.discipline || !ids(call?.fields.disciplines).includes(f.discipline))
    issues.push('Chọn lĩnh vực được tiếp nhận trong kỳ.')
  if (!f.objective?.trim()) issues.push('Bổ sung mục tiêu nghiên cứu.')
  if (!f.method?.trim()) issues.push('Bổ sung phương pháp nghiên cứu.')
  if (!f.outcome?.trim()) issues.push('Bổ sung sản phẩm dự kiến.')
  if (
    !/^\d+$/.test(f.durationMonths) ||
    !Number.isSafeInteger(Number(f.durationMonths)) ||
    Number(f.durationMonths) < 1
  )
    issues.push('Thời gian thực hiện phải là số tháng nguyên dương.')
  if (!/^\d+$/.test(f.requestedBudget) || !Number.isSafeInteger(Number(f.requestedBudget)))
    issues.push('Kinh phí phải là số nguyên VND không âm.')
  return issues
}
export function submitProposal(ctx: Context, id: string) {
  const p = record(ctx, 'project', id)
  ensure(author(ctx, p) && p.status === 'DRAFT', 'Chỉ chủ nhiệm được nộp bản nháp.')
  const issues = submissionIssues(p, find(ctx.rows, 'call', p.fields.callId))
  ensure(!issues.length, issues.join(' '))
  const code =
    p.fields.code ||
    ctx.session.tenant.toUpperCase() + '-26-' + p.id.replace(/^intake-project-/, '').toUpperCase()
  ensure(
    !ctx.rows.some((r) => r.kind === 'project' && r.id !== id && r.fields.code === code),
    'Mã theo dõi đã được sử dụng.',
  )
  return transition(ctx, p, 'SUBMITTED', {
    code,
    submittedAt: demoTime(),
    finalized: 'false',
    checked: 'false',
  })
}
export function processProposal(
  ctx: Context,
  id: string,
  action: 'check' | 'finalize' | 'return' | 'cancel',
  reason = '',
) {
  const project = record(ctx, 'project', id)
  if (action === 'cancel') {
    ensure(managed(ctx, project) || author(ctx, project), 'Bạn không được hủy đề xuất này.')
    ensure(reason.trim(), 'Nhập lý do hủy.')
    return transition(ctx, project, 'CANCELLED', { reason: reason.trim(), finalized: 'false' })
  }
  ensure(
    managed(ctx, project) && project.status === 'SUBMITTED',
    'Chỉ xử lý hồ sơ đã nộp trong đơn vị phụ trách.',
  )
  if (action === 'return') {
    ensure(
      receiving(find(ctx.rows, 'call', project.fields.callId)),
      'Kỳ đã hết hạn hoặc đã đóng, không thể trả bổ sung.',
    )
    ensure(reason.trim(), 'Nhập lý do trả lại bổ sung.')
    return transition(ctx, project, 'DRAFT', {
      reason: reason.trim(),
      checked: 'false',
      finalized: 'false',
    })
  }
  if (action === 'check') return change(project, { checked: 'true' })
  ensure(project.fields.checked === 'true', 'Cần kiểm tra hồ sơ trước khi chốt.')
  return change(project, { finalized: 'true' })
}
