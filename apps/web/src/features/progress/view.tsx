import { DateInput } from "@rms/ui/components/date-input"
import { Disclosure } from "@rms/ui/components/disclosure"
import { ChoiceOption, ChoiceSelect } from "@rms/ui/components/choice-select"
import { Textarea } from "@rms/ui/components/textarea"
import { formatVietnamDate } from "../../format-date"
import { useEffect,useRef,useState } from "react"
import { Button } from "@rms/ui/components/button"
import { Input } from "@rms/ui/components/input"
import type { operations } from "@rms/api-contracts"
import type { SignedInSession } from "../../auth/session"
import { ProjectFile } from "../attachments/ProjectFile"
import { CommitmentFields } from "./CommitmentFields"

type Detail=operations["getProgress"]["responses"][200]["content"]["application/json"]
type Assignment=operations["assignProject"]["requestBody"]["content"]["application/json"]
type Period=Detail["periods"][number]
export const phaseNames:Record<string,string>={APPROVED:"Đã duyệt",IN_PROGRESS:"Đang thực hiện",SUSPENDED:"Tạm dừng",
  PENDING_SUBMISSION:"Chờ nộp",SUBMITTED:"Chờ duyệt",PASSED:"Đạt",REVISION_REQUESTED:"Cần bổ sung"}
