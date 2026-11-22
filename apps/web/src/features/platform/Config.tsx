import { useEffect, useState } from "react"
import { Download, FileSliders, Plus, Settings2 } from "lucide-react"
import { Button } from "@rms/ui/components/button"
import { Input } from "@rms/ui/components/input"
import { Back, Blank, Heading } from "../../demo/ui"
import { demoRecord } from "../../demo/base-seed"
import { roleNames, tenants } from "../../demo/identity"
import type { DemoRow, FeatureProps, Role } from "../../demo/types"
import { Choice, DetailFields, Editor, ErrorLine } from "./shared"
import { contentType, widgets } from "./configContent"
import { readContent, storageMessage, writeConfig } from "./configBlobs"
import ConfigForm, { PngPreview } from "./ConfigForm"

function effectiveRow(rows: DemoRow[], key: string) {
  const candidates = rows.filter(r => r.kind === "config" && r.fields.key === key && r.fields.active !== "false")
  return candidates.find(r => r.fields.scope === "tenant") ?? candidates.find(r => r.fields.scope === "shared")
}

function ConfigDetail({ row, effective }: { row: DemoRow; effective?: DemoRow }) {
  const [error, setError] = useState("")
  const [image, setImage] = useState<Blob>()
  useEffect(() => {
    let current = true
    if (row.fields.mime === "image/png") {
      readContent(row).then(blob => { if (current) setImage(blob) })
        .catch(ex => { if (current) setError(storageMessage(ex)) })
    }
    return () => { current = false }
  }, [row])
  const f = row.fields
  async function download() {
    try {
      const blob = await readContent(row)
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = f.filename || f.key + (f.mime === "application/json" ? ".json" : ".txt")
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      setError("")
    } catch (ex) { setError(storageMessage(ex)) }
  }
  return <>
    <DetailFields values={[
      ["Khóa", f.key], ["Phạm vi", f.scope === "shared" ? "Dùng chung" : "Đơn vị"],
      ["Content-Type", contentType(f.mime, f.encoding)], ["Kích thước", (Number(f.size ?? new Blob([f.value]).size)).toLocaleString("vi-VN") + " byte"],
      ["Nội dung bản này", f.value || f.filename], ["Giá trị đang áp dụng", effective?.fields.value || effective?.fields.filename || "Chưa có"],
    ]} />
    {image && <PngPreview blob={image} />}
    <div><Button variant="outline" onClick={() => void download()}><Download data-icon="inline-start" />Tải nội dung</Button></div>
    <ErrorLine message={error} />
  </>
}

type DeleteTarget = { row: DemoRow; commit: FeatureProps["commit"] }
export default function Config(p: FeatureProps) {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("all")
  const [editor, setEditor] = useState<{ initial?: DemoRow; catalogEntry?: DemoRow }>()
  const [deletion, setDeletion] = useState<DeleteTarget>()
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")
  const platform = p.rows.some(r => r.kind === "account" && r.owner === p.session.userId && r.fields.platform === "true")
  const all = p.rows.filter(r => r.kind === "config" && (!platform || r.fields.scope === "shared"))
  const target = all.find(r => r.id === p.route.id)
  const list = all.filter(r => (filter === "all" || r.fields.scope === filter) &&
    [r.title, r.fields.key, r.fields.group].join(" ").toLowerCase().includes(query.trim().toLowerCase()))
  const tenantOverride = target && all.find(r => r.fields.scope === "tenant" && r.fields.key === target.fields.key)
  const catalogEntries = p.rows.filter(r => r.kind === "intake-reference")
  const home = p.route.id === "home"
  if (p.session.role !== "admin") return <Blank title="Bạn chưa có quyền cấu hình" />

  async function confirmDelete() {
    if (!deletion) return
    setDeleting(true)
    try {
      await writeConfig({
        commit: deletion.commit, action: "Xóa cấu hình", row: { ...deletion.row, status: "DELETED" },
        prior: deletion.row, tenant: p.session.tenant,
      })
      setDeletion(undefined)
      p.go("B01")
    } catch (ex) { setError(storageMessage(ex)) }
    finally { setDeleting(false) }
  }

  return <div className="stack">
    <Heading title="Cấu hình đơn vị" description={platform ? "Cấu hình dùng chung cho các đơn vị" : tenants[p.session.tenant]}
      action={<Button onClick={() => setEditor({})}><Plus data-icon="inline-start" />Tạo cấu hình</Button>} />
    <div className="tabs-bar">
      <Button variant={home ? "ghost" : "secondary"} onClick={() => p.go("B01")}>Danh mục cấu hình</Button>
      <Button variant={home ? "secondary" : "ghost"} onClick={() => p.go("B01", "home")}>Bố cục trang chủ</Button>
    </div>
    {home ? <HomeLayout p={p} platform={platform} /> : target ? <section className="panel pad stack">
      <Back onClick={() => p.go("B01")} /><h2>{target.title}</h2>
      <ConfigDetail key={JSON.stringify(target.fields)} row={target} effective={effectiveRow(all, target.fields.key)} />
      <div className="toolbar">
        {target.fields.scope === "shared" && !platform && tenantOverride
          ? <Button onClick={() => p.go("B01", tenantOverride.id)}>Mở bản riêng của đơn vị</Button>
          : <Button onClick={() => setEditor({ initial: target })}>{target.fields.scope === "shared" && !platform ? "Ghi đè cho đơn vị" : "Chỉnh sửa"}</Button>}
        {(platform || target.fields.scope === "tenant") && <Button variant="outline" onClick={() => {
          setError(""); setDeletion({ row: target, commit: p.commit })
        }}>Xóa cấu hình</Button>}
      </div>
    </section> : p.route.id ? <Blank title="Không tìm thấy cấu hình" /> : <section className="panel">
      <div className="section-heading"><h2>Danh mục cấu hình</h2><FileSliders size={18} /></div>
      <div className="toolbar pad">
        <Input aria-label="Tìm cấu hình" placeholder="Tìm theo tên, khóa hoặc nhóm…" value={query} onChange={e => setQuery(e.target.value)} />
        {!platform && <select aria-label="Phạm vi" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">Mọi phạm vi</option><option value="tenant">Đơn vị</option><option value="shared">Dùng chung</option>
        </select>}
      </div>
      {catalogEntries.length > 0 && <details className="pad">
        <summary>Danh mục kỳ nhận đề xuất</summary>
        {catalogEntries.map(ref => {
          const applied = effectiveRow(all, "CATALOG." + ref.id + ".STATUS")
          return <button className="project-row" key={ref.id} onClick={() => setEditor({ initial: applied, catalogEntry: ref })}>
            <span className="task-copy"><b>{ref.title}</b></span>
            <span className="pill">{(applied?.fields.value ?? ref.status) === "ACTIVE" ? "Đang dùng" : "Ngừng dùng"}</span>
          </button>
        })}
      </details>}
      {list.map(r => <button key={r.id} className="project-row" onClick={() => p.go("B01", r.id)}>
        <Settings2 size={17} /><span className="task-copy"><b>{r.title}</b><small>{r.fields.key} · {r.fields.group} · {r.fields.mime}</small></span>
        <span className="pill">{r.fields.scope === "tenant" ? "Đơn vị" : "Dùng chung"}</span>
      </button>)}
      {!list.length && <Blank title="Không tìm thấy cấu hình" />}
    </section>}
    {deletion && <Editor title="Xóa cấu hình?" hint={platform ? "Các đơn vị đang dùng bản chung sẽ mất giá trị này." : "Đơn vị sẽ dùng lại bản chung nếu có."}
      close={() => { if (!deleting) setDeletion(undefined) }}>
      <p>{deletion.row.fields.key}</p><ErrorLine message={error} />
      <Button variant="destructive" disabled={deleting} onClick={() => void confirmDelete()}>Xác nhận xóa</Button>
    </Editor>}
    {editor && <ConfigForm p={p} initial={editor.initial} catalogEntry={editor.catalogEntry} platform={platform} close={() => setEditor(undefined)}
      done={id => { setEditor(undefined); p.go("B01", id) }} />}
  </div>
}

