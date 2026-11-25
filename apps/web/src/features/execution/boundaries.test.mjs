import test from 'node:test'
import assert from 'node:assert/strict'
import { seed } from './seed.ts'
import { activateTemplate, addCareer, buildCV, exportCV, profileRecords, updateProfile } from './profiles.ts'
import { allocate, fee, reconcile, settle } from './budget.ts'
import { decideOutput, readCard, saveOutput, viewOutput } from './products.ts'
import { ballots, conclude, eligible, redo, submitBallot } from './acceptance.ts'
import { reminders } from './progress.ts'
import { notice, officer, row } from './model.ts'

const unit = 'Khoa Công trình'
function setup(tenant = 'tlu', role = 'officer', id = 'an') {
  const rows = seed(tenant)
  const c = {
    rows,
    session: { tenant, role, userId: id, name: id, unit },
    aiEnabled: tenant === 'tlu',
    e4Enabled: tenant === 'tlu',
  }
  return {
    c,
    get: (id) => rows.find((r) => r.id === id),
    put: (...changes) => {
      for (const r of changes) {
        const i = rows.findIndex((x) => x.id === r.id)
        if (i < 0) rows.push(r)
        else rows[i] = r
      }
    },
  }
}
test('staff uses account scope, including unrestricted office staff and restrictions applied to an admin', () => {
  const { c, get, put } = setup()
  c.session.unit = 'Phòng Khoa học và Công nghệ'
  put(row('account', 'Chuyên viên', 'ACTIVE', 'an', c.session.unit, { scopeUnit: unit }, 'account-an'))
  assert.equal(officer(c, get('exec-river')), true)
  assert.equal(officer(c, get('exec-reed')), false)
  const far = row('output', 'Bài thử', 'APPROVED', 'thao', 'Khoa Môi trường', {
    projectId: 'exec-reed',
    authors: 'thao',
  })
  assert.equal(viewOutput(c, far), false)
  c.session.role = 'admin'
  assert.equal(viewOutput(c, far), false)
})
test('snapshot captures the fee, optional cap, inclusive overrides and adjustment note', () => {
  const { c, get } = setup()
  const p = get('exec-reed')
  c.session.unit = p.unit
  assert.equal(fee('399', '0.25', ''), 0n)
  assert.equal(fee('400', '0.25', ''), 1n)
  assert.equal(fee('300000000', '5', '0'), 0n)
  for (const value of ['0', '100000000']) {
    const [a] = allocate(c, p, { amount: '100000000', override: value, note: 'Theo biên bản mô phỏng.' })
    assert.equal(a.fields.fee, value)
    assert.equal(BigInt(a.fields.research) + BigInt(value), 100000000n)
  }
  for (const value of ['-1', '100000001'])
    assert.throws(() => allocate(c, p, { amount: '100000000', override: value, note: 'Căn cứ' }))
  assert.throws(() => allocate(c, p, { amount: '100000000', override: '50', note: ' ' }))
})
test('transfer correction is scoped to its own project and pilot settlement needs manual confirmation', () => {
  const { c, get, put } = setup()
  const p = get('exec-dam'),
    item = get('exec-exp-19')
  assert.equal(reconcile(c, p, item, '25', 'MB-111')[0].status, 'MISMATCHED')
  put(...reconcile(c, p, item, item.fields.amount, 'MB-111'))
  assert.equal(get(item.id).status, 'MATCHED')
  assert.throws(() => reconcile(c, p, get('exec-exp-20'), '12000000', 'MB-111'))
  assert.throws(() => reconcile(c, get('exec-river'), get(item.id), '1', 'MB-112'))
  const h = setup('hmu')
  h.c.session.unit = h.get('exec-dam').unit
  assert.throws(() => settle(h.c, h.get('exec-dam'), false))
  assert.equal(settle(h.c, h.get('exec-dam'), true)[0].status, 'COMPLETED')
})
test('final ballot excludes conflict, retries, draft and proposal scores, enforces score bounds and redo limits', () => {
  const { c, get, put } = setup('tlu', 'reviewer', 'minh')
  let p = get('exec-bridge')
  assert.throws(() => submitBallot(c, p, { science: '101', impact: '80' }))
  put({ ...p, fields: { ...p.fields, memberIds: 'linh,minh' } })
  p = get(p.id)
  assert.equal(eligible(c, p), false)
  assert.throws(() => submitBallot(c, p, { science: '81', impact: '82' }))
  put({ ...p, fields: { ...p.fields, memberIds: 'linh' } })
  p = get(p.id)
  put(...submitBallot(c, p, { science: '55', impact: '60' }))
  const [vote] = ballots(c, p)
  put({ ...vote, id: 'exec-duplicate' })
  assert.equal(ballots(c, p).length, 1)
  c.session.role = 'officer'
  c.session.userId = 'an'
  put(...conclude(c, p))
  p = get(p.id)
  assert.equal(p.status, 'FAILED')
  assert.throws(() => redo(c, p, { reason: 'Bổ sung số liệu.', deadline: '2026-11-20' }))
  put(...redo(c, p, { reason: 'Bổ sung số liệu.', deadline: '2027-01-10' }))
  assert.equal(get(p.id).fields.redoCount, '1')
  put({ ...get(p.id), status: 'FAILED' })
  assert.throws(() => redo(c, get(p.id), { reason: 'Làm lại.', deadline: '2027-01-10' }))
})
test('draft with revoked evidence must replace it, source expiry applies to decisions as well as cards', () => {
  const { c, get, put } = setup('tlu', 'researcher', 'mai')
  const out = get('exec-paper')
  const expired = { ...out, fields: { ...out.fields, expires: '2026-11-20' }, status: 'PENDING_APPROVAL' }
  put(expired)
  assert.equal(readCard(c, expired).method, 'Chưa đủ căn cứ')
  c.session.role = 'officer'
  c.session.userId = 'an'
  assert.throws(() => decideOutput(c, expired, 'APPROVED', ''))
  c.session.role = 'researcher'
  c.session.userId = 'mai'
  const draft = { ...expired, status: 'DRAFT', fields: { ...expired.fields, access: 'REVOKED' } }
  put(draft)
  const form = { ...draft.fields, title: draft.title, access: 'FULL' }
  assert.throws(() => saveOutput(c, form, true, draft))
  assert.equal(saveOutput(c, { ...form, evidence: 'Thay-minh-chung.pdf' }, true, draft)[0].fields.expires, '')
})
test('template v2 affects only subsequent exports; HTML escapes input and hours preserve sourced signed deltas', () => {
  const { c, get, put } = setup('tlu', 'researcher', 'mai'),
    r = get('exec-profile-mai')
  const config = row('config', 'Mẫu LLKH', 'ACTIVE', 'ha', '', {
    key: 'PROFILE.TEMPLATE',
    scope: 'shared',
    value: 'CV-01.v1',
  })
  put(config)
  const source = { sourceId: 'ext-one', formulaVersion: '2', hours: '12' }
  put(
    row('hours', 'Buổi tập huấn <mẫu>', 'POSTED', 'mai', unit, source),
    row('hours', 'Hiệu chỉnh', 'ADJUSTMENT', 'mai', unit, { ...source, hours: '-2' }),
  )
  const old = exportCV(c, r)
  assert.ok(old.html.includes('&lt;mẫu&gt;'))
  assert.equal(
    buildCV(c, r).hours.reduce((s, r) => s + Number(r.fields.hours), 0),
    10,
  )
  c.session.userId = 'ha'
  c.session.role = 'admin'
  put(...activateTemplate(c, 'exec-template-2'))
  const next = exportCV(c, r)
  assert.equal(old.version, '1')
  assert.equal(next.version, '2')
  assert.equal(old.code, next.code)
  assert.ok(next.html.includes('Lý lịch nghiên cứu và giảng dạy'))
  assert.ok(!old.html.includes('Lý lịch nghiên cứu và giảng dạy'))
  assert.throws(() => addCareer(c, r, 'qualification', { type: 'DEGREE', title: 'Tiến sĩ', year: '2030' }))
  assert.throws(() =>
    addCareer(c, r, 'employment', {
      title: 'Bộ môn',
      position: 'Giảng viên',
      start: '2020-01-01',
      end: '2019-01-01',
    }),
  )
})
test('milestone ignores suspended projects and config changes only affect the matching due date', () => {
  const { c, get, put } = setup()
  const p = get('exec-river')
  put(
    row('config', 'Nhắc trước hạn', 'ACTIVE', 'ha', '', { key: 'NOTICE.DAYS', value: '5', scope: 'tenant' }),
  )
  assert.deepEqual(reminders(c, p), [])
  const messages = reminders(c, p, 7)
  assert.equal(messages.filter((n) => n.kind === 'notice').length, 1)
  assert.equal(messages[0].fields.event, 'PROGRESS_REPORT_DUE_SOON')
  assert.equal(notice(p, 'F04', 'Đã nhắc', 'mai', 'a').id, notice(p, 'F04', 'Đã nhắc', 'mai', 'a').id)
  put({ ...p, status: 'SUSPENDED' })
  assert.throws(() => reminders(c, get(p.id), 7))
})

