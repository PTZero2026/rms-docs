import {IndependentProducts} from "../features/product/IndependentProducts"
import { ConnectedModules } from "../features/extension/ConnectedModules"
import { ScientificProfile } from "../features/profile/export-profile/view"
import { useCallback, useEffect, useLayoutEffect, useState } from "react"
import { Button } from "@rms/ui/components/button"
import { applyTheme } from "@rms/ui/theme"
import { defaultTheme,type ThemeTokens } from "@rms/api-contracts/theme"
import { session,type Account,type SignedInSession } from "./session"
import { AccountDirectory,OwnProfile } from "../features/iam/lock-account/view"
import WorkflowEditor from "../features/workflow/workflow-version/view"
import { WorkSource } from "../features/home/open-work-item/view"
import { Overview } from "../features/home/Overview"
import { AcceptanceQueue } from "../features/acceptance/view"
import Inbox from "../features/notification/Inbox"
import CallReport from "../features/report/call-report/view"
import Reviews from "../features/review/open-review/view"
import Calls from "../features/call/open-call/view"
import ProjectHistory from "../features/audit/audit-trail/view"
import ConfigurationView from "../features/catalog/config-override/view"
import ThemeEditor from "../features/catalog/theme/Editor"

import { AccountPanel } from "./AccountPanel"
import { typeNames } from "../demo/identity"

