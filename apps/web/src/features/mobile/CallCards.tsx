import { useState } from "react"
import { CalendarDays, ChevronRight } from "lucide-react"
import { routeUrl } from "../../demo/catalog"
import type { DemoRow } from "../../demo/types"
import { Blank, Status } from "../../demo/ui"
import { callStatus, dateLabel, receiving } from "../intake/model"
import { FilterPair } from "./FilterPair"

export function CallCards({ matches }: { matches: DemoRow[] }) {
  const [all, setAll] = useState(false)
  const calls = all ? matches : matches.filter(receiving)
  return (
    <>
      <FilterPair
        label="Phạm vi tra kỳ"
        options={["Đang nhận", "Tất cả"]}
        secondActive={all}
        onChange={setAll}
      />
      {calls.length ? (
        <div className="mobile-records">
          {calls.map((call) => (
            <a key={call.id} className="call-record" href={routeUrl("F02", call.id)}>
              <span className="call-meta">
                <span>{call.fields.code}</span>
                <Status value={callStatus(call)} />
              </span>
              <strong>{call.title}</strong>
              <span className="call-deadline">
                <CalendarDays size={16} /> Hạn {dateLabel(call.fields.due)}{" "}
                <ChevronRight size={16} />
              </span>
            </a>
          ))}
        </div>
      ) : (
        <Blank title="Chưa có kỳ phù hợp" body="Thử đổi từ khóa hoặc phạm vi tra kỳ." />
      )}
    </>
  )
}