const localDate=(v:string)=>v.split("-").reverse().join("/")
export default function ProgressPanel({session,id,initialPeriod}:{session:SignedInSession;id:string;initialPeriod?:string}){
  const [detail,setDetail]=useState<Detail>(),[error,setError]=useState(""),[busy,setBusy]=useState(false),[reload,setReload]=useState(0)
  const [assignment,setAssignment]=useState<Assignment>({reference:"",signed:"",effective:"",start:"",end:"",budget:0,note:"",commitments:{},fileId:""})
  const [period,setPeriod]=useState("1"),[dueDate,setDueDate]=useState(""),[active,setActive]=useState(initialPeriod??"")
  const initialSelection=useRef(initialPeriod)
  const [content,setContent]=useState(""),[file,setFile]=useState(""),[reason,setReason]=useState("")
  const [message,setMessage]=useState("")
  useEffect(()=>{
    const c=new AbortController()
    session.api.GET("/api/tenants/{slug}/projects/{id}/progress",{params:{path:{...session.params.path,id}},cache:"no-store",signal:c.signal})
      .then(r=>{if(!c.signal.aborted){setDetail(r.data)
        const first=r.data?.periods.find(p=>p.id===initialSelection.current)
        if(first){setContent(first.content??"");setFile(first.fileId??"");initialSelection.current=undefined}
        if(!r.data)setError("Hồ sơ ngoài phạm vi hiện tại.")}})
      .catch(()=>{if(!c.signal.aborted)setError("Không thể kết nối.")})
    return ()=>c.abort()
  },[session,id,reload])
  async function run(work:()=>Promise<void>,feedback:string){
    setBusy(true);setMessage("");setError("")
    try{await work();setMessage(feedback);setReload(n=>n+1)}catch(e){setError(e instanceof Error?e.message:"Không thể lưu.")}finally{setBusy(false)}
  }
  const path={...session.params.path,id},params={path}
  function availableFile(value:string,select:(id:string)=>void){
    return <label>Tệp đã xác nhận <ChoiceSelect value={value} onValueChange={select}>
      <ChoiceOption value="">Chọn tệp</ChoiceOption>{detail?.files.map(f=><ChoiceOption key={f.id} value={f.id}>{f.filename}</ChoiceOption>)}</ChoiceSelect></label>
  }
  function choose(p:Period){setActive(p.id);setContent(p.content??"");setFile(p.fileId??"");setReason("")}
  const selected=detail?.periods.find(p=>p.id===active)
  const officer=!!detail?.canManage,executing=detail?.status==="IN_PROGRESS"
  return <section className="grid min-w-0 gap-3 rounded border p-3" aria-label="Giao đề tài và tiến độ"><h3>Giao đề tài và tiến độ</h3>
    {detail&&<><p>{detail.title} · {phaseNames[detail.status]??detail.status}</p>
      {!detail.assignment&&detail.status==="APPROVED"&&officer&&<fieldset disabled={busy} className="grid gap-2"><legend>Hồ sơ giao thực hiện</legend>
        <label>Số quyết định hoặc hợp đồng<Input value={assignment.reference} onChange={e=>setAssignment({...assignment,reference:e.target.value})}/></label>
        {(["signed","effective","start","end"] as const).map((k,i)=><label key={k}>{["Ngày ký","Ngày hiệu lực","Bắt đầu thực hiện","Kết thúc thực hiện"][i]}
          <DateInput value={assignment[k]} onValueChange={next => setAssignment({...assignment,[k]:next})}/></label>)}
        <label>Kinh phí giao (VND)<Input type="number" min={1} value={assignment.budget||""} onChange={e=>setAssignment({...assignment,budget:Number(e.target.value)})}/></label>
        <label>Lý do điều chỉnh<Textarea className="block w-full rounded border p-2" value={assignment.note} onChange={e=>setAssignment({...assignment,note:e.target.value})}/></label>
        {Object.keys(detail.promised).length?<p>Cam kết theo thuyết minh · {Object.entries(detail.promised).map(([k,v])=>k+" × "+v).join(", ")}</p>:
          <CommitmentFields session={session} value={assignment.commitments} onChange={commitments=>setAssignment({...assignment,commitments})}/>}
        {availableFile(assignment.fileId,fileId=>setAssignment({...assignment,fileId}))}
        <ProjectFile session={session} project={id} revision={detail.revision} onFile={fileId=>{setAssignment(v=>({...v,fileId}));setReload(n=>n+1)}}/>
        <Button onClick={()=>void run(async()=>{
          const r=await session.api.POST("/api/tenants/{slug}/projects/{id}/assignment",{params,body:assignment})
          if(!r.data)throw Error(r.error?.message)
        },"Đã giao thực hiện.")}>Xác nhận giao đề tài</Button></fieldset>}
      {detail.assignment&&<p>Quyết định {detail.assignment.reference} · Hiệu lực {localDate(detail.assignment.effective)} · {detail.assignment.budget.toLocaleString("vi-VN")} VND</p>}
      {executing&&officer&&<fieldset disabled={busy} className="grid gap-2"><legend>Lập lịch báo cáo</legend>
        <label>Số kỳ<Input type="number" min={1} value={period} onChange={e=>setPeriod(e.target.value)}/></label>
        <label>Ngày đến hạn<DateInput value={dueDate} onValueChange={setDueDate}/></label>
        <Button onClick={()=>void run(async()=>{
          const r=await session.api.POST("/api/tenants/{slug}/projects/{id}/periods",{params,body:{period:Number(period),dueDate}})
          if(!r.data)throw Error(r.error?.message);choose(r.data)
        },"Đã tạo kỳ báo cáo.")}>Tạo kỳ báo cáo</Button></fieldset>}
      {detail.periods.length>0&&<ul className="grid gap-2">{detail.periods.map(p=><li key={p.id}><Button variant="outline" onClick={()=>choose(p)}>
        Kỳ {p.period} · {localDate(p.dueDate)} · {phaseNames[p.status]}{p.late?" · Trễ hạn":""}</Button></li>)}</ul>}
      {selected&&<fieldset disabled={busy} className="grid gap-2 rounded border p-2"><legend>Báo cáo kỳ {selected.period}</legend>
        <p>{phaseNames[selected.status]} · {selected.late?"Trễ hạn":"Trong hạn"}</p>
        {selected.submittedAt&&<p>Đã nộp {formatVietnamDate(selected.submittedAt, "second")}</p>}
        {selected.comment&&<p>Nhận xét của chuyên viên · {selected.comment}</p>}
        {detail.principal&&executing&&["PENDING_SUBMISSION","REVISION_REQUESTED"].includes(selected.status)?<>
          <label>Nội dung thực hiện<Textarea className="block w-full rounded border p-2" value={content} onChange={e=>setContent(e.target.value)}/></label>
          {availableFile(file,setFile)}
          <ProjectFile session={session} project={id} revision={detail.revision} onFile={fileId=>{setFile(fileId);setReload(n=>n+1)}}/>
          <Button onClick={()=>void run(async()=>{
            const r=await session.api.POST("/api/tenants/{slug}/projects/{id}/periods/{periodId}/submission",{params:{path:{...path,periodId:selected.id}},body:{content,fileId:file,revision:selected.revision}})
            if(!r.data)throw Error(r.error?.message)
          },"Đã nộp báo cáo kỳ.")}>Nộp báo cáo kỳ</Button></>:<p>{selected.content}</p>}
        {officer&&executing&&["SUBMITTED","PASSED"].includes(selected.status)&&<>
          <label>Nhận xét chuyên viên<Textarea className="block w-full rounded border p-2" value={reason} onChange={e=>setReason(e.target.value)}/></label>
          {(selected.status==="PASSED"?["reopen"] as const:["pass","return"] as const).map(action=><Button variant="outline" key={action} onClick={()=>void run(async()=>{
            const r=await session.api.POST("/api/tenants/{slug}/projects/{id}/periods/{periodId}/review",{params:{path:{...path,periodId:selected.id}},body:{action,reason,revision:selected.revision}})
            if(!r.data)throw Error(r.error?.message)
          },"Đã cập nhật kết quả kỳ.")}>{({pass:"Duyệt đạt",return:"Yêu cầu chỉnh sửa",reopen:"Mở lại báo cáo"})[action]}</Button>)}</>}</fieldset>}
      {officer&&["IN_PROGRESS","SUSPENDED"].includes(detail.status)&&<Disclosure title={<> Điều chỉnh trạng thái thực hiện </>}>
        <label>Lý do thay đổi trạng thái<Input value={reason} onChange={e=>setReason(e.target.value)}/></label>
        <Button disabled={busy||!reason.trim()} onClick={()=>void run(async()=>{
          const r=await session.api.POST("/api/tenants/{slug}/projects/{id}/activity",{params,body:{action:executing?"suspend":"resume",reason}})
          if(!r.data)throw Error(r.error?.message)
        },"Đã đổi trạng thái thực hiện.")}>{executing?"Tạm dừng thực hiện":"Tiếp tục thực hiện"}</Button></Disclosure>}
    </>}{error&&<p role="alert">{error}</p>}{message&&<p role="status">{message}</p>}</section>
}
