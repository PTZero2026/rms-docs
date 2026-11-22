import type { DemoRow } from '../../demo/types'
import type { Source } from './model'

const prefixes: Partial<Record<Source,string>> = {
  F09:'RESEARCH_TOPIC_CATEGORY.', F11:'APPLIED_PROJECT_TYPE.', F12:'ACTIVITY_TYPE.',
}
export function settingRow(key: string, title: string, value: unknown): DemoRow {
  return {id:'cfg-' + key,kind:'config',title,status:'ACTIVE',owner:'ha',unit:'',
    fields:{key,value:JSON.stringify(value),scope:'tenant',active:'true',group:'Danh mục hoạt động mở rộng',mime:'application/json'}}
}
type Policy = { active: boolean; formula: string; trigger: string; extra: {
  tier?: string; requiredEvidence: { khai_bao: string[]; ket_qua: string[] }
} }
export function policySeed(feature: Source, code: string, title: string, declaration: string[], result: string[], formula: string, trigger: string) {
  return settingRow(prefixes[feature] + code,title,{active:true,formula,trigger,extra:{
    ...(feature === 'F09' ? {tier:'UPPER'} : {}),requiredEvidence:{khai_bao:declaration,ket_qua:result},
  }})
}
function settings(rows: DemoRow[], prefix: string) {
  const result = new Map<string,DemoRow>()
  for (const row of rows) {
    if (row.kind !== 'config' || row.status === 'DELETED' || row.fields.active === 'false' || !row.fields.key?.startsWith(prefix)) continue
    if (!result.has(row.fields.key) || row.fields.scope === 'tenant') result.set(row.fields.key,row)
  }
  return [...result.values()]
}
export function categories(rows: DemoRow[], feature: Source) {
  const prefix = prefixes[feature]
  if (!prefix) return []
  return settings(rows,prefix).flatMap(row => {
    try {
      const item = JSON.parse(row.fields.value) as Policy
      if (!item.active || !item.formula || (feature === 'F09' && item.extra.tier !== 'UPPER')) return []
      const evidence = item.extra.requiredEvidence
      if (![evidence.khai_bao,evidence.ket_qua].every(a => Array.isArray(a) && a.every(c => typeof c === 'string'))) return []
      return [{...row,fields:{...row.fields, feature, code:row.fields.key.slice(prefix.length), declaration:evidence.khai_bao.join(','),
        result:evidence.ket_qua.join(','), formula:item.formula, trigger:item.trigger}}]
    } catch { return [] }
  })
}
export function encodePolicy(projected: DemoRow): DemoRow {
  const f = projected.fields
  const item = JSON.parse(f.value) as Policy
  return settingRow(f.key,projected.title,{...item,trigger:f.trigger,extra:{...item.extra,requiredEvidence:{
    khai_bao:f.declaration.split(',').filter(Boolean),ket_qua:f.result.split(',').filter(Boolean),
  }}})
}
export function managingBodies(rows: DemoRow[]): string[] {
  const row = settings(rows,'MANAGING_BODY').find(r => r.fields.key === 'MANAGING_BODY')
  try {
    const list: unknown = JSON.parse(row?.fields.value || '[]')
    return Array.isArray(list) ? list.filter((s): s is string => typeof s === 'string' && Boolean(s.trim())) : []
  } catch { return [] }
}

