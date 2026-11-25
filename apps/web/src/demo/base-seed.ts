import { schoolUnits } from "./datasets.ts"
import { baseTypes, personas, person } from "./identity.ts"
import { defaultEdges } from "./workflow.ts"
import type { DemoRow, Role, Tenant } from "./types"
export function demoRecord(
  id: string,
  kind: string,
  title: string,
  fields: Record<string, string> = {},
  status = "ACTIVE",
  owner = "ha",
  unit = "Phòng Khoa học và Công nghệ",
): DemoRow {
  return { id, kind, title, status, owner, unit, fields }
}
export const configDefaults: Record<string, { value: string; label: string; group: string }> = {
  "FEATURE.E4": { value: "true", label: "Hoạt động khoa học mở rộng", group: "Tính năng" },
  "FEATURE.AI": { value: "true", label: "Trợ lý nghiên cứu", group: "Tính năng" },
  "NOTICE.DAYS": { value: "7", label: "Số ngày nhắc trước hạn", group: "Thông báo" },
  "HOME.RESEARCHER": {
    value: "tasks,projects,activity",
    label: "Bố cục trang chủ chủ nhiệm",
    group: "Trang chủ",
  },
  "PROFILE.TEMPLATE": { value: "CV-01.v1", label: "Mẫu lý lịch khoa học", group: "Biểu mẫu" },
}
export function baseSeed(tenant: Tenant): DemoRow[] {
  const accounts = Object.entries(personas).map(([role, p]) =>
    demoRecord(
      "account-" + p.userId,
      "account",
      p.name,
      {
        email: p.userId + "@example.invalid",
        userType: baseTypes[role as Role],
        source: role === "user" ? "AUTO" : "ADMIN",
        persona: role,
      },
      "ACTIVE",
      p.userId,
      person(tenant, role as Role).unit,
    ),
  )
  accounts.push(
    demoRecord(
      "account-nam",
      "account",
      "Trương Hoàng Nam",
      {
        email: "nam@example.invalid",
        userType: "staff",
        scopeUnit: schoolUnits(tenant)[0],
        persona: "officer",
        source: "ADMIN",
      },
      "ACTIVE",
      "nam",
      schoolUnits(tenant)[0],
    ),

    demoRecord(
      "account-lan",
      "account",
      "Vũ Ngọc Lan",
      {
        email: "lan@example.invalid",
        userType: "admin",
        persona: "admin",
        source: "ADMIN",
        platform: "true",
      },
      "ACTIVE",
      "lan",
      "Quản trị nền tảng",
    ),
  )
  const [primary, secondary] = schoolUnits(tenant)
  for (const [id, name, role, unit] of [
    ["son", "Đỗ Minh Sơn", "reviewer", primary],
    ["hue", "Phan Thu Huệ", "reviewer", secondary],
    ["thao", "Vũ Phương Thảo", "researcher", secondary],
    ["phuc", "SV Phúc", "student", primary],
    ["yen", "SV Yến", "student", primary],
  ] as const) {
    accounts.push(demoRecord("account-" + id, "account", name, {
      email: id + "@example.invalid", userType: baseTypes[role], source: "ADMIN", persona: role,
    }, "ACTIVE", id, unit))
  }
  const config = Object.entries(configDefaults).map(([key, s]) =>
    demoRecord("cfg-base-" + key, "config", s.label, {
      key,
      value: key.startsWith("FEATURE.") ? "false" : s.value,
      scope: "shared",
      group: s.group,
      mime: "text/plain",
      active: "true",
    }),
  )
  if (tenant === "tlu")
    for (const key of ["FEATURE.E4", "FEATURE.AI"])
      config.push(
        demoRecord("cfg-" + key, "config", configDefaults[key].label, {
          ...config.find((c) => c.fields.key === key)!.fields,
          value: "true",
          scope: "tenant",
        }),
      )
  return [
    ...accounts,
    ...config,
    demoRecord("wf-v1", "workflow", "Quy trình nghiên cứu cơ sở", {
      version: "v1",
      edges: JSON.stringify(defaultEdges),
    }),
    demoRecord(
      "delivery-initial",
      "delivery",
      "Nhắc hạn báo cáo định kỳ",
      {
        channel: "EMAIL",
        recipient: "mai",
        event: "PROGRESS_REPORT_DUE_SOON",
        attempts: "3",
        detail: "Kênh email giả lập tạm ngừng phản hồi.",
      },
      "ERROR",
    ),
  ]
}
export function configValue(rows: DemoRow[], key: string) {
  const configs = rows.filter(
    (r) => r.kind === "config" && r.fields.key === key && r.fields.active !== "false",
  )
  return (
    configs.find((r) => r.fields.scope === "tenant") ??
    configs.find((r) => r.fields.scope === "shared")
  )?.fields.value
}
