import { useState } from "react"
import { ArrowRight, GitBranch, Plus } from "lucide-react"
import { Button } from "@rms/ui/components/button"
import { FieldGroup, FieldLegend, FieldSet } from "@rms/ui/components/field"
import { demoRecord } from "../../demo/base-seed"
import { statusNames } from "../../demo/catalog"
import { roleNames } from "../../demo/identity"
import type { DemoRow, FeatureProps, Role } from "../../demo/types"
import { Blank, Heading, Status } from "../../demo/ui"
import { defaultEdges, validateGraph } from "../../demo/workflow"
import type { Edge } from "../../demo/workflow"
import { Choice, Editor, ErrorLine, TextField } from "./shared"

const semantics = Object.fromEntries([...new Set(defaultEdges.flatMap(edge => [edge.from, edge.to]))]
  .map(code => [code, statusNames[code] ?? code]))
const readEdges = (row: DemoRow): Edge[] => JSON.parse(row.fields.edges)
const readLabels = (row: DemoRow): Record<string, string> => JSON.parse(row.fields.stepLabels || "{}")
const stepName = (code: string, labels: Record<string, string>) => labels[code]?.trim() || semantics[code] || "Chưa chọn bước"

type Draft = { row: DemoRow; commit: FeatureProps["commit"] }
function DraftEditor({ draft, close, done }: { draft: Draft; close: () => void; done: (id: string) => void }) {
  const { row, commit } = draft
  const [title, setTitle] = useState(row.title)
  const [edges, setEdges] = useState(() => readEdges(row))
  const [labels, setLabels] = useState(() => readLabels(row))
  const [step, setStep] = useState("DRAFT")
  const [index, setIndex] = useState(() => Math.max(0, edges.findIndex(e => !e.from || !e.to || !e.roles.length)))
  const [error, setError] = useState("")
  const edge = edges[index]
  const options = Object.fromEntries(Object.keys(semantics).map(code => [code, stepName(code, labels)]))
  function update(patch: Partial<Edge>) {
    setEdges(edges.map((e, i) => i === index ? { ...e, ...patch } : e))
  }
  function save() {
    try {
      if (!title.trim()) throw Error("Nhập tên phiên bản.")
      const saved = { ...row, title: title.trim(), fields: { ...row.fields, edges: JSON.stringify(edges), stepLabels: JSON.stringify(labels) } }
      commit("Lưu phiên bản quy trình " + row.fields.version, [saved])
      done(row.id)
    } catch (ex) { setError((ex as Error).message) }
  }
  return <Editor title={"Chỉnh sửa bản nháp " + row.fields.version} hint="Có thể lưu các bước đang soạn và quay lại trước khi kích hoạt." close={close}>
    <form className="stack" onSubmit={e => { e.preventDefault(); save() }}>
      <TextField label="Tên phiên bản" value={title} change={setTitle} required />
      <FieldSet>
        <FieldLegend>Tên hiển thị của bước</FieldLegend>
        <div className="grid-two">
          <Choice label="Bước cần đổi tên" options={semantics} value={step} change={setStep} />
          <TextField label="Tên bước hiển thị" value={labels[step] ?? semantics[step]} change={value => setLabels({ ...labels, [step]: value })} />
        </div>
        <small>Trạng thái chuẩn · {step}</small>
      </FieldSet>
      <FieldSet>
        <FieldLegend>Chuyển bước</FieldLegend>
        {edge && <>
          <Choice label="Chuyển bước cần sửa" value={String(index)} change={v => setIndex(Number(v))}
            options={Object.fromEntries(edges.map((e, i) => [i, (i + 1) + ". " + stepName(e.from, labels) + " → " + stepName(e.to, labels)]))} />
          <div className="grid-two">
            <Choice label="Từ bước" options={{ "": "Chọn bước", ...options }} value={edge.from} change={from => update({ from })} />
            <Choice label="Chuyển tới" options={{ "": "Chọn đích", ...options }} value={edge.to} change={to => update({ to })} />
          </div>
          <FieldSet>
            <FieldLegend>Vai trò được chuyển bước</FieldLegend>
            <FieldGroup className="grid-two">{Object.entries(roleNames).map(([key, label]) => {
              const role = key as Role
              return <label className="check" key={role}><input type="checkbox" checked={edge.roles.includes(role)}
                onChange={e => update({ roles: e.target.checked ? [...edge.roles, role] : edge.roles.filter(r => r !== role) })} />{label}</label>
            })}</FieldGroup>
          </FieldSet>
          <label className="check"><input type="checkbox" checked={!!edge.reason} onChange={e => update({ reason: e.target.checked })} />Bắt buộc nhập lý do</label>
        </>}
        <div className="toolbar">
          <Button type="button" variant="outline" onClick={() => {
            setEdges([...edges, { from: "", to: "", roles: [] }]); setIndex(edges.length)
          }}><Plus data-icon="inline-start" />Thêm chuyển bước</Button>
          {edge && <Button type="button" variant="ghost" onClick={() => {
            setEdges(edges.filter((_, i) => i !== index)); setIndex(Math.max(0, index - 1))
          }}>Bỏ chuyển bước</Button>}
        </div>
      </FieldSet>
      <ErrorLine message={error} />
      <div><Button type="submit">Lưu bản nháp</Button></div>
    </form>
  </Editor>
}

