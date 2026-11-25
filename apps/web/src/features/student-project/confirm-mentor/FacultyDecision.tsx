import {useState} from "react"
import type {operations} from "@rms/api-contracts"
import {Button} from "@rms/ui/components/button"
import {Input} from "@rms/ui/components/input"
import type {SignedInSession} from "../../../auth/session"

type Item=operations["listStudentProjects"]["responses"][200]["content"]["application/json"]["items"][number]
type Decision=operations["decideStudentProject"]["requestBody"]["content"]["application/json"]["action"]
export function FacultyDecision({session,item,onSaved}:{session:SignedInSession;item:Item;onSaved:()=>void}){
  const [reason,setReason]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false)
  async function decide(action:Decision){
    setError("");setBusy(true)
    try{
      const r=await session.api.POST("/api/tenants/{slug}/student-projects/{id}/decision",{
        params:{path:{...session.params.path,id:item.id}},body:{action,reason,revision:item.revision}
      })
      if(!r.data)throw Error(r.error?.message??"Chưa thể ghi quyết định.")
      onSaved()
    }catch(e){setError(e instanceof Error?e.message:"Không thể kết nối.")}finally{setBusy(false)}
  }
  return <fieldset disabled={busy} className="grid gap-2"><legend>Quyết định của khoa</legend>
    {item.status==="SUBMITTED"?<>
      <Button onClick={()=>void decide("approve")}>Phê duyệt triển khai</Button>
      <label>Lý do khoa trả lại<Input value={reason} onChange={e=>setReason(e.target.value)}/></label>
      <Button variant="outline" disabled={!reason.trim()} onClick={()=>void decide("return")}>Trả đăng ký bổ sung</Button>
    </>:<Button onClick={()=>void decide("start")}>Bắt đầu thực hiện</Button>}
    {error&&<p role="alert">{error}</p>}
  </fieldset>
}
