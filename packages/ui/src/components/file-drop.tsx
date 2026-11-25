import { useId, useRef, useState } from "react"
import type { ComponentProps } from "react"
import { Upload } from "lucide-react"
import { cn } from "cn"
import { Button } from "./button"

type Props = Omit<ComponentProps<"input">, "type">

export function FileDrop({ id, disabled, multiple, accept, onChange, ref, ...props }: Props) {
  const generated = useId()
  const input = useRef<HTMLInputElement>(null)
  const opening = useRef(false)
  const previousFiles = useRef<FileList | null>(null)
  const [names, setNames] = useState("")
  const [error, setError] = useState("")
  function receive(files: FileList) {
    const control = input.current
    if (!control || control.matches(":disabled") || !files.length) return
    if (!multiple && files.length > 1) { setError("Chỉ nhận một tệp mỗi lần."); return }
    control.files = files
    control.dispatchEvent(new Event("change", { bubbles: true }))
  }
  function accepted(files: FileList) {
    const allowed = accept?.toLowerCase().split(",").map(rule => rule.trim()).filter(Boolean)
    return !allowed?.length || Array.from(files).every(file => allowed.some(rule =>
      rule.startsWith(".") ? file.name.toLowerCase().endsWith(rule) :
      rule.endsWith("/*") ? file.type.toLowerCase().startsWith(rule.slice(0, -1)) : file.type.toLowerCase() === rule
    ))
  }

  return <span className="grid min-w-0 gap-1">
    <input {...props} id={id ?? generated} hidden type="file" multiple={multiple} accept={accept} disabled={disabled}
      ref={node => {
        input.current = node
        if (typeof ref === "function") return ref(node)
        if (ref) ref.current = node
      }}
      onClick={event => { if (!opening.current) event.preventDefault() }}
      onChange={event => {
        const control = event.currentTarget
        if (control.files && !accepted(control.files)) {
          if (previousFiles.current) control.files = previousFiles.current
          else control.value = ""
          setError("Định dạng tệp được nhận: " + accept)
          return
        }
        onChange?.(event)
        previousFiles.current = control.files
        setNames(Array.from(control.files ?? [], file => file.name).join(", "))
        setError("")
      }} />
    <span role="group" onClick={event => event.preventDefault()} tabIndex={disabled ? -1 : 0} aria-label="Nhận tệp bằng kéo thả hoặc dán"
      aria-disabled={disabled} aria-describedby={generated + "-help"}
      className={cn("flex min-h-12 items-center gap-2 rounded-lg border border-dashed border-input px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-ring", disabled && "opacity-50")}
      onDragOver={event => event.preventDefault()}
      onDrop={event => { event.preventDefault(); receive(event.dataTransfer.files) }}
      onPaste={event => { if (event.clipboardData.files.length) { event.preventDefault(); receive(event.clipboardData.files) } }}>
      <Upload className="size-4 shrink-0" aria-hidden="true" />
      <span id={generated + "-help"}>Kéo tệp vào đây hoặc dán tệp đã sao chép.</span>
    </span>
    <Button type="button" variant="outline" className="justify-self-start" disabled={disabled}
      onClick={event => {
        event.preventDefault()
        opening.current = true
        try { input.current?.click() } finally { opening.current = false }
      }}>Chọn tệp từ máy</Button>
    <span aria-live="polite" className="break-all text-sm">{error || names}</span>
  </span>
}
