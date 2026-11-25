import {ProductCreditApproval,useProductHours} from "./ProductCreditApproval"
import { useEffect,useState } from "react"
import { Button } from "@rms/ui/components/button"
import { Input } from "@rms/ui/components/input"
import {useProductTypes} from "./useProductTypes"
import type { operations } from "@rms/api-contracts"
import type { SignedInSession } from "../../auth/session"
import { ProjectFile } from "../attachments/ProjectFile"

type Page=operations["listProjectProducts"]["responses"][200]["content"]["application/json"]
type Draft=operations["saveProduct"]["requestBody"]["content"]["application/json"]
type Result={data?:Page;error?:{message:string}}
const initial=(actor:string,kind:string)=>({id:crypto.randomUUID() as string,title:"",kind,year:new Date().getFullYear(),authors:[actor],publication:"",files:[] as string[],revision:0})
const status={DRAFT:"Nháp",PENDING_APPROVAL:"Chờ duyệt",APPROVED:"Đã duyệt",REJECTED:"Bị từ chối"}
export default function Products({session,id}:{session:SignedInSession;id:string}){
  const [page,setPage]=useState<Page>(),[me,setMe]=useState(""),[draft,setDraft]=useState<(Draft&{id:string})>()
  const [reason,setReason]=useState(""),[distinct,setDistinct]=useState(false),[error,setError]=useState(""),[busy,setBusy]=useState(false)
  const path={...session.params.path,id}
  useEffect(()=>{
    const c=new AbortController()
    Promise.all([session.current(),session.api.GET("/api/tenants/{slug}/projects/{id}/products",{params:{path:{...session.params.path,id}},cache:"no-store",signal:c.signal})])
      .then(([actor,r])=>{if(!c.signal.aborted){if(!r.data)throw Error("Không thể mở sản phẩm của đề tài.");setPage(r.data);setMe(actor.id)}})
      .catch(e=>{if(!c.signal.aborted)setError(e.message)})
    return ()=>c.abort()
  },[id,session])
  async function run(fn:()=>Promise<Result>){
    setBusy(true);setError("")
    try{const r=await fn();if(!r.data)throw Error(r.error?.message??"Không thể cập nhật sản phẩm.")
      setPage(r.data);setDraft(undefined);setReason("");setDistinct(false)
    }catch(e){reloadTypes();setError(e instanceof Error?e.message:"Không thể kết nối.")}finally{setBusy(false)}
  }
  const hoursEnabled=useProductHours(session)
  const product=(productId:string)=>({path:{...path,productId}})
  const change=<K extends keyof Draft>(key:K,value:Draft[K])=>{if(draft)setDraft({...draft,[key]:value})}
  const {choices,label:name,error:catalogError,reload:reloadTypes}=useProductTypes(session)
  const live=page&&!["COMPLETED","CANCELLED","REJECTED"].includes(page.status)
  return <section className="grid min-w-0 gap-3 rounded border p-3" aria-label="Sản phẩm đề tài"><h3>Sản phẩm đề tài</h3>
    {catalogError&&<p role="alert">{catalogError}</p>}{choices?.length===0&&<p>Trường chưa bật loại sản phẩm nào.</p>}
    {page&&<><h4>{page.title}</h4>
      {page.commitments.map(c=><p key={c.kind}>{name(c.kind)} · Đã duyệt {c.approved}/{c.required} · Còn thiếu {c.missing}</p>)}
      {live&&<Button variant="outline" disabled={!choices?.length} onClick={()=>setDraft(initial(me,choices?.[0]?.code??""))}>Kê khai sản phẩm</Button>}
      {draft&&<fieldset disabled={busy} className="grid gap-2"><legend>Bản kê khai</legend>
        <label>Tên sản phẩm<Input value={draft.title} onChange={e=>change("title",e.target.value)}/></label>
        <label>Loại sản phẩm <select value={draft.kind} onChange={e=>change("kind",e.target.value)}>{!choices?.some(t=>t.code===draft.kind)&&<option value={draft.kind} disabled>{name(draft.kind)} · Đã ngừng dùng</option>}{choices?.map(t=><option key={t.code} value={t.code}>{t.label}</option>)}</select></label>
        <label>Năm công bố<Input type="number" value={draft.year??""} onChange={e=>change("year",e.target.value?Number(e.target.value):null)}/></label>
        <label>Thông tin công bố<Input value={draft.publication} onChange={e=>change("publication",e.target.value)}/></label>
        <fieldset><legend>Tác giả</legend>{page.authors.map(a=><label className="block" key={a.id}><input type="checkbox" checked={draft.authors.includes(a.id)}
          onChange={e=>change("authors",e.target.checked?[...draft.authors,a.id]:draft.authors.filter(k=>k!==a.id))}/> {a.label}</label>)}</fieldset>
        <fieldset><legend>Minh chứng</legend>{page.files.map(f=><label className="block" key={f.id}><input type="checkbox" checked={draft.files.includes(f.id)}
          onChange={e=>change("files",e.target.checked?[...draft.files,f.id]:draft.files.filter(k=>k!==f.id))}/> {f.label}</label>)}</fieldset>
        <ProjectFile session={session} project={id} revision={page.revision} onFile={(fileId,label)=>{setPage({...page,files:[...page.files,{id:fileId,label}]});change("files",[...draft.files,fileId])}}/>
        <Button onClick={()=>run(()=>session.api.PUT("/api/tenants/{slug}/projects/{id}/products/{productId}",{params:product(draft.id),body:{title:draft.title,kind:draft.kind,year:draft.year,publication:draft.publication,authors:draft.authors,files:draft.files,revision:draft.revision}}))}>Lưu nháp sản phẩm</Button>
      </fieldset>}
      {live&&<label>Lý do từ chối, mở lại hoặc thu quyền<Input value={reason} onChange={e=>setReason(e.target.value)}/></label>}
      {live&&page.canReview&&page.files.length>0&&<details><summary>Quyền sử dụng minh chứng sản phẩm</summary>{page.files.map(f=><Button variant="outline" key={f.id} disabled={busy||!reason.trim()}
        onClick={()=>run(()=>session.api.POST("/api/tenants/{slug}/projects/{id}/products/files/{fileId}/revoke",{params:{path:{...path,fileId:f.id}},body:{reason}}))}>Thu quyền · {f.label}</Button>)}</details>}
      {page.items.map(o=><article key={o.id} className="grid gap-2 rounded border p-2"><strong>{o.title}</strong><p>{name(o.kind)} · {o.year??"Chưa nhập năm"} · {status[o.status]}</p>
        {o.publication&&<p>{o.publication}</p>}{o.reason&&<p>Căn cứ xử lý · {o.reason}</p>}
        {live&&["DRAFT","REJECTED"].includes(o.status)&&(page.canReview||page.principal||o.ownerId===me||o.authors.includes(me))&&<>
          <Button variant="outline" onClick={()=>setDraft({...o,files:o.files.filter(k=>page.files.some(f=>f.id===k))})}>Sửa bản kê khai</Button>
          {o.status==="DRAFT"&&<><label><input type="checkbox" checked={distinct} onChange={e=>setDistinct(e.target.checked)}/> Đã kiểm tra và xác nhận khác sản phẩm trùng thông tin</label>
            <Button disabled={busy} onClick={()=>run(()=>session.api.POST("/api/tenants/{slug}/projects/{id}/products/{productId}/submit",{params:product(o.id),body:{revision:o.revision,distinct}}))}>Gửi duyệt sản phẩm</Button></>}</>}
        {live&&page.canReview&&!page.principal&&o.ownerId!==me&&!o.authors.includes(me)&&["PENDING_APPROVAL","APPROVED"].includes(o.status)&&<>
          {o.status==="PENDING_APPROVAL"&&<ProductCreditApproval key={o.revision} enabled={hoursEnabled} busy={busy}
            authors={o.authors.map(id=>({id,label:page.authors.find(a=>a.id===id)?.label??id}))}
            approve={credits=>void run(()=>session.api.POST("/api/tenants/{slug}/projects/{id}/products/{productId}/decision",{params:product(o.id),body:{action:"approve",reason,revision:o.revision,credits}}))}/>}
          <Button disabled={busy||!reason.trim()} variant="outline"
            onClick={()=>void run(()=>session.api.POST("/api/tenants/{slug}/projects/{id}/products/{productId}/decision",{params:product(o.id),body:{action:o.status==="APPROVED"?"reopen":"reject",reason,revision:o.revision}}))}>
            {o.status==="APPROVED"?"Mở lại bản kê khai":"Từ chối sản phẩm"}</Button></>}
      </article>)}
    </>}{error&&<p role="alert">{error}</p>}
  </section>
}
