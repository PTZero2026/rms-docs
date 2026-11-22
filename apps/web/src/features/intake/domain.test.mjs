import test from 'node:test'
import assert from 'node:assert/strict'
import { seed } from './seed.ts'
import { canReadProject } from './model.ts'
import { submitProposal, processProposal } from './proposals.ts'
import { changeCall } from './calls.ts'
import { openRound, score, summarize, conclude, recordEthics, reviewerAccess } from './reviews.ts'
import { makeReport, readReport, exportReport } from './reports.ts'
import { suggest, decideSuggestion } from './evidence.ts'

const unit = 'Khoa Công trình'
const people = { researcher: 'mai', officer: 'an', reviewer: 'minh', admin: 'ha', student: 'linh' }
const context = (rows, role = 'officer', overrides = {}) => ({
  rows,
  aiEnabled: true,
  session: { tenant: 'tlu', userId: people[role], role, unit, ...overrides },
})
const replace = (rows, updates) => [...rows.filter((r) => !updates.some((u) => u.id === r.id)), ...updates]
const get = (rows, id) => rows.find((r) => r.id === id)

test('both tenants seed unique IDs and one usable approved project', () => {
  for (const tenant of ['tlu', 'hmu']) {
    const rows = seed(tenant)
    assert.equal(rows.length, new Set(rows.map((r) => r.id)).size)
    for (const state of ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED']) {
      const p = rows.find((r) => r.kind === 'project' && r.status === state)
      assert.ok(p.fields.workflowVersion && p.fields.due && get(rows, p.fields.callId))
      if (state !== 'DRAFT') assert.ok(p.fields.code)
    }
  }
})

test('draft access, deadline and return/resubmit preserve the first code', () => {
  let rows = seed('tlu')
  const original = get(rows, 'dt-01')
  assert.equal(canReadProject(context(rows, 'researcher', { userId: 'other' }), original), false)
  const submitted = submitProposal(context(rows, 'researcher'), original.id)
  rows = replace(rows, [submitted])
  assert.throws(() => processProposal(context(rows), original.id, 'return', '   '))
  const returned = processProposal(context(rows), original.id, 'return', 'Bổ sung số điểm quan trắc')
  assert.equal(returned.status, 'DRAFT')
  rows = replace(rows, [returned])
  assert.equal(submitProposal(context(rows, 'researcher'), original.id).fields.code, submitted.fields.code)
  const call = get(rows, original.fields.callId)
  rows = replace(rows, [{ ...call, fields: { ...call.fields, due: '2026-11-20' } }])
  assert.throws(() => submitProposal(context(rows, 'researcher'), original.id))
})

test('call opening rechecks active references, cancellation retains previously submitted projects', () => {
  const rows = seed('tlu')
  const call = rows.find((r) => r.kind === 'call' && r.status === 'DRAFT')
  assert.throws(() => changeCall(context(rows), call.id, 'open'), /hiệu lực/)
  assert.throws(() => changeCall(context(rows, 'admin'), call.id, 'open'))
  assert.throws(() => changeCall(context(rows), get(rows, 'dt-01').fields.callId, 'cancel'))
})

test('opening a round needs a finalized submission and cannot duplicate active rounds', () => {
  const rows = seed('tlu')
  const p = rows.find(
    (r) => r.kind === 'project' && r.fields.finalized === 'true' && r.status === 'SUBMITTED',
  )
  const council = rows.find((r) => r.kind === 'council')
  assert.throws(() => openRound(context(rows, 'reviewer'), p.id, council.id))
  const updates = openRound(context(rows), p.id, council.id)
  assert.ok(updates.some((r) => r.id === p.id && r.status === 'UNDER_REVIEW'))
  assert.deepEqual(openRound(context(replace(rows, updates)), p.id, council.id), [])
})

