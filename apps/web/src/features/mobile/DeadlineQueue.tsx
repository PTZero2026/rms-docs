import { useState } from "react"
import { ArrowUpRight, CalendarClock, ChevronRight, Clock3 } from "lucide-react"
import { Button } from "@rms/ui/components/button"
import { routeUrl, vietnamDate } from "../../demo/catalog"
import { Blank } from "../../demo/ui"
import type { dashboardTasks } from "../../demo/views"
import { today } from "../intake/model"
import { FilterPair } from "./FilterPair"

export function DeadlineQueue({ tasks }: { tasks: ReturnType<typeof dashboardTasks> }) {
  const [lateOnly, setLateOnly] = useState(false)
  const overdue = tasks.filter((task) => task.date && task.date < today)
  const shown = lateOnly ? overdue : tasks

  return (
    <section className="deadline-queue" aria-label="Việc cần xử lý">
      <header className="deadline-summary">
        <div>
          <CalendarClock size={17} />
          <h2>Việc cần xử lý</h2>
        </div>
        <p>
          <strong>{tasks.length}</strong> việc trong danh sách
        </p>
        <span>
          <Clock3 size={14} />
          {overdue.length} việc quá hạn
        </span>
      </header>
      <FilterPair
        label="Lọc việc theo hạn"
        options={["Tất cả", "Quá hạn"]}
        secondActive={lateOnly}
        onChange={setLateOnly}
      />
      {shown.length ? (
        <div className="mobile-records">
          {shown.map((task) => {
            const late = !!task.date && task.date < today
            return (
              <a key={task.id} className="agenda-row" href={routeUrl(task.feature, task.target)}>
                <span className="agenda-copy">
                  <small>{task.detail}</small>
                  <b>{task.title}</b>
                  <span className={late ? "due late" : "due"}>
                    <CalendarClock size={14} />
                    {late ? "Quá hạn · " : task.date ? "Hạn " : ""}
                    {task.date ? vietnamDate(task.date) : "Chưa có hạn"}
                  </span>
                </span>
                <ChevronRight size={17} aria-hidden="true" />
              </a>
            )
          })}
        </div>
      ) : (
        <Blank
          title={lateOnly ? "Không có việc quá hạn" : "Bạn đã xử lý hết công việc"}
          action={
            lateOnly ? (
              <Button variant="outline" onClick={() => setLateOnly(false)}>
                Xem tất cả việc
              </Button>
            ) : (
              <Button asChild variant="outline">
                <a href={routeUrl("B04")}>
                  Xem hộp thư <ArrowUpRight />
                </a>
              </Button>
            )
          }
        />
      )}
    </section>
  )
}
