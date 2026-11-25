import { DateInput } from "@rms/ui/components/date-input"
import { Textarea } from "@rms/ui/components/textarea"
import { ChoiceOption, ChoiceSelect } from "@rms/ui/components/choice-select"
import {useState} from "react"
import type {operations} from "@rms/api-contracts"
import {Button} from "@rms/ui/components/button"
import {Input} from "@rms/ui/components/input"
import {ProjectFile} from "../../attachments/ProjectFile"
import type {SignedInSession} from "../../../auth/session"

type Page=operations["listAppliedProjects"]["responses"][200]["content"]["application/json"]
type Project=Page["items"][number]
type Hours=operations["getAppliedHours"]["responses"][200]["content"]["application/json"]
const resultLabels={DRAFT:"Đang chuẩn bị",PENDING:"Chờ xác nhận",CONFIRMED:"Đã xác nhận"}
const roles:Record<string,string>={PRINCIPAL:"Chủ nhiệm",MEMBER:"Thành viên",SECRETARY:"Thư ký / điều phối"}
export function ResultPanel({session,page,project,onSaved,onFile}:{session:SignedInSession;page:Page;project:Project;onSaved:(p:Project)=>void;onFile:()=>Promise<void>}){
  const [summary,setSummary]=useState(project.resultSummary),[date,setDate]=useState(project.resultDate??"")
  const [reason,setReason]=useState(""),[code,setCode]=useState(""),[message,setMessage]=useState(""),[busy,setBusy]=useState(false)
  const [hours,setHours]=useState<Hours>()
  const params={path:{...session.params.path,id:project.id}}
  const owner=page.actorId===project.ownerId,revision=project.revision
  const required=page.catalog.types.find(t=>t.code===project.category)?.resultEvidence??["ACCEPTANCE_MINUTES"]
  async function save(action:"submit"|"confirmResult"|"returnResult"){
    setBusy(true);setMessage("")
    try{
      const r=action==="submit"?await session.api.POST("/api/tenants/{slug}/applied-projects/{id}/result",{params,body:{date,summary,revision}}):
        await session.api.POST("/api/tenants/{slug}/applied-projects/{id}/decision",{params,body:{revision,action,reason}})
      if(!r.data)throw Error(r.error?.message??"Chưa thể cập nhật kết quả.")
      onSaved(r.data)
    }catch(e){setMessage(e instanceof Error?e.message:"Không thể kết nối.")}finally{setBusy(false)}
  }
  async function loadHours(){
    setBusy(true);setMessage("")
    try{
      const r=await session.api.GET("/api/tenants/{slug}/applied-projects/{id}/hours",{params,cache:"no-store"})
      if(!r.data)throw Error(r.error?.message??"Chưa thể tải giờ dự án.")
      setHours(r.data)
    }catch(e){setHours(undefined);setMessage(e instanceof Error?e.message:"Không thể kết nối.")}finally{setBusy(false)}
  }
  return <section className="grid gap-2 rounded border p-3" aria-label="Kết quả dự án"><h3>Kết quả dự án · {resultLabels[project.resultStatus]}</h3>
    {owner&&project.resultStatus==="DRAFT"?<fieldset className="grid gap-2" disabled={busy}>
      <label>Ngày nghiệm thu<DateInput value={date} onValueChange={setDate}/></label>
      <label>Tóm tắt kết quả<Textarea className="block w-full border p-2" maxLength={10000} value={summary} onChange={e=>setSummary(e.target.value)}/></label>
      <p>Minh chứng để xác nhận · {required.map(c=>page.catalog.evidence.find(e=>e.code===c)?.label??c).join(" hoặc ")}</p>
      <label>Loại tệp kết quả <ChoiceSelect value={code} onValueChange={setCode}><ChoiceOption value="">Chọn loại</ChoiceOption>{page.catalog.evidence.map(c=><ChoiceOption value={c.code} key={c.code}>{c.label}</ChoiceOption>)}</ChoiceSelect></label>
      {code&&<ProjectFile session={session} project={project.id} revision={revision} extension={{module:"applied-project",evidenceType:code}} onFile={()=>void onFile().catch(e=>setMessage(e.message))}/>}
      <Button disabled={!summary.trim()||!date} onClick={()=>void save("submit")}>Gửi kết quả xác nhận</Button>
    </fieldset>:<>{project.resultDate&&<p>Ngày nghiệm thu · {project.resultDate.split("-").reverse().join("/")}</p>}{project.resultSummary&&<p>{project.resultSummary}</p>}</>}
    {!owner&&page.canReview&&project.resultStatus==="PENDING"&&<fieldset disabled={busy} className="grid gap-2">
      <Button onClick={()=>void save("confirmResult")}>Xác nhận kết quả dự án</Button>
      <label>Lý do trả kết quả<Input value={reason} onChange={e=>setReason(e.target.value)}/></label>
      <Button variant="outline" disabled={!reason.trim()} onClick={()=>void save("returnResult")}>Trả kết quả bổ sung</Button>
    </fieldset>}
    {page.hoursEnabled&&<><p>Mốc ghi giờ · {project.hourTrigger==="ON_PROJECT_APPROVED"?"Duyệt kê khai":"Xác nhận kết quả"}</p>
      <Button variant="outline" disabled={busy} onClick={()=>void loadHours()}>Xem giờ của dự án</Button>
      {hours&&(hours.length?<ul>{hours.map(h=><li key={h.email}>{h.email} · {roles[h.role]??h.role} · {h.share}% · {h.hours===null?"Chờ quy đổi":h.hours+" giờ · "+h.period+" · "+h.version}</li>)}</ul>:<p>Chưa phát sinh yêu cầu quy đổi.</p>)}</>}
    {message&&<p role="alert">{message}</p>}</section>
}
