export type Role = "researcher" | "officer" | "reviewer" | "admin" | "student" | "user"
export type Tenant = "tlu" | "hmu"
export type Session = { tenant: Tenant; role: Role; userId: string; name: string; unit: string }
export type DemoRow = {
  id: string
  kind: string
  title: string
  status: string
  owner: string
  unit: string
  fields: Record<string, string>
}
export type AuditEvent = {
  id: string
  at: string
  actor: string
  actorId?: string
  workflowVersion?: string
  reason?: string
  unit: string
  action: string
  recordId: string
  title: string
  from?: string
  to?: string
}
export type Route = { feature: string; id?: string }
export type FeatureProps = {
  route: Route
  session: Session
  rows: DemoRow[]
  audit: AuditEvent[]
  aiEnabled: boolean
  e4Enabled: boolean
  go: (feature: string, id?: string) => void
  commit: (action: string, updates: DemoRow[], subject?: DemoRow) => void
}
