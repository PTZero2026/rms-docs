import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import test from 'node:test'
import { initialSnapshot } from './storage.ts'
import { configValue } from './base-seed.ts'
import { person } from './identity.ts'
import { submitProposal } from '../features/intake/proposals.ts'
import { makeReport, readReport } from '../features/intake/reports.ts'
import { balance } from '../features/execution/budget.ts'
import { gate } from '../features/execution/acceptance.ts'
import { buildCV } from '../features/execution/profiles.ts'
import { transition } from '../features/extension/workflow.ts'

const features = readdirSync(new URL('../../../../docs/features/', import.meta.url))
  .filter(name => /^[BFP]\d\d-/.test(name)).map(name => name.slice(0, 3)).sort()

for (const tenant of ['tlu', 'hmu']) {
  const pack = JSON.parse(readFileSync(new URL('./datasets/' + tenant + '.json', import.meta.url)))
  test(tenant + ' · every review case, actor and linked dossier resolves in the running snapshot', () => {
    const { rows, audit } = initialSnapshot(tenant)
    const records = new Map(rows.map(row => [row.id, row]))
    const accounts = new Set(rows.filter(r => r.kind === 'account').map(r => r.owner))
    assert.equal(records.size, rows.length)
    assert.deepEqual([...new Set(pack.cases.map(c => c.feature))].sort(), features)
    assert.equal(new Set(pack.cases.map(c => c.id)).size, pack.cases.length)
    for (const c of pack.cases) {
      assert.ok(records.has(c.recordId), c.id + ' ' + c.recordId)
      assert.ok(accounts.has(c.actor), c.id)
      assert.equal(c.route.split('/')[1], c.feature)
      for (const key of ['goal', 'steps', 'expected', 'precondition']) assert.ok(c[key].trim(), c.id)
    }
    for (const row of rows) {
      assert.ok(accounts.has(row.owner), row.id + ' ' + row.owner)
      for (const key of ['projectId', 'callId', 'roundId', 'councilId', 'sourceId', 'formulaId', 'targetId']) {
        const ref = row.fields[key]
        if (ref) assert.ok(records.has(ref), row.id + ' → ' + ref)
      }
      assert.ok(Object.values(row.fields).every(v => typeof v === 'string'))
    }
    assert.ok(audit.every(e => records.has(e.recordId) && accounts.has(e.actorId)))
    records.get('dt-01').fields.objective = 'changed'
    assert.notEqual(initialSnapshot(tenant).rows.find(r => r.id === 'dt-01').fields.objective, 'changed')
  })
  test(tenant + ' · walkthrough figures follow the same services used by the screens', () => {
    const { rows } = initialSnapshot(tenant)
    const find = id => rows.find(r => r.id === id)
    const as = role => ({ rows, session: person(tenant, role), e4Enabled: true, aiEnabled: !medical })
    const medical = tenant === 'hmu'
    const mai = as('researcher'), an = as('officer')
    assert.equal(configValue(rows, 'FEATURE.E4'), String(!medical))
    assert.equal(submitProposal(mai, 'dt-01').fields.code, tenant.toUpperCase() + '-26-DT-01')
    const report = makeReport(an, 'call-01', '*')
    assert.deepEqual(JSON.parse(report.fields.lines), readReport(an, 'report-open-baseline'))
    assert.equal(readReport(an, 'report-open-baseline').length, 3)
    assert.equal(balance(mai, find('exec-river')), 2000000n)
    assert.deepEqual(gate(mai, find('exec-drain')), [])
    assert.deepEqual(gate(mai, find('exec-river')), ['Kỳ báo cáo cuối chưa đạt', 'Thiếu 1 Sáng chế'])
    const cv = buildCV(mai, find('exec-profile-mai'))
    assert.ok(cv.outputs.some(r => r.id === 'exec-book'))
    assert.ok(!cv.outputs.some(r => r.id === 'exec-software' || r.id === 'exec-returned-output'))
    const logged = rows.filter(r => r.kind === 'hours')
    assert.equal(logged.reduce((s, r) => s + Number(r.fields.hours), 0), medical ? 0 : 66)
    const upper = transition(an, find('ext-upper-pending'), 'approve')
    assert.deepEqual(upper.filter(r => r.kind === 'hours').map(r => r.fields.hours), ['48','32'])
    if (medical) {
      assert.deepEqual(transition(an, find('ext-applied-complete'), 'approveResult')
        .filter(r => r.kind === 'hours').map(r => r.fields.hours), ['24','16'])
      assert.equal(transition(an, find('ext-activity-conference'), 'approve')[1].fields.hours, '8')
    }
  })
}
