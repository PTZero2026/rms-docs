import {ReadingLibrary} from "../assistant/Suggestions"
import {FormulaEditor} from "../teaching-hour/FormulaEditor"
import {EvidenceEntries} from "./EvidenceEntries"
import {StudentProjects} from "../student-project/confirm-mentor/view"
import {useEffect,useState} from "react"
import {AccountPanel} from "../../auth/AccountPanel"
import type {SignedInSession} from "../../auth/session"
import {AppliedProjects} from "../applied-project/register-applied-project/view"

export function ConnectedModules({session,admin}:{session:SignedInSession;admin:boolean}){
  const [codes,setCodes]=useState<string[]>([]),[show,setShow]=useState("")
  useEffect(()=>{
    const c=new AbortController()
    session.api.GET("/api/tenants/{slug}/features",{params:session.params,signal:c.signal,cache:"no-store"}).then(r=>{if(!c.signal.aborted)setCodes(r.data?.modules??[])}).catch(()=>{})
    return ()=>c.abort()
  },[session])
  const modules = [
    {code:"AI", label:"Thư viện DOI", content:<ReadingLibrary session={session}/>},
    {code:"F09", label:"Nhiệm vụ cấp trên", content:<EvidenceEntries session={session} kind="upper-project"/>},
    {code:"F10", label:"Đề tài sinh viên", content:<StudentProjects session={session}/>},
    {code:"F11", label:"Dự án ứng dụng", content:<AppliedProjects session={session}/>},
    {code:"F12", label:"Hoạt động khoa học", content:<EvidenceEntries session={session} kind="activity"/>},
    {code:"P03", label:"Định mức giờ giảng", content:<FormulaEditor session={session}/>},
  ].filter(m => codes.includes(m.code) && (m.code !== "P03" || admin))
  if (!modules.length) return null
  return <section className="account-group"><h2>Nghiệp vụ mở rộng</h2>
    {modules.map(m => <AccountPanel key={m.code} id={"module-" + m.code} label={m.label}
      open={show === m.code} toggle={() => setShow(show === m.code ? "" : m.code)}>
      {m.content}
    </AccountPanel>)}
  </section>
}
