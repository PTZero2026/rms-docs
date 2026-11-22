import test from 'node:test'
import assert from 'node:assert/strict'
import { seed } from './seed.ts'
import { assign, schedule, submitReport, reminders } from './progress.ts'
import { takeIntoAcceptance, openRound, submitBallot, conclude } from './acceptance.ts'
import { fee, allocate, saveExpense, balance, settle } from './budget.ts'
import { saveOutput, decideOutput, readCard } from './products.ts'
import { buildCV } from './profiles.ts'

const unit = 'Khoa Công trình'
const session = (role, userId) => ({ role, userId, tenant: 'tlu', unit, name: userId })
const mai = session('researcher', 'mai')
const an = session('officer', 'an')
const minh = session('reviewer', 'minh')
function setup() {
  let rows = seed('tlu')
  return {
    ctx(actor) {
      return { rows, session: actor, aiEnabled: true, e4Enabled: true }
    },
    get(id) {
      return rows.find((r) => r.id === id)
    },
    put(...changes) {
      rows = [...rows.filter((r) => !changes.some((s) => s.id === r.id)), ...changes]
    },
  }
}
test('both tenant fixtures use unique IDs, all links resolve', () => {
  for (const tenant of ['tlu', 'hmu']) {
    const rows = seed(tenant)
    const ids = new Set(rows.map((r) => r.id))
    assert.equal(ids.size, rows.length)
    for (const r of rows) {
      assert.ok(r.id.startsWith('exec-'))
      if (r.fields.projectId) assert.ok(ids.has(r.fields.projectId))
    }
  }
})
test('assignment preserves F01 identity and requires a readable decision and adjustment reason', () => {
  const db = setup()
  const p = {
    ...db.get('exec-river'),
    id: 'dt-01',
    status: 'APPROVED',
    fields: { code: 'DT26-01', callId: 'call-1', workflowVersion: '3', requestedBudget: '100000000' },
  }
  db.put(p)
  const data = {
    countREPORT: '1',
    decision: 'QĐ-256',
    signed: '2026-11-20',
    effective: '2026-11-21',
    start: '2026-11-21',
    end: '2027-05-21',
    amount: '95000000',
    evidence: '',
    note: '',
  }
  assert.throws(() => assign(db.ctx(an), p, data))
  data.evidence = 'QD-256.pdf'
  assert.throws(() => assign(db.ctx(an), p, data))
  data.note = 'Điều chỉnh theo biên bản hội đồng'
  db.put(...assign(db.ctx(an), p, data))
  assert.equal(db.get(p.id).fields.workflowVersion, '3')
  assert.equal(db.get(p.id).status, 'IN_PROGRESS')
  assert.throws(() => assign(db.ctx(an), db.get(p.id), data))
})
test('period is unique per project, late submissions accepted, suspension and wrong role rejected', () => {
  const db = setup(),
    p = db.get('exec-river')
  const [r] = schedule(db.ctx(an), p, { period: '8', dueDate: '2026-11-20' })
  db.put(r)
  assert.throws(() => schedule(db.ctx(an), p, { period: '08', dueDate: '2026-11-21' }))
  const form = { content: 'Đã hoàn tất đo lưu tốc mặt cắt.', evidence: 'Mat-cat.pdf' }
  assert.throws(() => submitReport(db.ctx(an), p, r, form))
  assert.equal(submitReport(db.ctx(mai), p, r, form)[0].fields.late, 'true')
  db.put({ ...p, status: 'SUSPENDED' })
  assert.throws(() => submitReport(db.ctx(mai), db.get(p.id), r, form))
})
test('reminders use exact milestone and preserve an already read notification', () => {
  const db = setup(),
    p = db.get('exec-river')
  const [r] = schedule(db.ctx(an), p, { period: '8', dueDate: '2026-11-28' })
  db.put(r)
  const batch = reminders(db.ctx(an), p, 7)
  assert.ok(batch.some((n) => n.owner === 'mai' && n.fields.targetId === p.id && n.fields.periodId === r.id))
  db.put(...batch.map((n) => ({ ...n, status: 'READ' })))
  assert.deepEqual(reminders(db.ctx(an), p, 7), [])
})
test('fee rounds down, supports a cap, and snapshots the granted sum', () => {
  assert.equal(fee('100000019', '5', '10000000'), 5000000n)
  assert.equal(fee('300000000', '5', '10000000'), 10000000n)
  const db = setup(),
    p = db.get('exec-river')
  assert.throws(() => allocate(db.ctx(mai), p, { amount: '1' }))
  assert.throws(() => allocate(db.ctx(an), p, { amount: '999999999999' }))
})
test('expenses may exceed the remaining sum, zero is rejected, equal balance has no deficit', () => {
  const db = setup(),
    p = db.get('exec-river')
  assert.equal(balance(db.ctx(mai), p), 2000000n)
  const form = { title: 'Thuê thiết bị', date: '2026-11-21', amount: '0', evidence: 'PC-35.pdf' }
  assert.throws(() => saveExpense(db.ctx(mai), p, form))
  const [row] = saveExpense(db.ctx(mai), p, { ...form, amount: '2000000' })
  db.put(row)
  assert.equal(balance(db.ctx(mai), p), 0n)
  db.put(...saveExpense(db.ctx(mai), p, { ...form, amount: '3000000' }, row))
  assert.equal(balance(db.ctx(mai), p), -1000000n)
})
test('settlement reports all unmatched transactions and rejects manual override when reconciliation is on', () => {
  const db = setup(),
    p = db.get('exec-dam')
  assert.throws(() => settle(db.ctx(an), p, true), /PC-19.*PC-20|PC-20.*PC-19/)
  const expenses = db.ctx(an).rows.filter((r) => r.kind === 'expense' && r.fields.projectId === p.id)
  db.put(...expenses.map((r) => ({ ...r, status: 'MATCHED' })))
  assert.throws(() => settle(db.ctx(mai), p, true))
  assert.equal(settle(db.ctx(an), p, true)[0].status, 'COMPLETED')
})
test('acceptance checks the last period and approved types individually', () => {
  const db = setup(),
    p = db.get('exec-river')
  assert.throws(() => takeIntoAcceptance(db.ctx(mai), p, 'Bao-cao.pdf'), /kỳ|Kỳ/)
  db.put(
    ...db
      .ctx(an)
      .rows.filter((r) => r.kind === 'report' && r.fields.projectId === p.id)
      .map((r) => ({ ...r, status: 'PASSED' })),
  )
  assert.throws(() => takeIntoAcceptance(db.ctx(mai), p, 'Bao-cao.pdf'), /Sáng chế/)
})
test('current acceptance round excludes admission ballots, duplicate voting and conflict', () => {
  const db = setup(),
    p = db.get('exec-drain')
  db.put(...openRound(db.ctx(an), p, { date: '2026-11-26' }))
  const q = db.get(p.id)
  assert.throws(() => conclude(db.ctx(an), q), /phiếu/)
  assert.throws(() => submitBallot(db.ctx(mai), q, { science: '80', impact: '90' }))
  db.put(...submitBallot(db.ctx(minh), q, { science: '80', impact: '90', comment: 'Đủ minh chứng' }))
  assert.throws(() => submitBallot(db.ctx(minh), q, { science: '80', impact: '90' }))
  assert.equal(conclude(db.ctx(an), q)[0].status, 'PASSED')
})
test('outputs require accessible evidence and reviewer scope, reject duplicate approvals', () => {
  const db = setup(),
    p = db.get('exec-river')
  const data = {
    title: 'Giải pháp kè mới',
    type: 'PATENT',
    year: '2026',
    authors: 'mai',
    publication: 'Hồ sơ đơn mô phỏng',
    evidence: 'Ho-so.pdf',
    access: 'REVOKED',
    projectId: p.id,
  }
  assert.throws(() => saveOutput(db.ctx(mai), data, true))
  const [out] = saveOutput(db.ctx(mai), { ...data, access: 'FULL' }, true)
  db.put(out)
  assert.throws(() => decideOutput(db.ctx(mai), out, 'APPROVED', ''))
  db.put(...decideOutput(db.ctx(an), out, 'APPROVED', ''))
  assert.throws(() => decideOutput(db.ctx(an), db.get(out.id), 'APPROVED', ''))
})
test('reading cards recheck source rights when reopened', () => {
  const db = setup(),
    out = db.get('exec-paper')
  assert.match(readCard(db.ctx(mai), out).method, /trang/i)
  db.put({ ...out, fields: { ...out.fields, access: 'METADATA' } })
  assert.equal(readCard(db.ctx(mai), db.get(out.id)).method, 'Chưa đủ căn cứ')
})
test('CV checks record scope, deduplicates outputs and omits disabled teaching hours', () => {
  const db = setup(),
    profile = db.get('exec-profile-mai')
  const cv = buildCV(db.ctx(mai), profile)
  assert.equal(cv.outputs.filter((r) => r.id === 'exec-paper').length, 1)
  assert.ok(cv.outputs.every((r) => r.status === 'APPROVED'))
  assert.throws(() => buildCV(db.ctx(minh), profile))
  assert.equal(buildCV({ ...db.ctx(mai), e4Enabled: false }, profile).hours.length, 0)
})
