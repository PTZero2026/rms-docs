import { ChoiceOption, ChoiceSelect } from "@rms/ui/components/choice-select"
import { Textarea } from "@rms/ui/components/textarea"
import { useEffect, useState } from "react"
import type { operations } from "@rms/api-contracts"
import { Button } from "@rms/ui/components/button"
import type { SignedInSession } from "../../auth/session"

type Amendment = operations["getRoundAmendment"]["responses"][200]["content"]["application/json"]
const endpoint = "/api/tenants/{slug}/review/rounds/{id}/amendment"
const displayTime = new Intl.DateTimeFormat("vi-VN",{
  day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit",timeZone:"Asia/Ho_Chi_Minh",
})

export function RoundAmendment({session,id,status,onChanged}:{session:SignedInSession;id:string;status:string;onChanged:()=>Promise<void>}) {
  const [state,setState] = useState<Amendment>()
  const [reason,setReason] = useState(""), [recipient,setRecipient] = useState("")
  const [error,setError] = useState(""), [busy,setBusy] = useState(false), [reload,setReload] = useState(0)
  useEffect(()=>{
    const c = new AbortController()
    session.api.GET(endpoint,{params:{path:{...session.params.path,id}},cache:"no-store",signal:c.signal}).then(r=>{
      if(c.signal.aborted)return
      if(r.data){setState(r.data);setError("")}
      else if(r.response.status===404){setState(undefined);setError("")}
      else throw Error(r.error?.message??"Chưa tải được lịch sử kết luận.")
    }).catch(e=>{if(!c.signal.aborted)setError(e.message)})
    return ()=>c.abort()
  },[session,id,status,reload])
  async function submit(){
    if(!state?.action)return
    setBusy(true);setError("")
    try{
      const r=await session.api.POST(endpoint,{params:{path:{...session.params.path,id}},body:{
        action:state.action,revision:state.revision,reason,...(state.action==="REFER"?{recipientId:recipient}:{})}})
      if(!r.data)throw Error(r.error?.message??"Chưa thể ghi yêu cầu.")
      setState(r.data);setReason("");setRecipient("")
      await onChanged()
    }catch(e){setError(e instanceof Error?e.message:"Không thể kết nối.")}
    finally{setBusy(false)}
  }
  if(!error && !state?.action && !state?.history.length)return null
  return <section aria-label="Điều chỉnh kết luận" className="grid gap-2 rounded border p-3">
    {state?.action&&<fieldset disabled={busy} className="grid gap-2"><legend>{state.action==="REOPEN"?"Mở lại vòng hội đồng":"Chuyển yêu cầu đính chính"}</legend>
      {state.action==="REFER"&&<label>Chủ quy trình nhận yêu cầu <ChoiceSelect value={recipient} onValueChange={setRecipient}>
        <ChoiceOption value="">Chọn quản trị phụ trách</ChoiceOption>{state.recipients.map(a=><ChoiceOption key={a.id} value={a.id}>{a.label}</ChoiceOption>)}</ChoiceSelect></label>}
      <label>Lý do điều chỉnh kết luận<Textarea className="block w-full rounded border p-2" maxLength={2000} value={reason} onChange={e=>setReason(e.target.value)}/></label>
      <Button disabled={!reason.trim()||(state.action==="REFER"&&!recipient)} onClick={()=>void submit()}>{state.action==="REOPEN"?"Mở lại vòng":"Gửi yêu cầu đính chính"}</Button>
    </fieldset>}
    {!!state?.history.length&&<><h4>Lịch sử điều chỉnh kết luận</h4><ol>{state.history.map(h=><li key={h.revision} className="my-2">
      <p>{displayTime.format(new Date(h.createdAt))} · {h.actor} · {h.action==="REOPEN"?"Đã mở lại vòng":"Đã chuyển cho "+h.recipient}</p>
      <p>Kết luận trước · {h.conclusion==="PASSED"?"Đạt":"Không đạt"} · {h.count} phiếu · Điểm trung bình {h.mean} · Ngưỡng đạt {h.passing}</p>
      <p>{h.reason}</p></li>)}</ol></>}
    {error&&<><p role="alert">{error}</p><Button variant="outline" disabled={busy} onClick={()=>setReload(v=>v+1)}>Tải lại lịch sử kết luận</Button></>}
  </section>
}
