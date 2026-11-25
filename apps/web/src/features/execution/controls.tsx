import { ValidatedForm } from "@rms/ui/components/validated-form"
import { ValueInput } from "@rms/ui/components/date-input"
import { Checkbox } from "@rms/ui/components/checkbox"
import { ChoiceOption, ChoiceSelect } from "@rms/ui/components/choice-select"
import { useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Button } from '@rms/ui/components/button'
import { Badge } from '@rms/ui/components/badge'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@rms/ui/components/dialog'
import { Input } from '@rms/ui/components/input'
import { Textarea } from '@rms/ui/components/textarea'
import { Field, FieldLabel } from '@rms/ui/components/field'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@rms/ui/components/table'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@rms/ui/components/empty'
import { Alert, AlertDescription } from '@rms/ui/components/alert'
import type { FeatureProps } from '../../demo/types'
import { states } from './model'
import type { Data, Row } from './model'

type InputType = 'text' | 'date' | 'number' | 'long' | 'choice' | 'multi' | 'file' | 'files' | 'check'
export type FormField = {
  name: string
  label: string
  type?: InputType
  options?: [string, string][]
  required?: boolean
  value?: string
  sample?: string
  hint?: string
  min?: number
  max?: number
  step?: string
}
export function choice(
  name: string,
  label: string,
  options: Record<string, string>,
  value?: string,
): FormField {
  return { name, label, type: 'choice', options: Object.entries(options), value }
}
export function fileField(label = 'Minh chứng', sample = 'Minh-chung-mau.pdf', value = ''): FormField {
  return { name: 'evidence', label, type: 'file', value, sample }
}
function Control({
  spec,
  value,
  onChange,
}: {
  spec: FormField
  value: string
  onChange: (value: string) => void
}) {
  const id = useId(),
    { label, type = 'text', hint } = spec
  const props = { id, required: spec.required, 'aria-describedby': hint ? id + '-hint' : undefined }
  return (
    <Field className="exec-field">
      <FieldLabel htmlFor={id}>
        {label}
        {spec.required ? ' *' : ''}
      </FieldLabel>
      {type === 'multi' ? (
        <div id={id} role="group" aria-label={label} className="exec-options">
          {spec.options?.map(([key, name]) => {
            const selected = value.split(',').filter(Boolean)
            return (
              <label key={key}>
                <Checkbox
                  checked={selected.includes(key)}
                  onCheckedChange={checked => onChange(
                      (checked ? [...selected, key] : selected.filter((s) => s !== key)).join(','),
                    )}
                />{' '}
                {name}
              </label>
            )
          })}
        </div>
      ) : type === 'choice' ? (
        <ChoiceSelect {...props} value={value} onValueChange={onChange}>
          {spec.options?.map(([k, v]) => (
            <ChoiceOption key={k} value={k}>
              {v}
            </ChoiceOption>
          ))}
        </ChoiceSelect>
      ) : type === 'long' ? (
        <Textarea {...props} value={value} onChange={(e) => onChange(e.target.value)} rows={3} />
      ) : type === 'check' ? (
        <Checkbox
          id={id}

          checked={value === 'yes'}
          onCheckedChange={checked => onChange(checked ? 'yes' : '')}
        />
      ) : type === 'file' || type === 'files' ? (
        <div className="exec-file">
          <Input
            id={id}
            type="file"
            multiple={type === 'files'}
            accept=".pdf,.doc,.docx,.xlsx,.xls,.png,.jpg,.jpeg,.csv,.zip"
            onChange={(e) => {
              const names = Array.from(e.target.files || [], (f) => f.name)
              if (names.length) onChange(names.join('; '))
            }}
          />
          <div className="page-actions">
            {spec.sample && (
              <Button variant="outline" type="button" size="sm" onClick={() => onChange(spec.sample!)}>
                Dùng tệp mẫu
              </Button>
            )}
            {value && (
              <Button variant="ghost" type="button" size="sm" onClick={() => onChange('')}>
                Gỡ tệp
              </Button>
            )}
          </div>
          <small>{value || 'Chưa chọn tệp'} · Chỉ lưu tên tệp.</small>
        </div>
      ) : (
        <ValueInput
          {...props}
          type={type}
          min={spec.min}
          max={spec.max}
          step={spec.step}
          value={value}
          onValueChange={onChange}
        />
      )}
      {hint && (
        <small id={id + '-hint'} className="muted">
          {hint}
        </small>
      )}
    </Field>
  )
}
type ActionProps = {
  p: FeatureProps
  label: string
  title?: string
  description?: string
  fields?: FormField[]
  save: (data: Data) => Row[]
  action?: string | ((data: Data) => string)
  subject?: Row
  after?: (updates: Row[]) => void
  primary?: boolean
  confirm?: string
  initiallyOpen?: boolean
  children?: ReactNode
  extra?: (data: Data, set: (patch: Data) => void) => ReactNode
}
export function Action({
  p,
  label,
  title,
  description,
  fields = [],
  save,
  action,
  subject,
  after,
  primary,
  confirm,
  initiallyOpen = false,
  children,
  extra,
}: ActionProps) {
  const defaults = () =>
    Object.fromEntries(
      fields.map((f) => [f.name, f.value ?? (f.type === 'choice' ? f.options?.[0]?.[0] || '' : '')]),
    )
  const [open, setOpen] = useState(initiallyOpen),
    [data, setData] = useState<Data>(defaults),
    [error, setError] = useState(''),
    [feedback, setFeedback] = useState('')
  const errorRef = useRef<HTMLDivElement>(null)
  function toggle(v: boolean) {
    if (v) {
      setData(defaults())
      setError('')
      setFeedback('')
    }
    setOpen(v)
  }
  function patch(d: Data) {
    setData((prev) => ({ ...prev, ...d }))
    setError('')
  }
  return (
    <>
      <Dialog open={open} onOpenChange={toggle}>
        <DialogTrigger asChild>
          <Button type="button" size="sm" variant={primary ? 'default' : 'outline'}>
            {label}
          </Button>
        </DialogTrigger>
        <DialogContent className="exec-dialog">
          <DialogHeader>
            <DialogTitle>{title || label}</DialogTitle>
            <DialogDescription>
              {description || subject?.title || 'Kiểm tra thông tin trước khi xác nhận.'}
            </DialogDescription>
          </DialogHeader>
          <ValidatedForm
            onSubmit={(e) => {
              e.preventDefault()
              try {
                const updates = save(data)
                if (updates.length)
                  p.commit(
                    typeof action === 'function' ? action(data) : action || label,
                    updates,
                    subject || updates[0],
                  )
                setOpen(false)
                setFeedback(updates.length ? 'Đã ghi nhận.' : 'Không có bản ghi mới.')
                after?.(updates)
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Chưa lưu được thay đổi.')
                requestAnimationFrame(() => errorRef.current?.focus())
              }
            }}
          >
            {error && (
              <div tabIndex={-1} ref={errorRef}>
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}
            {children}
            {extra?.(data, patch)}
            <div className="exec-fields">
              {fields.map((f) => (
                <Control
                  key={f.name}
                  spec={f}
                  value={data[f.name] || ''}
                  onChange={(v) => patch({ [f.name]: v })}
                />
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">{confirm || 'Xác nhận'}</Button>
            </DialogFooter>
          </ValidatedForm>
        </DialogContent>
      </Dialog>
      <span role="status" className="sr-only">
        {feedback}
      </span>
    </>
  )
}
export function Status({ value }: { value: string }) {
  return (
    <Badge variant="outline" className={'exec-status exec-s-' + value.toLowerCase()}>
      {states[value] || value}
    </Badge>
  )
}
export function NoData({ title = 'Chưa có bản ghi', detail }: { title?: string; detail?: string }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        {detail && <EmptyDescription>{detail}</EmptyDescription>}
      </EmptyHeader>
    </Empty>
  )
}
export function Grid({
  columns,
  rows,
  caption,
}: {
  columns: string[]
  rows: { id: string; cells: ReactNode[] }[]
  caption: string
}) {
  if (!rows.length) return <NoData title={'Chưa có ' + caption.toLocaleLowerCase('vi')} />
  return (
    <Table className="data-table">
      <TableCaption className="sr-only">{caption}</TableCaption>
      <TableHeader>
        <TableRow>
          {columns.map((x) => (
            <TableHead key={x}>{x}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.id}>
            {r.cells.map((cell, i) => (
              <TableCell key={columns[i]}>{cell}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
export function Panel({ title, tools, children }: { title: string; tools?: ReactNode; children: ReactNode }) {
  return (
    <section className="panel exec-panel">
      <div className="section-heading">
        <h2>{title}</h2>
        {tools && <div className="page-actions">{tools}</div>}
      </div>
      <div className="exec-panel-body">{children}</div>
    </section>
  )
}
export function Metrics({ values }: { values: [string, string][] }) {
  return (
    <div className="metric-grid">
      {values.map(([name, value]) => (
        <div className="metric" key={name}>
          <span>{name}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  )
}
export function RecordLink({
  p,
  feature,
  id,
  children,
}: {
  p: FeatureProps
  feature: string
  id?: string
  children: ReactNode
}) {
  return (
    <a
      className="record-link"
      href={'#/' + feature + (id ? '/' + encodeURIComponent(id) : '')}
      onClick={(e) => {
        if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
          e.preventDefault()
          p.go(feature, id)
        }
      }}
    >
      {children}
    </a>
  )
}
export function Search({ label, value, set }: { label: string; value: string; set: (s: string) => void }) {
  return (
    <Input
      type="search"
      aria-label={label}
      placeholder={label}
      value={value}
      onChange={(e) => set(e.target.value)}
    />
  )
}
export function Heading({ title, sub, tools }: { title: string; sub?: string; tools?: ReactNode }) {
  return (
    <header className="page-heading">
      <div>
        <h1>{title}</h1>
        {sub && <p className="muted">{sub}</p>}
      </div>
      {tools && <div className="page-actions">{tools}</div>}
    </header>
  )
}
