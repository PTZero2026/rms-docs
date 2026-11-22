import type { DemoRow, Role, Session, Tenant } from "./types"
export const tenants: Record<Tenant, string> = { tlu: "Đại học Thủy lợi", hmu: "Đại học Y Hà Nội" }
export const roleNames: Record<Role, string> = {
  user: "Người dùng",
  researcher: "Chủ nhiệm đề tài",
  officer: "Chuyên viên QLKH",
  reviewer: "Thành viên hội đồng",
  student: "Sinh viên",
  admin: "Quản trị đơn vị",
}
export const personas: Record<Role, Omit<Session, "tenant" | "role">> = {
  user: { userId: "ngoc", name: "Đỗ Bảo Ngọc", unit: "Khoa Môi trường" },
  researcher: { userId: "mai", name: "Lê Thanh Mai", unit: "Khoa Công trình" },
  officer: { userId: "an", name: "Nguyễn Hoài An", unit: "Phòng Khoa học và Công nghệ" },
  reviewer: { userId: "minh", name: "Phạm Quang Minh", unit: "Khoa Môi trường" },
  admin: { userId: "ha", name: "Trần Thu Hà", unit: "Phòng Quản trị" },
  student: { userId: "linh", name: "Nguyễn Khánh Linh", unit: "Khoa Công trình" },
}
export function person(tenant: Tenant, role: Role): Session {
  return { tenant, role, ...personas[role] }
}
export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join("")
}
export function accountId(userId: string) {
  return "account-" + userId
}
export function currentAccount(rows: DemoRow[], session: Session) {
  return rows.find((row) => row.id === accountId(session.userId))
}
export function unitAllowed(row: DemoRow, session: Session, rows: DemoRow[]) {
  const scope = currentAccount(rows, session)?.fields.scopeUnit
  return !scope || row.unit === scope
}
export const typeNames: Record<string, string> = {
  admin: "Quản trị viên",
  staff: "Chuyên viên",
  author: "Tác giả",
  user: "Người dùng",
}
export const baseTypes: Record<Role, string> = {
  user: "user",
  admin: "admin",
  officer: "staff",
  researcher: "author",
  reviewer: "user",
  student: "user",
}
export function roleForAccount(account: DemoRow): Role {
  const persona = account.fields.persona as Role | undefined
  const type = account.fields.userType
  if (persona && baseTypes[persona] === type) return persona
  return type === "admin"
    ? "admin"
    : type === "staff"
      ? "officer"
      : type === "author"
        ? "researcher"
        : "user"
}
export function effectiveSession(original: Session, rows: DemoRow[]): Session {
  const account = currentAccount(rows, original)
  if (!account) return original
  const role = roleForAccount(account)
  return { ...original, role, name: account.title, unit: account.unit }
}
