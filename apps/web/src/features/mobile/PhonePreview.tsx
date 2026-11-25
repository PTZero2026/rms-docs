import { useEffect, useRef, useState } from "react"

export function PhonePreview() {
  const frame = useRef<HTMLIFrameElement>(null)
  const [entry] = useState(() => "/" + location.search + location.hash)
  const [destination, setDestination] = useState(entry)

  useEffect(() => {
    const preview = frame.current?.contentWindow
    if (!preview) return
    function syncRoute() {
      const hash = preview!.location.hash
      setDestination("/" + location.search + hash)
      history.replaceState(history.state, "", location.pathname + location.search + hash)
    }
    preview.addEventListener("hashchange", syncRoute)
    // The iframe's initial navigation may replace the provisional about:blank window.
    const element = frame.current
    const loaded = () => preview.addEventListener("hashchange", syncRoute)
    element?.addEventListener("load", loaded)
    return () => {
      element?.removeEventListener("load", loaded)
      preview.removeEventListener("hashchange", syncRoute)
    }
  }, [])

  return (
    <main className="mobile-preview">
      <header>
        <strong>RMS · v0-mobile</strong>
        <a href={destination}>Mở toàn màn hình</a>
      </header>
      <iframe ref={frame} title="Bản mẫu RMS trên điện thoại" src={entry} />
    </main>
  )
}
