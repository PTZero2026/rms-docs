import test from 'node:test'
import assert from 'node:assert/strict'
import { seed } from './seed.ts'
import { transition, saveDraft, canRead } from './workflow.ts'
import { postHours, adjustHours, saveFormula } from './hours.ts'

const mai = { role: 'researcher', userId: 'mai', tenant: 'tlu', unit: 'Khoa Công trình' }
const linh = { ...mai, role: 'student', userId: 'linh' }
const officer = { ...mai, role: 'officer', userId: 'an', unit: 'Phòng QLKH' }
const admin = { ...officer, role: 'admin', userId: 'ha' }
const context = (actor, rows = seed('tlu')) => ({ session: actor, rows, e4Enabled: true })
const get = (rows, id) => structuredClone(rows.find(r => r.id === id))
const merge = (rows, updates) => [...rows.filter(r => !updates.some(u => u.id === r.id)), ...updates]

test('F11 keeps a draft without a partner; submit and approval recheck the actual dossier', () => {
  const ctx = context(mai)
  const row = get(ctx.rows, 'ext-applied-draft')
  assert.equal(saveDraft(ctx, row).id, row.id)
  assert.throws(() => transition(ctx, row, 'submit'), /đối tác/i)
  row.fields.partner = 'Công ty CP Hạ tầng Sông Hồng'
  ctx.rows = merge(ctx.rows, [saveDraft(ctx, row)])
  const [pending] = transition(ctx, row, 'submit')
  assert.equal(pending.status, 'PENDING_APPROVAL')
  assert.throws(() => transition(context(admin, [pending]), pending, 'approve'), /quyền/i)
})

test('F09 approval names the missing evidence type; disabled routes and unrelated researchers cannot act', () => {
  const ctx = context(officer)
  const row = get(ctx.rows, 'ext-upper-pending')
  row.fields.evidence = '{}'
  ctx.rows = merge(ctx.rows, [row])
  assert.throws(() => transition(ctx, row, 'approve'), /DECISION/)
  assert.throws(() => transition({ ...ctx, e4Enabled: false }, row, 'return', { reason: 'Thiếu quyết định' }), /chưa bật/i)
  assert.equal(canRead({ ...mai, userId: 'nobody' }, row), false)
})

test('F10 confirmation is per record and mentor, and the registration window is enforced', () => {
  const ctx = context(mai)
  const row = get(ctx.rows, 'ext-student-invite')
  assert.throws(() => transition(context(officer, ctx.rows), row, 'mentorAccept'), /quyền/i)
  const [confirmed] = transition(ctx, row, 'mentorAccept')
  let records = merge(ctx.rows, [confirmed])
  const [submitted] = transition(context(linh, records), confirmed, 'submit')
  assert.equal(submitted.status, 'SUBMITTED')
  const other = { ...confirmed, id: 'ext-student-another' }
  assert.throws(() => transition(context(linh, [...records, other]), other, 'submit'), /xác nhận/i)
  const call = get(records, row.fields.callId)
  records = merge(records, [{ ...call, status: 'CLOSED' }])
  assert.throws(() => transition(context(linh, records), confirmed, 'submit'), /đợt/i)
})

test('P03 replay retains historical allocation and independent signed adjustments', () => {
  const rows = seed('tlu')
  const source = get(rows, 'ext-activity-conference')
  const original = rows.find(r => r.kind === 'hours' && r.fields.sourceId === source.id)
  assert.equal(original.fields.hours, '6')
  assert.deepEqual(postHours(rows, source), [])
  assert.throws(() => adjustHours(context(officer, rows), original, '1', ''), /lý do/i)
  const delta = adjustHours(context(officer, rows), original, '1', 'Bổ sung thời lượng báo cáo')
  assert.equal(delta.fields.originalId, original.id)
  assert.equal(original.fields.hours, '6')
  assert.equal(delta.fields.hours, '1')
  assert.deepEqual(postHours([...rows, delta], source), [])
})

test('P03 rejects overlapping versions and non-administrator configuration', () => {
  const ctx = context(admin)
  const formula = ctx.rows.find(r => r.kind === 'ext-formula' && r.status === 'ACTIVE')
  const copy = { ...formula, id: 'ext-formula-new', fields: { ...formula.fields, version: 'v9' } }
  assert.throws(() => saveFormula(ctx, copy), /chồng lấn/i)
  assert.throws(() => saveFormula(context(officer), copy), /quyền/i)
})

