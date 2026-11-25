import { ChoiceOption, ChoiceSelect } from "@rms/ui/components/choice-select"
import { Checkbox } from "@rms/ui/components/checkbox"
import {ProductCreditApproval,useProductHours} from "./ProductCreditApproval"
import {useEffect,useState} from "react"
import type {operations} from "@rms/api-contracts"
import {Button} from "@rms/ui/components/button"
import {Input} from "@rms/ui/components/input"
import type {SignedInSession} from "../../auth/session"
import {ProjectFile} from "../attachments/ProjectFile"
import {useProductTypes} from "./useProductTypes"

type Page=operations["listIndependentProducts"]["responses"][200]["content"]["application/json"]
type Item=Page["items"][number]
type Draft=operations["saveIndependentProduct"]["requestBody"]["content"]["application/json"]
type Action="submit"|"approve"|"reject"|"reopen"
const stages={DRAFT:"Nháp",PENDING_APPROVAL:"Chờ duyệt",APPROVED:"Đã duyệt",REJECTED:"Bị từ chối"}

export function IndependentProducts({session}:{session:SignedInSession}){
  const [page,setPage]=useState<Page>(),[round,reload]=useState(0),[editor,setEditor]=useState<(Draft&{id:string})>()
  const [busy,setBusy]=useState(false),[error,setError]=useState(""),[distinct,setDistinct]=useState<Record<string,boolean>>({})
  const [reasons,setReasons]=useState<Record<string,string>>({})
  const [email,setEmail]=useState(""),[extra,setExtra]=useState<Page["authors"]>([])
  const types=useProductTypes(session),hoursEnabled=useProductHours(session)
  useEffect(()=>{
    const c=new AbortController()
    session.api.GET("/api/tenants/{slug}/independent-products",{params:session.params,signal:c.signal,cache:"no-store"}).then(r=>{
      if(c.signal.aborted)return
      if(!r.data)throw Error(r.error?.message??"Chưa đọc được danh sách sản phẩm.")
      setPage(r.data)
    }).catch(e=>{if(!c.signal.aborted)setError(e.message)})
    return ()=>c.abort()
  },[session,round])
  const selected=page?.items.find(row=>row.id===editor?.id)
  const options=new Map((page?.authors??[]).map(person=>[person.id,person.label]))
  for(const person of extra)options.set(person.id,person.label)
  selected?.authors.forEach((id,i)=>options.set(id,selected.authorLabels[i]))
  async function addAuthor(){
    if(busy)return
    setBusy(true);setError("")
    try{
      const {data,error}=await session.api.POST("/api/tenants/{slug}/independent-products/author-lookup",{params:session.params,body:{email}})
      if(!data)throw Error(error?.message??"Chưa tìm thấy tác giả.")
      setExtra(v=>[...v.filter(p=>p.id!==data.id),data]);setEmail("")
      setEditor(v=>v&&({...v,authors:[...new Set([...v.authors,data.id])]}))
    }catch(e){setError(e instanceof Error?e.message:"Không thể kết nối.")}finally{setBusy(false)}
  }
  function edit(row?:Item){
    if(!page)return
    setError("");setEmail("");setExtra([])
    setEditor(row?{id:row.id,title:row.title,publication:row.publication,year:row.year,kind:row.kind,
      authors:row.authors,files:row.files,revision:row.revision}:{id:crypto.randomUUID(),title:"",publication:"",
      year:new Date().getFullYear(),kind:types.choices?.[0]?.code??"",authors:page.defaultAuthorId?[page.defaultAuthorId]:[],files:[],revision:0})
  }
  function change<K extends keyof Draft>(key:K,value:Draft[K]){setEditor(v=>v&&({...v,[key]:value}))}
  async function save(){
    if(!editor||busy)return
    setBusy(true);setError("")
    try{
      const {id,...body}=editor
      const r=await session.api.PUT("/api/tenants/{slug}/independent-products/{id}",{params:{path:{...session.params.path,id}},body})
      if(!r.data)throw Error(r.error?.message??"Chưa lưu được bản kê khai.")
      setEditor(undefined);reload(n=>n+1)
    }catch(e){setError(e instanceof Error?e.message:"Không thể kết nối.")}finally{setBusy(false)}
  }
  async function act(row:Item,action:Action,credits?:operations["decideIndependentProduct"]["requestBody"]["content"]["application/json"]["credits"]){
    if(busy)return
    setBusy(true);setError("")
    try{
      const params={path:{...session.params.path,id:row.id}}
      const r=action==="submit"?await session.api.POST("/api/tenants/{slug}/independent-products/{id}/submit",{params,body:{revision:row.revision,distinct:!!distinct[row.id]}}):
        await session.api.POST("/api/tenants/{slug}/independent-products/{id}/decision",{params,body:{action,revision:row.revision,reason:reasons[row.id]??"",credits}})
      if(!r.data)throw Error(r.error?.message??"Chưa lưu được quyết định.")
      setReasons(v=>({...v,[row.id]:""}));setDistinct(v=>({...v,[row.id]:false}));reload(n=>n+1)
    }catch(e){types.reload();setError(e instanceof Error?e.message:"Không thể kết nối.")}finally{setBusy(false)}
  }
  async function download(id:string,fileId:string){
    try{
      const r=await session.api.GET("/api/tenants/{slug}/extensions/{module}/{id}/files/{fileId}/download",{params:{path:{...session.params.path,module:"product",id,fileId}},cache:"no-store"})
      if(!r.data)throw Error(r.error?.message??"Chưa tải được minh chứng.")
      const link=document.createElement("a");link.href=r.data.url;link.referrerPolicy="no-referrer";link.click()
    }catch(e){setError(e instanceof Error?e.message:"Không thể kết nối.")}
  }
  return <section aria-label="Sản phẩm ngoài đề tài" className="grid max-w-3xl gap-3 rounded border p-4">
    <h2>Sản phẩm ngoài đề tài</h2>
    {page?.canCreate&&!editor&&<Button variant="outline" disabled={!types.choices?.length} onClick={()=>edit()}>Kê khai sản phẩm độc lập</Button>}
    {editor&&page&&<fieldset className="grid gap-2 rounded border p-3" disabled={busy}><legend>Bản kê khai ngoài đề tài</legend>
      <label>Tên sản phẩm<Input value={editor.title} onChange={e=>change("title",e.target.value)}/></label>
      <label>Loại sản phẩm<ChoiceSelect value={editor.kind} onValueChange={choiceValue => change("kind",choiceValue)}>
        {!types.choices?.some(t=>t.code===editor.kind)&&<ChoiceOption disabled value={editor.kind}>{types.label(editor.kind)} · Đã ngừng dùng</ChoiceOption>}
        {types.choices?.map(t=><ChoiceOption key={t.code} value={t.code}>{t.label}</ChoiceOption>)}</ChoiceSelect></label>
      <label>Năm công bố<Input type="number" value={editor.year??""} onChange={e=>change("year",e.target.value?Number(e.target.value):null)}/></label>
      <label>Thông tin công bố<Input value={editor.publication} onChange={e=>change("publication",e.target.value)}/></label>
      <fieldset><legend>Tác giả</legend>{Array.from(options,([id,label])=><label className="block" key={id}><Checkbox checked={editor.authors.includes(id)}
        onCheckedChange={checked => change("authors",checked?[...editor.authors,id]:editor.authors.filter(other=>other!==id))}/> {label}</label>)}</fieldset>
      <label>Email đồng tác giả khác khoa<Input type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>
      <Button type="button" variant="outline" disabled={!email.trim()} onClick={()=>void addAuthor()}>Thêm đồng tác giả theo email</Button>
      {!page.defaultAuthorId&&<p>Tác giả đứng tên · {options.get(selected?.ownerId??editor.authors[0])??"Chọn tác giả đầu tiên trong đơn vị phụ trách"}</p>}
      {selected?<><fieldset><legend>Minh chứng dùng cho bản kê khai</legend>{selected.attachments.map(f=><label key={f.id} className="block">
        <Checkbox checked={editor.files.includes(f.id)} onCheckedChange={checked => change("files",checked?[...editor.files,f.id]:editor.files.filter(id=>id!==f.id))}/> {f.label}</label>)}</fieldset>
        {selected.status==="REJECTED"&&<p>Lưu bản sửa thành nháp rồi mở lại để tải minh chứng mới.</p>}
        {selected.status==="DRAFT"&&<ProjectFile session={session} project={selected.id} revision={selected.revision} extension={{module:"product",evidenceType:"OUTPUT"}}
          onFile={id=>{setEditor(v=>v&&({...v,files:[...new Set([...v.files,id])]}));reload(n=>n+1)}}/>}</>:<p>Lưu nháp để có thể đính kèm minh chứng.</p>}
      <Button disabled={!editor.title.trim()} onClick={()=>void save()}>Lưu nháp sản phẩm</Button>
      <Button variant="outline" onClick={()=>setEditor(undefined)}>Đóng bản kê khai</Button>
    </fieldset>}
    {page?.items.filter(row=>row.id!==editor?.id).map(row=><article className="grid gap-2 rounded border p-3" key={row.id}>
      <h3>{row.title}</h3><p>{types.label(row.kind)} · {row.year} · {stages[row.status]}</p><p>{row.publication}</p><p>Tác giả · {row.authorLabels.join(", ")}</p>
      {row.reason&&<p>Nhận xét · {row.reason}</p>}
      {row.attachments.filter(f=>row.files.includes(f.id)).map(f=><Button variant="link" key={f.id} onClick={()=>void download(row.id,f.id)}>{f.label}</Button>)}
      {row.canEdit&&(row.status==="DRAFT"||row.status==="REJECTED")&&<Button variant="outline" onClick={()=>edit(row)}>Sửa bản kê khai</Button>}
      {row.canEdit&&row.status==="DRAFT"&&<><label><Checkbox checked={!!distinct[row.id]} onCheckedChange={checked => setDistinct({...distinct,[row.id]:checked})}/> Đã đối chiếu và xác nhận khác sản phẩm trùng thông tin</label>
        <Button disabled={busy} onClick={()=>void act(row,"submit")}>Gửi duyệt sản phẩm</Button></>}
      {row.canReview&&["PENDING_APPROVAL","APPROVED"].includes(row.status)&&<>
        <label>Nhận xét của chuyên viên<Input value={reasons[row.id]??""} onChange={e=>setReasons({...reasons,[row.id]:e.target.value})}/></label>
        {row.status==="PENDING_APPROVAL"?<><ProductCreditApproval key={row.revision} enabled={hoursEnabled} busy={busy} authors={row.authors.map((id,i)=>({id,label:row.authorLabels[i]}))} approve={credits=>void act(row,"approve",credits)}/>
          <Button variant="outline" disabled={busy||!reasons[row.id]?.trim()} onClick={()=>void act(row,"reject")}>Từ chối sản phẩm</Button></>:
          <Button variant="outline" disabled={busy||!reasons[row.id]?.trim()} onClick={()=>void act(row,"reopen")}>Mở lại bản kê khai</Button>}
      </>}
    </article>)}
    <Button variant="outline" onClick={()=>reload(n=>n+1)}>Tải lại sản phẩm</Button>
    {(error||types.error)&&<p role="alert">{error||types.error}</p>}
  </section>
}
