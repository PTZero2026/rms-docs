import { useSyncExternalStore } from "react"

const viewport = window.matchMedia("(max-width: 600px)")
function subscribe(notify: () => void) {
  viewport.addEventListener("change", notify)
  return () => viewport.removeEventListener("change", notify)
}
export const usePhoneLayout = () => useSyncExternalStore(subscribe, () => viewport.matches)
