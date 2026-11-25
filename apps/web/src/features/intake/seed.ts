import type { Tenant } from '../../demo/types.ts'
import { schoolRows } from '../../demo/datasets.ts'

export function seed(tenant: Tenant) {
  return schoolRows(tenant, 'intake')
}
