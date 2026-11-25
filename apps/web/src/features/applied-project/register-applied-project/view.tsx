import { ChoiceOption, ChoiceSelect } from "@rms/ui/components/choice-select"
import { Textarea } from "@rms/ui/components/textarea"
import {PartnerPicker} from "./PartnerPicker"
import {ResultPanel} from "./ResultPanel"
import {MemberShares} from "../../extension/MemberShares"
import {useEffect,useState} from "react"
import type {operations} from "@rms/api-contracts"
import {Button} from "@rms/ui/components/button"
import {Input} from "@rms/ui/components/input"
import type {SignedInSession} from "../../../auth/session"
import {ProjectFile} from "../../attachments/ProjectFile"
type Decision=operations["reviewAppliedProject"]["requestBody"]["content"]["application/json"]["action"]
type Page=operations["listAppliedProjects"]["responses"][200]["content"]["application/json"]
type Record=Page["items"][number]
const base="/api/tenants/{slug}/applied-projects" as const
const labels={DRAFT:"Nháp",PENDING:"Chờ duyệt",APPROVED:"Đã duyệt"}

const extraPartners=(item?:Record)=>item?.partners.filter(name=>!item.directoryPartners.some(p=>p.label===name)).join("\n")??""

export function AppliedProjects({session}:{session:SignedInSession}){
  const [page,setPage]=useState<Page>(),[selected,setSelected]=useState<Record>(),[id,setId]=useState(()=>crypto.randomUUID() as string)
  const [unit,setUnit]=useState(""),[title,setTitle]=useState(""),[amount,setAmount]=useState(""),[partners,setPartners]=useState("")
  const [directoryPartners,setDirectoryPartners]=useState<Page["partnerDirectory"]>([])
  const [members,setMembers]=useState<Record["members"]>([])
  const [category,setCategory]=useState(""),[evidence,setEvidence]=useState(""),[reason,setReason]=useState("")
  const [message,setMessage]=useState(""),[busy,setBusy]=useState(false)
  useEffect(()=>{
    const c=new AbortController()
    session.api.GET(base,{params:session.params,signal:c.signal,cache:"no-store"}).then(r=>{if(!c.signal.aborted){setPage(r.data);if(!r.data)setMessage("Dự án ứng dụng ngoài phạm vi hiện tại.")}}).catch(()=>{if(!c.signal.aborted)setMessage("Không thể đọc dự án.")})
    return ()=>c.abort()
  },[session])
  function open(item?:Record){
    setDirectoryPartners(item?.directoryPartners??[]);setMembers(item?.members??[]);setId(item?.id??crypto.randomUUID());setSelected(item);setTitle(item?.title??"");setUnit(item?.unitId??"");setAmount(item?.amount??"");setPartners(extraPartners(item));setMessage("");setCategory(item?.category??"");setEvidence("");setReason("")
  }
  async function act(submit:boolean,decision?:Decision){
    setBusy(true);setMessage("")
    try{
      const params={path:{...session.params.path,id}},revision=selected?.revision??0
      const response=decision?await session.api.POST("/api/tenants/{slug}/applied-projects/{id}/decision",{params,body:{action:decision,revision,reason}}):submit?await session.api.POST("/api/tenants/{slug}/applied-projects/{id}/submit",{params,body:{revision}}):
        await session.api.PUT("/api/tenants/{slug}/applied-projects/{id}",{params,body:{revision,category,members,unitId:unit,title,amount,partnerCodes:directoryPartners.map(p=>p.code),partners:partners.split("\n").map(s=>s.trim()).filter(Boolean)}})
      if(!response.data){
        const error=response.error as {message?:string}|undefined
        throw Error(typeof error?.message==="string"?error.message:"Không thể lưu. Kiểm tra quyền và phiên bản hồ sơ.")
      }
      const item=response.data
      setPage(p=>p&&({...p,items:[item,...p.items.filter(x=>x.id!==id)]}));open(item)
      setMessage(decision?"Đã ghi quyết định.":submit?"Đã gửi duyệt.":"Đã lưu bản nháp.")
    }catch(e){setMessage(e instanceof Error?e.message:"Không thể kết nối.")}finally{setBusy(false)}
  }
  async function reloadEvidence(){
    const {data}=await session.api.GET(base,{params:session.params,cache:"no-store"})
    if(!data)throw Error("Chưa thể tải lại danh sách tệp.")
    setPage(data);open(data.items.find(i=>i.id===id))
  }
  async function download(fileId:string){
    const {data}=await session.api.GET("/api/tenants/{slug}/extensions/{module}/{id}/files/{fileId}/download",{params:{path:{...session.params.path,module:"applied-project",id,fileId}},cache:"no-store"})
    if(!data)throw Error("Không thể tải minh chứng trong phạm vi hiện tại.")
    const link=document.createElement("a");link.href=data.url;link.referrerPolicy="no-referrer";link.click()
  }
  const dirty=selected&&(category!==selected.category||selected.title!==title||selected.unitId!==unit||selected.amount!==amount||extraPartners(selected)!==partners||directoryPartners.length!==selected.directoryPartners.length||directoryPartners.some((p,i)=>p.code!==selected.directoryPartners[i]?.code)||members.length!==selected.members.length||members.some((m,i)=>m.email!==selected.members[i].email||m.role!==selected.members[i].role||m.share!==selected.members[i].share))
  return <section className="grid max-w-3xl gap-3 rounded border p-4" aria-label="Dự án ứng dụng"><h2>Dự án ứng dụng</h2>
    {page&&<><ul>{page.items.map(r=><li key={r.id}><Button variant="link" onClick={()=>open(r)}>{r.title}</Button> · {labels[r.status]}</li>)}</ul>
      <Button variant="outline" onClick={()=>open()}>Kê khai dự án mới</Button>
      {selected&&<p>{labels[selected.status]} · {selected.unit} · {BigInt(selected.amount).toLocaleString("vi-VN")} ₫</p>}
      {(!selected||selected.status==="DRAFT")&&<><label>Tên dự án<Input value={title} onChange={e=>setTitle(e.target.value)}/></label>
        {page.catalog.types.length>0&&<label>Loại dự án<ChoiceSelect value={category} onValueChange={setCategory}><ChoiceOption value="">Chọn loại dự án</ChoiceOption>
          {page.catalog.types.map(t=><ChoiceOption key={t.code} value={t.code}>{t.label}</ChoiceOption>)}</ChoiceSelect></label>}
        <label>Đơn vị chủ trì<ChoiceSelect value={unit} onValueChange={setUnit}><ChoiceOption value="">Chọn đơn vị</ChoiceOption>{page.units.map(u=><ChoiceOption key={u.id} value={u.id}>{u.name}</ChoiceOption>)}</ChoiceSelect></label>
        <label>Tổng kinh phí (VND)<Input inputMode="numeric" value={amount} onChange={e=>setAmount(e.target.value)}/></label>
        <PartnerPicker directory={page.partnerDirectory} selected={directoryPartners} onChange={setDirectoryPartners}/>
        <label>Đối tác ngoài (mỗi dòng một đơn vị)<Textarea className="block w-full border p-2" value={partners} onChange={e=>setPartners(e.target.value)}/></label>
        <MemberShares members={members} roles onChange={rows=>setMembers(rows.map(m=>({...m,role:m.role??"MEMBER"})))}/>
        <Button disabled={busy} onClick={()=>void act(false)}>Lưu nháp dự án</Button>{selected&&<Button disabled={busy||!!dirty} onClick={()=>void act(true)}>Gửi duyệt dự án</Button>}</>}
      {selected&&<>
        {selected.status!=="DRAFT"&&<MemberShares roles members={selected.members}/>}
        {selected.status==="APPROVED"&&<ResultPanel key={selected.id+"/"+selected.revision} session={session} page={page} project={selected}
          onFile={reloadEvidence} onSaved={item=>{setPage(p=>p&&({...p,items:[item,...p.items.filter(x=>x.id!==item.id)]}));open(item)}}/>}
        {selected.reason&&<p>Lý do quyết định · {selected.reason}</p>}
        <ul>{selected.files.map(f=><li key={f.id}><Button variant="link" onClick={()=>void download(f.id).catch(e=>setMessage(e.message))}>{f.filename}</Button> · {f.code}{f.cycle!==null?" · Kết quả lần duyệt "+f.cycle:""}</li>)}</ul>
        {selected.status==="DRAFT"&&page.actorId===selected.ownerId&&page.catalog.evidence.length>0&&<>
          <label>Loại minh chứng<ChoiceSelect value={evidence} onValueChange={setEvidence}><ChoiceOption value="">Chọn loại minh chứng</ChoiceOption>
            {page.catalog.evidence.map(e=><ChoiceOption key={e.code} value={e.code}>{e.label}</ChoiceOption>)}</ChoiceSelect></label>
          {evidence&&<ProjectFile session={session} project={id} revision={selected.revision} extension={{module:"applied-project",evidenceType:evidence}}
            onFile={()=>void reloadEvidence().catch(e=>setMessage(e.message))}/>}</>}
        {page.canReview&&page.actorId!==selected.ownerId&&selected.status!=="DRAFT"&&<>
          <label>Lý do quyết định<Input value={reason} onChange={e=>setReason(e.target.value)}/></label>
          {selected.status==="PENDING"?<><Button disabled={busy} onClick={()=>void act(false,"approve")}>Duyệt dự án</Button>
            <Button variant="outline" disabled={busy||!reason.trim()} onClick={()=>void act(false,"return")}>Trả dự án bổ sung</Button></>:
            <Button variant="outline" disabled={busy||!reason.trim()} onClick={()=>void act(false,"revoke")}>Thu hồi quyết định duyệt</Button>}</>}
      </>}
      {selected?.status!=="DRAFT"&&selected?.partners.map(s=><p key={s}>{s}</p>)}</>}
    {message&&<p role="status">{message}</p>}</section>
}
