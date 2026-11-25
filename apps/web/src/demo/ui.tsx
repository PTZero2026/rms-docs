import type { ReactNode } from "react"
import { ArrowLeft, SearchX } from "lucide-react"
import { Button } from "@rms/ui/components/button"
import { Badge } from "@rms/ui/components/badge"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@rms/ui/components/empty"
import { statusNames } from "./catalog"
export function Status({ value }: { value: string }) {
  const tone = ["APPROVED", "ACTIVE", "OPEN", "PASSED", "COMPLETED", "READ"].includes(value)
    ? "green"
    : ["LOCKED", "REJECTED", "FAILED", "ERROR", "CANCELLED"].includes(value)
      ? "red"
      : ["UNDER_REVIEW", "PENDING_ACCEPTANCE", "PENDING", "UNREAD"].includes(value)
        ? "amber"
        : "blue"
  return (
    <Badge variant="outline" className={"state-chip " + tone}>
      <i />
      {statusNames[value] ?? value}
    </Badge>
  )
}
export function Heading({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <header className="page-heading">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </header>
  )
}
export function Blank({
  title = "Chưa có hồ sơ",
  body,
  action,
}: {
  title?: string
  body?: string
  action?: ReactNode
}) {
  return (
    <Empty className="blank">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchX />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {body && <EmptyDescription>{body}</EmptyDescription>}
      </EmptyHeader>
      {action}
    </Empty>
  )
}
export function Back({
  href,
  label = "Quay lại danh sách",
}: {
  href: string
  label?: string
}) {
  return (
    <Button variant="ghost" asChild>
      <a href={href}><ArrowLeft data-icon="inline-start" />{label}</a>
    </Button>
  )
}
