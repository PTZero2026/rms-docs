import { loadTenant } from "../../demo/repository"
import type { DemoRow, FeatureProps, Tenant } from "../../demo/types"
import { contentType } from "./configContent"

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("rms.v0.config-content", 1)
    request.onupgradeneeded = () => request.result.createObjectStore("blobs")
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function withBlobs<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>) {
  const db = await openDatabase()
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction("blobs", mode)
      const request = operation(tx.objectStore("blobs"))
      tx.oncomplete = () => resolve(request.result)
      tx.onabort = () => reject(tx.error ?? request.error ?? Error("Giao dịch lưu tệp đã bị hủy."))
    })
  } finally { db.close() }
}

export async function readContent(row: DemoRow): Promise<Blob> {
  const { blobId, value, mime, encoding } = row.fields
  if (!blobId) return new Blob([value], { type: contentType(mime, encoding) })
  const blob: unknown = await withBlobs("readonly", store => store.get(blobId))
  if (!(blob instanceof Blob)) throw Error("Không tìm thấy tệp đã lưu trong trình duyệt.")
  return blob
}

export function storageMessage(error: unknown) {
  if (error instanceof DOMException && error.name === "QuotaExceededError") {
    return "Trình duyệt hết dung lượng lưu trữ. Hãy giải phóng dung lượng rồi thử lại."
  }
  return error instanceof Error ? error.message : "Không thể lưu hoặc đọc cấu hình. Hãy thử lại."
}

const discard = (id: string) => withBlobs("readwrite", store => store.delete(id))

// Each editor supplies the commit from the snapshot it opened. The repository checks that
// snapshot against persisted rows. Serialize B01 writers since its index spans both tenants.
type ConfigWrite = {
  commit: FeatureProps["commit"]
  action: string
  row: DemoRow
  prior?: DemoRow
  replacement?: Blob
  inherited?: DemoRow
  tenant: Tenant
}
export async function writeConfig({ commit, action, row, prior, replacement, inherited, tenant }: ConfigWrite) {
  await navigator.locks.request("rms.v0.config-write", async () => {
    if (inherited && inherited.id !== row.id) {
      const live = loadTenant(tenant).rows.find(r => r.id === inherited.id)
      if (JSON.stringify(live) !== JSON.stringify(inherited)) throw Error("Bản dùng chung đã thay đổi ở phiên khác. Hãy mở lại trước khi ghi đè.")
      if (inherited.fields.blobId && row.fields.blobId === inherited.fields.blobId) {
        replacement = await readContent(inherited)
      }
    }
    const blobId = replacement ? crypto.randomUUID() : undefined
    if (replacement && blobId) {
      await withBlobs("readwrite", store => store.add(replacement, blobId))
      row = { ...row, fields: { ...row.fields, blobId } }
    }
    try {
      commit(action, [row])
    } catch (error) {
      if (blobId) await discard(blobId)
      throw error
    }
    const oldId = prior?.fields.blobId
    if (oldId && (row.status === "DELETED" || oldId !== row.fields.blobId)) {
      // The index already points to the committed revision. Cleanup must never roll it back.
      await discard(oldId).catch(() => undefined)
    }
  })
}