export default function Workflow(p: FeatureProps) {
  const versions = p.rows.filter(r => r.kind === "workflow")
  const active = versions.find(r => r.status === "ACTIVE")
  const selected = p.route.id ? versions.find(r => r.id === p.route.id) : active
  const [draft, setDraft] = useState<Draft>()
  const [error, setError] = useState("")
  if (p.session.role !== "admin") return <Blank title="Cần quyền quản trị quy trình" />
  if (!selected) return <Blank title="Không tìm thấy phiên bản quy trình" />
  const edges = readEdges(selected)
  const labels = readLabels(selected)
  function create(source: DemoRow) {
    const num = 1 + Math.max(0, ...versions.map(r => Number(/^v(\d+)$/.exec(r.fields.version)?.[1] ?? 0)))
    const version = "v" + num
    setDraft({ row: demoRecord("wf-" + version, "workflow", "Quy trình cơ sở " + num, { ...source.fields, version }, "DRAFT"), commit: p.commit })
    setError("")
  }
  function activate(row: DemoRow) {
    try {
      validateGraph(readEdges(row))
      const previous = active ? [{ ...active, status: "ARCHIVED" }] : []
      p.commit("Kích hoạt quy trình " + row.fields.version, [...previous, { ...row, status: "ACTIVE" }], row)
      setError("")
    } catch (ex) { setError((ex as Error).message) }
  }
  return <div className="stack">
    <Heading title="Quy trình đề tài" description="Hồ sơ đang xử lý tiếp tục dùng phiên bản được ghim lúc tạo."
      action={<Button onClick={() => create(selected)}><Plus data-icon="inline-start" />Tạo phiên bản</Button>} />
    <div className="grid-two workflow-panels">
      <section className="panel"><div className="section-heading"><h2>Phiên bản</h2></div>
        {versions.map(r => <button className="project-row" key={r.id} aria-current={r.id === selected.id ? "true" : undefined} onClick={() => p.go("P01", r.id)}>
          <GitBranch size={17} /><span className="task-copy"><b>{r.title}</b><small>{r.fields.version}</small></span><Status value={r.status} />
        </button>)}
      </section>
      <section className="panel pad stack"><h2>{selected.title}</h2>
        {selected.status === "DRAFT" && <div className="toolbar">
          <Button variant="outline" onClick={() => { setError(""); setDraft({ row: selected, commit: p.commit }) }}>Chỉnh sửa bản nháp</Button>
          <Button onClick={() => activate(selected)}>Kích hoạt phiên bản</Button>
        </div>}
        <ErrorLine message={error} />
        {edges.map((e, i) => <div key={i} className="workflow-edge">
          <span>{stepName(e.from, labels)}</span><ArrowRight size={14} aria-label="chuyển tới" /><span>{stepName(e.to, labels)}</span>
          <small>{e.roles.map(r => roleNames[r]).join(", ") || "Chưa chọn vai trò"}{e.reason && " · Bắt buộc nhập lý do"}</small>
        </div>)}
        {!edges.length && <p>Chưa có chuyển bước.</p>}
      </section>
    </div>
    {draft && <DraftEditor draft={draft} close={() => setDraft(undefined)} done={id => { setDraft(undefined); setError(""); p.go("P01", id) }} />}
  </div>
}
