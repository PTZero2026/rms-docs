const maxBytes = 20 * 1024 * 1024
// Runtime configuration is synchronous. Only short text values belong in its localStorage index.
const inlineBytes = 16 * 1024
const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10]

export const widgets: Record<string, string> = {
  tasks: "Việc cần xử lý và phân bố", projects: "Hồ sơ nghiên cứu", activity: "Thông báo gần đây",
}
export const sampleOptions = {
  png: "Ảnh PNG · 3 KB", limit: "Tệp nhị phân · đúng 20 MB", oversized: "Tệp nhị phân · vượt 20 MB một byte",
}

export function sampleFile(kind: string) {
  if (kind !== "png") {
    return new File([new Uint8Array(maxBytes + Number(kind === "oversized"))], "dung-luong-mau.bin")
  }
  // A 96 × 48 RGB plot. Its PNG tEXt chunk pads the fixture to exactly 3 KiB, before CRC and IEND.
  const bytes = (encoded: string) => Uint8Array.from(atob(encoded), c => c.charCodeAt(0))
  const start = bytes("iVBORw0KGgoAAAANSUhEUgAAAGAAAAAwCAIAAABhdOiYAAAAk0lEQVR42u3YPQqAMAwG0FzEE4qXdnfxBO4O0kr9IXnwjSWF19BoY903uUggAAQIECBAgAABEkCAAAECBAgQIAHUDjQt8ymjSueoDKgfaNT2OSpH1pN/8JLWU91TrHJPRZ3b5F7lqDyhXgXK2lPhqwfQP4D8rAISQIAAffJg1jIOy64BBAgQIECAAAECBAgQoAfWHH+54rPXuM/nAAALKHRFWHRDb21tZW50AFJNUw==")
  return new File([start, " ".repeat(2845), bytes("l/HTCwAAAABJRU5ErkJggg==")], "bieu-do-mau.png")
}

export function checkSize(size: number) {
  if (!size) throw Error("Nội dung đang trống. Hãy nhập giá trị hoặc chọn tệp mẫu.")
  if (size > maxBytes) throw Error("Tệp vượt 20 MB. Hãy chọn tệp nhỏ hơn hoặc bằng 20 MB.")
}

export function contentType(mime: string, encoding = "utf-8") {
  return mime.startsWith("text/") || mime === "application/json" ? mime + ";charset=" + encoding : mime
}

async function detectMime(blob: Blob) {
  const bytes = new Uint8Array(await blob.slice(0, 4096).arrayBuffer())
  if (pngSignature.every((n, i) => bytes[i] === n)) return "image/png"
  if ([37, 80, 68, 70, 45].every((n, i) => bytes[i] === n)) return "application/pdf"
  try {
    const decoder = new TextDecoder("utf-8", { fatal: true })
    const text = decoder.decode(bytes, { stream: blob.size > bytes.length })
    if (Array.from(text).some(c => c.charCodeAt(0) < 32 && !"\t\r\n".includes(c))) return "application/octet-stream"
    if (/^[\s]*[[{]/.test(text)) {
      try { JSON.parse(await blob.text()); return "application/json" } catch { /* Plain UTF-8 text. */ }
    }
    return "text/plain"
  } catch {
    return "application/octet-stream"
  }
}

export async function inspectContent(source: File | string, key: string, textMime: string) {
  const file = typeof source !== "string"
  const blob = file ? source : new Blob([source])
  checkSize(blob.size)
  const mime = file ? await detectMime(blob) : textMime
  if (!file && mime === "application/json") {
    try { JSON.parse(source) } catch { throw Error("Nội dung JSON chưa hợp lệ.") }
  }
  const isText = mime === "text/plain" || mime === "application/json"
  const value = isText && blob.size <= inlineBytes ? await blob.text() : ""
  if (key.startsWith("FEATURE.") && !["true", "false"].includes(value)) throw Error("Tính năng nhận giá trị true hoặc false.")
  if (key === "NOTICE.DAYS" && (!/^\d+$/.test(value) || Number(value) > 365)) throw Error("Số ngày nhắc cần nằm trong khoảng 0–365.")
  if (/^CATALOG\..+\.STATUS$/.test(key) && !["ACTIVE", "INACTIVE"].includes(value)) throw Error("Hiệu lực danh mục phải là ACTIVE hoặc INACTIVE.")
  if (key.startsWith("HOME.")) {
    const sections = value.split(",")
    if (sections.some(k => !Object.hasOwn(widgets, k)) || new Set(sections).size !== sections.length) {
      throw Error("Bố cục cần dùng các mục tasks, projects, activity, ngăn cách bằng dấu phẩy.")
    }
  }
  const filename = file ? source.name : key + (mime === "application/json" ? ".json" : ".txt")
  const fields = { value, mime, encoding: "utf-8", size: String(blob.size), filename }
  return { fields, blob: blob.slice(0, blob.size, contentType(mime)), storeBlob: file || blob.size > inlineBytes }
}
