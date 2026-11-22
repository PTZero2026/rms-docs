import { useEffect, useId, useRef, useState } from "react"
import { Button } from "@rms/ui/components/button"
import { Field, FieldGroup, FieldLabel } from "@rms/ui/components/field"
import { Input } from "@rms/ui/components/input"
import { demoRecord } from "../../demo/base-seed"
import type { DemoRow, FeatureProps } from "../../demo/types"
import { checkSize, inspectContent, sampleFile, sampleOptions } from "./configContent"
import { readContent, storageMessage, writeConfig } from "./configBlobs"
import { Choice, DetailFields, Editor, ErrorLine, TextField } from "./shared"

export function PngPreview({ blob }: { blob: Blob }) {
  const image = useRef<HTMLImageElement>(null)
  useEffect(() => {
    const url = URL.createObjectURL(blob)
    if (image.current) image.current.src = url
    return () => URL.revokeObjectURL(url)
  }, [blob])
  return <img ref={image} alt="Xem trước ảnh PNG" className="max-h-40 max-w-full object-contain" />
}

type FormProps = {
  p: FeatureProps; initial?: DemoRow; catalogEntry?: DemoRow; platform: boolean; close: () => void; done: (id: string) => void
}
export default function ConfigForm({ p, initial, catalogEntry, platform, close, done }: FormProps) {
  // Keep the opening snapshot even when the workspace receives another tab's storage event.
  const [opening] = useState(() => ({ initial, commit: p.commit, rows: p.rows }))
  const source = opening.initial
  const [key, setKey] = useState(source?.fields.key ?? (catalogEntry ? "CATALOG." + catalogEntry.id + ".STATUS" : ""))
  const [title, setTitle] = useState(source?.title ?? catalogEntry?.title ?? "")
  const [group, setGroup] = useState(source?.fields.group ?? (catalogEntry ? "Kỳ nhận đề xuất" : "Nghiệp vụ"))
  const scope = platform ? "shared" : "tenant"
  const [mode, setMode] = useState(source?.fields.blobId ? "file" : "text")
  const [text, setText] = useState(source?.fields.value ?? catalogEntry?.status ?? "")
  const [mime, setMime] = useState(source?.fields.mime === "application/json" ? "application/json" : "text/plain")
  const [file, setFile] = useState<File>()
  const [sample, setSample] = useState("png")
  const [preview, setPreview] = useState<{ fields: Record<string, string>; blob: Blob }>()
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const fileId = useId()
  const mounted = useRef(false)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])

  function resetFeedback() { setError(""); setPreview(undefined) }
  function chooseFile(chosen: File) {
    resetFeedback()
    setMode("file")
    setFile(chosen)
    try { checkSize(chosen.size) } catch (ex) { setError(storageMessage(ex)) }
  }
  async function process(save: boolean) {
    resetFeedback()
    setBusy(true)
    try {
      if (!/^[a-zA-Z0-9._-]{1,128}$/.test(key)) throw Error("Khóa dài tối đa 128 ký tự, dùng chữ, số, dấu chấm, gạch ngang hoặc gạch dưới.")
      if (!title.trim()) throw Error("Nhập tên hiển thị cho cấu hình.")
      const prefix = platform ? "cfg-base-" : key.startsWith("base-") ? "cfg-tenant/" : "cfg-"
      const id = source?.fields.scope === scope ? source.id : prefix + key
      const prior = opening.rows.find(r => r.id === id)
      if (save && prior && prior.id !== source?.id) throw Error("Đã tồn tại bản cấu hình trong phạm vi này. Hãy mở bản đó để chỉnh sửa.")
      let fields: Record<string, string>
      let replacement: Blob | undefined
      const keep = source && (mode === "file" ? !file && !!source.fields.blobId : !text)
      if (keep) {
        fields = { ...source.fields, encoding: source.fields.encoding || "utf-8" }
        if (!save) { setPreview({ fields, blob: await readContent(source) }); return }
      } else {
        const input = mode === "file" ? file : text
        if (input === undefined) throw Error("Chọn tệp thử hoặc dùng tệp mẫu.")
        const inspected = await inspectContent(input, key, mime)
        fields = inspected.fields
        if (!save) { setPreview(inspected); return }
        if (inspected.storeBlob) replacement = inspected.blob
      }
      const row = demoRecord(id, "config", title.trim(), {
        ...fields, scope, group, key, active: source?.fields.active ?? "true",
      })
      await writeConfig({
        commit: (...args) => {
          if (!mounted.current) throw Error("Phiên chỉnh sửa đã đóng.")
          opening.commit(...args)
        },
        action: "Lưu cấu hình " + key, row, prior, replacement, inherited: source, tenant: p.session.tenant,
      })
      if (mounted.current) done(id)
    } catch (ex) { setError(storageMessage(ex)) }
    finally { setBusy(false) }
  }

  return <Editor title={source ? "Cập nhật cấu hình" : "Tạo cấu hình"}
    hint={platform ? "Áp dụng cho các đơn vị đang dùng bản chung. Đơn vị có bản riêng giữ giá trị của mình." : "Áp dụng cho đơn vị " + p.session.tenant.toUpperCase() + " ngay sau khi lưu."}
    close={() => { if (!busy) close() }}>
    <form onSubmit={e => { e.preventDefault(); void process(true) }}>
      <fieldset disabled={busy} className="stack min-w-0" onChangeCapture={resetFeedback}>
        <FieldGroup>
          <div className="grid-two">
            <TextField label="Khóa cấu hình" value={key} change={setKey} disabled={!!source || !!catalogEntry} required />
            <TextField label="Tên hiển thị" value={title} change={setTitle} required />
          </div>
          <TextField label="Nhóm" value={group} change={setGroup} />
          <Choice label="Nguồn nội dung" options={{ text: "Nhập văn bản", file: "Tải tệp thử" }} value={mode} change={setMode} />
          {mode === "text" ? <>
            <Choice label="Định dạng" value={mime} change={setMime} options={{ "text/plain": "Văn bản", "application/json": "JSON" }} />
            {catalogEntry ? <Choice label="Hiệu lực" value={text} change={setText} options={{ ACTIVE: "Đang dùng", INACTIVE: "Ngừng dùng" }} />
              : <TextField label="Giá trị" multiline value={text} change={setText} />}
          </> : <Field>
            <FieldLabel htmlFor={fileId}>Tệp thử (tối đa 20 MB)</FieldLabel>
            <Input id={fileId} type="file" ref={fileInput} onChange={e => { if (e.target.files?.[0]) chooseFile(e.target.files[0]) }} />
            <small>{file?.name ?? source?.fields.filename}</small>
          </Field>}
          <div className="toolbar">
            <Choice label="Tệp mẫu" value={sample} change={setSample} options={sampleOptions} />
            <Button type="button" variant="outline" onClick={() => {
              if (fileInput.current) fileInput.current.value = ""
              chooseFile(sampleFile(sample))
              if (!key) setKey(sample === "png" ? "DEMO.PNG" : "DEMO.SIZE")
              if (!title) setTitle(sample === "png" ? "Biểu đồ mẫu" : "Kiểm tra dung lượng")
            }}>Dùng tệp mẫu</Button>
          </div>
        </FieldGroup>
        {preview && <div role="status" className="panel pad stack">
          <h3>Xem trước · chưa lưu</h3>
          <DetailFields values={[["MIME", preview.fields.mime], ["Encoding", preview.fields.encoding],
            ["Kích thước", preview.blob.size.toLocaleString("vi-VN") + " byte"], ["Content-Type", preview.blob.type]]} />
          {preview.fields.mime === "image/png" && <PngPreview blob={preview.blob} />}
        </div>}
        <ErrorLine message={error} />
        <div className="toolbar">
          <Button type="button" variant="outline" onClick={() => void process(false)}>Xem trước</Button>
          <Button type="submit">Lưu cấu hình</Button>
          {busy && <span role="status">Đang xử lý…</span>}
        </div>
      </fieldset>
    </form>
  </Editor>
}
