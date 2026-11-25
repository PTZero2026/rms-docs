import { useEffect, useState } from "react"
import { createRmsClient } from "@rms/api-contracts"
import { Button } from "@rms/ui/components/button"

export function ServiceStatus() {
  const [attempt, setAttempt] = useState(0)
  const [status, setStatus] = useState<"loading" | "up" | "down">("loading")
  useEffect(() => {
    const controller = new AbortController()
    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(5000)])
    createRmsClient(location.origin).GET("/api/health", { signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) setStatus(data?.status === "ok" ? "up" : "down")
      })
      .catch(() => { if (!controller.signal.aborted) setStatus("down") })
    return () => controller.abort()
  }, [attempt])
  return (
    <div>
      <p role="status">
        {status === "up" ? "Đã kết nối API RMS." : status === "down" ? "Chưa kết nối được API RMS." : "Đang kiểm tra kết nối API…"}
      </p>
      {status === "down" && <Button variant="outline" onClick={() => { setStatus("loading"); setAttempt(attempt + 1) }}>Kiểm tra lại</Button>}
    </div>
  )
}
