import { useState } from "react"
import { Button } from "@rms/ui/components/button"
import { Input } from "@rms/ui/components/input"
import type { operations } from "@rms/api-contracts"
import type { SignedInSession } from "../../../auth/session"

type Assigned=operations["listReviewAssignments"]["responses"][200]["content"]["application/json"][number]
export default function ScoreSheet({session,assignment,acceptance=false,onAccessLost}:{
  session:SignedInSession;assignment:Assigned;acceptance?:boolean;onAccessLost:(scope:"assignment"|"session")=>void
}) {
  const [sheet,setSheet]=useState(assignment.sheet),[points,setPoints]=useState<Record<string,number>>(sheet?.points??{})
  const [comment,setComment]=useState(sheet?.comment??""),[message,setMessage]=useState(""),[busy,setBusy]=useState(false)
  async function save(submit:boolean) {
    setBusy(true)
    try{
      const r=await session.api.PUT(acceptance?"/api/tenants/{slug}/acceptance/rounds/{id}/sheet":"/api/tenants/{slug}/review/rounds/{id}/sheet",{params:{path:{...session.params.path,id:assignment.id}},body:{points,comment,submit}})
      if([401,403,404].includes(r.response.status)){
        onAccessLost(r.response.status===404?"assignment":"session")
        return
      }
      if(!r.data)throw Error(r.error?.message??"Phiếu nằm ngoài phạm vi hiện tại.")
      setSheet(r.data);setMessage(submit?"Đã gửi và khóa phiếu.":"Đã lưu nháp phiếu.")
    }catch(e){setMessage(e instanceof Error?e.message:"Không thể lưu phiếu.")}finally{setBusy(false)}
  }
  return <article className="grid gap-2 rounded border p-3"><h3>{assignment.title}</h3>
    {Object.values(assignment.document).map((v,i)=><p key={i}>{v}</p>)}
    <fieldset disabled={busy||sheet?.submitted} className="grid gap-2">
      {assignment.criteria.map(c=><label key={c.key}>{c.label} · {Math.round(c.weight*100)}% · tối đa {c.maxScore}
        <Input type="number" min={0} max={c.maxScore} step="any" value={points[c.key]??""} onChange={e=>{
          const next={...points};if(e.target.value==="")delete next[c.key];else next[c.key]=Number(e.target.value);setPoints(next)
        }}/></label>)}
      <label>Nhận xét chuyên môn<textarea className="block w-full rounded border p-2" maxLength={4000} value={comment} onChange={e=>setComment(e.target.value)}/></label>
      {!sheet?.submitted&&<div className="flex flex-wrap gap-2"><Button variant="outline" onClick={()=>void save(false)}>Lưu nháp phiếu</Button>
        <Button onClick={()=>void save(true)}>Gửi phiếu chấm</Button></div>}</fieldset>
    {sheet?.submitted&&<p>Điểm phiếu đã gửi · {sheet.total}</p>}<p role="status">{message}</p></article>
}
