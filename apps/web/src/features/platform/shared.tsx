import { ValueInput } from "@rms/ui/components/date-input"
import { ChoiceOption, ChoiceSelect } from "@rms/ui/components/choice-select"
import { useId } from "react"
import type { ReactNode } from "react"
import { Field, FieldError, FieldLabel } from "@rms/ui/components/field"
import { Textarea } from "@rms/ui/components/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@rms/ui/components/dialog"
export function Editor({
  title,
  hint,
  close,
  children,
}: {
  title: string
  hint: string
  close: () => void
  children: ReactNode
}) {
  return (
    <Dialog
      open
      onOpenChange={(value) => {
        if (!value) close()
      }}
    >
      <DialogContent restoreOpener className="editor-dialog">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{hint}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
export function TextField({
  label,
  value,
  change,
  multiline = false,
  type = "text",
  disabled = false,
  required = false,
}: {
  label: string
  value: string
  change: (v: string) => void
  multiline?: boolean
  type?: string
  disabled?: boolean
  required?: boolean
}) {
  const id = useId()
  return (
    <Field>
      <FieldLabel htmlFor={id}>
        {label}
        {required ? " *" : ""}
      </FieldLabel>
      {multiline ? (
        <Textarea
          id={id}
          required={required}
          value={value}
          onChange={(e) => change(e.target.value)}
          disabled={disabled}
        />
      ) : (
        <ValueInput
          id={id}
          required={required}
          value={value}
          type={type}
          onValueChange={change}
          disabled={disabled}
        />
      )}
    </Field>
  )
}
export function Choice({
  label,
  value,
  change,
  options,
  disabled = false,
}: {
  label: string
  value: string
  change: (v: string) => void
  options: Record<string, string>
  disabled?: boolean
}) {
  const id = useId()
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <ChoiceSelect id={id} value={value} disabled={disabled} onValueChange={change}>
        {Object.entries(options).map(([k, v]) => (
          <ChoiceOption key={k} value={k}>
            {v}
          </ChoiceOption>
        ))}
      </ChoiceSelect>
    </Field>
  )
}
export function ErrorLine({ message }: { message: string }) {
  return message ? <FieldError role="alert">{message}</FieldError> : null
}
export function DetailFields({ values }: { values: [string, ReactNode][] }) {
  return (
    <dl className="detail-fields">
      {values.map(([key, value]) => (
        <div key={key}>
          <dt>{key}</dt>
          <dd>{value || "—"}</dd>
        </div>
      ))}
    </dl>
  )
}
export function download(name: string, text: string, mime = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([text], { type: mime }))
  const a = document.createElement("a")
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
