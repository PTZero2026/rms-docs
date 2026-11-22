import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { Field, FieldLabel, FieldDescription } from '@rms/ui/components/field'
import { Input } from '@rms/ui/components/input'
import { Textarea } from '@rms/ui/components/textarea'
import { Alert, AlertDescription } from '@rms/ui/components/alert'
import { Button } from '@rms/ui/components/button'
import { Badge } from '@rms/ui/components/badge'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@rms/ui/components/empty'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@rms/ui/components/dialog'
import { evidenceLabels, statuses } from './model'

export type Choice = { value: string; label: string }
export const options = (list: string[]): Choice[] => list.map(s => ({ value: s, label: s }))
export const pairs = (obj: Record<string,string>): Choice[] => Object.entries(obj).map(([value,label]) => ({ value, label }))
type Control = { label: string; value: string; onChange: (value: string) => void; hint?: string; required?: boolean }
export function TextField({ label, value, onChange, hint, required, type = 'text', multiline = false, list }: Control & {
  type?: 'text'|'date'|'number'|'search'; multiline?: boolean; list?: string
}) {
  const id = useId()
  const common = { id, value: value || '', required, 'aria-describedby': hint ? id + '-hint' : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value) }
  return <Field>
    <FieldLabel htmlFor={id}>{label}{required && ' *'}</FieldLabel>
    {multiline ? <Textarea {...common} rows={3}/> : <Input {...common} type={type} list={list} step={type === 'number' ? 'any' : undefined}/>}
    {hint && <FieldDescription id={id + '-hint'}>{hint}</FieldDescription>}
  </Field>
}
export function SelectField({ label, value, onChange, choices, required, hint }: Control & { choices: Choice[] }) {
  const id = useId()
  return <Field>
    <FieldLabel htmlFor={id}>{label}{required && ' *'}</FieldLabel>
    <select className="ext-select" id={id} value={value || ''} required={required} aria-describedby={hint ? id + '-hint' : undefined} onChange={e => onChange(e.target.value)}>
      {choices.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
    </select>
    {hint && <FieldDescription id={id + '-hint'}>{hint}</FieldDescription>}
  </Field>
}
export function Problem({ message }: { message: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { if (message) ref.current?.focus() }, [message])
  return message ? <div ref={ref} tabIndex={-1}><Alert variant="destructive"><AlertDescription>{message}</AlertDescription></Alert></div> : null
}
export function Blank({ title, children }: { title: string; children?: ReactNode }) {
  return <Empty><EmptyHeader><EmptyTitle>{title}</EmptyTitle>{children && <EmptyDescription>{children}</EmptyDescription>}</EmptyHeader></Empty>
}
export function Modal({ title, description, close, children }: { title: string; description: string; close: () => void; children: ReactNode }) {
  return <Dialog open onOpenChange={v => { if (!v) close() }}>
    <DialogContent className="ext-modal" showCloseButton={false}>
      <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>{children}
    </DialogContent>
  </Dialog>
}
export function Footer({ label, close }: { label: string; close: () => void }) {
  return <div className="page-actions ext-actions"><Button type="button" variant="outline" onClick={close}>Quay lại</Button><Button type="submit">{label}</Button></div>
}
export function Status({ value }: { value: string }) { return <Badge variant="secondary">{statuses[value] || value}</Badge> }
export function EvidenceFields({ required, value, change }: {
  required: string[]; value: Record<string,string>; change: (value: Record<string,string>) => void
}) {
  const keys = [...new Set([...required,...Object.keys(value),'OTHER'])]
  return <fieldset className="ext-group"><legend>Minh chứng</legend>
    <p className="muted">Nhập ký hiệu văn bản hoặc tên tệp minh họa. Hệ thống chỉ lưu tên tham chiếu.</p>
    {keys.map(code => <TextField key={code} label={(evidenceLabels[code] || code) + (required.includes(code) ? ' · bắt buộc khi xét' : '')}
      value={value[code] || ''} onChange={v => change({ ...value, [code]: v })}/>)}
  </fieldset>
}
export function Facts({ facts }: { facts: [string, ReactNode][] }) {
  return <dl className="ext-facts">{facts.map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value || '—'}</dd></div>)}</dl>
}
export const messageOf = (e: unknown) => e instanceof Error ? e.message : 'Kiểm tra lại dữ liệu vừa nhập.'

