import { DateInput } from "@rms/ui/components/date-input"
import { ChoiceOption, ChoiceSelect } from "@rms/ui/components/choice-select"
import {useEffect,useState} from "react"
import {Button} from "@rms/ui/components/button"
import {Input} from "@rms/ui/components/input"
import type {operations} from "@rms/api-contracts"
import type {SignedInSession} from "../../auth/session"
import {ProjectFile} from "../attachments/ProjectFile"
import {MemberShares,type Members} from "./MemberShares"
import {vnd} from "../execution/model"
type Page=operations["listEvidenceEntries"]["responses"][200]["content"]["application/json"]
type Item=Page["items"][number]
type Kind="upper-project"|"activity"
const labels={DRAFT:"Nháp",PENDING:"Chờ duyệt",APPROVED:"Đã duyệt",REJECTED:"Đã từ chối"}
export function EvidenceEntries({session,kind}:{session:SignedInSession;kind:Kind}){
  const [page,setPage]=useState<Page>(),[round,setRound]=useState(0),[id,setId]=useState(""),[busy,setBusy]=useState(false),[message,setMessage]=useState("")
  const [title,setTitle]=useState(""),[category,setCategory]=useState(""),[body,setBody]=useState(""),[host,setHost]=useState(""),[date,setDate]=useState("")
  const [reason,setReason]=useState(""),[code,setCode]=useState("")
  const [supportAmount,setSupportAmount]=useState("")
  const [members,setMembers]=useState<Members>([])
  const selected=page?.items.find(i=>i.id===id),upper=kind==="upper-project",heading=upper?"Nhiệm vụ cấp trên":"Hoạt động khoa học"
  useEffect(()=>{
    const c=new AbortController()
    session.api.GET("/api/tenants/{slug}/extensions/{module}",{params:{path:{...session.params.path,module:kind}},signal:c.signal,cache:"no-store"}).then(r=>{if(!c.signal.aborted){setPage(r.data);if(!r.data)setMessage("Không thể mở danh sách của trường.")}}).catch(()=>{if(!c.signal.aborted)setMessage("Không thể kết nối.")})
    return ()=>c.abort()
  },[session,kind,round])
  function open(item?:Item){
    setId(item?.id??crypto.randomUUID());setTitle(item?.title??"");setCategory(item?.category??page?.catalog.types[0]?.code??"")
    setBody(item?.body??page?.catalog.bodies[0]?.code??"");setHost(item?.hostId??"");setDate(item?.date??"")
    setMembers(item?.members??[]);setReason("");setCode(page?.catalog.evidence[0]?.code??"");setMessage("")
    setSupportAmount("")
  }
  async function action(verb:"save"|"submit"|"approve"|"return"|"reject"|"revoke"){
    const params={path:{...session.params.path,module:kind,id}},revision=selected?.revision??0
    setBusy(true);setMessage("")
    try{
      const r=verb==="save"?await session.api.PUT("/api/tenants/{slug}/extensions/{module}/{id}",{params,body:{title,category,body,hostId:host||null,date,revision,...(upper?{members}:{})}}):
        await session.api.POST("/api/tenants/{slug}/extensions/{module}/{id}/decision",{params,body:{action:verb,revision,reason,
          ...(!upper&&verb==="approve"&&supportAmount.trim()?{supportAmount:supportAmount.trim()}:{})}})
      if(!r.data)throw Error((r.error as {message?:string})?.message||"Không thể xử lý đầu mục.")
      const updated=r.data
      setPage(p=>p&&({...p,items:[updated,...p.items.filter(x=>x.id!==id)]}));open(updated);setMessage("Đã lưu thay đổi.")
    }catch(e){setMessage(e instanceof Error?e.message:"Không thể kết nối.")}finally{setBusy(false)}
  }
  async function download(fileId:string){
    const {data}=await session.api.GET("/api/tenants/{slug}/extensions/{module}/{id}/files/{fileId}/download",{params:{path:{...session.params.path,module:kind,id,fileId}},cache:"no-store"})
    if(!data){setMessage("Không thể tải tệp trong phạm vi hiện tại.");return}
    const link=document.createElement("a");link.href=data.url;link.referrerPolicy="no-referrer";link.click()
  }
  const editable=!!page&&(!selected||selected.ownerId===page.actorId&&selected.status==="DRAFT")
  const membersChanged=upper&&!!selected&&(members.length!==selected.members.length||members.some((m,i)=>m.email!==selected.members[i].email||m.share!==selected.members[i].share))
  const dirty=!!selected&&(selected.title!==title||selected.category!==category||upper&&selected.body!==body||(selected.hostId??"")!==host||selected.date!==date||membersChanged)
  const select=(label:string,value:string,change:(v:string)=>void,choices:Page["units"],optional=false)=><label>{label}<ChoiceSelect value={value} onValueChange={change}>{optional&&<ChoiceOption value="">Chưa chọn</ChoiceOption>}{choices.map(c=><ChoiceOption key={c.code} value={c.code}>{c.label}</ChoiceOption>)}</ChoiceSelect></label>
  return <section className="grid max-w-3xl gap-3 rounded border p-4" aria-label={heading}><h2>{heading}</h2>
    {page&&<><Button variant="outline" onClick={()=>setRound(r=>r+1)}>Tải lại đầu mục</Button>
      <ul>{page.items.map(x=><li key={x.id}><Button variant="link" onClick={()=>open(x)}>{x.title}</Button> · {labels[x.status]}</li>)}</ul>
      {page.canCreate&&<Button variant="outline" onClick={()=>open()}>Thêm đầu mục</Button>}
      {id&&editable&&<><label>Tên đầu mục<Input value={title} onChange={e=>setTitle(e.target.value)}/></label>
        {select(upper?"Cấp nhiệm vụ":"Loại hoạt động",category,setCategory,page.catalog.types)}
        {upper&&select("Cơ quan quản lý",body,setBody,page.catalog.bodies)}
        {select("Đơn vị chủ trì",host,setHost,page.units,true)}
        <label>Ngày nghiệp vụ<DateInput value={date} onValueChange={setDate}/></label>
        {upper&&<MemberShares members={members} onChange={setMembers}/>}
        <Button disabled={busy} onClick={()=>void action("save")}>Lưu nháp đầu mục</Button></>}
      {selected&&<><h3>{selected.title}</h3><p>Trạng thái · {labels[selected.status]}</p>
        {!upper&&selected.status==="APPROVED"&&<p>{selected.supportAmount?"Kinh phí hỗ trợ được duyệt · "+vnd(selected.supportAmount):"Chưa ghi nhận kinh phí hỗ trợ"}</p>}
        {upper&&!editable&&<MemberShares members={selected.members}/>}
        <p>{page.catalog.types.find(t=>t.code===selected.category)?.label??selected.category} · {selected.date.split("-").reverse().join("/")}</p>
        {selected.hostId&&<p>{page.units.find(u=>u.code===selected.hostId)?.label??selected.hostId}</p>}
        {selected.reason&&<p>{selected.reason}</p>}<ul>{selected.files.map(f=><li key={f.id}><Button variant="link" onClick={()=>void download(f.id).catch(()=>setMessage("Không thể tải tệp."))}>{f.filename}</Button> · {f.code}</li>)}</ul>
        {editable&&<>{select("Loại minh chứng",code,setCode,page.catalog.evidence)}
          {code&&<ProjectFile session={session} project={id} revision={selected.revision} extension={{module:kind,evidenceType:code}} onFile={()=>setRound(r=>r+1)}/>}
          <Button disabled={busy||dirty} onClick={()=>void action("submit")}>Gửi duyệt đầu mục</Button></>}
        {page.canReview&&selected.ownerId!==page.actorId&&selected.status==="APPROVED"&&<>
          <label>Lý do thu hồi<Input value={reason} onChange={e=>setReason(e.target.value)}/></label>
          <Button variant="outline" disabled={busy||!reason.trim()} onClick={()=>void action("revoke")}>Thu hồi đầu mục đã duyệt</Button></>}
        {page.canReview&&selected.ownerId!==page.actorId&&selected.status==="PENDING"&&<>
          {!upper&&<label>Kinh phí hỗ trợ được duyệt (VND)<Input inputMode="numeric" placeholder="Có thể để trống" value={supportAmount} onChange={e=>setSupportAmount(e.target.value)}/></label>}
          <Button disabled={busy} onClick={()=>void action("approve")}>Duyệt đầu mục</Button><label>{upper?"Lý do trả lại":"Lý do trả lại hoặc từ chối"}<Input value={reason} onChange={e=>setReason(e.target.value)}/></label>
          <Button variant="outline" disabled={busy||!reason.trim()} onClick={()=>void action("return")}>Trả lại đầu mục</Button>
          {!upper&&<Button variant="outline" disabled={busy||!reason.trim()} onClick={()=>void action("reject")}>Từ chối hoạt động</Button>}</>}</>}</>}
    {message&&<p role="status">{message}</p>}</section>
}
