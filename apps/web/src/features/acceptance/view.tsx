import { DateInput } from "@rms/ui/components/date-input"
import { Disclosure } from "@rms/ui/components/disclosure"
import { Textarea } from "@rms/ui/components/textarea"
import { ChoiceOption, ChoiceSelect } from "@rms/ui/components/choice-select"
import {MeetingMinutes} from "../review/meetings/view"
import {RoundAmendment} from "../review/amendment"
import { useEffect,useState } from "react"
import { Button } from "@rms/ui/components/button"
import { Input } from "@rms/ui/components/input"
import type { operations } from "@rms/api-contracts"
import {useProductTypes} from "../product/useProductTypes"
import type { SignedInSession } from "../../auth/session"
import ScoreSheet from "../review/submit-score/view"
import { ProjectFile } from "../attachments/ProjectFile"
type Detail=operations["getAcceptance"]["responses"][200]["content"]["application/json"]
type Queue=operations["getAcceptanceQueue"]["responses"][200]["content"]["application/json"]
type Seat=operations["createAcceptanceCommittee"]["requestBody"]["content"]["application/json"]["seats"][number]
const states:Record<string,string>={PENDING_ACCEPTANCE:"Chờ nghiệm thu",UNDER_ACCEPTANCE:"Đang nghiệm thu",IN_PROGRESS:"Đang thực hiện",PASSED:"Đạt",FAILED:"Không đạt",COMPLETED:"Đã đóng"}
export function AcceptanceQueue({session}:{session:SignedInSession}){
  const [rows,setRows]=useState<Queue>(),[error,setError]=useState("")
  useEffect(()=>{const c=new AbortController()
    session.api.GET("/api/tenants/{slug}/acceptance/queue",{params:session.params,cache:"no-store",signal:c.signal}).then(r=>{
      if(!c.signal.aborted){if(!r.data)throw Error("Không thể mở hàng chờ.");setRows(r.data)}
    }).catch(e=>{if(!c.signal.aborted)setError(e.message)})
    return ()=>c.abort()
  },[session])
  return <section aria-label="Phiếu nghiệm thu" className="grid gap-2"><MeetingMinutes session={session} kind="ACCEPTANCE"/><h3>Phiếu nghiệm thu được phân công</h3>
    {rows?.map(r=><ScoreSheet key={r.id} session={session} assignment={r} acceptance onAccessLost={scope=>{
      setRows(current=>scope==="session"?[]:current?.filter(row=>row.id!==r.id))
      setError("Phiếu không còn trong phạm vi hiện tại.")
    }}/>)}{rows?.length===0&&<p>Chưa có phiếu nghiệm thu.</p>}{error&&<p role="alert">{error}</p>}</section>
}
export function Acceptance({session,id}:{session:SignedInSession;id:string}){
  const {label:productTypeLabel}=useProductTypes(session)
  const [d,setData]=useState<Detail>(),[reload,refresh]=useState(0),[busy,setBusy]=useState(false),[error,setError]=useState("")
  const [summary,setSummary]=useState(""),[file,setFile]=useState(""),[name,setName]=useState(""),[seats,setSeats]=useState<Seat[]>([])
  const [committee,setCommittee]=useState(""),[criteria,setCriteria]=useState(""),[message,setMessage]=useState("")
  const [reason,setReason]=useState(""),[deadline,setDeadline]=useState("")
  useEffect(()=>{const c=new AbortController()
    session.api.GET("/api/tenants/{slug}/projects/{id}/acceptance",{params:{path:{...session.params.path,id}},cache:"no-store",signal:c.signal}).then(r=>{
      if(!c.signal.aborted){if(!r.data)throw Error("Không thể mở hồ sơ nghiệm thu.");setData(r.data)}
    }).catch(e=>{if(!c.signal.aborted){setData(undefined);setError(e.message)}})
    return ()=>c.abort()
  },[session,id,reload])
  const path={...session.params.path,id},params={path}
  async function run(fn:()=>Promise<{data?:unknown;error?:{message:string}}>,feedback:string){
    setBusy(true);setError("");setMessage("")
    try{const r=await fn();if(!r.data)throw Error(r.error?.message??"Không thể cập nhật.");setMessage(feedback);refresh(n=>n+1)}
    catch(e){setError(e instanceof Error?e.message:"Không thể kết nối.")}finally{setBusy(false)}
  }
  return <section aria-label="Nghiệm thu đề tài" className="grid gap-3 rounded border p-3"><h3>Nghiệm thu đề tài</h3>
    {d&&<><strong>{d.title} · {states[d.status]??d.status}</strong>
      {d.finalPeriod&&<p>Kỳ cuối · Kỳ {d.finalPeriod.period} · {d.finalPeriod.status==="PASSED"?"Đạt":"Chưa đạt"}</p>}
      {d.commitments.map(c=><p key={c.kind}>{productTypeLabel(c.kind)} · Đã duyệt {c.approved}/{c.required} · Còn thiếu {c.missing}</p>)}
      {d.summary&&<p>Hồ sơ lần {d.attempt} · {d.summary}</p>}
      {d.principal&&d.status==="IN_PROGRESS"&&<fieldset disabled={busy} className="grid gap-2"><legend>Đăng ký nghiệm thu</legend>
        <label>Tóm tắt hồ sơ cuối<Textarea className="block w-full rounded border" value={summary} onChange={e=>setSummary(e.target.value)}/></label>
        <label>Tệp hồ sơ cuối <ChoiceSelect value={file} onValueChange={setFile}><ChoiceOption value="">Chọn tệp đã xác nhận</ChoiceOption>{d.files.map(f=><ChoiceOption key={f.id} value={f.id}>{f.label}</ChoiceOption>)}</ChoiceSelect></label>
        <ProjectFile session={session} project={id} revision={d.revision} onFile={f=>{setFile(f);refresh(n=>n+1)}}/>
        <Button onClick={()=>run(()=>session.api.POST("/api/tenants/{slug}/projects/{id}/acceptance",{params,body:{summary,fileId:file}}),"Đã nộp hồ sơ nghiệm thu.")}>Nộp hồ sơ nghiệm thu</Button></fieldset>}
      {d.officer&&d.status==="PENDING_ACCEPTANCE"&&<fieldset disabled={busy} className="grid gap-2"><legend>Hội đồng nghiệm thu</legend>
        <Disclosure title={<> Lập hội đồng nghiệm thu </>}><label>Tên hội đồng nghiệm thu<Input value={name} onChange={e=>setName(e.target.value)}/></label>
          {d.accounts.map(a=><label key={a.id} className="block">{a.label} <ChoiceSelect aria-label={"Vai trò nghiệm thu "+a.label} value={seats.find(s=>s.accountId===a.id)?.role??""}
            onValueChange={choiceValue => setSeats([...seats.filter(s=>s.accountId!==a.id),...(choiceValue?[{accountId:a.id,role:choiceValue as Seat["role"]}]:[])])}>
            <ChoiceOption value="">Chọn chức danh</ChoiceOption><ChoiceOption value="CHAIR">Chủ tịch</ChoiceOption><ChoiceOption value="REVIEWER">Phản biện</ChoiceOption><ChoiceOption value="SECRETARY">Thư ký</ChoiceOption><ChoiceOption value="MEMBER">Ủy viên</ChoiceOption></ChoiceSelect></label>)}
          <Button disabled={!name.trim()||!seats.length} onClick={()=>run(async()=>{
            const r=await session.api.POST("/api/tenants/{slug}/acceptance/committees",{params:session.params,body:{name,seats}});if(r.data)setCommittee(r.data.id);return r
          },"Đã lập hội đồng.")}>Lưu hội đồng nghiệm thu</Button></Disclosure>
        <label>Chọn hội đồng <ChoiceSelect value={committee} onValueChange={setCommittee}><ChoiceOption value="">Chọn</ChoiceOption>{d.committees.map(o=><ChoiceOption key={o.id} value={o.id}>{o.label}</ChoiceOption>)}</ChoiceSelect></label>
        <label>Tiêu chí nghiệm thu <ChoiceSelect value={criteria} onValueChange={setCriteria}><ChoiceOption value="">Chọn</ChoiceOption>{d.criteria.map(o=><ChoiceOption key={o.id} value={o.id}>{o.label}</ChoiceOption>)}</ChoiceSelect></label>
        <Button disabled={!committee||!criteria} onClick={()=>run(()=>session.api.POST("/api/tenants/{slug}/projects/{id}/acceptance/rounds",{params,body:{committeeId:committee,criteriaId:criteria}}),"Đã mở đợt nghiệm thu.")}>Mở đợt nghiệm thu</Button></fieldset>}
      {d.officer&&d.status==="UNDER_ACCEPTANCE"&&d.roundId&&<Button disabled={busy} onClick={()=>run(()=>session.api.POST("/api/tenants/{slug}/acceptance/rounds/{id}/conclusion",
        {params:{path:{...session.params.path,id:d.roundId!}},body:{revision:d.decisionRevision}}),"Đã chốt kết luận nghiệm thu.")}>Chốt kết luận nghiệm thu</Button>}
      {d.conclusion&&<strong>Kết luận nghiệm thu · {states[d.conclusion]}</strong>}
      {d.officer&&d.roundId&&<RoundAmendment key={d.roundId} session={session} id={d.roundId} status={d.status} onChanged={async()=>{setMessage("");refresh(n=>n+1)}}/>}
      {d.officer&&d.status==="FAILED"&&<fieldset disabled={busy} className="grid gap-2"><legend>Cho làm lại</legend><label>Lý do<Input value={reason} onChange={e=>setReason(e.target.value)}/></label>
        <label>Hạn làm lại<DateInput value={deadline} onValueChange={setDeadline}/></label>
        <Button onClick={()=>run(()=>session.api.POST("/api/tenants/{slug}/projects/{id}/acceptance/redo",{params,body:{reason,deadline}}),"Đã tạo kỳ làm lại.")}>Cho làm lại theo thời hạn</Button></fieldset>}
    </>}{error&&<p role="alert">{error}</p>}{message&&<p role="status">{message}</p>}</section>
}
