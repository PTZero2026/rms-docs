import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

function requireValue(condition, message) {
  if (!condition) throw new Error(message)
}

function nonempty(value) {
  return typeof value === 'string' && value.trim().length > 0
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function matchedUuid(expected, actual, context) {
  requireValue(typeof expected === 'string' && uuidPattern.test(expected), context + ' gold UUID is invalid or missing')
  const id = expected.toLowerCase()
  requireValue(typeof actual === 'string' && actual.toLowerCase() === id, context + ' card UUID differs or is missing')
  return id
}

function indexBy(rows, key, context) {
  requireValue(Array.isArray(rows) && rows.length > 0, context + ' list is empty or missing')
  const index = new Map()
  for (const row of rows) {
    const id = row?.[key]
    requireValue(nonempty(id) && !index.has(id), context + ' identifier is missing or repeated')
    index.set(id, row)
  }
  return index
}

function compareFields(counts, labels, actual, context) {
  const expected = indexBy(labels, 'key', context)
  const observed = indexBy(actual, 'key', context)
  requireValue(expected.size === observed.size, context + ' count differs')
  for (const [key, label] of expected) {
    const field = observed.get(key)
    requireValue(field && typeof label.missing === 'boolean', context + ' label or response missing')
    const warned = field.text === null && field.location === null
    requireValue(warned || (nonempty(field.text) && nonempty(field.location)), context + ' citation is incomplete')
    if (label.missing) counts.missing++
    if (warned) {
      counts.warnings++
      if (label.missing) counts.detected++
      else counts.falseWarnings++
    }
  }
}

function score(gold, run) {
  requireValue(nonempty(gold?.batch) && gold.batch === run?.batch, 'batch identifiers differ or are missing')
  const labels = indexBy(gold.cases, 'dossier', 'gold dossier')
  const observations = indexBy(run.cases, 'dossier', 'run dossier')
  requireValue(labels.size === observations.size, 'dossier counts differ')
  const seenSuggestions = new Set()
  const seenSources = new Set()
  const counts = { missing: 0, detected: 0, warnings: 0, falseWarnings: 0,
    unauthorizedDisclosures: 0, fabricatedCitations: 0 }
  const { model, prompt } = run.cases[0].card ?? {}
  for (const [index, label] of gold.cases.entries()) {
    const context = 'gold row ' + (index + 1) + ': '
    const item = observations.get(label.dossier)
    requireValue(item?.card, context + 'missing dossier result')
    const { card, audit } = item
    requireValue(card.sourceKind === 'proposal', context + 'expected proposal source')
    const tenantId = matchedUuid(label.tenantId, card.tenantId, context + 'tenant')
    const sourceId = matchedUuid(label.sourceId, card.sourceId, context + 'source')
    const sourceKey = tenantId + '/' + sourceId
    requireValue(!seenSources.has(sourceKey), context + 'source assigned to multiple dossiers')
    seenSources.add(sourceKey)
    requireValue(nonempty(card.id) && !seenSuggestions.has(card.id), context + 'missing or repeated suggestion ID')
    seenSuggestions.add(card.id)
    for (const key of ['sourceVersion', 'templateVersion']) {
      requireValue(nonempty(label[key]) && card[key] === label[key], context + 'version mismatch (' + key + ')')
    }
    requireValue(nonempty(model) && card.model === model, context + 'model mismatch or missing')
    requireValue(nonempty(prompt) && card.prompt === prompt, context + 'prompt mismatch or missing')
    compareFields(counts, label.fields, card.fields, context + 'field')
    requireValue(audit?.suggestionId === card.id, context + 'audit missing or references another suggestion')
    for (const key of ['unauthorizedDisclosures', 'fabricatedCitations']) {
      requireValue(Number.isSafeInteger(audit[key]) && audit[key] >= 0, context + 'invalid audit count (' + key + ')')
      counts[key] += audit[key]
      requireValue(Number.isSafeInteger(counts[key]), context + 'audit total too large')
    }
  }
  const recall = counts.missing ? counts.detected / counts.missing : null
  const falseWarningShare = counts.warnings ? counts.falseWarnings / counts.warnings : null
  const criteria = {
    dossiers: labels.size === 50,
    recall: recall !== null && counts.detected * 10 >= counts.missing * 9,
    falseWarningShare: falseWarningShare !== null && counts.falseWarnings * 10 <= counts.warnings,
    unauthorizedDisclosures: counts.unauthorizedDisclosures === 0,
    fabricatedCitations: counts.fabricatedCitations === 0
  }
  const failedCriteria = Object.keys(criteria).filter(key => !criteria[key])
  return { model, prompt, dossiers: labels.size, counts, recall, falseWarningShare,
    failedCriteria, meetsThresholds: failedCriteria.length === 0 }
}

function load(path, name) {
  try {
    const bytes = readFileSync(path)
    return { data: JSON.parse(bytes.toString('utf8')), sha256: createHash('sha256').update(bytes).digest('hex') }
  } catch {
    throw new Error(name + ' file unreadable or invalid JSON')
  }
}

try {
  const paths = process.argv.slice(2)
  requireValue(paths.length === 2, 'Usage: node score.mjs GOLD.json RUN.json')
  const gold = load(paths[0], 'gold')
  const run = load(paths[1], 'run')
  const result = score(gold.data, run.data)
  console.log(JSON.stringify({ goldSha256: gold.sha256, runSha256: run.sha256, ...result }, null, 2))
  process.exitCode = result.meetsThresholds ? 0 : 1
} catch (error) {
  console.error(error.message)
  process.exitCode = 2
}