test('COI rechecked after draft, scores locked, aggregate excludes drafts and unpublished scores', () => {
  const rows = seed('tlu')
  const p = rows.find((r) => r.kind === 'project' && r.status === 'UNDER_REVIEW')
  const round = rows.find((r) => r.kind === 'review-round' && r.fields.projectId === p.id)
  const reviewer = context(rows, 'reviewer')
  assert.equal(reviewerAccess(reviewer, p, round), true)
  assert.throws(() => score(reviewer, p.id, ['11', '10', '10'], '', 'submit'))
  assert.throws(() => score(reviewer, p.id, ['', '10', '10'], '', 'submit'))
  const draft = score(reviewer, p.id, ['8', '', ''], '', 'draft')
  const withDraft = replace(rows, [draft])
  const before = summarize(withDraft, p, round)
  assert.throws(() => conclude(context(withDraft), p.id), /thiếu/)
  const conflict = { ...p, fields: { ...p.fields, memberIds: 'minh' } }
  assert.equal(reviewerAccess(reviewer, conflict, round), false)
  assert.throws(() =>
    score(context(replace(withDraft, [conflict]), 'reviewer'), p.id, ['8', '9', '10'], '', 'submit'),
  )
  const sent = score(context(withDraft, 'reviewer'), p.id, ['8', '9', '10'], '', 'submit')
  assert.equal(Number(sent.fields.total), 8.7)
  const sentRows = replace(withDraft, [sent])
  assert.equal(summarize(sentRows, p, round).count, before.count + 1)
  assert.throws(() => score(context(sentRows, 'reviewer'), p.id, ['0', '0', '0'], '', 'submit'))
})

test('science passes while ethics is pending and approval is emitted once', () => {
  let rows = seed('tlu')
  const p = rows.find((r) => r.kind === 'project' && r.status === 'UNDER_REVIEW')
  rows = replace(rows, [score(context(rows, 'reviewer'), p.id, ['8', '8', '8'], 'Đủ cơ sở', 'submit')])
  rows = replace(rows, conclude(context(rows), p.id))
  assert.equal(get(rows, p.id).status, 'UNDER_REVIEW')
  rows = replace(rows, recordEthics(context(rows), p.id, 'SUPPLEMENT', 'Bổ sung phiếu đồng thuận'))
  assert.equal(get(rows, p.id).status, 'UNDER_REVIEW')
  const approved = recordEthics(context(rows), p.id, 'APPROVED', 'Biên bản số 18')
  rows = replace(rows, approved)
  assert.equal(get(rows, p.id).status, 'APPROVED')
  assert.deepEqual(recordEthics(context(rows), p.id, 'APPROVED', 'Biên bản số 18'), [])
})

test('report details and CSV use frozen scoped rows, including coded drafts', () => {
  let rows = seed('tlu')
  const offered = get(rows, 'dt-01').fields.callId
  const coded = {
    ...get(rows, 'dt-01'),
    id: 'case',
    fields: { ...get(rows, 'dt-01').fields, code: 'DT-TEST' },
  }
  const foreign = {
    ...coded,
    id: 'foreign',
    unit: 'Khoa Môi trường',
    fields: { ...coded.fields, code: 'DT-FOREIGN' },
  }
  rows = replace(rows, [coded, foreign])
  const report = makeReport(context(rows), offered, unit)
  const changed = replace(rows, [report, { ...coded, status: 'APPROVED' }])
  const lines = readReport(context(changed), report.id)
  assert.equal(lines.find((r) => r.id === 'case').status, 'DRAFT')
  assert.ok(lines.every((r) => r.unit === unit && r.code))
  assert.ok(!lines.some((r) => r.id === 'dt-01'))
  assert.match(exportReport(context(changed), report.id), /DT-TEST/)
  assert.doesNotMatch(exportReport(context(changed), report.id), /DT-FOREIGN/)
  assert.throws(() => exportReport(context(changed, 'officer', { unit: foreign.unit }), report.id))
})

test('AI evidence is opt-in, anchored to actual text and decisions leave proposal unchanged', () => {
  const rows = seed('tlu')
  const owner = context(rows, 'researcher')
  assert.throws(() => suggest(owner, 'dt-01', false))
  assert.throws(() => suggest({ ...owner, aiEnabled: false }, 'dt-01', true))
  assert.throws(() => suggest(context(rows, 'researcher', { userId: 'other' }), 'dt-01', true))
  const hint = suggest(owner, 'dt-01', true)
  assert.ok(get(rows, 'dt-01').fields.method.includes(hint.fields.excerpt) && hint.fields.excerpt)
  const decision = decideSuggestion({ ...owner, rows: replace(rows, [hint]) }, hint.id, 'DISMISSED')
  assert.equal(decision.status, 'DISMISSED')
  assert.notEqual(decision.id, 'dt-01')
})

test('scope narrowing on account invalidates the complete snapshot even if only one unit had data', () => {
  const rows = seed('tlu')
  const account = {
    kind: 'account',
    id: 'account-an',
    title: 'Chuyên viên',
    unit: 'Phòng Khoa học và Công nghệ',
    owner: 'an',
    status: 'ACTIVE',
    fields: {},
  }
  const broad = context([...rows, account])
  const full = makeReport(broad, 'call-01', '*')
  const updated = replace(broad.rows, [full, { ...account, fields: { scopeUnit: unit } }])
  assert.throws(() => readReport(context(updated), full.id), /Phạm vi/)
  assert.throws(() => makeReport(context(updated), 'call-01', 'Khoa Môi trường'))
})

