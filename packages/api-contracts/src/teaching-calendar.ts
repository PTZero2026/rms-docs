import type {operations} from "./schema.d.ts"
export type Calendar=operations["getTeachingCalendar"]["responses"][200]["content"]["application/json"]
export function calendarDay(s:unknown):s is string{
  return typeof s==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s
}
export function validCalendar(value:unknown):value is Calendar{
  if(!Array.isArray(value)||value.length>150)return false
  const rows=value as Calendar
  if(rows.some(p=>!p||!["ACADEMIC_YEAR","FISCAL_YEAR"].includes(p.type)||typeof p.code!=="string"||!p.code.trim()||p.code.length>64||
    !calendarDay(p.from)||!calendarDay(p.to)||p.to<p.from))return false
  const sorted=[...rows].sort((a,b)=>a.from.localeCompare(b.from))
  return sorted.every((p,i)=>!i||(sorted[i-1].to<p.from&&p.type===sorted[i-1].type))&&new Set(rows.map(p=>p.code)).size===rows.length
}
