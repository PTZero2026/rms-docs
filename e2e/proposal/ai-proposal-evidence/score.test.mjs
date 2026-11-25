import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const cli = fileURLToPath(new URL('./score.mjs', import.meta.url))

// Per ten dossiers: ten missing items, nine detected, one false warning.
function fixture(size = 50) {
  const gold = { batch: 'synthetic', cases: [] }
  const run = { batch: gold.batch, cases: [] }
  for (let index = 0; index < size; index++) {
    const dossier = 'case-' + index
    const versions = { tenantId: 'deafbeef-0000-4000-8000-000000000000',
      sourceId: '00000000-0000-4000-8000-' + String(index).padStart(12, '0'),
      sourceVersion: 'r2', templateVersion: 'form-v1' }
    gold.cases.push({ dossier, ...versions, fields: [
      { key: 'a', missing: true }, { key: 'b', missing: false }
    ] })
    const field = (key, warned) => ({
      key, text: warned ? null : 'PRIVATE PASSAGE', location: warned ? null : 'Đoạn 1'
    })
    const id = 'suggestion-' + index
    run.cases.unshift({ dossier, card: { id, sourceKind: 'proposal', ...versions, model: 'fixture', prompt: 'v1',
      fields: [field('b', index % 10 === 0), field('a', index % 10 !== 0)] },
      audit: { suggestionId: id, unauthorizedDisclosures: 0, fabricatedCitations: 0 } })
  }
  return { gold, run }
}

function score(t, { gold, run }) {
  const dir = mkdtempSync(join(tmpdir(), 'rms-score-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  const paths = [join(dir, 'gold.json'), join(dir, 'run.json')]
  writeFileSync(paths[0], JSON.stringify(gold))
  writeFileSync(paths[1], JSON.stringify(run))
  const result = spawnSync(process.execPath, [cli, ...paths], { encoding: 'utf8' })
  assert.doesNotMatch(result.stdout + result.stderr, /PRIVATE PASSAGE|00000000-0000-4000-8000-|deafbeef/i)
  return result
}

test('SC-003 scores each required item by key and dossier at the exact thresholds', t => {
  const data = fixture()
  const result = score(t, data)
  assert.equal(result.status, 0, result.stderr)
  const report = JSON.parse(result.stdout)
  assert.equal(report.meetsThresholds, true)
  assert.equal(report.dossiers, 50)
  assert.deepEqual(report.counts, { missing: 50, detected: 45, warnings: 50, falseWarnings: 5,
    unauthorizedDisclosures: 0, fabricatedCitations: 0 })
  assert.equal(report.recall, 0.9)
  assert.equal(report.falseWarningShare, 0.1)
  assert.match(report.goldSha256, /^[\da-f]{64}$/)
  assert.notEqual(report.runSha256, report.goldSha256)
})

test('a valid run reports the specific failing criteria', t => {
  const data = fixture()
  const item = data.run.cases[0]
  item.card.fields.find(f => f.key === 'b').text = null
  item.card.fields.find(f => f.key === 'b').location = null
  item.audit.unauthorizedDisclosures = 2
  item.audit.fabricatedCitations = 1
  const result = score(t, data)
  assert.equal(result.status, 1)
  assert.deepEqual(JSON.parse(result.stdout).failedCriteria,
    ['falseWarningShare', 'unauthorizedDisclosures', 'fabricatedCitations'])
})

test('insufficient sample and undefined denominators cannot pass', t => {
  const data = fixture(49)
  for (const item of data.gold.cases) for (const field of item.fields) field.missing = false
  for (const item of data.run.cases) for (const field of item.card.fields) {
    field.text = 'PRIVATE PASSAGE'
    field.location = 'Đoạn 1'
  }
  const result = score(t, data)
  assert.equal(result.status, 1)
  const report = JSON.parse(result.stdout)
  assert.equal(report.recall, null)
  assert.equal(report.falseWarningShare, null)
  assert.deepEqual(report.failedCriteria, ['dossiers', 'recall', 'falseWarningShare'])
})

const invalid = [
  ['batch', d => { d.run.batch = 'other' }],
  ['dossier', d => { d.gold.cases[0].dossier = d.gold.cases[1].dossier }],
  ['dossier', d => { d.run.cases[0].dossier = d.run.cases[1].dossier }],
  ['dossier', d => { d.run.cases.pop() }],
  ['dossier', d => { d.run.cases[0].dossier = 'unknown' }],
  ['version', d => { d.run.cases[0].card.sourceVersion = 'r1' }],
  ['version', d => { d.run.cases[0].card.templateVersion = 'other' }],
  ['source', d => { delete d.gold.cases[0].sourceId }],
  ['source', d => { delete d.run.cases[0].card.sourceId }],
  ['tenant', d => { delete d.gold.cases[0].tenantId }],
  ['tenant', d => { delete d.run.cases[0].card.tenantId }],
  ['tenant', d => { d.run.cases[0].card.tenantId = 'deafbeef-0000-4000-8000-000000000001' }],
  ['source', d => { d.run.cases[0].card.sourceKind = 'product' }],
  ['source', d => { delete d.run.cases[0].card.sourceKind }],
  ['source', d => { d.gold.cases[0].sourceId = 'alias'
    d.run.cases.find(item => item.dossier === d.gold.cases[0].dossier).card.sourceId = 'alias' }],
  ['source', d => { d.gold.cases[0].sourceId = d.gold.cases[1].sourceId
    d.run.cases.find(item => item.dossier === d.gold.cases[0].dossier).card.sourceId = d.gold.cases[1].sourceId }],
  ['model', d => { d.run.cases[0].card.model = 'other' }],
  ['prompt', d => { d.run.cases[0].card.prompt = 'other' }],
  ['suggestion', d => { d.run.cases[0].card.id = d.run.cases[1].card.id
    d.run.cases[0].audit.suggestionId = d.run.cases[0].card.id }],
  ['audit', d => { delete d.run.cases[0].audit }],
  ['audit', d => { d.run.cases[0].audit.suggestionId = 'wrong' }],
  ['audit', d => { delete d.run.cases[0].audit.unauthorizedDisclosures }],
  ['audit', d => { d.run.cases[0].audit.fabricatedCitations = -1 }],
  ['field', d => { d.gold.cases[0].fields[0].missing = 'false' }],
  ['field', d => { d.run.cases[0].card.fields.pop() }],
  ['field', d => { d.run.cases[0].card.fields[1].key = 'b' }],
  ['field', d => { d.run.cases[0].card.fields[0].key = 'unknown' }],
  ['field', d => { d.run.cases[0].card.fields[0].location = null }]
]
test('a swap of two reviewed cards with identical source and form versions invalidates the batch', t => {
  const data = fixture()
  const [first, second] = data.run.cases
  data.run.cases[0] = { ...second, dossier: first.dossier }
  data.run.cases[1] = { ...first, dossier: second.dossier }
  const result = score(t, data)
  assert.equal(result.status, 2)
  assert.match(result.stderr, /source/i)
  assert.equal(result.stdout, '')
})
test('inconsistent or unreviewed records never produce a score', t => {
  for (const [reason, change] of invalid) {
    const data = fixture(3)
    change(data)
    const result = score(t, data)
    assert.equal(result.status, 2, result.stderr)
    assert.match(result.stderr, new RegExp(reason, 'i'))
    assert.equal(result.stdout, '')
  }
})
