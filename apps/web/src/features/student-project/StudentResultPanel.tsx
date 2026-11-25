import { DateInput } from "@rms/ui/components/date-input"
import { ChoiceOption, ChoiceSelect } from "@rms/ui/components/choice-select"
import { Textarea } from "@rms/ui/components/textarea"
import {useState} from "react"
import type {operations} from "@rms/api-contracts"
import {Button} from "@rms/ui/components/button"
import type {SignedInSession} from "../../auth/session"
import {ProjectFile} from "../attachments/ProjectFile"

type Item=operations["listStudentProjects"]["responses"][200]["content"]["application/json"]["items"][number]
type Action=operations["decideStudentResult"]["requestBody"]["content"]["application/json"]["action"]
type Props={session:SignedInSession;item:Item;actor:string;refresh:()=>void}

export function StudentResultPanel({session,item,actor,refresh}:Props){
  const [message,setMessage]=useState(""),[feedback,setFeedback]=useState({revision:item.revision,text:""}),[busy,setBusy]=useState(false)
  const error=feedback.revision===item.revision?feedback.text:""
  const setError=(text:string)=>setFeedback({revision:item.revision,text})
  const [deadline,setDeadline]=useState("")
  const [code,setCode]=useState(item.finalEvidence[0]?.code??"")
  const drafting=item.status==="IN_PROGRESS"&&actor===item.leader
  const reviewing=item.status==="FINAL_SUBMITTED",mentor=actor===item.mentorId
  const filePath={...session.params.path,module:"student-project" as const,id:item.id}
  async function decide(action:Action){
    setBusy(true);setError("")
    try{
      const result=await session.api.POST("/api/tenants/{slug}/student-projects/{id}/result",{
        params:{path:{...session.params.path,id:item.id}},body:{action,revision:item.revision,message,dueDate:action==="reopen"?deadline:undefined}})
      if(!result.data)throw Error(result.error?.message??"Chưa lưu được kết quả.")
      refresh()
    }catch(e){setError(e instanceof Error?e.message:"Không thể kết nối.")}finally{setBusy(false)}
  }
  async function download(fileId:string){
    try{
      const {data}=await session.api.GET("/api/tenants/{slug}/extensions/{module}/{id}/files/{fileId}/download",{params:{path:{...filePath,fileId}},cache:"no-store"})
      if(!data)throw Error("Không thể tải minh chứng.")
      const link=document.createElement("a");link.href=data.url;link.referrerPolicy="no-referrer";link.click()
    }catch(e){setError(e instanceof Error?e.message:"Không thể tải minh chứng.")}
  }
  return <fieldset className="grid gap-2" disabled={busy}><legend>Kết quả cuối · Lượt {item.finalRound}</legend>
    {item.dueDate&&<p>Hạn nộp kết quả · {item.dueDate.split("-").reverse().join("/")}</p>}
    {item.finalSummary&&<p>{item.finalSummary}</p>}
    {!!item.finalEvidence.length&&<ul>{item.finalEvidence.map(e=><li key={e.code}>{e.label} · {item.files.some(f=>f.code===e.code)?"Đã có tệp":"Chưa có tệp"}</li>)}</ul>}
    {!!item.files.length&&<ul>{item.files.map(f=><li key={f.id}><Button variant="link" onClick={()=>void download(f.id)}>{f.filename}</Button></li>)}</ul>}
    {drafting&&<>
      {item.finalEvidence.length>0&&<><label>Loại minh chứng cuối<ChoiceSelect value={code} onValueChange={setCode}>{item.finalEvidence.map(e=><ChoiceOption key={e.code} value={e.code}>{e.label}</ChoiceOption>)}</ChoiceSelect></label>
        <ProjectFile key={code} session={session} project={item.id} revision={item.revision} extension={{module:"student-project",evidenceType:code}} onFile={refresh}/></>}
      <label>Tóm tắt kết quả cuối<Textarea className="block w-full rounded border p-2" value={message} maxLength={4000} onChange={e=>setMessage(e.target.value)}/></label>
      <Button onClick={()=>void decide("submit")} disabled={!message.trim()}>Nộp kết quả cuối</Button>
    </>}
    {reviewing&&<p>{item.mentorEndorsed?"Giảng viên đã xác nhận kết quả":item.requireMentorFinal?"Chờ giảng viên xác nhận kết quả":"Đợt này cho phép khoa nghiệm thu trực tiếp"}</p>}
    {reviewing&&mentor&&!item.mentorEndorsed&&<Button onClick={()=>void decide("endorse")}>Xác nhận kết quả đủ điều kiện</Button>}
    {reviewing&&(mentor||item.canReview)&&<>
      <label>Nhận xét kết quả<Textarea className="block w-full rounded border p-2" maxLength={4000} value={message} onChange={e=>setMessage(e.target.value)}/></label>
      <Button variant="outline" disabled={!message.trim()} onClick={()=>void decide("revise")}>Yêu cầu nộp lại kết quả</Button>
    </>}
    {reviewing&&item.canReview&&(!item.requireMentorFinal||item.mentorEndorsed)&&<>
      <Button onClick={()=>void decide("pass")}>Ghi nhận đạt</Button>
      <Button variant="outline" disabled={!message.trim()} onClick={()=>void decide("fail")}>Ghi nhận không đạt</Button>
    </>}
    {item.status==="FAILED"&&item.canReview&&<>
      <label>Hạn nộp lại kết quả<DateInput value={deadline} onValueChange={setDeadline}/></label>
      <label>Lý do cho làm lại<Textarea className="block w-full rounded border p-2" maxLength={4000} value={message} onChange={e=>setMessage(e.target.value)}/></label>
      <Button variant="outline" disabled={!message.trim()||!deadline} onClick={()=>void decide("reopen")}>Cho nhóm làm lại</Button>
    </>}
    {item.acceptanceDate&&<p>Ngày nghiệm thu · {item.acceptanceDate.split("-").reverse().join("/")}</p>}
    {item.status==="PASSED"&&item.canReview&&<Button onClick={()=>void decide("close")}>Đóng đề tài</Button>}
    {item.status==="COMPLETED"&&<p>{item.hoursRequested?"Đã gửi yêu cầu quy đổi giờ hướng dẫn":"P03 tắt tại thời điểm đóng đề tài"}</p>}
    {error&&<p role="alert">{error}</p>}
  </fieldset>
}
