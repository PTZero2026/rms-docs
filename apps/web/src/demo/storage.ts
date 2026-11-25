import { schoolAudit } from "./datasets.ts"
import type { DemoRow, Session, Tenant } from "./types"
import type { Snapshot } from "./workflow"
import { baseSeed } from "./base-seed.ts"
import { seed as intakeSeed } from "../features/intake/seed.ts"
import { seed as executionSeed } from "../features/execution/seed.ts"
import { seed as extensionSeed } from "../features/extension/seed.ts"
import { person } from "./identity.ts"
export function initialSnapshot(tenant: Tenant): Snapshot {
  const rows = [
    ...baseSeed(tenant),
    ...intakeSeed(tenant),
    ...executionSeed(tenant),
    ...extensionSeed(tenant),
  ]
  const project = rows.find(
    (r) => r.kind === "project" && r.owner === "mai" && r.status === "IN_PROGRESS",
  )
  const call = rows.find((r) => r.kind === "call" && r.status === "OPEN")
  const sources = [call, project].filter((r): r is DemoRow => !!r)
  const notices = sources.map((r, i) => ({
    id: "home-notice-" + r.id,
    kind: "notice",
    owner: "mai",
    unit: r.unit,
    status: "UNREAD",
    title: r.kind === "call" ? "Kỳ nhận đề xuất đã mở" : "Đến kỳ cập nhật tiến độ",
    fields: {
      text: r.title,
      feature: r.kind === "call" ? "F02" : "F04",
      targetId: r.id,
      at: "2026-11-" + (20 - i) + "T02:15:00Z",
    },
  }))
  return {
    rows: [...rows, ...notices],
    audit: schoolAudit(tenant),
  }
}
export function readSession(): Session {
  try {
    const raw = JSON.parse(sessionStorage.getItem("rms.persona") ?? "null")
    if (
      raw &&
      ["tlu", "hmu"].includes(raw.tenant) &&
      ["researcher", "reviewer", "officer", "student", "admin", "user"].includes(raw.role) &&
      typeof raw.userId === "string"
    )
      return { ...person(raw.tenant, raw.role), userId: raw.userId }
  } catch {
    /* Start a fresh demo session. */
  }
  return person("tlu", "researcher")
}