test('a negative scientific result overrides pending ethics and cannot be recorded by admin', () => {
  let rows = seed('tlu')
  const p = rows.find((r) => r.kind === 'project' && r.status === 'UNDER_REVIEW')
  rows = replace(rows, [score(context(rows, 'reviewer'), p.id, ['0', '0', '0'], '', 'submit')])
  assert.throws(() => conclude(context(rows, 'admin'), p.id))
  const result = conclude(context(rows), p.id)
  assert.equal(get(result, p.id).status, 'REJECTED')
  assert.equal(result.find((r) => r.kind === 'review-round').fields.conclusion, 'FAILED')
})

test('reopening and confirming the same final result does not reapprove the project', async () => {
  const { reopen } = await import('./reviews.ts')
  let rows = seed('tlu')
  const p = rows.find((r) => r.kind === 'project' && r.status === 'APPROVED')
  assert.throws(() => reopen(context(rows), p.id, '   '))
  const reopened = reopen(context(rows), p.id, 'Đối chiếu lại chữ ký biên bản')
  assert.equal(reopened.length, 1)
  assert.equal(reopened[0].kind, 'review-round')
  rows = replace(rows, reopened)
  const confirmed = conclude(context(rows), p.id)
  assert.deepEqual(
    confirmed.map((r) => [r.kind, r.status]),
    [['review-round', 'CONCLUDED']],
  )
})

test('tenant scoring override is respected at the decision boundary', () => {
  let rows = seed('tlu')
  const p = rows.find((r) => r.kind === 'project' && r.status === 'UNDER_REVIEW')
  rows = replace(rows, [score(context(rows, 'reviewer'), p.id, ['9', '9', '9'], '', 'submit')])
  const cfg = {
    id: 'cfg-test',
    kind: 'config',
    status: 'ACTIVE',
    title: 'Ngưỡng đạt',
    owner: 'ha',
    unit,
    fields: { scope: 'tenant', key: 'PROPOSAL_REVIEW.PASSING_SCORE', active: 'true', value: '9.5' },
  }
  const result = conclude(context([...rows, cfg]), p.id)
  assert.equal(result.find((r) => r.kind === 'review-round').fields.conclusion, 'FAILED')
})

test('removing a reviewer from the council revokes access to an already open score form', () => {
  let rows = seed('tlu')
  const p = rows.find((r) => r.kind === 'project' && r.status === 'UNDER_REVIEW')
  const round = rows.find((r) => r.kind === 'review-round' && r.fields.projectId === p.id)
  const council = get(rows, round.fields.councilId)
  const draft = score(context(rows, 'reviewer'), p.id, ['6', '', ''], '', 'draft')
  rows = replace(rows, [draft, { ...council, fields: { ...council.fields, memberIds: 'son,hue' } }])
  assert.equal(reviewerAccess(context(rows, 'reviewer'), p, round), false)
  assert.throws(() => score(context(rows, 'reviewer'), p.id, ['6', '8', '7'], '', 'submit'))
})

test('published calls are discoverable before their first day but do not accept proposals yet', async () => {
  const { callVisible, receiving } = await import('./model.ts')
  const rows = seed('tlu')
  const future = {
    ...get(rows, 'call-01'),
    fields: { ...get(rows, 'call-01').fields, start: '2026-11-25' },
  }
  assert.equal(callVisible(context(rows, 'researcher'), future), true)
  assert.equal(receiving(future), false)
})

test('exactly the passing score and a final ethics refusal preserve the scientific outcome', () => {
  let rows = seed('tlu')
  const p = rows.find((r) => r.kind === 'project' && r.status === 'UNDER_REVIEW')
  rows = replace(rows, [score(context(rows, 'reviewer'), p.id, ['6', '6', '6'], '', 'submit')])
  rows = replace(rows, conclude(context(rows), p.id))
  const scientific = rows.find((r) => r.kind === 'review-round' && r.fields.projectId === p.id)
  assert.equal(scientific.fields.aggregate, '7')
  assert.equal(scientific.fields.conclusion, 'PASSED')
  const result = recordEthics(context(rows), p.id, 'REJECTED', 'Hội đồng không thông qua phương án')
  assert.equal(get(result, p.id).status, 'REJECTED')
  assert.equal(get(result, scientific.id).fields.conclusion, 'PASSED')
})

