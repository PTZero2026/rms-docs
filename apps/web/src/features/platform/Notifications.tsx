import { useEffect, useEffectEvent, useState } from "react"
import { FilterPair } from "../mobile/FilterPair"
import { usePhoneLayout } from "../mobile/usePhoneLayout"
import { Bell, CheckCheck, ChevronRight, Mail } from "lucide-react"
import { Button } from "@rms/ui/components/button"
import { Heading, Blank, Status, Back } from "../../demo/ui"
import { demoRecord, configValue } from "../../demo/base-seed"
import { eventCatalog, channels, inbox } from "../../demo/notifications"
import { vietnamDate } from "../../demo/catalog"
import { unitAllowed } from "../../demo/identity"
import { rowVisible } from "../../demo/views"
import type { FeatureProps } from "../../demo/types"
import { Choice, Editor, TextField } from "./shared"
export default function Notifications(p: FeatureProps) {
  const { rows, session, route, go, commit } = p,
    admin = session.role === "admin",
    operator = admin || session.role === "officer"
  const phone = usePhoneLayout()
  const fromUnread = route.id === "unread" || !!route.id?.startsWith("unread~")
  const inboxPage = !route.id || route.id === "unread"
  const showUnread = (active: boolean) => go("B04", active ? "unread" : undefined)
  const [editing, setEditing] = useState(""),
    [draft, setDraft] = useState(""),
    [event, setEvent] = useState("PROPOSAL_CALL_OPENED")
  const list = inbox(rows, session.userId),
    unread = list.filter((r) => r.status === "UNREAD"),
    shown = fromUnread ? unread : list
  const selectedId = route.id?.replace(/^unread~/, "")
  const selected = list.find((r) => r.id === selectedId)
  const markRead = useEffectEvent(() => {
    if (selected?.status !== "UNREAD") return
    try {
      commit("Đánh dấu đã đọc", [{ ...selected, status: "READ" }])
    } catch {
      // Workspace displays the storage or changed-session error with a retry action below.
    }
  })
  useEffect(() => {
    markRead()
  }, [selectedId, selected?.status])
  const preferences = route.id === "preferences",
    delivery = route.id === "delivery" && operator,
    policy = route.id === "policy" && admin
  const config = rows.find((r) => r.kind === "channel-policy" && r.fields.event === event),
    template = rows.find((r) => r.kind === "message-template" && r.fields.event === event)
  const opts = Object.fromEntries(Object.entries(eventCatalog).map(([k, e]) => [k, e.title]))
  function updatePref(key: string, channel: "email" | "sms", flag: boolean) {
    const row =
      rows.find(
        (r) => r.kind === "preferences" && r.owner === session.userId && r.fields.event === key,
      ) ??
      demoRecord(
        "pref-" + session.userId + "-" + key,
        "preferences",
        opts[key],
        { event: key },
        "ACTIVE",
        session.userId,
        session.unit,
      )
    commit("Lưu tùy chọn nhận thông báo", [
      { ...row, fields: { ...row.fields, [channel]: String(flag) } },
    ])
  }
  return (
    <div className="stack inbox-page">
      <Heading title="Thông báo" description="Cập nhật và nhắc hạn từ các hồ sơ nghiên cứu." />
      <div className="tabs-bar">
        {[
          [undefined, "Hộp thư"],
          ["preferences", "Tùy chọn nhận"],
          ...(operator ? [["delivery", "Nhật ký gửi"]] : []),
          ...(admin ? [["policy", "Kênh và mẫu gửi"]] : []),
        ].map(([id, label]) => (
          <Button
            key={label}
            variant={route.id === id || (!id && inboxPage) ? "secondary" : "ghost"}
            onClick={() => go("B04", id)}
          >
            {label}
          </Button>
        ))}
      </div>
      {preferences ? (
        <section className="panel">
          <div className="section-heading">
            <h2>Kênh nhận theo sự kiện</h2>
          </div>
          {Object.entries(eventCatalog).map(([key, item]) => {
            const ch = channels(rows, key, session.userId),
              policy = rows.find((r) => r.kind === "channel-policy" && r.fields.event === key)
            return (
              <div className="pref-row" key={key}>
                <div>
                  <b>{item.title}</b>
                  <small>{item.required ? "Thông báo bắt buộc" : "Luôn nhận trong ứng dụng"}</small>
                </div>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={!!ch.email}
                    disabled={!!item.required || policy?.fields.email === "false"}
                    onChange={(e) => updatePref(key, "email", e.target.checked)}
                  />
                  Email
                </label>
                {item.important && (
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={ch.sms}
                      disabled={policy?.fields.sms !== "true"}
                      onChange={(e) => updatePref(key, "sms", e.target.checked)}
                    />
                    SMS
                  </label>
                )}
              </div>
            )
          })}
        </section>
      ) : policy ? (
        <section className="panel pad stack">
          <h2>Ma trận sự kiện và mẫu thông báo</h2>
          <Choice label="Sự kiện" value={event} change={setEvent} options={opts} />
          {["email", "sms"].map((channel) => (
            <label className="check" key={channel}>
              <input
                type="checkbox"
                checked={
                  channel === "email"
                    ? config?.fields.email !== "false"
                    : config?.fields.sms === "true"
                }
                disabled={channel === "sms" && !eventCatalog[event].important}
                onChange={(e) => {
                  const r =
                    config ??
                    demoRecord("channels-" + event, "channel-policy", opts[event], { event })
                  commit("Cập nhật kênh gửi", [
                    { ...r, fields: { ...r.fields, [channel]: String(e.target.checked) } },
                  ])
                }}
              />
              {channel.toUpperCase()}
            </label>
          ))}
          <p>Mẫu đang dùng: {template?.fields.value ?? opts[event]}</p>
          <Button
            variant="outline"
            onClick={() => {
              setDraft(template?.fields.value ?? opts[event])
              setEditing("template")
            }}
          >
            Sửa mẫu thông báo
          </Button>
          <p>Nhắc trước hạn {configValue(rows, "NOTICE.DAYS") ?? "7"} ngày.</p>
          <Button variant="ghost" onClick={() => go("B01")}>
            Mở cấu hình nhắc hạn
          </Button>
        </section>
      ) : delivery ? (
        <section className="panel">
          <div className="section-heading">
            <h2>Nhật ký gửi giả lập</h2>
          </div>
          {rows
            .filter((r) => r.kind === "delivery" && (admin || unitAllowed(r, session, rows)))
            .slice()
            .reverse()
            .map((r) => (
              <div className="project-row" key={r.id}>
                <Mail size={17} />
                <span className="task-copy">
                  <b>{r.title}</b>
                  <small>
                    {r.fields.channel} · {r.fields.recipient} · {r.fields.attempts} lần gửi
                  </small>
                </span>
                <Status value={r.status} />
                {r.status === "ERROR" && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      commit("Gửi lại thông báo", [
                        {
                          ...r,
                          status: "SENT",
                          fields: {
                            ...r.fields,
                            attempts: String(Number(r.fields.attempts) + 1),
                            detail: "Gửi thành công trong phiên mô phỏng.",
                          },
                        },
                      ])
                    }
                  >
                    Gửi lại
                  </Button>
                )}
              </div>
            ))}
        </section>
      ) : selected ? (
        <section className="panel pad stack">
          <Back onClick={() => showUnread(fromUnread)} />
          <h2>{selected.title}</h2>
          <p>{selected.fields.text ?? selected.fields.message}</p>
          <div className="toolbar">
            {selected.status === "UNREAD" && (
              <Button
                variant="outline"
                onClick={() => commit("Đánh dấu đã đọc", [{ ...selected, status: "READ" }])}
              >
                Đánh dấu đã đọc
              </Button>
            )}
            {selected.fields.feature && (
              <Button
                onClick={() => {
                  if (selected.status === "UNREAD")
                    commit("Đánh dấu đã đọc", [{ ...selected, status: "READ" }])
                  const target = rows.find((r) => r.id === selected.fields.targetId)
                  go(
                    selected.fields.feature,
                    target && rowVisible(target, session, rows) ? target.id : "unavailable",
                  )
                }}
              >
                Mở hồ sơ <ChevronRight />
              </Button>
            )}
          </div>
        </section>
      ) : !inboxPage ? (
        <Blank title="Không tìm thấy thông báo trong phạm vi của bạn" />
      ) : (
        <section className="panel">
          <div className="section-heading">
            <h2>
              Hộp thư <span>{unread.length} chưa đọc</span>
            </h2>
            <Button
              size="sm"
              variant="outline"
              disabled={!unread.length}
              onClick={() =>
                commit(
                  "Đánh dấu tất cả đã đọc",
                  unread.map((r) => ({ ...r, status: "READ" })),
                )
              }
            >
              <CheckCheck />
              Đọc tất cả
            </Button>
          </div>
          <div className="toolbar pad">
            {phone ? (
              <FilterPair
                label="Lọc hộp thư"
                options={["Tất cả", "Chưa đọc"]}
                secondActive={fromUnread}
                onChange={showUnread}
              />
            ) : (
              <Choice
                label="Hiển thị"
                value={fromUnread ? "unread" : "all"}
                change={(value) => showUnread(value === "unread")}
                options={{ all: "Tất cả", unread: "Chưa đọc" }}
              />
            )}
          </div>
          {shown.length ? (
            shown.map((r) => (
              <button
                className="project-row"
                key={r.id}
                onClick={() => go("B04", fromUnread ? "unread~" + r.id : r.id)}
              >
                <Bell size={17} />
                <span className="task-copy">
                  <b>{r.title}</b>
                  <small>{r.fields.at ? vietnamDate(r.fields.at, true) : r.fields.text}</small>
                </span>
                <Status value={r.status} />
              </button>
            ))
          ) : (
            <Blank title="Không có thông báo trong mục này" />
          )}
        </section>
      )}
      {editing && (
        <Editor
          title="Sửa mẫu thông báo"
          hint="Chèn {ho_so} để hiển thị tên hồ sơ nguồn."
          close={() => setEditing("")}
        >
          <TextField label="Nội dung" value={draft} change={setDraft} multiline />
          <p>Xem trước · {draft.replaceAll("{ho_so}", "Đề tài quan trắc thủy văn")}</p>
          <Button
            disabled={!draft.trim()}
            onClick={() => {
              commit("Lưu mẫu thông báo", [
                demoRecord("template-" + event, "message-template", opts[event], {
                  event,
                  value: draft.trim(),
                }),
              ])
              setEditing("")
            }}
          >
            Lưu mẫu
          </Button>
        </Editor>
      )}
    </div>
  )
}