test('a failed reminder delivery retries the same channel record without reissuing the read notice', () => {
  const { c, get, put } = setup()
  const project = get('exec-river')
  const [message, delivery] = reminders(c, project)
  assert.equal(message.kind, 'notice')
  assert.equal(delivery.kind, 'delivery')
  put({ ...message, status: 'READ' }, { ...delivery, status: 'ERROR' })
  const retry = reminders(c, project)
  assert.equal(retry.length, 1)
  assert.equal(retry[0].id, delivery.id)
  assert.equal(retry[0].fields.attempts, '2')
  assert.equal(get(message.id).status, 'READ')
})

test('an account created by B03 can save its own one-to-one profile without creating a duplicate', () => {
  const { c, put } = setup('tlu', 'researcher', 'new-researcher')
  put(
    row(
      'account',
      'Nghiên cứu viên mẫu',
      'ACTIVE',
      'new-researcher',
      unit,
      { email: 'new@example.invalid' },
      'account-new-researcher',
    ),
  )
  const [r] = profileRecords(c)
  assert.equal(r.owner, 'new-researcher')
  assert.equal(buildCV(c, r).outputs.length, 0)
  put(...updateProfile(c, r, { name: r.title, position: 'Giảng viên' }))
  assert.equal(profileRecords(c).length, 1)
  assert.equal(profileRecords(c)[0].fields.position, 'Giảng viên')
})

test('AI permission is explicit per source version, independent of the right to view metadata', () => {
  const { c, get, put } = setup('tlu', 'researcher', 'mai')
  const paper = get('exec-paper')
  const unknown = { ...paper, fields: { ...paper.fields } }
  delete unknown.fields.aiAllowed
  put(unknown)
  assert.throws(() => readCard(c, unknown))
  const changed = { ...paper, fields: { ...paper.fields, sourceVersion: '2' } }
  put(changed)
  assert.throws(() => readCard(c, changed))
  c.rows.push({
    id: 'grant-paper',
    kind: 'config',
    status: 'ACTIVE',
    fields: { scope: 'tenant', key: 'AI.SOURCE.' + paper.id, value: '2' },
  })
  assert.equal(readCard(c, changed).version, '2')
  c.rows.at(-1).fields.value = 'off'
  assert.throws(() => readCard(c, changed))
})
