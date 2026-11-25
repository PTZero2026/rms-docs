import tlu from './datasets/tlu.json' with { type: 'json' }
import hmu from './datasets/hmu.json' with { type: 'json' }
import type { AuditEvent, DemoRow, Tenant } from './types.ts'

type Section = 'intake' | 'execution' | 'extension'
const schools = { tlu, hmu }

export function schoolUnits(tenant: Tenant, rows?: DemoRow[]): readonly string[] {
  // Older saved HMU simulations used the engineering faculties.
  if (tenant === 'hmu' && rows?.find(r => r.id === 'intake-field-applied')?.unit === schools.tlu.units[0])
    return schools.tlu.units
  return schools[tenant].units
}

export function schoolRows(tenant: Tenant, section: Section): DemoRow[] {
  // Editors and tests may modify their snapshot. Never hand out a reference to imported JSON.
  return schools[tenant][section].map(row => {
    const fields: Record<string, string> = {}
    for (const [key, value] of Object.entries(row.fields)) {
      if (typeof value !== 'string') throw Error(`Trường dữ liệu mẫu không hợp lệ: ${row.id}.${key}`)
      fields[key] = value
    }
    return { ...row, fields }
  })
}

export function schoolAudit(tenant: Tenant): AuditEvent[] {
  return structuredClone(schools[tenant].audit)
}

export function findReviewCase(id: string) {
  for (const tenant of ['tlu', 'hmu'] as const) {
    const review = schools[tenant].cases.find(entry => entry.id === id)
    if (review) return { tenant, review }
  }
}
