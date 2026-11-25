import { useId, useRef, useState, type ReactNode } from "react"
import { Button } from "@rms/ui/components/button"
import { ListFilter } from "lucide-react"
import { usePhoneLayout } from "../mobile/usePhoneLayout"

export function RecordFilters({ search, count, clear, children }: {
  search?: ReactNode
  count: number
  clear: () => void
  children: ReactNode
}) {
  const phone = usePhoneLayout()
  const [open, setOpen] = useState(false)
  const id = useId()
  const controls = useRef<HTMLDivElement>(null)
  function reset() {
    const first = controls.current?.querySelector<HTMLElement>('input, [aria-controls], [role="combobox"]')
    first?.focus()
    clear()
  }
  return <div ref={controls} className="ext-filter-controls">
    {search}
    <div className="ext-filter-actions">
      {phone && <Button variant="outline" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        <ListFilter /> Bộ lọc{count > 0 && ` (${count})`}
      </Button>}
      {count > 0 && <Button variant="ghost" onClick={reset}>Xóa bộ lọc</Button>}
    </div>
    <div id={id} hidden={phone && !open}><div className="ext-filters">{children}</div></div>
  </div>
}
