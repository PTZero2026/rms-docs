import { ValueInput, DateInput } from "@rms/ui/components/date-input"
import { Checkbox } from "@rms/ui/components/checkbox"
import { ChoiceOption, ChoiceSelect } from "@rms/ui/components/choice-select"
import { useCallback,useEffect,useState } from "react"
import type { operations } from "@rms/api-contracts"
import { Button } from "@rms/ui/components/button"
import { Input } from "@rms/ui/components/input"
import type { Account,SignedInSession } from "../../../auth/session"
import ProposalEditor from "../../proposal/Editor"
import { FilterPair } from "../../mobile/FilterPair"

type Listing=operations["listCalls"]["responses"][200]["content"]["application/json"]
type Call=Listing["items"][number]
type Ref=operations["listIntakeReferences"]["responses"][200]["content"]["application/json"][number]
type InputCall=operations["saveNewCall"]["requestBody"]["content"]["application/json"]
const empty:InputCall={code:"",name:"",startDate:"",endDate:"",fieldIds:[],templateId:null,criteriaId:null}
const status={DRAFT:"Nháp",OPEN:"Đã mở",CLOSED:"Đã đóng",CANCELLED:"Đã hủy"}
const showDate=(v:string)=>v.split("-").reverse().join("/")
type Props={session:SignedInSession;account:Account}
export default function Calls({session,account}:Props) {
  const [reason,setReason]=useState("")
  const [list,setList]=useState<Listing>(),[search,setSearch]=useState(""),[all,setAll]=useState(false),[skip,setSkip]=useState(0)
  const [refs,setRefs]=useState<Ref[]>([]),[detail,setDetail]=useState<Call>(),[form,setForm]=useState<InputCall>()
  const [draftCall,setDraftCall]=useState<Call>()
  const [end,setEnd]=useState(""),[message,setMessage]=useState(""),[busy,setBusy]=useState(false),[round,setRound]=useState(0)
  const params=session.params
  const load=useCallback(async(signal?:AbortSignal)=>{
    const {data}=await session.api.GET("/api/tenants/{slug}/calls",{params:{path:params.path,query:{search,group:all?"all":"receiving",skip}},cache:"no-store",signal})
    if(!data)throw Error("Không thể tải danh sách kỳ.")
    return data
  },[session,params,search,all,skip])
  useEffect(()=>{
    const c=new AbortController()
    load(c.signal).then(data=>{if(!c.signal.aborted)setList(data)}).catch(e=>{if(!c.signal.aborted){setList(undefined);setMessage(e.message)}})
    return()=>c.abort()
  },[load,round])
  async function run(action:()=>Promise<void>) {
    if(busy)return
    setMessage("");setBusy(true)
    try{await action()}catch(e){setMessage(e instanceof Error?e.message:"Không thể kết nối.")}
    finally{setBusy(false)}
  }
  async function open(id:string) {
    const {data}=await session.api.GET("/api/tenants/{slug}/calls/{id}",{params:{path:{...params.path,id}},cache:"no-store"})
    if(!data){setDetail(undefined);setForm(undefined);throw Error("Kỳ không còn trong phạm vi được xem.")}
    setDraftCall(undefined);setDetail(data);setForm(undefined);setEnd(data.endDate);setReason("")
  }
  async function edit(row?:Call) {
    const {data}=await session.api.GET("/api/tenants/{slug}/calls/references",{params,cache:"no-store"})
    if(!data)throw Error("Không thể đọc danh mục có hiệu lực.")
    setReason("");setRefs(data);setDetail(row)
    setForm(row?{code:row.code,name:row.name,startDate:row.startDate,endDate:row.endDate,fieldIds:row.fieldIds,templateId:row.templateId,criteriaId:row.criteriaId,revision:row.revision}:{...empty,fieldIds:[]})
  }
  async function save() {
    if(!form)return
    const result=detail?await session.api.PUT("/api/tenants/{slug}/calls/{id}",{params:{path:{...params.path,id:detail.id}},body:form}):
      await session.api.POST("/api/tenants/{slug}/calls",{params,body:form})
    if(!result.data)throw Error(result.error?.message??"Không thể lưu kỳ.")
    setDetail(result.data);setForm(undefined);setRound(n=>n+1);setMessage("Đã lưu kỳ nháp.")
  }
  async function change(action:"open"|"close"|"cancel"|"extend") {
    if(!detail)return
    const result=await session.api.POST("/api/tenants/{slug}/calls/{id}/actions",{params:{path:{...params.path,id:detail.id}},body:{action,revision:detail.revision,endDate:action==="extend"?end:undefined,reason:action==="cancel"||action==="extend"?reason.trim()||undefined:undefined}})
    if(!result.data)throw Error(result.error?.message??"Không thể thay đổi kỳ.")
    setReason("");setDetail(result.data);setEnd(result.data.endDate);setRound(n=>n+1);setMessage("Đã cập nhật trạng thái kỳ.")
  }
  return <section className="grid min-w-0 gap-4 py-4"><h2>Kỳ nhận đề xuất</h2>
    <label>Tìm tên hoặc mã kỳ<Input value={search} onChange={e=>{setSkip(0);setSearch(e.target.value)}}/></label>
    <FilterPair label="Phạm vi tra kỳ" options={["Đang nhận","Tất cả"]} secondActive={all} onChange={v=>{setSkip(0);setAll(v)}}/>
    {list?.canManage && <Button className="justify-self-start" disabled={busy} onClick={()=>void run(()=>edit())}>Tạo kỳ nháp</Button>}
    {list && <><p>{list.total?list.total+" kỳ phù hợp":"Chưa có kỳ phù hợp"}</p>
      <ul className="grid gap-2 sm:grid-cols-2">{list.items.map(row=><li key={row.id} className="min-w-0 rounded border">
        <Button variant="ghost" size="content" className="grid w-full gap-2 break-words p-3 text-left" onClick={()=>void run(()=>open(row.id))}>
          <span>{row.code} · {status[row.status]}</span><strong>{row.name}</strong><span>Hạn {showDate(row.endDate)}</span></Button></li>)}</ul>
      {(list.total>20||skip>0)&&<div><Button disabled={!skip} onClick={()=>setSkip(skip-20)}>Trang trước</Button><Button disabled={skip+20>=list.total} onClick={()=>setSkip(skip+20)}>Trang sau</Button></div>}</>}
    {form?<fieldset disabled={busy} className="grid gap-3 rounded border p-4"><legend>{detail?"Sửa kỳ nháp":"Kỳ nháp mới"}</legend>
      {(["code","name","startDate","endDate"] as const).map((k,i)=><label key={k}>{["Mã kỳ","Tên kỳ","Ngày bắt đầu","Hạn nhận"][i]}
        <ValueInput type={i>1?"date":"text"} value={form[k]} onValueChange={next => setForm({...form,[k]:next})}/></label>)}
      <fieldset><legend>Lĩnh vực nghiên cứu</legend>{refs.filter(r=>r.kind==="field").map(r=><label key={r.id} className="mr-4"><Checkbox checked={form.fieldIds.includes(r.id)} onCheckedChange={checked => setForm({...form,fieldIds:checked?[...form.fieldIds,r.id]:form.fieldIds.filter(id=>id!==r.id)})}/> {r.name}</label>)}
      {form.fieldIds.filter(id=>!refs.some(r=>r.id===id)).map(id=><label key={id}><Checkbox checked onCheckedChange={() => setForm({...form,fieldIds:form.fieldIds.filter(x=>x!==id)})}/> Bỏ lĩnh vực đã hết hiệu lực</label>)}</fieldset>
      {(["templateId","criteriaId"] as const).map(k=><label key={k}>{k==="templateId"?"Biểu mẫu":"Bộ tiêu chí"} <ChoiceSelect value={form[k]??""} onValueChange={choiceValue => setForm({...form,[k]:choiceValue||null})}>
        <ChoiceOption value="">Chọn từ danh mục</ChoiceOption>{refs.filter(r=>r.kind===(k==="templateId"?"form":"criteria")).map(r=><ChoiceOption key={r.id} value={r.id}>{r.name} · v{r.revision}</ChoiceOption>)}</ChoiceSelect></label>)}
      <div className="flex gap-2"><Button onClick={()=>void run(save)}>Lưu kỳ nháp</Button><Button variant="outline" onClick={()=>setForm(undefined)}>Đóng biểu mẫu</Button></div>
    </fieldset>:detail && <section className="grid gap-2 rounded border p-4"><h3>{detail.name}</h3>
      <p>{detail.code} · {status[detail.status]} · {showDate(detail.startDate)} – {showDate(detail.endDate)}</p>
      <p>Biểu mẫu {detail.templateName??"chưa chọn"}</p>
      {account.userType==="author" && detail.receiving && <Button onClick={()=>setDraftCall(detail)}>Lập đề xuất</Button>}
      {list?.canManage && <fieldset disabled={busy} aria-label="Thao tác với kỳ" className="flex flex-wrap items-end gap-2">
        {detail.status==="DRAFT" && <><Button disabled={busy} variant="outline" onClick={()=>void run(()=>edit(detail))}>Sửa kỳ nháp</Button><Button disabled={busy} onClick={()=>void run(()=>change("open"))}>Mở kỳ</Button></>}
        {detail.status==="OPEN" && <Button disabled={busy} onClick={()=>void run(()=>change("close"))}>Đóng kỳ</Button>}
        {["DRAFT","OPEN","CLOSED"].includes(detail.status)&&<label>Lý do hủy hoặc gia hạn<Input maxLength={2000} value={reason} onChange={e=>setReason(e.target.value)}/></label>}
        {["OPEN","DRAFT"].includes(detail.status)&&<Button disabled={busy||!reason.trim()} variant="outline" onClick={()=>void run(()=>change("cancel"))}>Hủy kỳ</Button>}
        {["OPEN","CLOSED"].includes(detail.status)&&<><label>Hạn mới<DateInput value={end} onValueChange={setEnd}/></label><Button disabled={busy||detail.status==="CLOSED"&&!reason.trim()} onClick={()=>void run(()=>change("extend"))}>Gia hạn kỳ</Button></>}
      </fieldset>}</section>}
    {draftCall && <ProposalEditor key={draftCall.id} session={session} call={draftCall}/>}
    <p role="status">{message}</p></section>
}
