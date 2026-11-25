import { ChoiceOption, ChoiceSelect } from "@rms/ui/components/choice-select"
import { ServiceStatus } from "./ServiceStatus"
import { useEffect, useRef, useState } from "react"
import type { MouseEvent, ReactNode } from "react"
import {
  ArrowRight,
  Bell,
  BookOpen,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Command,
  Menu,
  PanelLeft,
  Search,
  SlidersHorizontal,
  UserRound,
} from "lucide-react"
import { Button } from "@rms/ui/components/button"
import { Input } from "@rms/ui/components/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@rms/ui/components/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@rms/ui/components/sheet"
import { items, canOpen, readRoute, routeUrl } from "./catalog"
import { featureOf, sourceId, rowVisible } from "./views"
import { tenants, initials, roleNames, person, roleForAccount } from "./identity"
import { inbox } from "./notifications"
import { usePhoneLayout } from "../features/mobile/usePhoneLayout"
import FixtureSignIn from "./FixtureSignIn"
import { loadTenant } from "./repository"
import { Blank } from "./ui"
import type { FeatureProps, Session, Tenant } from "./types"
type Props = FeatureProps & {
  children: ReactNode
  switchSession: (s: Session) => void
  locked: boolean
}
export default function Shell(p: Props) {
  const phone = usePhoneLayout()
  const [dialog, setDialog] = useState(""),
    [menu, setMenu] = useState(false),
    [query, setQuery] = useState("")
  const { session, route, rows } = p
  const current = items.find((x) => x.id === route.feature)
  const [expanded, setExpanded] = useState(() => new Set([
    "Không gian làm việc", "Quản lý nghiên cứu", "Kết quả nghiên cứu",
    ...(current ? [current.group] : []),
  ]))
  useEffect(() => {
    function revealDestination() {
      const group = items.find(item => item.id === readRoute().feature)?.group
      if (group) setExpanded(previous => previous.has(group) ? previous : new Set(previous).add(group))
    }
    window.addEventListener("hashchange", revealDestination)
    return () => window.removeEventListener("hashchange", revealDestination)
  }, [])
  const accessible = items.filter((x) => canOpen(x.id, session.role, p.e4Enabled))
  const [tenant, setTenant] = useState<Tenant>(session.tenant)
  const accounts =
    dialog === "session"
      ? (tenant === session.tenant ? rows : loadTenant(tenant).rows).filter(
          (r) => r.kind === "account",
        )
      : []
  const [signIn, setSignIn] = useState(false)
  const opener = useRef<HTMLElement | null>(null)
  function rememberOpener() {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
  }
  function restoreFocus(event: Event) {
    event.preventDefault()
    if (opener.current?.isConnected) opener.current.focus()
    else document.getElementById("main")?.focus()
  }
  const openSession = () => {
    rememberOpener()
    setSignIn(false)
    setTenant(session.tenant)
    setDialog("session")
  }
  const closeAfterNavigation = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
    opener.current = null
    setMenu(false)
    setDialog("")
  }
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        if (!document.querySelector(".search-dialog")) rememberOpener()
        setDialog((value) => (value === "search" ? "" : "search"))
        setQuery("")
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])
  const groups = [...new Set(accessible.map((x) => x.group))]
  const unread = countUnread()
  const nav = (
    <>
      <div className="brand">
        <span className="brand-mark">
          <BookOpen size={24} strokeWidth={1.8} />
        </span>
        <div>
          <strong>
            RMS<span>.</span>
          </strong>
          <small>Quản lý nghiên cứu</small>
        </div>
      </div>
      <Button variant="ghost" size="content" className="tenant-button" aria-haspopup="dialog" aria-expanded={dialog === "session"} onClick={openSession}>
        <span className="tenant-icon">
          <Building2 size={18} />
        </span>
        <span>
          <small>Đơn vị làm việc</small>
          <b>{tenants[session.tenant]}</b>
        </span>
        <ChevronsUpDown size={14} />
      </Button>
      <nav aria-label="Chức năng" className="sidebar-nav">
        {groups.map((group) => {
          const show = expanded.has(group)
          return (
            <section key={group}>
              <Button variant="ghost" size="content"
                className="group-toggle"
                aria-expanded={show}
                onClick={() =>
                  setExpanded(previous => {
                    const next = new Set(previous)
                    if (show) next.delete(group)
                    else next.add(group)
                    return next
                  })
                }
              >
                {group}
                <ChevronDown size={13} className={show ? "" : "fold"} />
              </Button>
              {show &&
                accessible
                  .filter((i) => i.group === group)
                  .map(({ id, label, icon: Icon }) => (
                    <a
                      key={id}
                      href={routeUrl(id)}
                      onClick={() => setMenu(false)}
                      aria-current={route.feature === id ? "page" : undefined}
                      className="nav-item"
                    >
                      <Icon size={17} />
                      {label}
                      {id === "B04" && !!unread && <span>{unread}</span>}
                    </a>
                  ))}
            </section>
          )
        })}
      </nav>
      <Button variant="ghost" size="content" className="account-button" aria-haspopup="dialog" aria-expanded={dialog === "session"} onClick={openSession}>
        <span className="avatar">{initials(session.name)}</span>
        <span>
          <b>{session.name}</b>
          <small>{roleNames[session.role]}</small>
        </span>
        <ChevronsUpDown size={14} />
      </Button>
    </>
  )
  function countUnread() {
    return p.locked
      ? 0
      : rows.filter(
          (r) => r.kind === "notice" && r.owner === session.userId && r.status === "UNREAD",
        ).length
  }
  function searchResults() {
    const normalize = (s: string) =>
      s
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/đ/gi, "d")
        .toLowerCase()
    const q = normalize(query.trim())
    const links = accessible
      .filter((i) => normalize(i.label + " " + i.id).includes(q))
      .slice(0, 6)
      .map((i) => ({
        key: i.id,
        label: i.label,
        meta: "Chức năng",
        feature: i.id,
        id: undefined as string | undefined,
      }))
    if (!q) return links
    const results = [...links]
    for (const row of rows) {
      if (!normalize(row.title + " " + (row.fields.code ?? "")).includes(q)) continue
      const feature = featureOf(row, session)
      const destination = accessible.find((item) => item.id === feature)
      if (!destination || !rowVisible(row, session, rows)) continue
      results.push({
        key: row.id,
        label: row.title,
        meta: destination.label,
        feature: destination.id,
        id: sourceId(row),
      })
      if (results.length === links.length + 8) break
    }
    return results
  }
  const results = dialog === "search" && !p.locked ? searchResults() : []
  return (
    <div className="rms-shell">
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById("main")?.focus()
        }}
      >
        Đi đến nội dung
      </a>
      <aside className="sidebar">{nav}</aside>
      <div className="shell-body">
        <header className="topbar">
          <Button
            className="mobile-menu"
            variant="ghost"
            size="icon"
            aria-label="Mở điều hướng"
            aria-haspopup="dialog" aria-expanded={menu}
            onClick={() => { rememberOpener(); setMenu(true) }}
          >
            <Menu />
          </Button>
          {phone && (
            <span className="mobile-location">{route.id ? current?.label ?? "RMS" : "RMS"}</span>
          )}
          <div className="crumb">
            <PanelLeft size={16} />
            <span>Không gian làm việc</span>
            <ChevronRight size={13} />
            <b>{current?.label ?? "Trang không tồn tại"}</b>
          </div>
          <div className="top-actions">
            <Button variant="ghost" size="content"
              className="global-search" aria-haspopup="dialog" aria-expanded={dialog === "search"}
              onClick={() => {
                rememberOpener()
                setQuery("")
                setDialog("search")
              }}
              aria-label="Tìm kiếm"
            >
              <Search size={15} />
              <span>Tìm kiếm</span>
              <kbd>
                <Command size={10} />K
              </kbd>
            </Button>
            <Button variant="ghost" size="content"
              className="bell-button"
              aria-haspopup="dialog" aria-expanded={dialog === "notices"}
              onClick={() => { rememberOpener(); setDialog("notices") }}
              aria-label={"Thông báo, " + countUnread() + " chưa đọc"}
            >
              <Bell size={19} />
              {!!countUnread() && <i />}
            </Button>
            <Button variant="ghost" size="content" className="demo-button" aria-label="Phiên mô phỏng" aria-haspopup="dialog" aria-expanded={dialog === "session"} onClick={openSession}>
              <SlidersHorizontal size={14} />
              <span>Phiên mô phỏng</span>
            </Button>
          </div>
        </header>
        <main id="main" tabIndex={-1} className="workspace">
          {p.children}
        </main>
        {phone && !p.locked && (
          <nav className="mobile-dock" aria-label="Điều hướng nhanh">
            {["B06", "F02", "B04"].map((id) => {
              const item = accessible.find((entry) => entry.id === id)
              if (!item) return null
              return (
                <a
                  key={id}
                  href={routeUrl(id)}
                  aria-current={route.feature === id ? "page" : undefined}
                >
                  <item.icon size={19} />
                  {id === "B04" ? "Hộp thư" : id === "F02" ? "Kỳ đề xuất" : item.label}
                </a>
              )
            })}
          </nav>
        )}
      </div>
      <Dialog
        open={dialog === "notices"}
        onOpenChange={(open) => {
          if (!open) setDialog("")
        }}
      >
        <DialogContent onCloseAutoFocus={restoreFocus}>
          <DialogHeader>
            <DialogTitle>Thông báo gần đây</DialogTitle>
            <DialogDescription>Năm thông báo mới nhất trong hộp thư của bạn.</DialogDescription>
          </DialogHeader>
          <div className="search-results">
            {(p.locked ? [] : inbox(rows, session.userId)).slice(0, 5).map((n) => (
              <Button variant="ghost" size="content" key={n.id} asChild>
                <a href={routeUrl("B04", n.id)} onClick={closeAfterNavigation}>
                  <Bell size={16} />
                  <span>
                    <b>{n.title}</b>
                    <small>{n.status === "UNREAD" ? "Chưa đọc" : "Đã đọc"}</small>
                  </span>
                  <ChevronRight size={15} />
                </a>
              </Button>
            ))}
          </div>
          {(p.locked || !rows.some((r) => r.kind === "notice" && r.owner === session.userId)) && (
            <Blank title="Chưa có thông báo" />
          )}
          <Button variant="outline" asChild>
            <a href={routeUrl("B04")} onClick={closeAfterNavigation}>Mở hộp thư</a>
          </Button>
        </DialogContent>
      </Dialog>
      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent onCloseAutoFocus={restoreFocus} side="left" className="mobile-sidebar">
          <SheetHeader className="sr-only">
            <SheetTitle>Điều hướng RMS</SheetTitle>
            <SheetDescription>Chọn chức năng</SheetDescription>
          </SheetHeader>
          {nav}
        </SheetContent>
      </Sheet>
      <Dialog
        open={dialog === "session"}
        onOpenChange={(v) => {
          if (!v) setDialog("")
        }}
      >
        <DialogContent onCloseAutoFocus={restoreFocus} className="session-dialog">
          <DialogHeader>
            <DialogTitle>Chuyển phiên mô phỏng</DialogTitle>
            <DialogDescription>
              Chọn đơn vị và người dùng để thử quyền và các bước xử lý trên dữ liệu mẫu.
            </DialogDescription>
          </DialogHeader>
          <label className="form-label">
            Đơn vị
            <ChoiceSelect
              aria-label="Đơn vị"
              value={tenant}
              onValueChange={choiceValue => setTenant(choiceValue as Tenant)}
            >
              {Object.entries(tenants).map(([k, n]) => (
                <ChoiceOption key={k} value={k}>
                  {n}
                </ChoiceOption>
              ))}
            </ChoiceSelect>
          </label>
          <ServiceStatus />
          <Button variant="outline" aria-expanded={signIn} onClick={() => setSignIn(!signIn)}>
            {signIn ? "Chọn tài khoản có sẵn" : "Đăng nhập bằng email mẫu"}
          </Button>
          {signIn ? (
            <FixtureSignIn
              key={tenant}
              tenant={tenant}
              done={(s) => {
                p.switchSession(s)
                setDialog("")
                setMenu(false)
              }}
            />
          ) : (
            <div className="persona-list">
              {accounts.map((a) => (
                <Button variant="ghost" size="content"
                  key={a.id}
                  onClick={() => {
                    const role = roleForAccount(a)
                    p.switchSession({
                      ...person(tenant, role),
                      userId: a.owner,
                      name: a.title,
                      unit: a.unit,
                    })
                    setDialog("")
                    setMenu(false)
                  }}
                >
                  <span className="persona-symbol">
                    <UserRound size={17} />
                  </span>
                  <span>
                    <b>{a.title}</b>
                    <small>
                      {a.fields.platform === "true"
                        ? "Quản trị nền tảng"
                        : roleNames[roleForAccount(a)]}
                      {a.fields.scopeUnit ? " · " + a.fields.scopeUnit : ""}
                    </small>
                  </span>
                  {session.userId === a.owner && session.tenant === tenant ? (
                    <Check size={16} />
                  ) : (
                    <ChevronRight size={15} />
                  )}
                </Button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={dialog === "search"}
        onOpenChange={(v) => {
          if (!v) setDialog("")
        }}
      >
        <DialogContent onCloseAutoFocus={restoreFocus} className="search-dialog">
          <DialogHeader>
            <DialogTitle>Tìm kiếm trong RMS</DialogTitle>
            <DialogDescription>
              Tra tên chức năng, tên đề tài hoặc mã hồ sơ trong phạm vi của bạn.
            </DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            aria-label="Từ khóa tìm kiếm"
            placeholder="Nhập tên hoặc mã hồ sơ…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="search-results">
            {results.length ? (
              results.map((r) => (
                <Button variant="ghost" size="content" key={r.key} asChild>
                  <a href={routeUrl(r.feature, r.id)} onClick={closeAfterNavigation}>
                    <Search size={15} />
                    <span>
                      <b>{r.label}</b>
                      <small>{r.meta}</small>
                    </span>
                    <ArrowRight size={15} />
                  </a>
                </Button>
              ))
            ) : (
              <Blank title="Không tìm thấy kết quả" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
