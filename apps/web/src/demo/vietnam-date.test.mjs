import assert from 'node:assert/strict'
import test from 'node:test'
import { formatVietnamDate } from '../format-date.ts'

test('local timestamps cross midnight in Vietnam and retain day, month and four-digit year', () => {
  const timestamp = '2026-01-01T17:08:09Z'
  assert.equal(formatVietnamDate(timestamp), '02/01/2026')
  assert.match(formatVietnamDate(timestamp, 'minute'), /00:08(?!:) .*02\/01\/2026/)
  assert.match(formatVietnamDate(timestamp, 'second'), /00:08:09 .*02\/01\/2026/)
  assert.equal(formatVietnamDate(''), '—')
})
