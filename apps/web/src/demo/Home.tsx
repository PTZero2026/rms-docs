import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarDays,
  ChartPie,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  FilePenLine,
  Files,
  FlaskConical,
  Layers,
  Network,
  Settings2,
  UserRound,
  UsersRound,
} from "lucide-react"
import { Button } from "@rms/ui/components/button"
import { Heading, Blank, Status } from "./ui"
import type { FeatureProps } from "./types"
import { dashboardTasks, featureOf, rowVisible } from "./views"
import { canOpen, vietnamDate } from "./catalog"
import { configValue } from "./base-seed"
import { inbox } from "./notifications"
import { tenants } from "./identity"
import { useState } from "react"
import { DeadlineQueue } from "../features/mobile/DeadlineQueue"
import { usePhoneLayout } from "../features/mobile/usePhoneLayout"
import art from "../assets/river-atlas.webp"
export default function Home(p: FeatureProps) {
  const phone = usePhoneLayout()
  const { rows, session, go } = p
  const [allTasks, setAllTasks] = useState(false)
  const visible = rows.filter((r) => rowVisible(r, session, rows))
  const projects = visible.filter(
      (r) => r.kind === "project" && canOpen(featureOf(r, session), session.role, p.e4Enabled),
    ),
    tasks = dashboardTasks(p, visible)
  const outputs = visible.filter((r) => r.kind === "output" && r.status === "APPROVED")
  const notices = inbox(rows, session.userId)
  const call = visible.find(
    (r) =>
      r.kind === "call" && r.status === "OPEN" && (!r.fields.due || r.fields.due >= "2026-11-21"),
  )
  const admin = session.role === "admin",
    student = session.role === "student",
    reviewer = session.role === "reviewer"
  const metrics = admin
    ? [
        {
          label: "Tài khoản hoạt động",
          n: visible.filter((r) => r.kind === "account" && r.status === "ACTIVE").length,
          icon: UsersRound,
          dest: "B03",
        },
        {
          label: "Cấu hình đơn vị",
          n: visible.filter((r) => r.kind === "config" && r.fields.scope === "tenant").length,
          icon: Settings2,
          dest: "B01",
        },
        {
          label: "Phiên bản quy trình",
          n: visible.filter((r) => r.kind === "workflow").length,
          icon: Network,
          dest: "P01",
        },
      ]
    : session.role === "user"
      ? [
          {
            label: "Thông báo chưa đọc",
            n: notices.filter((r) => r.status === "UNREAD").length,
            icon: Bell,
            dest: "B04",
          },
          {
            label: "Yêu cầu nâng quyền",
            n: visible.filter((r) => r.kind === "upgrade").length,
            icon: UsersRound,
            dest: "B03",
          },
        ]
      : student
        ? [
            ...(p.e4Enabled
              ? [
                  {
                    label: "Đề tài sinh viên",
                    n: visible.filter((r) => r.kind === "student-project").length,
                    icon: Files,
                    dest: "F10",
                  },
                ]
              : []),
            {
              label: "Kỳ đang mở",
              n: visible.filter((r) => r.kind === "call" && r.status === "OPEN").length,
              icon: CalendarDays,
              dest: "F02",
            },
            {
              label: "Thông báo chưa đọc",
              n: notices.filter((r) => r.status === "UNREAD").length,
              icon: Bell,
              dest: "B04",
            },
          ]
        : reviewer
          ? [
              {
                label: "Hồ sơ đang xét duyệt",
                n: projects.filter((r) => r.status === "UNDER_REVIEW").length,
                icon: Files,
                dest: "F03",
              },
              {
                label: "Hồ sơ nghiệm thu",
                n: projects.filter((r) => r.status === "UNDER_ACCEPTANCE").length,
                icon: ClipboardCheck,
                dest: "F06",
              },
              {
                label: "Thông báo chưa đọc",
                n: notices.filter((r) => r.status === "UNREAD").length,
                icon: Bell,
                dest: "B04",
              },
            ]
          : [
              { label: "Đề tài trong phạm vi", n: projects.length, icon: Files, dest: "F01" },
              {
                label: "Đang thực hiện",
                n: projects.filter((r) => r.status === "IN_PROGRESS").length,
                icon: FlaskConical,
                dest: "F04",
              },
              { label: "Sản phẩm được duyệt", n: outputs.length, icon: BookOpen, dest: "F07" },
            ]
  const layout = (
    configValue(rows, "HOME." + session.role.toUpperCase()) ?? "tasks,projects,activity"
  ).split(",")
  const groups = [
    {
      name: "Tiếp nhận",
      color: "#53938c",
      n: projects.filter((r) => ["DRAFT", "SUBMITTED"].includes(r.status)).length,
    },
    {
      name: "Xét duyệt",
      color: "#d69d52",
      n: projects.filter((r) => ["UNDER_REVIEW", "APPROVED"].includes(r.status)).length,
    },
    {
      name: "Thực hiện",
      color: "#376785",
      n: projects.filter((r) => ["IN_PROGRESS", "SUSPENDED"].includes(r.status)).length,
    },
  ]
  groups.push({
    name: "Giai đoạn khác",
    color: "#8e86ad",
    n: projects.length - groups.reduce((s, g) => s + g.n, 0),
  })
  const heroAction = admin ? () => go("B01") : call ? () => go("F02", call.id) : () => go("B04")
  const banner = (
    <section
      className="call-banner"
      style={{
        backgroundImage: `linear-gradient(90deg,rgba(10,65,63,.96) 5%,rgba(10,65,63,.82) 43%,transparent 83%),url(${art})`,
      }}
    >
      <div className="call-tag">
        <i />
        {admin ? "Quản trị đơn vị" : call ? "Đang nhận đề xuất" : "Không gian nghiên cứu"}
      </div>
      <h2>{admin ? "Cấu hình hoạt động nghiên cứu" : (call?.title ?? "Trung tâm thông báo")}</h2>
      <p>
        {admin
          ? "Quản lý tính năng và mẫu cấu hình đang áp dụng."
          : call?.fields.due
            ? "Hạn nhận hồ sơ · " + vietnamDate(call.fields.due)
            : "Theo dõi cập nhật liên quan đến hồ sơ của bạn."}
      </p>
      <Button variant="secondary" onClick={heroAction}>
        {admin ? "Mở cấu hình" : call ? "Xem thông tin kỳ" : "Xem thông báo"}
        <ArrowUpRight data-icon="inline-end" />
      </Button>
    </section>
  )
  const metricCards = (
    <section className="home-metrics" aria-label="Số liệu trong phạm vi">
      {metrics.map(({ label, n, icon: Icon, dest }, i) => (
        <button key={label} onClick={() => go(dest)} className={"metric-link tone-" + i}>
          <span className="metric-symbol">
            <Icon size={19} />
          </span>
          <span>
            <small>{label}</small>
            <strong>{n.toLocaleString("vi-VN")}</strong>
          </span>
          <ArrowUpRight size={15} className="metric-open" />
        </button>
      ))}
    </section>
  )
  return (
    <div className="home stack">
      <Heading
        title={"Xin chào, " + session.name.split(" ").slice(-2).join(" ")}
        description={session.unit + " · " + tenants[session.tenant]}
        action={
          <span className="today">
            <CalendarDays size={16} />
            21/11/2026
          </span>
        }
      />
      {!phone && banner}
      {!phone && metricCards}
      {layout.map((section) =>
        section === "tasks" ? (
          <div className="home-columns" key={section}>
            {phone ? (
              <DeadlineQueue tasks={tasks} />
            ) : (
              <section className="panel tasks">
                <div className="section-heading">
                  <h2>
                    Việc cần xử lý <span>{tasks.length}</span>
                  </h2>
                  <ClipboardCheck size={18} />
                </div>
                {tasks.length ? (
                  (allTasks ? tasks : tasks.slice(0, 4)).map((t) => (
                    <button className="task-row" key={t.id} onClick={() => go(t.feature, t.target)}>
                      <span
                        className={"task-symbol " + (t.date && t.date < "2026-11-21" ? "late" : "")}
                      >
                        <FilePenLine size={18} />
                      </span>
                      <span className="task-copy">
                        <b>{t.title}</b>
                        <small>
                          {t.detail}
                          {t.date ? " · " + vietnamDate(t.date) : ""}
                        </small>
                      </span>
                      {t.date && t.date < "2026-11-21" && (
                        <span className="late-label">Quá hạn</span>
                      )}
                      <ChevronRight size={15} />
                    </button>
                  ))
                ) : (
                  <Blank
                    title="Bạn đã xử lý hết công việc"
                    body="Những hồ sơ cần bạn xử lý sẽ xuất hiện tại đây."
                  />
                )}
                {tasks.length > 4 && (
                  <Button variant="ghost" onClick={() => setAllTasks(!allTasks)}>
                    {allTasks ? "Thu gọn" : "Xem thêm " + (tasks.length - 4) + " việc"}
                  </Button>
                )}
              </section>
            )}
            <section className="panel distribution">
              <div className="section-heading">
                <h2>Phân bố đề tài</h2>
                <ChartPie size={18} />
              </div>
              <div className="ratio-bar">
                {groups
                  .filter((g) => g.n)
                  .map((g) => (
                    <span key={g.name} style={{ flex: g.n, background: g.color }} />
                  ))}
              </div>
              <div className="legend">
                {groups.map((g) => (
                  <div key={g.name}>
                    <i style={{ background: g.color }} />
                    {g.name}
                    <b>{g.n}</b>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : section === "projects" ? (
          <section key={section} className="panel">
            <div className="section-heading">
              <h2>{student || session.role === "user" ? "Lối tắt" : "Hồ sơ nghiên cứu"}</h2>
              <Layers size={18} />
            </div>
            {projects.length ? (
              projects.slice(0, 5).map((r) => (
                <button
                  className="project-row"
                  key={r.id}
                  onClick={() => go(featureOf(r, session), r.id)}
                >
                  <span className="project-symbol">
                    <Files size={18} />
                  </span>
                  <span className="task-copy">
                    <b>{r.title}</b>
                    <small>
                      {r.fields.code || "Bản nháp"} · {r.unit}
                    </small>
                  </span>
                  <Status value={r.status} />
                  <ChevronRight size={15} />
                </button>
              ))
            ) : (
              <div className="toolbar pad">
                <Button variant="outline" onClick={() => go("F08")}>
                  <UserRound />
                  Lý lịch của tôi
                </Button>
                {session.role === "user" ? (
                  <Button variant="outline" onClick={() => go("B03", "requests")}>
                    Yêu cầu nâng quyền
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => go("F02")}>
                    <ArrowDownToLine />
                    Các kỳ đề xuất
                  </Button>
                )}
              </div>
            )}
          </section>
        ) : section === "activity" ? (
          <section key={section} className="panel">
            <div className="section-heading">
              <h2>Thông báo gần đây</h2>
              <Button variant="ghost" onClick={() => go("B04")}>
                Xem tất cả <ArrowRight />
              </Button>
            </div>
            {notices.length ? (
              notices.slice(0, 5).map((n) => (
                <button key={n.id} className="project-row" onClick={() => go("B04", n.id)}>
                  <Clock3 size={17} />
                  <span className="task-copy">
                    <b>{n.title}</b>
                    <small>{n.fields.text || "Thông báo trong ứng dụng"}</small>
                  </span>
                  <ChevronRight size={15} />
                </button>
              ))
            ) : (
              <p className="muted pad">Chưa có thông báo mới.</p>
            )}
          </section>
        ) : null,
      )}
      {phone && metricCards}
      {phone && banner}
    </div>
  )
}
