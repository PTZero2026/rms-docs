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
  return <main className="workspace">
    <h1>Tài khoản RMS</h1>
    {error ? <div role="alert"><p>{error}</p><Button onClick={() => location.reload()}>Đăng nhập lại</Button></div> :
      account ? <section className="panel pad">
        <h2>{account.email}</h2><p>Đơn vị {slug}</p><p>Vai trò {account.userType}</p>
        {connection&&<ConnectedModules session={connection} admin={account.userType==="admin"}/>}
        {connection&&<Inbox session={connection} admin={account.userType==="admin"} canManageDelivery={account.permissions.includes("notifications.send")}/>}
        {connection&&(workId?<WorkSource key={workId} session={connection} id={workId}/>:
          <Overview session={connection} onAccessLost={onHomeAccessLost} canReport={account.permissions.includes("reports.view")} open={target=>{
            if(target==="profile")setCvOpen(true)
            else if(target==="reports")setReportOpen(true)
            else setCallsOpen(true)
          }}/>)}
        {account.userType==="admin" && connection && <Button variant="outline" aria-expanded={editor} onClick={()=>setEditor(!editor)}>Giao diện đơn vị</Button>}
        {editor && account.userType==="admin" && connection && <ThemeEditor session={connection} onApply={setTokens} />}
        {account.userType==="admin" && <Button variant="outline" aria-expanded={flowOpen} onClick={()=>setFlowOpen(!flowOpen)}>Cấu hình quy trình</Button>}
        {account.userType==="admin" && flowOpen && connection && <WorkflowEditor session={connection}/>}
        <Button variant="outline" aria-expanded={callsOpen} onClick={()=>setCallsOpen(!callsOpen)}>Kỳ nhận đề xuất</Button>
        <Button variant="outline" aria-expanded={reviewOpen} onClick={()=>setReviewOpen(!reviewOpen)}>Xét duyệt hội đồng</Button>
        <Button variant="outline" aria-expanded={acceptance} onClick={()=>setAcceptance(!acceptance)}>Phiếu nghiệm thu</Button>
        {acceptance&&connection&&<AcceptanceQueue session={connection}/>}
        {reviewOpen && connection && <Reviews session={connection} staff={account.userType==="staff"}/>}
        {account.permissions.includes("reports.view")&&<Button variant="outline" aria-expanded={reportOpen} onClick={()=>setReportOpen(!reportOpen)}>Báo cáo theo kỳ</Button>}
        {reportOpen&&account.permissions.includes("reports.view")&&connection&&<CallReport session={connection} canExport={account.permissions.includes("reports.export")}/>}
        {callsOpen && connection && <Calls session={connection} account={account}/>}
        <Button variant="outline" aria-expanded={profileOpen} onClick={()=>setProfileOpen(!profileOpen)}>Hồ sơ cá nhân</Button>
        <Button variant="outline" aria-expanded={cvOpen} onClick={()=>setCvOpen(!cvOpen)}>Lý lịch khoa học</Button>
        <Button variant="outline" aria-expanded={independentOpen} onClick={()=>setIndependentOpen(!independentOpen)}>Sản phẩm ngoài đề tài</Button>
        {independentOpen&&connection&&<IndependentProducts session={connection}/>}
        {cvOpen&&connection&&<ScientificProfile manager={account.userType==="admin"||account.userType==="staff"} id={new URLSearchParams(location.search).get("profile")||account.id} session={connection}/>}
        {profileOpen && connection && <OwnProfile session={connection}/>}
        {account.permissions.includes("users.manage") && <Button variant="outline" aria-expanded={directoryOpen} onClick={()=>setDirectoryOpen(!directoryOpen)}>Quản lý người dùng</Button>}
        {directoryOpen && account.permissions.includes("users.manage") && connection && <AccountDirectory session={connection} actor={account}/>}
        <Button variant="outline" aria-expanded={historyOpen} onClick={()=>setHistoryOpen(!historyOpen)}>Hồ sơ nghiên cứu</Button>
        {historyOpen && connection && <ProjectHistory session={connection}/>}
        <Button variant="outline" aria-expanded={configOpen} onClick={()=>setConfigOpen(!configOpen)}>Cấu hình hệ thống</Button>
        {configOpen && connection && <ConfigurationView session={connection}/>}
        <Button variant="outline" onClick={() => { setAccount(undefined); setGeneration(generation+1) }}>Tải lại thông tin</Button>
        <Button onClick={() => void logout().catch(() => setError("Không thể đăng xuất. Hãy thử lại."))}>Đăng xuất</Button>
      </section> : <p role="status">Đang mở phiên đăng nhập…</p>}
  </main>
}
