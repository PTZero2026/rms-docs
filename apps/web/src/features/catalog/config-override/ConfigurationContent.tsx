import { useEffect, useRef } from "react"

export async function inspectConfiguration(blob: Blob) {
  const [mime, ...parameters] = blob.type.toLowerCase().split(";")
  if (mime.startsWith("image/")) return { kind: "image" } as const
  if (!mime.startsWith("text/") && !/[+/](json|xml|yaml)$/.test(mime)) return { kind: "file" } as const

  const charset = parameters.map(p => p.trim()).find(p => p.startsWith("charset="))
  const encoding = charset?.slice("charset=".length).replace(/^"|"$/g, "") || "utf-8"
  const limit = 64 * 1024
  const truncated = blob.size > limit
  try {
    const bytes = await blob.slice(0, limit).arrayBuffer()
    // With a partial file, keep a split final character out of the displayed text.
    const text = new TextDecoder(encoding, { fatal: true }).decode(bytes, { stream: truncated })
    return { kind: "text", text, encoding, truncated } as const
  } catch {
    return { kind: "unreadable", encoding } as const
  }
}

export type ConfigurationDetail = {
  key: string
  scope: string
  cache: string
  blob: Blob
  preview: Awaited<ReturnType<typeof inspectConfiguration>>
}

export function ConfigurationContent({ detail }: { detail: ConfigurationDetail }) {
  const download = useRef<HTMLAnchorElement>(null)
  const img = useRef<HTMLImageElement>(null)
  const { blob, preview } = detail
  useEffect(() => {
    const downloadUrl = URL.createObjectURL(blob.slice(0, blob.size, "application/octet-stream"))
    if (download.current) download.current.href = downloadUrl
    // The image element decodes the bytes. SVG uses an opaque data URL.
    let svg: FileReader | undefined
    if (img.current && blob.type.split(";")[0] === "image/svg+xml") {
      const element = img.current
      svg = new FileReader()
      svg.onload = () => { if (typeof svg?.result === "string") element.src = svg.result }
      svg.readAsDataURL(blob)
    } else if (img.current) img.current.src = downloadUrl
    return () => { svg?.abort(); URL.revokeObjectURL(downloadUrl) }
  }, [blob])

  return <section aria-label="Nội dung cấu hình">
    <h3>{detail.key}</h3><p>{detail.scope} · Cache {detail.cache}</p>
    {preview.kind === "image" && <img ref={img} alt={detail.key} className="max-h-64 max-w-full object-contain" />}
    {preview.kind === "text" && <>
      <p>Bảng mã {preview.encoding}{preview.truncated && " · Hiển thị 64 KiB đầu"}</p>
      <pre className="max-h-64 overflow-auto whitespace-pre-wrap">{preview.text}</pre>
    </>}
    {preview.kind === "unreadable" && <p>Trình duyệt chưa đọc được văn bản theo bảng mã {preview.encoding}. Bạn có thể tải tệp gốc.</p>}
    <a ref={download} download={detail.key}>Tải nội dung</a>
  </section>
}
