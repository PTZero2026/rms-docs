import { sourceAllowed } from '../../demo/source-rights.ts'
import type { DemoRow } from '../../demo/types.ts'
import { author, change, demoTime, ensure, newId, record } from './model.ts'
import type { Context } from './model.ts'

function source(ctx: Context, id: string) {
  const p = record(ctx, 'project', id)
  ensure(
    ctx.aiEnabled && sourceAllowed(ctx.rows, p) && author(ctx, p) && p.status === 'DRAFT',
    'Không thể mở nguồn trong phạm vi hiện tại.',
  )
  return p
}
export function suggest(ctx: Context, id: string, consent: boolean): DemoRow {
  ensure(consent, 'Cần đồng ý dùng bản nháp này để đối chiếu.')
  const p = source(ctx, id)
  const call = record(ctx, 'call', p.fields.callId)
  const template = record(ctx, 'intake-reference', call.fields.template)
  const excerpt = p.fields.method?.trim().slice(0, 240) || ''
  return {
    id: newId('evidence'),
    kind: 'proposal-evidence',
    owner: ctx.session.userId,
    unit: p.unit,
    title: excerpt ? 'Đối chiếu phương pháp nghiên cứu' : 'Chưa đủ căn cứ cho mục phương pháp',
    status: 'PENDING',
    fields: {
      projectId: id,
      template: template.title,
      templateVersion: template.fields.version,
      source: 'method',
      sourceVersion: p.fields.revision || '1',
      offset: String(p.fields.method?.indexOf(excerpt) ?? 0),
      location: 'Thuyết minh · Phương pháp nghiên cứu',
      model: 'Mô phỏng cục bộ 1',
      promptVersion: '1',
      excerpt,
      createdAt: demoTime(),
    },
  }
}
export function openEvidence(ctx: Context, id: string) {
  const hint = record(ctx, 'proposal-evidence', id)
  const p = source(ctx, hint.fields.projectId)
  ensure(hint.owner === ctx.session.userId && hint.unit === p.unit, 'Căn cứ ngoài phạm vi truy cập.')
  ensure(
    (!hint.fields.sourceVersion || hint.fields.sourceVersion === (p.fields.revision || '1')) &&
      (!hint.fields.excerpt || p.fields.method?.includes(hint.fields.excerpt)),
    'Đoạn nguồn đã thay đổi. Hãy đối chiếu bản nháp mới.',
  )
  return hint
}
export function decideSuggestion(ctx: Context, id: string, decision: 'ACCEPTED' | 'DISMISSED') {
  const hint = openEvidence(ctx, id)
  ensure(hint.status === 'PENDING', 'Gợi ý đã được xử lý.')
  return change(hint, { decidedAt: demoTime() }, decision)
}
