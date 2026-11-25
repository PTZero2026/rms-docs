import { Children, isValidElement, useId, useState } from "react"
import type { ComponentProps, ReactElement, ReactNode } from "react"
import { cn } from "cn"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./select"

// Radix reserves the empty string for clearing. Prefix item keys so an actual
// empty choice (e.g. “Tất cả”) remains selectable alongside arbitrary domain IDs.
type ChoiceProps = { value: string | number; children: ReactNode; disabled?: boolean }
export function ChoiceOption({ value, children, disabled }: ChoiceProps) {
  return <SelectItem value={"v:" + value} data-value={value} disabled={disabled}>{children}</SelectItem>
}

type Props = Pick<ComponentProps<typeof SelectTrigger>,
  "id" | "disabled" | "className" | "aria-label" | "aria-labelledby" | "aria-describedby" | "aria-invalid"
> & {
  value?: string | number
  defaultValue?: string | number
  onValueChange?: (value: string) => void
  required?: boolean
  name?: string
  children: ReactNode
}

export function ChoiceSelect({ value, defaultValue, children, onValueChange, required, name, disabled, className, ...trigger }: Props) {
  const id = useId()
  const choices = Children.toArray(children).filter((child): child is ReactElement<ChoiceProps> =>
    isValidElement<ChoiceProps>(child) && child.type === ChoiceOption
  )
  const first = choices.find(child => !child.props.disabled)
  const [picked, setPicked] = useState(defaultValue)
  const selected = String(value ?? picked ?? first?.props.value ?? "")
  const empty = choices.find(child => child.props.value === "")
  // Keep the underlying required field empty until the user selects a real value.
  const placeholder = empty?.props.children ?? "Chọn giá trị"
  return <>
    <Select value={!selected && (required || !empty) ? "" : "v:" + selected} required={required} disabled={disabled}
      onValueChange={key => {
        if (!key.startsWith("v:")) return
        const next = key.slice(2)
        setPicked(next)
        onValueChange?.(next)
      }}>
      <SelectTrigger {...trigger} id={trigger.id ?? id} data-value={selected} className={cn("max-w-full min-w-0 text-start", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent position="popper" align="start" collisionPadding={8} className="max-w-[calc(100vw-1rem)]">
        <SelectGroup>{children}</SelectGroup>
      </SelectContent>
    </Select>
    {name && <input type="hidden" name={name} value={selected} disabled={disabled} />}
  </>
}
