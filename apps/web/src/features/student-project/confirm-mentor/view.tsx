import {StudentResultPanel} from "../StudentResultPanel"
import {StudentAmendment} from "../StudentAmendment"
import {StudentProgress} from "../StudentProgress"
import {FacultyDecision} from "./FacultyDecision"
import {useEffect,useState} from "react"
import type {operations} from "@rms/api-contracts"
import {Button} from "@rms/ui/components/button"
import {Input} from "@rms/ui/components/input"
import type {SignedInSession} from "../../../auth/session"
type Page=operations["listStudentProjects"]["responses"][200]["content"]["application/json"]
type Item=Page["items"][number]
const stages={SUBMITTED:"Đã nộp",APPROVED:"Đã phê duyệt",IN_PROGRESS:"Đang thực hiện",MENTOR_PENDING:"Chờ xác nhận bản điều chỉnh",FINAL_SUBMITTED:"Đã nộp kết quả cuối",PASSED:"Nghiệm thu đạt",FAILED:"Nghiệm thu không đạt",COMPLETED:"Đã đóng đề tài"}
const states={RECONFIRM_REQUIRED:"Khoa yêu cầu bổ sung",INVITED:"Chờ giảng viên xác nhận",ACCEPTED:"Giảng viên đã xác nhận",RETURNED:"Yêu cầu sửa",DECLINED:"Đã từ chối"}
export function StudentProjects({session}:{session:SignedInSession}){
  const [page,setPage]=useState<Page>(),[round,setRound]=useState(0),[message,setMessage]=useState(""),[busy,setBusy]=useState(false)
  const [editing,setEditing]=useState(""),[title,setTitle]=useState(""),[call,setCall]=useState(""),[mentor,setMentor]=useState(""),[members,setMembers]=useState<string[]>([]),[reasons,setReasons]=useState<Record<string,string>>({})
  const [objective,setObjective]=useState(""),[product,setProduct]=useState("")
  useEffect(()=>{
    const c=new AbortController()
    session.api.GET("/api/tenants/{slug}/student-projects",{params:session.params,signal:c.signal,cache:"no-store"}).then(r=>{if(!c.signal.aborted){setPage(r.data);if(!r.data)setMessage("Không thể mở đợt đăng ký trong phạm vi hiện tại.")}}).catch(()=>{if(!c.signal.aborted)setMessage("Không thể kết nối.")})
    return ()=>c.abort()
  },[session,round])
  function edit(r?:Item){setEditing(r?.id??crypto.randomUUID());setTitle(r?.title??"");setCall(r?.call??page?.calls[0]?.code??"");setMentor(r?.mentorId??"");setMembers(r?.members??(page?[page.accountId]:[]));setObjective(r?.objective??"");setProduct(r?.product??"");setMessage("")}
  async function action(id:string,kind:"register"|"submit"|"accept"|"decline"|"return"){
    setBusy(true);setMessage("")
    const params={path:{...session.params.path,id}}
    try{
      const result=kind==="register"?await session.api.PUT("/api/tenants/{slug}/student-projects/{id}",{params,body:{title,objective,product,call,mentorId:mentor,members}}):
        kind==="submit"?await session.api.POST("/api/tenants/{slug}/student-projects/{id}/submit",{params}):
        await session.api.POST("/api/tenants/{slug}/student-projects/{id}/mentor",{params,body:{action:kind,reason:reasons[id]??"",revision:page?.items.find(item=>item.id===id)?.revision}})
      if(!result.data)throw Error((result.error as {message?:string})?.message||"Không thể xử lý đăng ký.")
      setEditing("");setRound(r=>r+1);setMessage("Đã lưu thay đổi.")
    }catch(e){setMessage(e instanceof Error?e.message:"Không thể kết nối.")}finally{setBusy(false)}
  }
  return <section className="grid max-w-3xl gap-3 rounded border p-4" aria-label="Đề tài sinh viên"><h2>Đề tài sinh viên</h2>
    {page?.people.some(p=>p.kind==="STUDENT"&&p.id===page.accountId)&&<Button variant="outline" onClick={()=>edit()}>Tạo đăng ký</Button>}
    {page&&editing&&<div className="grid gap-2"><label>Tên đề tài sinh viên<Input value={title} onChange={e=>setTitle(e.target.value)}/></label>
      <label>Mục tiêu nghiên cứu<Input value={objective} maxLength={4000} onChange={e=>setObjective(e.target.value)}/></label>
      <label>Sản phẩm dự kiến<Input value={product} maxLength={4000} onChange={e=>setProduct(e.target.value)}/></label>
      <label>Đợt đăng ký<select value={call} onChange={e=>setCall(e.target.value)}>{page.calls.map(c=><option key={c.code}>{c.code}</option>)}</select></label>
      <label>Giảng viên hướng dẫn<select value={mentor} onChange={e=>setMentor(e.target.value)}><option value="">Chọn giảng viên</option>{page.people.filter(x=>x.kind==="MENTOR").map(p=><option value={p.id} key={p.id}>{p.label}</option>)}</select></label>
      <fieldset><legend>Thành viên nhóm</legend>{page.people.filter(x=>x.kind==="STUDENT").map(p=><label key={p.id} className="block"><input type="checkbox" checked={members.includes(p.id)} disabled={p.id===page.accountId} onChange={e=>setMembers(e.target.checked?[...members,p.id]:members.filter(id=>id!==p.id))}/> {p.label}</label>)}</fieldset>
      <Button disabled={busy} onClick={()=>void action(editing,"register")}>Mời giảng viên xác nhận</Button></div>}
    {page?.items.map(r=><article key={r.id} className="grid gap-2 rounded border p-3"><h3>{r.title}</h3><p>{r.call} · {r.status==="DRAFT"?states[r.mentorState]:stages[r.status]}</p>{r.reason&&<p>{r.reason}</p>}
      <p>Giảng viên hướng dẫn · {r.mentorLabel}</p><p>Nhóm sinh viên · {r.memberLabels.join(", ")}</p>
      {r.objective&&<p>Mục tiêu · {r.objective}</p>}{r.product&&<p>Sản phẩm dự kiến · {r.product}</p>}
      {r.status==="MENTOR_PENDING"&&<p>Phản hồi bản điều chỉnh · {states[r.mentorState]}</p>}
      {r.canReview&&["APPROVED","IN_PROGRESS","MENTOR_PENDING"].includes(r.status)&&<StudentAmendment key={"amend-"+r.revision} session={session} item={r} refresh={()=>setRound(n=>n+1)}/>}
      {["IN_PROGRESS","FINAL_SUBMITTED","PASSED","FAILED","COMPLETED"].includes(r.status)&&<>
        <StudentProgress session={session} item={r} actor={page.accountId} refresh={()=>setRound(n=>n+1)}/>
        <StudentResultPanel key={"result-"+r.status+"-"+r.finalRound} session={session} item={r} actor={page.accountId} refresh={()=>setRound(n=>n+1)}/></>}
      {r.canReview&&(r.status==="SUBMITTED"||r.status==="APPROVED")&&<FacultyDecision key={"faculty-"+r.revision} session={session} item={r} onSaved={()=>setRound(n=>n+1)}/>}
      {r.leader===page.accountId&&r.status==="DRAFT"&&<><Button disabled={busy} onClick={()=>void action(r.id,"submit")}>Nộp đăng ký</Button>
        {["DECLINED","RETURNED","RECONFIRM_REQUIRED"].includes(r.mentorState)&&<Button variant="outline" onClick={()=>edit(r)}>Sửa đăng ký</Button>}</>}
      {r.mentorId===page.accountId&&r.mentorState==="INVITED"&&<><Button disabled={busy} onClick={()=>void action(r.id,"accept")}>Xác nhận hướng dẫn</Button>
        <label>Lý do phản hồi<Input value={reasons[r.id]??""} onChange={e=>setReasons({...reasons,[r.id]:e.target.value})}/></label>
        <Button variant="outline" disabled={busy} onClick={()=>void action(r.id,"return")}>Yêu cầu sửa</Button><Button variant="outline" disabled={busy} onClick={()=>void action(r.id,"decline")}>Từ chối hướng dẫn</Button></>}</article>)}
    <Button variant="outline" onClick={()=>setRound(r=>r+1)}>Tải lại đăng ký</Button>{message&&<p role="status">{message}</p>}</section>
}