function HomeLayout({ p, platform }: { p: FeatureProps; platform: boolean }) {
  const [role, setRole] = useState<Role>("researcher")
  return <section className="panel pad stack">
    <h2>Bố cục trang chủ theo vai trò</h2>
    <Choice label="Vai trò" value={role} options={roleNames} change={v => setRole(v as Role)} />
    <LayoutOptions key={role} p={p} role={role} platform={platform} />
  </section>
}
function LayoutOptions({ p, role, platform }: { p: FeatureProps; role: Role; platform: boolean }) {
  const key = "HOME." + role.toUpperCase()
  const scope = platform ? "shared" : "tenant"
  const id = (platform ? "cfg-base-" : "cfg-") + key
  const prior = p.rows.find(r => r.id === id)
  const applied = effectiveRow(p.rows.filter(r => !platform || r.fields.scope === "shared"), key)
  const [draft, setDraft] = useState<{ keys: string[]; commit: FeatureProps["commit"]; prior?: DemoRow; inherited?: DemoRow }>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)
  const keys = draft?.keys ?? (applied?.fields.value ?? "tasks,projects,activity").split(",").filter(k => Object.hasOwn(widgets, k))
  function change(next: string[]) {
    setDraft({ ...(draft ?? { commit: p.commit, prior, inherited: applied }), keys: next }); setSaved(false); setError("")
  }
  async function save() {
    setBusy(true); setError(""); setSaved(false)
    try {
      const row = demoRecord(id, "config", "Bố cục " + roleNames[role], {
        key, scope, group: "Trang chủ", value: keys.join(","), mime: "text/plain", active: "true",
      })
      await writeConfig({
        commit: draft?.commit ?? p.commit, action: "Lưu bố cục trang chủ", row, prior: draft ? draft.prior : prior,
        inherited: draft ? draft.inherited : applied, tenant: p.session.tenant,
      })
      setDraft(undefined); setSaved(true)
    } catch (ex) { setError(storageMessage(ex)) }
    finally { setBusy(false) }
  }
  return <fieldset disabled={busy} className="stack">
    <legend>{platform ? "Bản dùng chung cho các đơn vị" : tenants[p.session.tenant]}</legend>
    {[...keys, ...Object.keys(widgets).filter(k => !keys.includes(k))].map((k, i) => <div className="toolbar" key={k}>
      <label className="check"><input type="checkbox" checked={keys.includes(k)}
        onChange={e => change(e.target.checked ? [...keys, k] : keys.filter(x => x !== k))} />{widgets[k]}</label>
      {keys.includes(k) && i > 0 && <Button variant="ghost" size="sm" aria-label={"Đưa lên " + widgets[k]} onClick={() => {
        const ordered = [...keys]; [ordered[i-1], ordered[i]] = [ordered[i], ordered[i-1]]; change(ordered)
      }}>Đưa lên</Button>}
    </div>)}
    <div><Button onClick={() => void save()}>Lưu bố cục</Button></div>
    {saved && <p role="status">Đã áp dụng cho {roleNames[role].toLowerCase()}.</p>}
    <ErrorLine message={error} />
  </fieldset>
}
