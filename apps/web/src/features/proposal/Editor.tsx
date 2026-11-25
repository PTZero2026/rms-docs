import { formatVietnamDate } from "../../format-date"
import {Suggestions} from "../assistant/Suggestions"
import { useCallback,useEffect,useState } from "react"
import type { operations } from "@rms/api-contracts"
import { CommitmentFields } from "../progress/CommitmentFields"
import { OwnerResult } from "../review/review-decision/view"
import { Button } from "@rms/ui/components/button"
import { Input } from "@rms/ui/components/input"
import type { SignedInSession } from "../../auth/session"

type Call=operations["getCall"]["responses"][200]["content"]["application/json"]
type Proposal=operations["getProposal"]["responses"][200]["content"]["application/json"]
type Draft=operations["createDraftProposal"]["requestBody"]["content"]["application/json"]
const empty:Draft={title:"",fieldId:null,months:null,budget:null,document:{},memberIds:[]}
const label:Record<string,string>={DRAFT:"Nháp",SUBMITTED:"Đã nộp",UNDER_REVIEW:"Đang xét duyệt",APPROVED:"Đã duyệt",CANCELLED:"Đã hủy"}
function copy(p:Proposal):Draft {
  return {commitments:p.commitments??{},title:p.title,fieldId:p.fieldId,months:p.months,budget:p.budget,document:p.document,memberIds:p.memberIds,revision:p.revision}
}
export default function ProposalEditor({session,call,id}:{session:SignedInSession;call?:Call;id?:string}) {
  const [record,setRecord]=useState<Proposal>(),[draft,setDraft]=useState<Draft>(empty)
  const [message,setMessage]=useState(""),[busy,setBusy]=useState(false),[reason,setReason]=useState("")
  const [member,setMember]=useState("")
  const [elapsedCutoff,setElapsedCutoff]=useState<string>()
  const cutoff=record?.submitUntil
  useEffect(()=>{
    if(!cutoff)return
    const scheduledCutoff=cutoff
    const end=Date.parse(scheduledCutoff)
    function checkDeadline(){
      const remaining=end-Date.now()
      if(remaining<=0)setElapsedCutoff(scheduledCutoff)
      else timer=window.setTimeout(checkDeadline,Math.min(remaining,2147483647))
    }
    let timer=window.setTimeout(checkDeadline,0)
    return ()=>window.clearTimeout(timer)
  },[cutoff])
  const receiving=!!cutoff&&cutoff!==elapsedCutoff
  const path=session.params.path
  const accept=useCallback((p:Proposal)=>{setRecord(p);setDraft(copy(p));setReason("")},[])
  useEffect(()=>{
    if(!id)return
    const ctrl=new AbortController()
    session.api.GET("/api/tenants/{slug}/projects/{id}/proposal",{params:{path:{...path,id}},cache:"no-store",signal:ctrl.signal})
      .then(({data})=>{if(!ctrl.signal.aborted){if(data)accept(data);else{setRecord(undefined);setMessage("Không thể mở thuyết minh trong phạm vi hiện tại.")}}})
      .catch(()=>{if(!ctrl.signal.aborted)setMessage("Không thể kết nối.")})
    return()=>ctrl.abort()
  },[session,path,id,accept])
  async function save(action:"draft"|"submit"|"return"|"cancel",actionReason=reason) {
    if(busy)return
    if(action==="submit" && (!cutoff||Date.now()>=Date.parse(cutoff))){
      setElapsedCutoff(cutoff??undefined)
      return
    }
    setBusy(true);setMessage("")
    try{
      const current=record?.id??id
      const item={params:{path:{...path,id:current??call!.id}}}
      const result=action==="draft"?(current?await session.api.PUT("/api/tenants/{slug}/projects/{id}/proposal",{...item,body:draft}):
        await session.api.POST("/api/tenants/{slug}/calls/{id}/proposals",{...item,body:draft})):
        await session.api.POST("/api/tenants/{slug}/projects/{id}/proposal/actions",{...item,body:{action,revision:record!.revision,reason:actionReason}})
      if(!result.data){
        if([401,403,404].includes(result.response.status)){
          setRecord(undefined);setDraft(empty);setReason("")
        }else if((action==="submit"||action==="cancel")&&result.response.status===409&&current){
          // Another session can close the call or advance this proposal.
          const latest=await session.api.GET("/api/tenants/{slug}/projects/{id}/proposal",{params:item.params,cache:"no-store"})
          if(latest.data)accept(latest.data)
          else if([401,403,404].includes(latest.response.status)){
            setRecord(undefined);setDraft(empty)
          }
        }
        throw Error(result.error?.message??"Không thể lưu hồ sơ.")
      }
      accept(result.data);setMessage({draft:"Đã lưu nháp.",submit:"Đã tiếp nhận đề xuất.",return:"Đã trả hồ sơ cho chủ nhiệm.",cancel:"Đã hủy đề xuất."}[action])
    }catch(e){setMessage(e instanceof Error?e.message:"Không thể kết nối.")}finally{setBusy(false)}
  }
  const editable=record?record.canEdit:!id
  const dirty=!!record && JSON.stringify(copy(record))!==JSON.stringify(draft)
  const fields=record?.fields??call?.formFields??[],options=record?.fieldOptions??call?.fieldOptions??[]
  if(id&&!record)return <p role="status">{message||"Đang tải thuyết minh…"}</p>
  return <section className="grid min-w-0 gap-3 rounded border p-4"><h3>Thuyết minh đề xuất</h3>
    {record&&["DRAFT","RETURNED"].includes(record.semantic)&&<Suggestions key={record.id+"-"+record.revision} session={session} id={record.id} kind="proposal"/>}
    {record && <><p>{label[record.semantic]??record.semantic} · Quy trình v{record.templateVersion}</p>
      <p className="break-all">{record.projectCode?"Mã đề tài "+record.projectCode:"Chưa cấp mã đề tài"}</p>
      {record.submittedAt && <p>Tiếp nhận {formatVietnamDate(record.submittedAt, "second")}</p>}
      {record.reason && <p>{record.semantic==="CANCELLED"?"Lý do hủy":"Lý do trả hồ sơ"} · {record.reason}</p>}
      <p>{record.members.filter(m=>m.principal).map(m=>"Chủ nhiệm "+m.email)}</p></>}
    {record&&["UNDER_REVIEW","APPROVED","REJECTED"].includes(record.semantic)&&<OwnerResult session={session} id={record.id}/>}
    <fieldset className="grid gap-3" disabled={!editable||busy}>
      <label>Tên đề xuất<Input value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})}/></label>
      <label>Lĩnh vực đề tài <select value={draft.fieldId??""} onChange={e=>setDraft({...draft,fieldId:e.target.value||null})}>
        <option value="">Chọn lĩnh vực</option>{options.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></label>
      <label>Thời gian thực hiện (tháng)<Input type="number" min={1} step={1} value={draft.months??""} onChange={e=>setDraft({...draft,months:e.target.value===""?null:Number(e.target.value)})}/></label>
      <label>Kinh phí đề xuất (VND)<Input type="number" min={0} step={1} value={draft.budget??""} onChange={e=>setDraft({...draft,budget:e.target.value===""?null:Number(e.target.value)})}/></label>
      {fields.map(f=><label key={f.key}>{f.label}{f.required?" (cần khi nộp)":""}
        <textarea className="block w-full rounded border p-2" value={draft.document[f.key]??""} onChange={e=>setDraft({...draft,document:{...draft.document,[f.key]:e.target.value}})}/></label>)}
      <CommitmentFields session={session} value={draft.commitments??{}} onChange={v=>setDraft({...draft,commitments:v})}/>
      <fieldset><legend>Thành viên bổ sung</legend>{draft.memberIds.map(id=><div key={id}>{record?.members.find(m=>m.id===id)?.email??id} {editable&&<Button variant="outline" onClick={()=>setDraft({...draft,memberIds:draft.memberIds.filter(x=>x!==id)})}>Bỏ thành viên</Button>}</div>)}
        {editable && <div className="flex flex-wrap items-end gap-2"><label>Mã tài khoản thành viên<Input value={member} onChange={e=>setMember(e.target.value)}/></label>
        <Button variant="outline" disabled={!member.trim()} onClick={()=>{if(draft.memberIds.includes(member.trim())||record?.members.some(m=>m.principal&&m.id===member.trim())){setMessage("Thành viên đã có trong hồ sơ.");return}setDraft({...draft,memberIds:[...draft.memberIds,member.trim()]});setMember("")}}>Thêm thành viên</Button></div>}</fieldset>
    </fieldset>
    <div className="flex flex-wrap gap-2">{editable&&<Button disabled={busy||!draft.title.trim()} onClick={()=>void save("draft")}>Lưu nháp đề xuất</Button>}
      {record?.canEdit&&<Button disabled={busy||dirty||!receiving} onClick={()=>void save("submit")}>Nộp đề xuất</Button>}</div>
    {record?.canEdit&&!receiving&&<p>Kỳ hiện không nhận đề xuất.</p>}
    {record?.canReturn&&<fieldset disabled={busy} className="grid gap-2"><label>Lý do cần bổ sung<textarea className="block w-full rounded border p-2" value={reason} onChange={e=>setReason(e.target.value)}/></label>
      <Button className="justify-self-start" onClick={()=>void save("return")}>Trả hồ sơ bổ sung</Button></fieldset>}
    {record?.canCancel&&<CancelProposal key={"cancel-"+record.id+"-"+record.revision} busy={busy} dirty={dirty} onConfirm={value=>void save("cancel",value)}/>}
    <p role="status">{message}</p></section>
}

function CancelProposal({busy,dirty,onConfirm}:{busy:boolean;dirty:boolean;onConfirm:(reason:string)=>void}){
  const [value,setValue]=useState("")
  return <details><summary className="w-fit cursor-pointer">Hủy đề xuất</summary>
    <fieldset disabled={busy} className="mt-2 grid gap-2">
      <label>Lý do hủy đề xuất<textarea maxLength={4000} value={value}
        className="block w-full rounded border p-2" onChange={e=>setValue(e.target.value)}/></label>
      <p>{dirty?"Hệ thống sẽ hủy phiên bản đã lưu. Các chỉnh sửa chưa lưu sẽ bị bỏ.":"Hồ sơ đã hủy vẫn lưu để tra cứu."}</p>
      <Button variant="destructive" className="justify-self-start" disabled={!value.replace(/[\p{Z}\p{C}]/gu,"")}
        onClick={()=>onConfirm(value)}>Xác nhận hủy đề xuất</Button>
    </fieldset></details>
}
