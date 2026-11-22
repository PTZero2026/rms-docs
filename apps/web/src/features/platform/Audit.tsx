import { useState } from "react"
import { History } from "lucide-react"
import { Input } from "@rms/ui/components/input"
import { Button } from "@rms/ui/components/button"
import { rowVisible } from "../../demo/views"
import { Blank, Heading } from "../../demo/ui"
import { statusNames, vietnamDate } from "../../demo/catalog"
import type { FeatureProps } from "../../demo/types"
import { DetailFields, Editor } from "./shared"
export default function Audit(p: FeatureProps) {
  const [query, setQuery] = useState(""),
    [eventId, setEventId] = useState("")
  const events = p.audit
    .filter((e) => {
      const row = p.rows.find((r) => r.id === e.recordId)
      return (
        (row ? rowVisible(row, p.session, p.rows) : p.session.role === "admin") &&
        (!p.route.id || e.recordId === p.route.id) &&
        (e.action + " " + e.actor + " " + e.title).toLowerCase().includes(query.toLowerCase())
      )
    })
    .slice()
    .reverse()
  const selected = events.find((e) => e.id === eventId)
  return (
    <div className="stack">
      <Heading
        title="Nhật ký hoạt động"
        description="Lịch sử thay đổi trong phạm vi hồ sơ được phép xem."
      />
      <section className="panel">
        <div className="toolbar pad">
          <Input
            aria-label="Tìm nhật ký"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo hồ sơ, hành động hoặc người thực hiện…"
          />
          {p.route.id && (
            <Button variant="outline" onClick={() => p.go("P02")}>
              Xem toàn bộ nhật ký
            </Button>
          )}
        </div>
        {events.length ? (
          events.map((e) => (
            <button className="project-row" key={e.id} onClick={() => setEventId(e.id)}>
              <History size={17} />
              <span className="task-copy">
                <b>{e.action}</b>
                <small>
                  {e.title} · {e.actor}
                </small>
              </span>
              <time>{vietnamDate(e.at, true)}</time>
            </button>
          ))
        ) : (
          <Blank title="Chưa có sự kiện trong phạm vi này" />
        )}
      </section>
      {selected && (
        <Editor title={selected.action} hint={selected.title} close={() => setEventId("")}>
          <DetailFields
            values={[
              ["Người thực hiện", selected.actor],
              ["Đơn vị khi ghi nhận", selected.unit],
              ["Thời điểm", vietnamDate(selected.at, true)],
              ["Mã hồ sơ", selected.recordId],
              ["Phiên bản quy trình", selected.workflowVersion],
              ["Lý do ghi nhận", selected.reason],
              ["Trước", statusNames[selected.from ?? ""] ?? selected.from],
              ["Sau", statusNames[selected.to ?? ""] ?? selected.to],
            ]}
          />
        </Editor>
      )}
    </div>
  )
}
