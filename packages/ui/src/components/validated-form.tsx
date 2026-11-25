import { useState } from "react"
import type { ComponentProps } from "react"
import { Alert, AlertDescription } from "./alert"

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

function message(field: Control) {
  if (field.validity.customError) return field.validationMessage
  if (field.validity.valueMissing) return "Vui lòng điền hoặc chọn một giá trị."
  if (field.validity.typeMismatch && field.type === "email") return "Nhập địa chỉ email hợp lệ."
  if (field.validity.rangeUnderflow || field.validity.rangeOverflow) return "Giá trị nằm ngoài phạm vi cho phép."
  return "Kiểm tra lại định dạng của giá trị đã nhập."
}

// HTML constraints still block submission. Surface the first error in the app
// and focus its visible control, including Radix's form-associated controls.
export function ValidatedForm({ children, onSubmit, ...props }: ComponentProps<"form">) {
  const [error, setError] = useState("")
  return <form {...props} onInvalid={event => {
    event.preventDefault()
    const target = event.target as Control
    if (target !== event.currentTarget.querySelector("input:invalid, select:invalid, textarea:invalid")) return
    const control = target.getAttribute("aria-hidden") === "true"
      ? target.previousElementSibling : target
    if (control instanceof HTMLElement) control.focus()
    const label = control?.getAttribute("aria-label") ??
      (control instanceof HTMLButtonElement || control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement
        ? control.labels?.[0]?.innerText.trim() : "")
    setError([label, message(target)].filter(Boolean).join(" — "))
  }} onInput={() => setError("")} onChange={() => setError("")}
    onSubmit={event => { setError(""); onSubmit?.(event) }}>
    {children}
    {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
  </form>
}