export default function AccountHome({ slug }: {slug: string}) {
  const [account, setAccount] = useState<Account>()
  const [connection, setConnection] = useState<SignedInSession>()
  const [tokens,setTokens] = useState<ThemeTokens>(defaultTheme)
  useLayoutEffect(()=>applyTheme(document.documentElement,tokens,"light"),[tokens])
  const [cvOpen,setCvOpen]=useState(()=>new URLSearchParams(location.search).has("profile"))
  const [editor,setEditor] = useState(false)
  const [independentOpen,setIndependentOpen]=useState(false)
  const [profileOpen,setProfileOpen]=useState(false),[directoryOpen,setDirectoryOpen]=useState(false)
  const [historyOpen,setHistoryOpen]=useState(()=>new URLSearchParams(location.search).has("project"))
  const [reportOpen,setReportOpen]=useState(false)
  const [search,setSearch]=useState(location.search)
  useEffect(()=>{
    const syncRoute=()=>{
      setSearch(location.search)
      if(new URLSearchParams(location.search).has("project")){setHistoryOpen(true);setReportOpen(false)}
    }
    window.addEventListener("popstate",syncRoute)
    return ()=>window.removeEventListener("popstate",syncRoute)
  },[])
  const [flowOpen,setFlowOpen]=useState(false)
  const [acceptance,setAcceptance]=useState(false)
  const [reviewOpen,setReviewOpen]=useState(false)
  const [callsOpen,setCallsOpen]=useState(false)
  const [configOpen,setConfigOpen]=useState(false)
  const [error, setError] = useState("")
  const [generation, setGeneration] = useState(0)
  const onHomeAccessLost=useCallback(()=>{
    setError("Phiên hiện tại không còn quyền truy cập trang chủ.")
    setAccount(undefined)
    setConnection(undefined)
    setTokens(defaultTheme)
  },[])
  useEffect(() => {
    let active = true
    session(slug).then(async s => {
      const a = await s.current()
      const theme = await s.api.GET("/api/tenants/{slug}/catalog/theme",{params:s.params, cache:"no-store"}).catch(()=>undefined)
      if (active) { setSearch(location.search);if(new URLSearchParams(location.search).has("profile"))setCvOpen(true);if(new URLSearchParams(location.search).has("project"))setHistoryOpen(true);setAccount(a); setConnection(s); setTokens(theme?.data?.tokens??defaultTheme) }
    })
      .catch(e => { if (active) setError(e instanceof Error ? e.message : "Không thể đăng nhập.") })
    return () => { active = false }
  }, [slug,generation])
  async function logout() {
    const s = await session(slug)
    setConnection(undefined)
    setTokens(defaultTheme)
    setAccount(undefined)
    await s.logout()
  }
  const workId=new URLSearchParams(location.search).get("work")
  if(!error&&connection&&account&&new URLSearchParams(search).get("report")==="home"){
    return <main className="workspace">
      <a className="underline" href={location.pathname}>Về trang chủ</a>
      <h1>Báo cáo theo kỳ</h1>
      {account.permissions.includes("reports.view")
        ? <CallReport session={connection} initialUnit={account.userType==="staff"?account.unitId:""} canExport={account.permissions.includes("reports.export")}/>
        : <p role="alert">Bạn chưa có quyền xem báo cáo kỳ.</p>}
    </main>
  }
  return <main className="workspace account-workspace">
    <h1>Tài khoản RMS</h1>
    {error ? <div role="alert"><p>{error}</p><Button onClick={() => location.reload()}>Đăng nhập lại</Button></div> :
      account && connection ? <section className="account-sections">
        <header className="account-identity">
          <div><h2>{account.email}</h2><p>Đơn vị {slug} · <span>Vai trò {typeNames[account.userType]}</span></p></div>
          <div className="page-actions">
            <Button variant="outline" onClick={() => { setAccount(undefined); setGeneration(generation+1) }}>Tải lại thông tin</Button>
            <Button variant="ghost" onClick={() => void logout().catch(() => setError("Không thể đăng xuất. Hãy thử lại."))}>Đăng xuất</Button>
          </div>
        </header>
        {workId ? <WorkSource key={workId} session={connection} id={workId}/> :
          <Overview session={connection} onAccessLost={onHomeAccessLost} canReport={account.permissions.includes("reports.view")} open={target => {
            if (target === "profile") setCvOpen(true)
            else if (target === "reports") setReportOpen(true)
            else setCallsOpen(true)
            document.getElementById(target + "-trigger")?.focus()
          }}/>}
        <Inbox session={connection} admin={account.userType==="admin"} canManageDelivery={account.permissions.includes("notifications.send")}/>
        <section className="account-group"><h2>Quản lý nghiên cứu</h2>
          <AccountPanel id="calls" label="Kỳ nhận đề xuất" open={callsOpen} toggle={() => setCallsOpen(!callsOpen)}>
            <Calls session={connection} account={account}/>
          </AccountPanel>
          <AccountPanel id="reviews" label="Xét duyệt hội đồng" open={reviewOpen} toggle={() => setReviewOpen(!reviewOpen)}>
            <Reviews session={connection} staff={account.userType==="staff"}/>
          </AccountPanel>
          <AccountPanel id="acceptance" label="Phiếu nghiệm thu" open={acceptance} toggle={() => setAcceptance(!acceptance)}>
            <AcceptanceQueue session={connection}/>
          </AccountPanel>
          <AccountPanel id="history" label="Hồ sơ nghiên cứu" open={historyOpen} toggle={() => setHistoryOpen(!historyOpen)}>
            <ProjectHistory session={connection}/>
          </AccountPanel>
          {account.permissions.includes("reports.view") && <AccountPanel id="reports" label="Báo cáo theo kỳ" open={reportOpen} toggle={() => setReportOpen(!reportOpen)}>
            <CallReport session={connection} canExport={account.permissions.includes("reports.export")}/>
          </AccountPanel>}
        </section>
        <section className="account-group"><h2>Hồ sơ và sản phẩm</h2>
          <AccountPanel id="personal" label="Hồ sơ cá nhân" open={profileOpen} toggle={() => setProfileOpen(!profileOpen)}><OwnProfile session={connection}/></AccountPanel>
          <AccountPanel id="profile" label="Lý lịch khoa học" open={cvOpen} toggle={() => setCvOpen(!cvOpen)}>
            <ScientificProfile manager={account.userType==="admin"||account.userType==="staff"} id={new URLSearchParams(location.search).get("profile")||account.id} session={connection}/>
          </AccountPanel>
          <AccountPanel id="products" label="Sản phẩm ngoài đề tài" open={independentOpen} toggle={() => setIndependentOpen(!independentOpen)}><IndependentProducts session={connection}/></AccountPanel>
        </section>
        <ConnectedModules session={connection} admin={account.userType==="admin"}/>
        <section className="account-group"><h2>Thiết lập đơn vị</h2>
          {account.userType==="admin" && <>
            <AccountPanel id="appearance" label="Giao diện đơn vị" open={editor} toggle={() => setEditor(!editor)}><ThemeEditor session={connection} onApply={setTokens}/></AccountPanel>
            <AccountPanel id="workflow" label="Cấu hình quy trình" open={flowOpen} toggle={() => setFlowOpen(!flowOpen)}><WorkflowEditor session={connection}/></AccountPanel>
          </>}
          {account.permissions.includes("users.manage") && <AccountPanel id="directory" label="Quản lý người dùng" open={directoryOpen} toggle={() => setDirectoryOpen(!directoryOpen)}><AccountDirectory session={connection} actor={account}/></AccountPanel>}
          <AccountPanel id="configuration" label="Cấu hình hệ thống" open={configOpen} toggle={() => setConfigOpen(!configOpen)}><ConfigurationView session={connection}/></AccountPanel>
        </section>
      </section> : <p role="status">Đang mở phiên đăng nhập…</p>}
  </main>
}
