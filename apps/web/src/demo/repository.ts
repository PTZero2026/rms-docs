import type { DemoRow, Session, Tenant } from "./types"
import type { Snapshot } from "./workflow"
import { applyTransaction } from "./workflow"
import { initialSnapshot } from "./storage"
import { demoRecord } from "./base-seed"
import { accountId, effectiveSession, roleForAccount, unitAllowed } from "./identity"
import { eventNotices } from "./notifications"
export const worldKey = "rms.frontend.demo.2026-11.v1"
type World = Partial<Record<Tenant, Snapshot>>
function readWorld(): World {
  const raw = localStorage.getItem(worldKey)
  if (!raw) return {}
  const world = JSON.parse(raw)
  if (!world || typeof world !== "object" || Array.isArray(world))
    throw Error("Dữ liệu mô phỏng không hợp lệ.")
  for (const key of ["tlu", "hmu"]) {
    const snapshot = world[key]
    if (!snapshot) continue
    if (
      !Array.isArray(snapshot.rows) ||
      !Array.isArray(snapshot.audit) ||
      !snapshot.rows.every(
        (r: DemoRow) =>
          r &&
          typeof r.id === "string" &&
          typeof r.kind === "string" &&
          typeof r.title === "string" &&
          typeof r.status === "string" &&
          r.fields &&
          typeof r.fields === "object" &&
          Object.values(r.fields).every((v) => typeof v === "string"),
      )
    )
      throw Error("Dữ liệu mô phỏng không hợp lệ.")
  }
  return world
}
export function loadTenant(tenant: Tenant) {
  return readWorld()[tenant] ?? initialSnapshot(tenant)
}
function cloneSettings(snapshot: Snapshot, records: DemoRow[]) {
  const keys = new Set(records.map((r) => r.id))
  return {
    ...snapshot,
    rows: [
      ...snapshot.rows.filter((r) => !keys.has(r.id)),
      ...records.filter((r) => r.status !== "DELETED"),
    ],
  }
}
export function saveAction(
  original: Session,
  expected: Snapshot,
  action: string,
  updates: DemoRow[],
  subject?: DemoRow,
) {
  const world = readWorld(),
    tenant = original.tenant,
    now = world[tenant] ?? initialSnapshot(tenant)
  const session = effectiveSession(original, now.rows)
  const account = now.rows.find((r) => r.id === accountId(original.userId))
  if (!account || account.status !== "ACTIVE")
    throw Error("Tài khoản đã bị khóa. Hãy chuyển phiên mô phỏng.")
  if (session.role !== effectiveSession(original, expected.rows).role)
    throw Error("Quyền đã thay đổi. Hãy mở lại hồ sơ.")
  for (const r of updates) {
    const live = now.rows.find((x) => x.id === r.id),
      prior = expected.rows.find((x) => x.id === r.id)
    if (JSON.stringify(live) !== JSON.stringify(prior))
      throw Error("Hồ sơ đã thay đổi ở phiên khác. Vui lòng mở lại trước khi lưu.")
    if (live && live.kind !== r.kind) throw Error("Mã hồ sơ đã được sử dụng.")
    if (["workflow", "config", "account"].includes(r.kind) && session.role !== "admin")
      throw Error("Thao tác này cần quyền quản trị.")
    if (r.kind === "config" && r.fields.scope === "shared" && account.fields.platform !== "true")
      throw Error("Chỉ quản trị nền tảng được sửa giá trị dùng chung.")
    if (
      r.kind === "account" &&
      r.owner === session.userId &&
      (r.status !== "ACTIVE" || r.fields.userType !== "admin")
    )
      throw Error("Không thể tự khóa hoặc hạ quyền quản trị.")
    if (session.role === "officer" && r.kind === "project" && !unitAllowed(r, session, now.rows))
      throw Error("Đề tài ngoài phạm vi đơn vị.")
  }
  if (updates.some((r) => r.kind === "account")) {
    const accounts = new Map(now.rows.filter((r) => r.kind === "account").map((r) => [r.id, r]))
    for (const r of updates) if (r.kind === "account") accounts.set(r.id, r)
    if (![...accounts.values()].some((r) => r.status === "ACTIVE" && r.fields.userType === "admin"))
      throw Error("Cần tối thiểu một quản trị viên đang hoạt động.")
  }
  const next = applyTransaction(now, session, action, updates, subject)
  next.rows.push(...eventNotices(now.rows, updates, next.audit[next.audit.length - 1].at))
  const deleted = new Set(
    updates.filter((r) => r.kind === "config" && r.status === "DELETED").map((r) => r.id),
  )
  if (deleted.size) next.rows = next.rows.filter((r) => !deleted.has(r.id))
  const shared = updates.filter((r) => r.kind === "config" && r.fields.scope === "shared")
  if (shared.length) {
    const other = tenant === "tlu" ? "hmu" : "tlu"
    world[other] = cloneSettings(world[other] ?? initialSnapshot(other), shared)
  }
  world[tenant] = next
  localStorage.setItem(worldKey, JSON.stringify(world))
  return next
}

export function fixtureSignIn(tenant: Tenant, input: string): Session {
  const email = input.trim().toLowerCase()
  if (!/^[a-z0-9._+-]+@example\.invalid$/.test(email))
    throw Error("Cần email mẫu thuộc @example.invalid.")
  const world = readWorld()
  const snapshot = world[tenant] ?? initialSnapshot(tenant)
  const existing = snapshot.rows.find(
    (r) => r.kind === "account" && r.fields.email.toLowerCase() === email,
  )
  if (existing && existing.status !== "ACTIVE")
    throw Error("Tài khoản đang bị khóa hoặc ngừng hoạt động.")
  const id = existing?.owner ?? crypto.randomUUID()
  const name = existing?.title ?? "Người dùng " + email.split("@")[0]
  const unit = existing?.unit ?? "Khoa Công trình"
  const session: Session = {
    tenant,
    userId: id,
    role: existing ? roleForAccount(existing) : "user",
    name,
    unit,
  }
  if (!existing) {
    const account = demoRecord(
      accountId(id),
      "account",
      name,
      { email, userType: "user", persona: "user", source: "AUTO", profileComplete: "false" },
      "ACTIVE",
      id,
      unit,
    )
    const profile = demoRecord(
      "exec-profile-" + id,
      "profile",
      name,
      { email, department: unit },
      "ACTIVE",
      id,
      unit,
    )
    world[tenant] = applyTransaction(
      snapshot,
      session,
      "Tạo tài khoản ở lần đăng nhập đầu",
      [account, profile],
      account,
    )
    localStorage.setItem(worldKey, JSON.stringify(world))
  }
  return session
}
