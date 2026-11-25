import { routeUrl } from "../../demo/catalog"
import { schoolUnits } from "../../demo/datasets"
import { ValidatedForm } from "@rms/ui/components/validated-form"
import { Disclosure } from "@rms/ui/components/disclosure"
import { ChoiceOption, ChoiceSelect } from "@rms/ui/components/choice-select"
import { useState } from "react"
import { ChevronRight, Plus, ShieldCheck, UserRound } from "lucide-react"
import { Button } from "@rms/ui/components/button"
import { Input } from "@rms/ui/components/input"
import { FieldGroup } from "@rms/ui/components/field"
import { Back, Blank, Heading, Status } from "../../demo/ui"
import { accountId, initials, typeNames } from "../../demo/identity"
import { demoRecord } from "../../demo/base-seed"
import type { DemoRow, FeatureProps } from "../../demo/types"
import { Choice, DetailFields, Editor, ErrorLine, TextField } from "./shared"
const permissions: Record<string, string[]> = {
  user: ["meetings.view"],
  author: ["research.projects", "research.proposals", "meetings.view"],
  staff: [
    "research.proposals",
    "research.reviews",
    "research.evaluations",
    "councils.view",
    "councils.manage",
    "meetings.view",
    "meetings.manage",
    "reports.view",
    "reports.export",
    "users.manage",
    "notifications.send",
  ],
}
permissions.admin = [
  ...new Set([
    ...permissions.author,
    ...permissions.staff,
    "meetings.report",
    "meetings.settings",
    "certificates.view",
    "certificates.manage",
    "catalog.manage",
  ]),
]
export default function Accounts(p: FeatureProps) {
  const [edit, setEdit] = useState(""),
    [q, setQ] = useState(""),
    [filter, setFilter] = useState("all"),
    [reason, setReason] = useState(""),
    [error, setError] = useState("")
  const admin = p.session.role === "admin",
    accounts = p.rows.filter((r) => r.kind === "account"),
    own = accounts.find((r) => r.id === accountId(p.session.userId))!
  const tab = p.route.id,
    reqs = p.rows.filter((r) => r.kind === "upgrade" && (admin || r.owner === p.session.userId))
  const selected = admin
    ? accounts.find((r) => r.id === tab)
    : !tab || tab === own.id
      ? own
      : undefined
  const filtered = accounts.filter(
    (r) =>
      (filter === "all" || r.status === filter) &&
      (r.title + " " + r.fields.email).toLowerCase().includes(q.toLowerCase()),
  )
  const request = reqs.find((r) => r.id === edit)
  function close() {
    setEdit("")
    setError("")
    setReason("")
  }
  return (
    <div className="stack">
      <Heading
        title={admin ? "Tài khoản & quyền" : "Tài khoản của tôi"}
        description="Vai trò, trạng thái truy cập và yêu cầu nâng quyền."
        action={
          admin && (
            <Button onClick={() => setEdit("new")}>
              <Plus />
              Tạo tài khoản
            </Button>
          )
        }
      />
      <div className="tabs-bar">
        {[
          [undefined, admin ? "Người dùng" : "Thông tin"],
          ["requests", "Yêu cầu nâng quyền"],
          ["roles", "Quyền theo vai trò"],
        ].map(([id, label]) => (
          <Button
            key={label}
            variant={tab === id ? "secondary" : "ghost"}
            asChild
          ><a href={routeUrl("B03", id)}>
            {label}
          </a></Button>
        ))}
      </div>
      {tab === "roles" ? (
        <section className="panel pad">
          <h2>Quyền mặc định</h2>
          {Object.entries(permissions)
            .filter(([k]) => admin || k === own.fields.userType)
            .map(([k, v]) => (
              <Disclosure key={k} className="disclose" title={<> {typeNames[k]} · {v.length} quyền </>}>
                <p>{v.join(" · ")}</p>
              </Disclosure>
            ))}
        </section>
      ) : tab === "requests" ? (
        <section className="panel">
          <div className="section-heading">
            <h2>Yêu cầu nâng quyền tác giả</h2>
            {!admin &&
              own.fields.userType === "user" &&
              !reqs.some((r) => r.status === "PENDING") && (
                <Button onClick={() => setEdit("apply")}>Gửi yêu cầu</Button>
              )}
          </div>
          {reqs.length ? (
            reqs.map((r) => (
              <Button variant="ghost" size="content" className="project-row" key={r.id} onClick={() => setEdit(r.id)}>
                <UserRound />
                <span className="task-copy">
                  <b>{r.title}</b>
                  <small>{r.unit}</small>
                </span>
                <Status value={r.status} />
              </Button>
            ))
          ) : (
            <Blank title="Chưa có yêu cầu nâng quyền" />
          )}
        </section>
      ) : selected ? (
        <section className="panel pad stack">
          {admin && <Back href={routeUrl("B03")} />}
          <div className="profile-head">
            <span className="avatar">{initials(selected.title)}</span>
            <h2>{selected.title}</h2>
            <Status value={selected.status} />
          </div>
          <DetailFields
            values={[
              ["Email", selected.fields.email],
              ["Đơn vị", selected.unit],
              ["Vai trò", typeNames[selected.fields.userType]],
              [
                "Nguồn tài khoản",
                selected.fields.source === "AUTO" ? "Đồng bộ lần đầu" : "Quản trị tạo",
              ],
            ]}
          />
          {admin && (
            <div className="toolbar">
              <Button onClick={() => setEdit(selected.id)}>Chỉnh sửa</Button>
              <Button
                variant="outline"
                disabled={selected.owner === p.session.userId}
                onClick={() => setEdit("lock")}
              >
                {selected.status === "ACTIVE" ? "Khóa tài khoản" : "Kích hoạt lại"}
              </Button>
              {selected.owner !== p.session.userId && selected.status !== "DISABLED" && (
                <Button variant="outline" onClick={() => setEdit("disable")}>
                  Ngừng hoạt động
                </Button>
              )}
              {p.rows.some((r) => r.kind === "profile" && r.owner === selected.owner) && (
                <Button variant="outline" asChild><a href={routeUrl("F08", selected.owner)}>
                  Mở lý lịch khoa học
                </a></Button>
              )}
              <Button variant="ghost" asChild><a href={routeUrl("P02", selected.id)}>
                Nhật ký
              </a></Button>
            </div>
          )}
        </section>
      ) : tab ? (
        <Blank title="Không có quyền xem tài khoản này" />
      ) : (
        <section className="panel">
          <div className="toolbar pad">
            <Input
              aria-label="Tìm người dùng"
              placeholder="Tìm tên hoặc email…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <ChoiceSelect
              aria-label="Trạng thái tài khoản"
              value={filter}
              onValueChange={setFilter}
            >
              <ChoiceOption value="all">Mọi trạng thái</ChoiceOption>
              <ChoiceOption value="ACTIVE">Đang hoạt động</ChoiceOption>
              <ChoiceOption value="LOCKED">Đã khóa</ChoiceOption>
              <ChoiceOption value="DISABLED">Ngừng hoạt động</ChoiceOption>
            </ChoiceSelect>
          </div>
          {filtered.map((r) => (
            <Button variant="ghost" size="content" key={r.id} className="project-row" asChild><a href={routeUrl("B03", r.id)}>
              <span className="avatar small">{initials(r.title)}</span>
              <span className="task-copy">
                <b>{r.title}</b>
                <small>
                  {typeNames[r.fields.userType]} · {r.fields.email}
                </small>
              </span>
              <Status value={r.status} />
              <ChevronRight size={15} />
            </a></Button>
          ))}
          {!filtered.length && <Blank title="Không tìm thấy người dùng" />}
        </section>
      )}
      {(edit === "new" || edit === selected?.id) && edit !== "" && (
        <AccountForm p={p} initial={edit === "new" ? undefined : selected} close={close} />
      )}
      {["lock", "disable"].includes(edit) && selected && (
        <Editor
          title="Xác nhận đổi trạng thái"
          hint={selected.title + " · " + selected.fields.email}
          close={close}
        >
          <p>
            {selected.status === "ACTIVE" || edit === "disable"
              ? "Người dùng sẽ mất quyền truy cập ở lần đọc hoặc ghi tiếp theo."
              : "Người dùng có thể truy cập lại bằng vai trò hiện tại."}
          </p>
          <ErrorLine message={error} />
          <Button
            onClick={() => {
              try {
                const status =
                  edit === "disable"
                    ? "DISABLED"
                    : selected.status === "ACTIVE"
                      ? "LOCKED"
                      : "ACTIVE"
                if (
                  status !== "ACTIVE" &&
                  selected.fields.userType === "admin" &&
                  accounts.filter((a) => a.status === "ACTIVE" && a.fields.userType === "admin")
                    .length < 2
                )
                  throw Error("Cần tối thiểu một quản trị viên đang hoạt động.")
                p.commit(
                  status === "LOCKED"
                    ? "Khóa tài khoản"
                    : status === "DISABLED"
                      ? "Ngừng hoạt động"
                      : "Kích hoạt tài khoản",
                  [{ ...selected, status }],
                )
                close()
              } catch (e) {
                setError((e as Error).message)
              }
            }}
          >
            Xác nhận
          </Button>
        </Editor>
      )}
      {edit === "apply" && <UpgradeForm p={p} close={close} />}
      {request && (
        <Editor title="Hồ sơ xin nâng quyền" hint={request.title} close={close}>
          <DetailFields
            values={[
              ["Chuyên ngành", request.fields.specialty],
              ["Học hàm, học vị", request.fields.degree],
              ["Hướng nghiên cứu", request.fields.direction],
              ["Minh chứng", request.fields.evidence],
              ["Ý kiến xét duyệt", request.fields.note],
            ]}
          />
          {admin && request.status === "PENDING" && (
            <>
              <TextField label="Nhận xét" value={reason} change={setReason} />
              <ErrorLine message={error} />
              <div className="toolbar">
                {["APPROVED", "REJECTED"].map((status) => (
                  <Button
                    key={status}
                    variant={status === "APPROVED" ? "default" : "outline"}
                    onClick={() => {
                      if (status === "REJECTED" && !reason.trim()) {
                        setError("Nhập lý do từ chối.")
                        return
                      }
                      const user = accounts.find((a) => a.owner === request.owner)
                      if (!user) {
                        setError("Không tìm thấy tài khoản.")
                        return
                      }
                      p.commit(
                        "Xét yêu cầu nâng quyền",
                        [
                          { ...request, status, fields: { ...request.fields, note: reason } },
                          ...(status === "APPROVED"
                            ? [{ ...user, fields: { ...user.fields, userType: "author" } }]
                            : []),
                        ],
                        request,
                      )
                      close()
                    }}
                  >
                    {status === "APPROVED" ? "Phê duyệt" : "Từ chối"}
                  </Button>
                ))}
              </div>
            </>
          )}
        </Editor>
      )}
    </div>
  )
}
function AccountForm({
  p,
  initial,
  close,
}: {
  p: FeatureProps
  initial?: DemoRow
  close: () => void
}) {
  const [name, setName] = useState(initial?.title ?? ""),
    [email, setEmail] = useState(initial?.fields.email ?? ""),
    [unit, setUnit] = useState(initial?.unit ?? schoolUnits(p.session.tenant, p.rows)[0]),
    [type, setType] = useState(initial?.fields.userType ?? "user"),
    [scope, setScope] = useState(initial?.fields.scopeUnit ?? ""),
    [error, setError] = useState("")
  return (
    <Editor
      title={initial ? "Chỉnh sửa tài khoản" : "Tạo tài khoản"}
      hint="Dùng danh tính giả lập cho phiên trình diễn."
      close={close}
    >
      <ValidatedForm
        className="stack"
        onSubmit={(e) => {
          e.preventDefault()
          if (!name.trim() || !unit.trim()) return setError("Nhập họ tên và đơn vị.")
          if (
            p.rows.some(
              (r) =>
                r.kind === "account" &&
                r.id !== initial?.id &&
                r.fields.email.toLowerCase() === email.trim().toLowerCase(),
            )
          )
            return setError("Email đã được sử dụng trong đơn vị.")
          const id = initial?.owner ?? crypto.randomUUID()
          const row = demoRecord(
            accountId(id),
            "account",
            name.trim(),
            {
              ...initial?.fields,
              email: email.trim(),
              userType: type,
              source: initial?.fields.source ?? "ADMIN",
              scopeUnit: scope,
            },
            initial?.status ?? "ACTIVE",
            id,
            unit.trim(),
          )
          try {
            p.commit(initial ? "Cập nhật tài khoản" : "Tạo tài khoản", [row])
            p.go("B03", row.id)
            close()
          } catch (e) {
            setError((e as Error).message)
          }
        }}
      >
        <FieldGroup>
          <TextField label="Họ và tên" value={name} change={setName} required />
          <TextField
            label="Email"
            value={email}
            change={setEmail}
            type="email"
            required
            disabled={!!initial}
          />
          <TextField label="Đơn vị công tác" value={unit} change={setUnit} required />
          <Choice
            label="Vai trò"
            value={type}
            change={setType}
            options={typeNames}
            disabled={initial?.owner === p.session.userId}
          />
          {type === "staff" && (
            <Choice
              label="Phạm vi phụ trách"
              value={scope}
              change={setScope}
              options={{
                "": "Toàn trường",
                ...Object.fromEntries(schoolUnits(p.session.tenant, p.rows).map(unit => [unit, unit])),
              }}
            />
          )}
        </FieldGroup>
        <ErrorLine message={error} />
        <Button type="submit">Lưu tài khoản</Button>
      </ValidatedForm>
    </Editor>
  )
}
function UpgradeForm({ p, close }: { p: FeatureProps; close: () => void }) {
  const [specialty, setSpecialty] = useState(""),
    [degree, setDegree] = useState(""),
    [direction, setDirection] = useState(""),
    [evidence, setEvidence] = useState("")
  return (
    <Editor
      title="Xin nâng quyền tác giả"
      hint="Quản trị đơn vị sẽ xem xét hồ sơ học thuật của bạn."
      close={close}
    >
      <ValidatedForm
        className="stack"
        onSubmit={(e) => {
          e.preventDefault()
          const row = demoRecord(
            "upgrade-" + crypto.randomUUID(),
            "upgrade",
            p.session.name,
            { specialty, degree, direction, evidence },
            "PENDING",
            p.session.userId,
            p.session.unit,
          )
          p.commit("Gửi yêu cầu nâng quyền", [row])
          close()
        }}
      >
        <FieldGroup>
          <TextField label="Học hàm, học vị" value={degree} change={setDegree} required />
          <TextField label="Chuyên ngành" value={specialty} change={setSpecialty} required />
          <TextField label="Hướng nghiên cứu" value={direction} change={setDirection} required />
          <label className="form-label">
            Minh chứng (chỉ lưu tên tệp)
            <Input type="file" onChange={(e) => setEvidence(e.target.files?.[0]?.name ?? "")} />
          </label>
        </FieldGroup>
        <Button type="submit">
          <ShieldCheck />
          Gửi yêu cầu
        </Button>
      </ValidatedForm>
    </Editor>
  )
}