test('last admission day is inclusive, the previous day blocks both first submit and return', () => {
  const rows = seed('tlu')
  const p = get(rows, 'dt-01'),
    call = get(rows, p.fields.callId)
  const atDeadline = replace(rows, [{ ...call, fields: { ...call.fields, due: '2026-11-21' } }])
  const submitted = submitProposal(context(atDeadline, 'researcher'), p.id)
  assert.equal(submitted.status, 'SUBMITTED')
  const expired = replace(rows, [{ ...call, fields: { ...call.fields, due: '2026-11-20' } }])
  assert.throws(() => submitProposal(context(expired, 'researcher'), p.id))
  assert.throws(() => processProposal(context(replace(expired, [submitted])), p.id, 'return', 'Bổ sung'))
})

test('changing catalog status after saving a draft prevents opening, then repair succeeds', async () => {
  const { saveCall } = await import('./calls.ts')
  let rows = seed('tlu')
  const original = rows.find((r) => r.kind === 'call' && r.status === 'DRAFT')
  const revised = saveCall(
    context(rows),
    { ...original.fields, title: original.title, criteria: 'intake-rubric-26' },
    original.id,
  )
  rows = replace(rows, [revised])
  const override = {
    id: 'cfg-block',
    kind: 'config',
    status: 'ACTIVE',
    owner: 'ha',
    unit,
    title: 'Hiệu lực',
    fields: { scope: 'tenant', key: 'CATALOG.intake-field-applied.STATUS', value: 'INACTIVE' },
  }
  assert.throws(() => changeCall(context([...rows, override]), original.id, 'open'), /Lĩnh vực/)
  const opened = changeCall(context(rows), original.id, 'open')
  assert.equal(opened.id, original.id)
  assert.equal(opened.status, 'OPEN')
})

test('manual drafts still save when AI is disabled and stale source citations cannot be reopened', async () => {
  const { openEvidence } = await import('./evidence.ts')
  const { saveDraft, proposalForm } = await import('./proposals.ts')
  const rows = seed('tlu'),
    p = get(rows, 'dt-01')
  const evidence = suggest(context(rows, 'researcher'), p.id, true)
  const saved = saveDraft(
    { ...context(rows, 'researcher'), aiEnabled: false },
    { ...proposalForm(p), method: '' },
    p.id,
  )
  assert.equal(saved.fields.method, '')
  assert.throws(() => openEvidence(context(replace(rows, [saved, evidence]), 'researcher'), evidence.id))
  const current = replace(rows, [saved])
  assert.throws(() => suggest(context(current, 'researcher'), p.id, true))
  const grant = {
    id: 'grant',
    kind: 'config',
    status: 'ACTIVE',
    fields: { scope: 'tenant', key: 'AI.SOURCE.' + p.id, value: saved.fields.revision },
  }
  assert.equal(suggest(context([...current, grant], 'researcher'), p.id, true).fields.excerpt, '')
})

test('a score excluded before the conclusion stays excluded from the concluded score table', () => {
  let rows = seed('tlu')
  const p = rows.find((r) => r.kind === 'project' && r.status === 'UNDER_REVIEW')
  const round = rows.find((r) => r.kind === 'review-round' && r.fields.projectId === p.id)
  const council = get(rows, round.fields.councilId)
  const excluded = score(context(rows, 'reviewer'), p.id, ['10', '10', '10'], '', 'submit')
  rows = replace(rows, [
    excluded,
    { ...round, fields: { ...round.fields, min: '2' } },
    { ...council, fields: { ...council.fields, memberIds: 'hue,son' } },
  ])
  rows = replace(rows, conclude(context(rows), p.id))
  const result = summarize(rows, p, get(rows, round.id))
  assert.equal(result.count, 2)
  assert.equal(result.mean, 7.5)
  assert.ok(!result.sheets.some((s) => s.owner === 'minh'))
})

test('school-wide snapshot counts projects from a newly represented department', () => {
  const rows = seed('tlu')
  const original = rows.find((r) => r.kind === 'project' && r.fields.code)
  const external = {
    ...original,
    id: 'new-khoa',
    unit: 'Khoa Tài nguyên nước',
    fields: { ...original.fields, code: 'TN-26-01' },
  }
  rows.push(external)
  const school = context(rows, 'officer', { unit: 'Phòng Khoa học và Công nghệ' })
  const report = makeReport(school, original.fields.callId, '*')
  assert.ok(JSON.parse(report.fields.lines).some((line) => line.id === external.id))
})
