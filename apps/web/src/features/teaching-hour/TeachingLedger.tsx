import {useEffect,useState} from "react"
import {Button} from "@rms/ui/components/button"
import {Input} from "@rms/ui/components/input"
import type {operations} from "@rms/api-contracts"
import type {SignedInSession} from "../../auth/session"
type Ledger=operations["getPersonHours"]["responses"][200]["content"]["application/json"]
const roleNames:Record<string,string>={CORRESPONDING_OR_FIRST:"Tác giả chính / liên hệ",COAUTHOR:"Đồng tác giả",MENTOR:"Giảng viên hướng dẫn",LECTURER:"Giảng viên",PRINCIPAL:"Chủ nhiệm",MEMBER:"Thành viên",SECRETARY:"Thư ký"}
export function TeachingLedger({session,person,manager,onAdjusted}:{session:SignedInSession;person:string;manager:boolean;onAdjusted:()=>void}){
  const [ledger,setLedger]=useState<Ledger>(),[record,setRecord]=useState(""),[delta,setDelta]=useState(""),[reason,setReason]=useState(""),[message,setMessage]=useState(""),[busy,setBusy]=useState(false)
  const [command,setCommand]=useState(()=>crypto.randomUUID())
  useEffect(()=>{
    const c=new AbortController()
    session.api.GET("/api/tenants/{slug}/teaching-hours/people/{id}",{params:{path:{...session.params.path,id:person}},cache:"no-store",signal:c.signal}).then(r=>{if(!c.signal.aborted){setLedger(r.data);if(!r.data)setMessage("Chưa thể đọc sổ giờ.")}}).catch(()=>{if(!c.signal.aborted)setMessage("Không thể kết nối.")})
    return ()=>c.abort()
  },[session,person])
  async function adjust(){
    setBusy(true)
    try{
      const r=await session.api.POST("/api/tenants/{slug}/teaching-hours/records/{id}/adjustments",{params:{path:{...session.params.path,id:record}},body:{id:command,delta,reason}})
      if(!r.data)throw Error((r.error as {message?:string})?.message||"Không thể ghi điều chỉnh.")
      setLedger(r.data);setRecord("");setMessage("Đã ghi điều chỉnh.");onAdjusted()
    }catch(e){setMessage(e instanceof Error?e.message:"Không thể kết nối.")}finally{setBusy(false)}
  }
  return <section aria-label="Sổ giờ giảng" className="grid gap-2"><h3>Sổ giờ giảng</h3>
    {ledger?.items.map(r=><article key={r.id} className="rounded border p-2"><strong>{r.title}</strong><p>{r.date.split("-").reverse().join("/")} · {r.period} · {r.version} · {roleNames[r.role]??r.role} · {r.share}%</p><p>Giờ gốc {r.hours} · Sau điều chỉnh {r.adjusted}</p>
      {manager&&<Button variant="outline" onClick={()=>{setRecord(r.id);setDelta("");setReason("");setCommand(crypto.randomUUID())}}>Điều chỉnh giờ</Button>}</article>)}
    {record&&<><label>Chênh lệch giờ<Input value={delta} onChange={e=>setDelta(e.target.value)}/></label><label>Lý do điều chỉnh<Input value={reason} onChange={e=>setReason(e.target.value)}/></label><Button disabled={busy||!reason.trim()} onClick={()=>void adjust()}>Ghi điều chỉnh</Button></>}
    {message&&<p role="status">{message}</p>}</section>
}
