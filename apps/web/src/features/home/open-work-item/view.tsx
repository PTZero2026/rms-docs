import { useCallback,useEffect,useState } from "react"
import { Button } from "@rms/ui/components/button"
import type { operations } from "@rms/api-contracts"
import type { SignedInSession } from "../../../auth/session"
import {useHomeRead,WidgetFeedback} from "../widget-load"
import { FilterPair } from "../../mobile/FilterPair"
import ProgressPanel from "../../progress/view"
import { Acceptance } from "../../acceptance/view"
import ScoreSheet from "../../review/submit-score/view"
import ProposalEditor from "../../proposal/Editor"

type Page=operations["listHomeWork"]["responses"][200]["content"]["application/json"]
const localDate=(v:string)=>v.split("-").reverse().join("/")
export function WorkSource({session,id}:{session:SignedInSession;id:string}){
  const [item,setItem]=useState<Page["items"][number]>(),[failed,setFailed]=useState(false)
  const [assignment,setAssignment]=useState<operations["listReviewAssignments"]["responses"][200]["content"]["application/json"][number]>()
  useEffect(()=>{
    const c=new AbortController()
    async function load(){
      const r=await session.api.GET("/api/tenants/{slug}/home/work/{id}",{params:{path:{...session.params.path,id}},cache:"no-store",signal:c.signal})
      const task=r.data
      if(!task)throw Error()
      if(task.targetType==="round"||task.feature==="F03"){
        const path=task.feature==="F06"?"/api/tenants/{slug}/acceptance/queue":"/api/tenants/{slug}/review/queue"
        const q=await session.api.GET(path,{params:session.params,cache:"no-store",signal:c.signal})
        const assigned=q.data?.find(a=>a.id===task.targetId)
        if(!assigned||assigned.sheet?.submitted)throw Error()
        if(!c.signal.aborted)setAssignment(assigned)
      }
      if(!c.signal.aborted)setItem(task)
    }
    load().catch(()=>{if(!c.signal.aborted)setFailed(true)})
    return ()=>c.abort()
  },[session,id])
  return <section className="grid gap-3 py-4" aria-label="Xử lý công việc">
    <a className="underline" href={location.pathname}>Về danh sách việc</a>
    {failed?<p role="alert">Công việc không còn trong phạm vi hiện tại.</p>:!item?<p>Đang kiểm tra công việc…</p>:
      item.feature==="F04"?<ProgressPanel session={session} id={item.targetId} initialPeriod={item.id}/>:
      assignment?<ScoreSheet session={session} assignment={assignment} acceptance={item.feature==="F06"} onAccessLost={()=>{
        setAssignment(undefined);setItem(undefined);setFailed(true)
      }}/>:
      item.feature==="F06"?<Acceptance session={session} id={item.targetId}/>:<ProposalEditor session={session} id={item.targetId}/>}</section>
}
export function HomeWork({session,onCalls,onAccessLost}:{session:SignedInSession;onCalls:()=>void;onAccessLost:()=>void}){
  const [overdue,setOverdue]=useState(false),[skip,setSkip]=useState(0)
  const read=useCallback((signal:AbortSignal)=>
    session.api.GET("/api/tenants/{slug}/home/work",{
      params:{path:session.params.path,query:{group:overdue?"overdue":"all",skip}},cache:"no-store",signal,
    }),[session,overdue,skip])
  const {data,failed,retry}=useHomeRead(read,onAccessLost)
  if(data&&!data.visible)return null
  const total=(overdue?data?.overdue:data?.total)??0
  return <section className="grid min-w-0 gap-2 py-4" aria-label="Việc cần làm">
    <h2>Việc cần làm</h2>
    <FilterPair label="Lọc việc cần làm" options={["Tất cả","Quá hạn"]} secondActive={overdue} onChange={v=>{setOverdue(v);setSkip(0)}}/>
    {data?<><p>{data.total} việc · {data.overdue} quá hạn</p>
      {data.items.map(w=><a className="grid min-h-11 gap-1 rounded border p-3 break-words" key={w.id} href={"?work="+w.id}>
        <strong>{w.title}</strong><span className="break-all">{w.projectCode}</span><span>{w.dueDate?"Hạn "+localDate(w.dueDate):"Chưa có hạn"}</span></a>)}
      {!total&&<p>{overdue?"Chưa có việc quá hạn.":"Hiện bạn không có việc cần làm."}</p>}
      {!data.total&&<Button variant="outline" onClick={onCalls}>Xem các kỳ đang nhận</Button>}
      {total>20&&<div><Button disabled={skip===0} onClick={()=>setSkip(skip-20)}>Trang trước</Button><Button disabled={skip+20>=total} onClick={()=>setSkip(skip+20)}>Trang sau</Button></div>}
    </>:<WidgetFeedback failed={failed} retry={retry}/>}</section>
}
