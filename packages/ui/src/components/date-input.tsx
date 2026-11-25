import { useState } from "react"
import type { ComponentProps } from "react"
import { format, isValid, parse } from "date-fns"
import { vi } from "date-fns/locale/vi"
import { CalendarDays } from "lucide-react"
import { Button } from "./button"
import { Calendar } from "./calendar"
import { Input } from "./input"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

type Props = Omit<ComponentProps<typeof Input>, "value" | "defaultValue" | "onChange"> & {
  value?: string | number
  onValueChange: (value: string) => void
}

function readDate(text: string) {
  const mask = /^\d{4}-\d{2}-\d{2}$/.test(text) ? "yyyy-MM-dd" : "dd/MM/yyyy"
  const date = parse(text, mask, new Date(2000, 0, 1))
  return isValid(date) && format(date, mask) === text ? date : undefined
}

export function DateInput({ value, onValueChange, name, disabled, readOnly, min, max, ...props }: Props) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<{ text: string; iso: string }>()
  const iso = String(value ?? draft?.iso ?? "")
  const selected = readDate(iso)
  const text = draft?.iso === iso ? draft.text : selected ? format(selected, "dd/MM/yyyy") : ""
  const earliest = typeof min === "string" ? readDate(min) : undefined
  const latest = typeof max === "string" ? readDate(max) : undefined
  const outside = (d: Date) => !!((earliest && d < earliest) || (latest && d > latest))
  const invalid = !!text && (!selected || outside(selected))
  function edit(text: string) {
    const date = readDate(text)
    const next = date && !outside(date) ? format(date, "yyyy-MM-dd") : ""
    setDraft({ text: date && next ? format(date, "dd/MM/yyyy") : text, iso: next })
    onValueChange(next)
  }
  return <span className="relative inline-flex w-full min-w-0 items-center">
    <Input {...props} type="text" autoComplete="off" disabled={disabled} readOnly={readOnly}
      placeholder="dd/mm/yyyy" className={"pr-10 " + (props.className ?? "")} value={text}
      aria-invalid={invalid || props["aria-invalid"]} onChange={event => edit(event.target.value)}
      ref={node => { node?.setCustomValidity(invalid ? "Nhập ngày hợp lệ theo định dạng dd/mm/yyyy." : "") }} />
    {name && <input type="hidden" name={name} value={iso} disabled={disabled} />}
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="icon-sm" className="absolute end-1"
          disabled={disabled || readOnly} aria-label="Mở lịch"><CalendarDays /></Button>
      </PopoverTrigger>
      <PopoverContent align="end" aria-label="Chọn ngày" className="w-auto p-0">
        <Calendar mode="single" locale={vi} autoFocus defaultMonth={selected} selected={selected}
          formatters={{ formatWeekdayName: day => ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][day.getDay()] }}
          disabled={outside} onSelect={date => { edit(date ? format(date, "dd/MM/yyyy") : ""); setOpen(false) }} />
      </PopoverContent>
    </Popover>
  </span>
}

// Some screens derive field types from the tenant's schema at runtime.
export function ValueInput({ type, value, onValueChange, ...props }: Props) {
  return type === "date"
    ? <DateInput {...props} value={value} onValueChange={onValueChange} />
    : <Input {...props} type={type} value={value} onChange={event => onValueChange(event.target.value)} />
}
