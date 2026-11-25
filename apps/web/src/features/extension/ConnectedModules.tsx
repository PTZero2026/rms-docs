import {ReadingLibrary} from "../assistant/Suggestions"
import {FormulaEditor} from "../teaching-hour/FormulaEditor"
import {EvidenceEntries} from "./EvidenceEntries"
import {StudentProjects} from "../student-project/confirm-mentor/view"
import {useEffect,useState} from "react"
import {Button} from "@rms/ui/components/button"
import type {SignedInSession} from "../../auth/session"
import {AppliedProjects} from "../applied-project/register-applied-project/view"

export function ConnectedModules({session,admin}:{session:SignedInSession;admin:boolean}){
  const [codes,setCodes]=useState<string[]>([]),[show,setShow]=useState("")
  useEffect(()=>{
    const c=new AbortController()
    session.api.GET("/api/tenants/{slug}/features",{params:session.params,signal:c.signal,cache:"no-store"}).then(r=>{if(!c.signal.aborted)setCodes(r.data?.modules??[])}).catch(()=>{})
    return ()=>c.abort()
  },[session])
  return <>{codes.includes("AI")&&<Button variant="outline" aria-expanded={show==="AI"} onClick={()=>setShow(show==="AI"?"":"AI")}>Thư viện DOI</Button>}{show==="AI"&&<ReadingLibrary session={session}/>}
    {admin&&codes.includes("P03")&&<Button variant="outline" aria-expanded={show==="P03"} onClick={()=>setShow(show==="P03"?"":"P03")}>Định mức giờ giảng</Button>}
    {show==="P03"&&admin&&<FormulaEditor session={session}/>}
    {codes.includes("F09")&&<Button variant="outline" aria-expanded={show==="F09"} onClick={()=>setShow(show==="F09"?"":"F09")}>Nhiệm vụ cấp trên</Button>}
    {show==="F09"&&<EvidenceEntries key="upper-project" session={session} kind="upper-project"/>}
    {codes.includes("F12")&&<Button variant="outline" aria-expanded={show==="F12"} onClick={()=>setShow(show==="F12"?"":"F12")}>Hoạt động khoa học</Button>}
    {show==="F12"&&<EvidenceEntries key="activity" session={session} kind="activity"/>}
    {codes.includes("F10")&&<Button variant="outline" aria-expanded={show==="F10"} onClick={()=>setShow(show==="F10"?"":"F10")}>Đề tài sinh viên</Button>}
    {show==="F10"&&<StudentProjects session={session}/>}
    {codes.includes("F11")&&<Button variant="outline" aria-expanded={show==="F11"} onClick={()=>setShow(show==="F11"?"":"F11")}>Dự án ứng dụng</Button>}
    {show==="F11"&&<AppliedProjects session={session}/>}</>
}
