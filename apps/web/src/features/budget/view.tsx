import { DateInput } from "@rms/ui/components/date-input"
import { Disclosure } from "@rms/ui/components/disclosure"
import { Checkbox } from "@rms/ui/components/checkbox"
import { useEffect,useState } from "react"
import { Button } from "@rms/ui/components/button"
import { Input } from "@rms/ui/components/input"
import type { operations } from "@rms/api-contracts"
import type { SignedInSession } from "../../auth/session"
import { ProjectFile } from "../attachments/ProjectFile"

type Detail=operations["getProjectBudget"]["responses"][200]["content"]["application/json"]
type Entry=Detail["items"][number]
type Result={data?:Detail;error?:{message:string}}
const labels={UNRECONCILED:"Chưa đối soát",MATCHED:"Khớp",MISMATCHED:"Chênh lệch"}
const vnd=(value:string)=>BigInt(value).toLocaleString("vi-VN")+" ₫"
const empty=()=>({id:crypto.randomUUID() as string,amount:"",date:"",description:"",files:[] as string[],revision:0})
export default function Budget({session,id}:{session:SignedInSession;id:string}){
  const [d,setData]=useState<Detail>(),[error,setError]=useState(""),[busy,setBusy]=useState(false),[message,setMessage]=useState("")
  const [allocated,amount]=useState(""),[override,fee]=useState(""),[note,setNote]=useState("")
  const [draft,setDraft]=useState(empty),[voidReason,setVoidReason]=useState("")
  const [actual,setActual]=useState(""),[reference,setReference]=useState(""),[selected,select]=useState(""),[checked,check]=useState(false)
  const [download,setDownload]=useState<{id:string;url:string}>()
  const path={...session.params.path,id},params={path}
  useEffect(()=>{
    const c=new AbortController()
    session.api.GET("/api/tenants/{slug}/projects/{id}/budget",{params:{path:{...session.params.path,id}},signal:c.signal,cache:"no-store"})
      .then(r=>{if(!c.signal.aborted){if(!r.data)throw Error(r.error?.message??"Không thể mở sổ.");setData(r.data);amount(r.data.allocation?.amount??r.data.approvedBudget??"")}})
      .catch(e=>{if(!c.signal.aborted)setError(e.message)})
    return ()=>c.abort()
  },[session,id])
  async function change(fn:()=>Promise<Result>,feedback:string){
    setBusy(true);setError("");setMessage("")
    try{
      const r=await fn()
      if(!r.data)throw Error(r.error?.message??"Không thể cập nhật sổ.")
      setData({...r.data,reconciliationEnabled:d?.reconciliationEnabled});setMessage(feedback);setDraft(empty());select("");setNote("");fee("");setVoidReason("")
    }catch(e){setError(e instanceof Error?e.message:"Không thể kết nối.")}finally{setBusy(false)}
  }
  const editing=d?.items.find(e=>e.id===draft.id),active=d?.status==="IN_PROGRESS",settle=d?.status==="PASSED"
  async function fileLink(fileId:string){
    try{
      const r=await session.api.GET("/api/tenants/{slug}/projects/{projectId}/files/{id}/download",{params:{path:{...session.params.path,projectId:id,id:fileId}},cache:"no-store"})
      if(!r.data)throw Error()
      setDownload({id:fileId,url:r.data.url})
    }catch{setDownload(undefined);setError("Không thể cấp liên kết chứng từ.")}
  }
  function edit(row:Entry){setDraft({...row});setError("");setMessage("")}
  const expenseParams=(expenseId:string)=>({path:{...path,expenseId}})
  return <section className="grid min-w-0 gap-3 rounded border p-3" aria-label="Sổ kinh phí"><h3>Sổ kinh phí</h3>
    {d&&<><h4>{d.title}</h4>{d.approvedBudget&&<p>Quyết định giao · {vnd(d.approvedBudget)}</p>}
      {d.allocation?<><p>Tổng cấp · {vnd(d.allocation.amount)}</p><p>Phí quản lý · {vnd(d.allocation.fee)} · Tỷ lệ {d.allocation.rate}%</p>
        <p>Kinh phí thực hiện · {vnd(d.available)}</p><p>Đã chi · {vnd(d.spent)}</p><strong>Còn lại · {vnd(d.balance)}</strong>
        {BigInt(d.balance)<0n&&<p role="status">Vượt kinh phí {vnd(String(-BigInt(d.balance)))}</p>}
        {d.allocation.settlementMode&&<strong>Đã quyết toán và khóa sổ · {d.allocation.settlementMode==="MANUAL"?"Rà thủ công":"Đã đối soát"}</strong>}
      </>:<p>Chưa xác nhận cấp kinh phí.</p>}
      {active&&d.officer&&d.approvedBudget&&<Disclosure defaultOpen={!d.allocation} title={<> {d.allocation?"Điều chỉnh tổng cấp":"Cấp kinh phí"} </>}>
        <fieldset disabled={busy} className="grid gap-2"><label>Tổng cấp (VND)<Input inputMode="numeric" value={allocated} onChange={e=>amount(e.target.value)}/></label>
        <label>Phí điều chỉnh (nếu có)<Input inputMode="numeric" value={override} onChange={e=>fee(e.target.value)}/></label>
        <label>Lý do điều chỉnh<Input value={note} onChange={e=>setNote(e.target.value)}/></label>
        <Button onClick={()=>change(()=>{
          const body={amount:allocated,override:override.trim()||null,note,revision:d.allocation?.revision}
          return d.allocation?session.api.PUT("/api/tenants/{slug}/projects/{id}/budget/allocation",{params,body}):session.api.POST("/api/tenants/{slug}/projects/{id}/budget/allocation",{params,body})
        },"Đã ghi nhận kinh phí.")}>{d.allocation?"Lưu điều chỉnh":"Xác nhận cấp kinh phí"}</Button></fieldset></Disclosure>}
      {d.items.map(row=><article key={row.id} className="grid gap-1 rounded border p-2"><strong>{row.description} · {vnd(row.amount)}</strong>
        <span>{row.date.split("-").reverse().join("/")} · {labels[row.reconciliation]}</span><span className="break-all">Mã khoản chi · {row.id}</span>
        {row.files.map(f=><div key={f}><Button variant="outline" onClick={()=>fileLink(f)}>{d.files.find(x=>x.id===f)?.filename??"Xem chứng từ"}</Button>
          {download?.id===f&&<a href={download.url} target="_blank" rel="noreferrer">Tải chứng từ</a>}</div>)}
        {active&&d.principal&&<Button variant="outline" onClick={()=>edit(row)}>Sửa khoản chi</Button>}
        {d.officer&&d.reconciliationEnabled&&(active||settle)&&<Button variant="outline" onClick={()=>{select(row.id);setReference(row.reference??"");setActual(row.transferred??"")}}>Đối soát khoản chi</Button>}
        {selected===row.id&&<fieldset disabled={busy} className="grid gap-2"><label>Mã giao dịch<Input value={reference} onChange={e=>setReference(e.target.value)}/></label>
          <label>Số tiền chuyển (VND)<Input value={actual} inputMode="numeric" onChange={e=>setActual(e.target.value)}/></label>
          <Button onClick={()=>change(()=>session.api.POST("/api/tenants/{slug}/projects/{id}/budget/expenses/{expenseId}/reconcile",{params:expenseParams(row.id),body:{amount:actual,reference,revision:row.revision}}),"Đã ghi kết quả đối soát.")}>Lưu đối soát</Button></fieldset>}
      </article>)}
      {active&&d.principal&&d.allocation&&<fieldset disabled={busy} className="grid gap-2"><legend>{editing?"Sửa phiếu chi":"Ghi khoản chi"}</legend>
        <label>Nội dung chi<Input value={draft.description} onChange={e=>setDraft({...draft,description:e.target.value})}/></label>
        <label>Số tiền chi (VND)<Input inputMode="numeric" value={draft.amount} onChange={e=>setDraft({...draft,amount:e.target.value})}/></label>
        <label>Ngày chi<DateInput value={draft.date} onValueChange={next => setDraft({...draft,date:next})}/></label>
        <fieldset><legend>Chứng từ đính kèm</legend>{d.files.map(f=><label className="block" key={f.id}><Checkbox checked={draft.files.includes(f.id)}
          onCheckedChange={checked => setDraft({...draft,files:checked?[...draft.files,f.id]:draft.files.filter(id=>id!==f.id)})}/> {f.filename}</label>)}</fieldset>
        <ProjectFile session={session} project={id} revision={d.projectRevision} onFile={(fileId,filename)=>{setDraft(prev=>({...prev,files:[...prev.files,fileId]}));setData({...d,files:[...d.files,{id:fileId,filename}]})}}/>
        <Button onClick={()=>change(()=>session.api.PUT("/api/tenants/{slug}/projects/{id}/budget/expenses/{expenseId}",{params:expenseParams(draft.id),body:{amount:draft.amount,date:draft.date,description:draft.description,files:draft.files,revision:draft.revision}}),"Đã lưu khoản chi.")}>Lưu khoản chi</Button>
        {editing&&<><label>Lý do hủy khoản chi<Input value={voidReason} onChange={e=>setVoidReason(e.target.value)}/></label>
          <Button variant="outline" onClick={()=>change(()=>session.api.POST("/api/tenants/{slug}/projects/{id}/budget/expenses/{expenseId}/void",{params:expenseParams(draft.id),body:{reason:voidReason,revision:draft.revision}}),"Đã hủy khoản chi.")}>Hủy khoản chi</Button>
          <Button variant="outline" onClick={()=>setDraft(empty())}>Quay về tạo khoản mới</Button></>}
      </fieldset>}
      {settle&&d.officer&&d.allocation&&<fieldset disabled={busy} className="grid gap-2"><legend>Quyết toán</legend>
        {d.reconciliationEnabled?<p>Các khoản chi phải có kết quả Khớp.</p>:<label><Checkbox checked={checked} onCheckedChange={check}/> Đã rà soát thủ công</label>}
        <Button onClick={()=>change(()=>session.api.POST("/api/tenants/{slug}/projects/{id}/budget/settle",{params,body:{manualReviewed:checked}}),"Đã quyết toán và khóa sổ.")}>Quyết toán và đóng đề tài</Button></fieldset>}
    </>}{error&&<p role="alert" className="break-words">{error}</p>}{message&&<p role="status">{message}</p>}
  </section>
}
