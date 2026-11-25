import type { ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@rms/ui/components/button"

export function AccountPanel({ id, label, open, toggle, children }: {
  id: string
  label: string
  open: boolean
  toggle: () => void
  children: ReactNode
}) {
  return <div className="account-panel">
    <Button id={id + "-trigger"} variant="ghost" aria-expanded={open} aria-controls={id} onClick={toggle}>
      {label}<ChevronDown aria-hidden="true" size={16} />
    </Button>
    <div id={id} className="account-panel-body" hidden={!open}>{open && children}</div>
  </div>
}
