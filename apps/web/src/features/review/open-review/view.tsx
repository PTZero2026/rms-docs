import {MeetingMinutes} from "../meetings/view"
import { useCallback,useEffect,useState } from "react"
import { Button } from "@rms/ui/components/button"
import { Input } from "@rms/ui/components/input"
import type { operations } from "@rms/api-contracts"
import type { SignedInSession } from "../../../auth/session"
import ScoreSheet from "../submit-score/view"
import { ReviewDecision,type Round } from "../review-decision/view"

type Setup=operations["getReviewSetup"]["responses"][200]["content"]["application/json"]
type Queue=operations["listReviewAssignments"]["responses"][200]["content"]["application/json"]
type Seat=operations["createReviewCommittee"]["requestBody"]["content"]["application/json"]["seats"][number]
const roles:Record<Seat["role"],string>={CHAIR:"Chủ tịch",REVIEWER:"Phản biện",MEMBER:"Ủy viên",SECRETARY:"Thư ký"}
export default function Reviews({session,staff}:{session:SignedInSession;staff:boolean}) {
  const [setup,setSetup]=useState<Setup>(),[queue,setQueue]=useState<Queue>([]),[error,setError]=useState(""),[busy,setBusy]=useState(false)
  const [name,setName]=useState(""),[seats,setSeats]=useState<Seat[]>([]),[project,setProject]=useState(""),[committee,setCommittee]=useState("")
  const [ethics,setEthics]=useState(false),[round,setRound]=useState<Round>()
  const fetchData=useCallback(async(signal?:AbortSignal)=>{
    const opts={params:session.params,cache:"no-store" as const,signal}
    const q=await session.api.GET("/api/tenants/{slug}/review/queue",opts)
    if(!q.data)throw Error("Không thể tải hàng chờ chấm.")
    if(staff){
      const s=await session.api.GET("/api/tenants/{slug}/review/setup",opts)
      if(!s.data)throw Error("Không thể mở phạm vi chuyên viên.")
      return {queue:q.data,setup:s.data}
    }
    return {queue:q.data,setup:undefined}
  },[session,staff])
  useEffect(()=>{
    const c=new AbortController()
    fetchData(c.signal).then(data=>{if(!c.signal.aborted){setQueue(data.queue);setSetup(data.setup)}})
      .catch(e=>{if(!c.signal.aborted)setError(e.message)})
    return ()=>c.abort()
  },[fetchData])
  async function run(work:()=>Promise<void>){
    setBusy(true);setError("")
    try{await work();const data=await fetchData();setQueue(data.queue);setSetup(data.setup)}catch(e){setError(e instanceof Error?e.message:"Không thể lưu.")}finally{setBusy(false)}
  }
  const params=(id:string)=>({path:{...session.params.path,id}})
  const chosen=setup?.projects.find(p=>p.id===project)
  return <section className="grid gap-4 py-4" aria-label="Xét duyệt hội đồng">
    {setup&&<><details><summary>Lập hội đồng xét duyệt</summary><fieldset className="grid gap-2" disabled={busy}>
      <label>Tên hội đồng<Input value={name} onChange={e=>setName(e.target.value)}/></label>
      {setup.accounts.map(a=><label key={a.id}>{a.label} <select aria-label={"Chức danh "+a.label} value={seats.find(s=>s.accountId===a.id)?.role??""}
        onChange={e=>setSeats([...seats.filter(s=>s.accountId!==a.id),...(e.target.value?[{accountId:a.id,role:e.target.value as Seat["role"]}]:[])])}>
        <option value="">Chọn chức danh</option>{Object.entries(roles).map(([key,v])=><option key={key} value={key}>{v}</option>)}</select></label>)}
      <Button disabled={!name.trim()||!seats.length} onClick={()=>void run(async()=>{
        const r=await session.api.POST("/api/tenants/{slug}/review/committees",{params:session.params,body:{name,seats}})
        if(!r.data)throw Error(r.error?.message);setCommittee(r.data.id);setName("");setSeats([])
      })}>Lưu hội đồng</Button></fieldset></details>
      <fieldset className="grid gap-2" disabled={busy}><legend>Mở đợt xét duyệt</legend>
        <label>Hồ sơ của kỳ đã đóng <select value={project} onChange={e=>setProject(e.target.value)}><option value="">Chọn hồ sơ</option>
          {setup.projects.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</select></label>
        {chosen&&!chosen.finalized&&<Button variant="outline" onClick={()=>void run(async()=>{
          const r=await session.api.POST("/api/tenants/{slug}/projects/{id}/finalize",{params:params(project)})
          if(!r.data)throw Error(r.error?.message)
        })}>Chốt hồ sơ hợp lệ</Button>}
        <label>Hội đồng phụ trách <select value={committee} onChange={e=>setCommittee(e.target.value)}><option value="">Chọn hội đồng</option>
          {setup.committees.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select></label>
        <label><input type="checkbox" checked={ethics} onChange={e=>setEthics(e.target.checked)}/> Bắt buộc thẩm định đạo đức</label>
        <Button disabled={!chosen?.finalized||!committee} onClick={()=>void run(async()=>{
          const r=await session.api.POST("/api/tenants/{slug}/projects/{id}/reviews",{params:params(project),body:{committeeId:committee,ethicsRequired:ethics}})
          if(!r.data)throw Error(r.error?.message);setRound(r.data);setProject("")
        })}>Mở đợt chấm</Button></fieldset>
      {setup.rounds.length>0&&<label>Đợt xét duyệt <select value={round?.id??""} onChange={e=>{const id=e.target.value;setRound(undefined);if(id)void run(async()=>{
        const r=await session.api.GET("/api/tenants/{slug}/review/rounds/{id}",{params:params(id),cache:"no-store"})
        if(!r.data)throw Error(r.error?.message);setRound(r.data)
      })}}><option value="">Chọn đợt</option>{setup.rounds.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}</select></label>}
      {round&&<ReviewDecision key={round.id} session={session} round={round} onChange={setRound}/>}</>}
    <MeetingMinutes session={session} kind="PROPOSAL_REVIEW"/><h3>Phiếu được phân công</h3>{queue.length?queue.map(r=><ScoreSheet key={r.id} session={session} assignment={r} onAccessLost={scope=>{
      setQueue(current=>scope==="session"?[]:current.filter(row=>row.id!==r.id))
      if(scope==="session"){setSetup(undefined);setRound(undefined)}
      setError("Phiếu không còn trong phạm vi hiện tại.")
    }}/>):<p>Chưa có hồ sơ cần chấm.</p>}
    {error&&<p role="alert">{error}</p>}<Button variant="outline" disabled={busy} onClick={()=>void run(async()=>{})}>Tải lại xét duyệt</Button>
  </section>
}
