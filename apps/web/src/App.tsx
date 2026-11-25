import { Component, lazy, Suspense, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@rms/ui/components/alert-dialog"
import { Button } from "@rms/ui/components/button"
import Shell from "./demo/Shell"
import Home from "./demo/Home"
import { Blank } from "./demo/ui"
import { canOpen, items, readRoute, routeUrl } from "./demo/catalog"
import { effectiveSession, currentAccount } from "./demo/identity"
import { configValue } from "./demo/base-seed"
import { loadTenant, saveAction, worldKey } from "./demo/repository"
import { readSession } from "./demo/storage"
import type { FeatureProps, Session } from "./demo/types"
import "./workspace.css"
import "./features/mobile/mobile.css"
import { PhonePreview } from "./features/mobile/PhonePreview"
import { usePhoneLayout } from "./features/mobile/usePhoneLayout"

const ThemeGallery = lazy(() => import("./features/catalog/theme/Gallery"))
const AccountHome = lazy(() => import("./auth/AccountHome"))
const Intake = lazy(() => import("./features/intake"))
const Execution = lazy(() => import("./features/execution"))
const Extension = lazy(() => import("./features/extension"))
const Platform = lazy(() => import("./features/platform"))
class FaultBoundary extends Component<
  { children: ReactNode; onRecover?: () => void },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? (
      <section className="panel pad">
        <h2>Không thể mở không gian làm việc</h2>
        <p>Hãy tải lại để thử lại với dữ liệu đang lưu trên máy.</p>
        <Button onClick={() => location.reload()}>Tải lại</Button>
        {this.props.onRecover && (
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="outline">Khôi phục dữ liệu mẫu</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Khôi phục dữ liệu mẫu?</AlertDialogTitle>
                <AlertDialogDescription>Thao tác này xóa thay đổi mô phỏng của cả hai đơn vị trên trình duyệt này.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={this.props.onRecover}>Khôi phục</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </section>
    ) : (
      this.props.children
    )
  }
}
function Workspace() {
  const [original, setOriginal] = useState(readSession)
  const [state, setState] = useState(() => loadTenant(original.tenant))
  const [route, setRoute] = useState(readRoute)
  const [error, setError] = useState("")
  const session = effectiveSession(original, state.rows)
  const locked = currentAccount(state.rows, session)?.status !== "ACTIVE"
  function go(feature: string, id?: string) {
    const next = routeUrl(feature, id)
    if (location.hash !== next) window.location.assign(next)
  }
  useEffect(() => {
    function navigate() {
      setRoute(readRoute())
      setError("")
      window.scrollTo(0, 0)
      document.getElementById("main")?.focus({ preventScroll: true })
    }
    window.addEventListener("hashchange", navigate)
    return () => window.removeEventListener("hashchange", navigate)
  }, [])
  useEffect(() => {
    function refresh(event: StorageEvent) {
      if (event.key !== worldKey && event.key !== null) return
      try {
        setState(loadTenant(original.tenant))
      } catch {
        setError("Dữ liệu phiên khác chưa thể đọc. Vui lòng tải lại.")
      }
    }
    window.addEventListener("storage", refresh)
    return () => window.removeEventListener("storage", refresh)
  }, [original.tenant])
  useEffect(() => {
    document.title =
      (items.find((i) => i.id === route.feature)?.label ?? "Trang không tồn tại") + " · RMS"
  }, [route.feature])
  function switchSession(s: Session) {
    try {
      const next = loadTenant(s.tenant)
      sessionStorage.setItem("rms.persona", JSON.stringify(s))
      setState(next)
      setOriginal(s)
      setRoute({ feature: "B06", id: undefined })
      setError("")
      go("B06")
    } catch {
      setError("Không thể chuyển phiên. Kiểm tra quyền lưu trữ của trình duyệt.")
    }
  }
  const p: FeatureProps = {
    session,
    rows: state.rows,
    audit: state.audit,
    route,
    go,
    e4Enabled: configValue(state.rows, "FEATURE.E4") === "true",
    aiEnabled: configValue(state.rows, "FEATURE.AI") === "true",
    commit(action, updates, subject) {
      try {
        const next = saveAction(original, state, action, updates, subject)
        setState(next)
        setError("")
      } catch (ex) {
        const message = ex instanceof Error ? ex.message : "Không thể lưu thay đổi."
        setError(message)
        throw ex
      }
    },
  }
  const f = route.feature
  const Page = ["F01", "F02", "F03", "B02"].includes(f)
    ? Intake
    : ["F04", "F05", "F06", "F07", "F08"].includes(f)
      ? Execution
      : ["F09", "F10", "F11", "F12", "P03"].includes(f)
        ? Extension
        : Platform
  return (
    <Shell {...p} locked={locked} switchSession={switchSession}>
      {error && (
        <div className="error-banner" role="alert">
          {error}
          <Button variant="ghost" size="sm" onClick={() => setError("")}>
            Đóng
          </Button>
        </div>
      )}
      {locked ? (
        <Blank
          title="Tài khoản đang bị khóa"
          body="Chọn một phiên mô phỏng khác hoặc nhờ quản trị viên mở khóa."
        />
      ) : !canOpen(f, session.role, p.e4Enabled) ? (
        <Blank
          title="Chức năng không khả dụng"
          body="Kiểm tra vai trò và tính năng được bật ở đơn vị hiện tại."
          action={<Button asChild><a href={routeUrl("B06")}>Về tổng quan</a></Button>}
        />
      ) : (
        <FaultBoundary key={[session.tenant, session.userId, session.role, f, route.id].join("/")}>
          <Suspense
            fallback={
              <div className="panel pad" role="status">
                Đang mở hồ sơ…
              </div>
            }
          >
            {f === "B06" ? <Home {...p} /> : <Page {...p} />}
          </Suspense>
        </FaultBoundary>
      )}
    </Shell>
  )
}
export function App() {
  const phone = usePhoneLayout()
  if (location.pathname.replace(/\/$/,"") === "/theme-gallery") return <Suspense fallback={<p>Đang mở giao diện…</p>}><ThemeGallery /></Suspense>
  const signedInRoute = /^\/app\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/.exec(location.pathname)
  if (signedInRoute) return <FaultBoundary><Suspense fallback={<p>Đang mở tài khoản…</p>}><AccountHome slug={signedInRoute[1]} /></Suspense></FaultBoundary>
  if (!phone && location.pathname.replace(/\/$/, "") === "/v0-mobile") {
    return <PhonePreview />
  }
  return (
    <FaultBoundary
      onRecover={() => {
        localStorage.removeItem(worldKey)
        location.reload()
      }}
    >
      <Workspace />
    </FaultBoundary>
  )
}
