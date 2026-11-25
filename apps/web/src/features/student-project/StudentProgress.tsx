import {useState} from "react"
import {Button} from "@rms/ui/components/button"
import type {operations} from "@rms/api-contracts"
import type {SignedInSession} from "../../auth/session"

type Item=operations["listStudentProjects"]["responses"][200]["content"]["application/json"]["items"][number]
const time=new Intl.DateTimeFormat("vi-VN",{timeZone:"Asia/Ho_Chi_Minh",day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})

export function StudentProgress({session,item,actor,refresh}:{session:SignedInSession;item:Item;actor:string;refresh:()=>void}){
  const [note,setNote]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false)
  const canRecord=item.status==="IN_PROGRESS"&&(actor===item.leader||actor===item.mentorId)
  if(!canRecord&&!item.progressAt&&!item.requireProgress)return null
  async function save(){
    setError("");setBusy(true)
    try{
      const r=await session.api.POST("/api/tenants/{slug}/student-projects/{id}/progress",{
        params:{path:{...session.params.path,id:item.id}},body:{revision:item.revision,note}})
      if(!r.data)throw Error(r.error?.message??"Không thể ghi tiến độ.")
      setNote("");refresh()
    }catch(e){setError(e instanceof Error?e.message:"Không thể kết nối.")}finally{setBusy(false)}
  }
  return <fieldset className="grid gap-2 rounded border p-3" disabled={busy}><legend>Tiến độ thực hiện</legend>
    {item.progressAt?<><p>{item.progressNote}</p><p>{item.progressLabel} · {time.format(new Date(item.progressAt))}</p></>:
      item.requireProgress&&<p>Cần ghi tiến độ trước khi nộp kết quả cuối.</p>}
    {canRecord&&<><label>Nội dung tiến độ<textarea className="block w-full rounded border p-2" maxLength={4000} value={note} onChange={e=>setNote(e.target.value)}/></label>
      <Button variant="outline" disabled={!note.trim()} onClick={()=>void save()}>Ghi nhận tiến độ</Button></>}
    {error&&<p role="alert">{error}</p>}
  </fieldset>
}
