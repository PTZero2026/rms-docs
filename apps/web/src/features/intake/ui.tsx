import { useId, useState } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import { Alert, AlertDescription } from '@rms/ui/components/alert'
import { Badge } from '@rms/ui/components/badge'
import { Button } from '@rms/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@rms/ui/components/dialog'
import { Empty, EmptyHeader, EmptyTitle } from '@rms/ui/components/empty'
import { Field, FieldLabel } from '@rms/ui/components/field'
import { Input } from '@rms/ui/components/input'
import { Textarea } from '@rms/ui/components/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@rms/ui/components/table'
import { label } from './model'

export function Heading({
  title,
  detail,
  children,
}: {
  title: string
  detail?: string
  children?: ReactNode
}) {
  return (
    <header className="page-heading">
      <div>
        <h1>{title}</h1>
        {detail && <p className="muted">{detail}</p>}
      </div>
      <div className="page-actions">{children}</div>
    </header>
  )
}
export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel stack">
      <h2 className="section-heading">{title}</h2>
      {children}
    </section>
  )
}
export function Blank({
  children = 'Chưa có bản ghi trong phạm vi truy cập.',
}: {
  children?: ReactNode
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>{children}</EmptyTitle>
      </EmptyHeader>
    </Empty>
  )
}
export function FieldText({
  label: caption,
  ...props
}: Omit<ComponentProps<typeof Input>, 'id'> & { label: string }) {
  const id = useId()
  return (
    <Field>
      <FieldLabel htmlFor={id}>{caption}</FieldLabel>
      <Input {...props} id={id} />
    </Field>
  )
}
export function Area({
  label: caption,
  ...props
}: ComponentProps<typeof Textarea> & { label: string }) {
  const id = useId()
  return (
    <Field>
      <FieldLabel htmlFor={id}>{caption}</FieldLabel>
      <Textarea {...props} id={id} />
    </Field>
  )
}
export function Choice({
  label: caption,
  children,
  ...props
}: ComponentProps<'select'> & { label: string }) {
  const id = useId()
  return (
    <Field>
      <FieldLabel htmlFor={id}>{caption}</FieldLabel>
      <select {...props} id={id} className="intake-select">
        {children}
      </select>
    </Field>
  )
}
export function State({ value }: { value: string }) {
  return (
    <Badge variant="outline" className="status" data-state={value}>
      {label(value)}
    </Badge>
  )
}
export function LinkRecord({
  feature,
  id,
  children,
}: {
  feature: string
  id?: string
  children: ReactNode
}) {
  return (
    <a className="record-link" href={'#/' + feature + (id ? '/' + encodeURIComponent(id) : '')}>
      {children}
    </a>
  )
}
export function Facts({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="intake-facts">
      {items.map(([key, value]) => (
        <div key={key}>
          <dt>{key}</dt>
          <dd>{value || '—'}</dd>
        </div>
      ))}
    </dl>
  )
}
export function Grid({
  heads,
  lines,
  empty,
}: {
  heads: string[]
  lines: { id: string; cells: ReactNode[] }[]
  empty?: string
}) {
  if (!lines.length) return <Blank>{empty || 'Chưa có bản ghi phù hợp.'}</Blank>
  return (
    <Table className="data-table">
      <TableHeader>
        <TableRow>
          {heads.map((h) => (
            <TableHead key={h}>{h}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {lines.map((line) => (
          <TableRow key={line.id}>
            {line.cells.map((cell, i) => (
              <TableCell
                key={heads[i]}
                data-label={heads[i]}
                data-empty={cell == null || undefined}
              >
                {cell}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Chưa lưu được thay đổi. Vui lòng thử lại.'
export function Problem({ text }: { text: string }) {
  return text ? (
    <Alert variant="destructive" role="alert">
      <AlertDescription>{text}</AlertDescription>
    </Alert>
  ) : null
}
export function useAction() {
  const [error, setError] = useState('')
  return {
    error,
    run(fn: () => void) {
      try {
        fn()
        setError('')
      } catch (e) {
        setError(errorMessage(e))
      }
    },
  }
}
export function ActionDialog({
  trigger,
  title,
  detail,
  confirm,
  onConfirm,
  children,
  disabled,
  primary = false,
}: {
  trigger: string
  title?: string
  detail: string
  confirm?: string
  onConfirm: () => void
  children?: ReactNode
  disabled?: boolean
  primary?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
        setError('')
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" disabled={disabled} variant={primary ? 'default' : 'outline'}>
          {trigger}
        </Button>
      </DialogTrigger>
      <DialogContent className="intake-modal">
        <DialogHeader>
          <DialogTitle>{title || trigger}</DialogTitle>
          <DialogDescription>{detail}</DialogDescription>
        </DialogHeader>
        {children}
        <Problem text={error} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Quay lại
          </Button>
          <Button
            type="button"
            onClick={() => {
              try {
                onConfirm()
                setOpen(false)
              } catch (e) {
                setError(errorMessage(e))
              }
            }}
          >
            {confirm || trigger}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
