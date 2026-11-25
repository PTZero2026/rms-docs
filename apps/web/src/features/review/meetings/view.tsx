import { ValidatedForm } from "@rms/ui/components/validated-form"
import { DateInput } from "@rms/ui/components/date-input"
import { ChoiceOption, ChoiceSelect } from "@rms/ui/components/choice-select"
import {useEffect,useState} from "react"
import type {operations} from "@rms/api-contracts"
import {Button} from "@rms/ui/components/button"
import {Input} from "@rms/ui/components/input"
import type {SignedInSession} from "../../../auth/session"
import {ProjectFile} from "../../attachments/ProjectFile"

type Rounds=operations["listMeetingRounds"]["responses"][200]["content"]["application/json"]
type List=operations["listRoundMeetings"]["responses"][200]["content"]["application/json"]
const format=new Intl.DateTimeFormat("vi-VN",{timeZone:"Asia/Ho_Chi_Minh",day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})
export function MeetingMinutes({session,kind}:{session:SignedInSession;kind:Rounds[number]["kind"]}){
  const [rounds,setRounds]=useState<Rounds>(),[selected,setSelected]=useState("")
  const [visible,show]=useState(false),[failed,setFailed]=useState(false)
  useEffect(()=>{
    if(!visible)return
    const c=new AbortController()
    session.api.GET("/api/tenants/{slug}/review/meeting-rounds",{params:session.params,signal:c.signal,cache:"no-store"})
      .then(r=>{if(!c.signal.aborted){setRounds(r.data?.filter(x=>x.kind===kind));setFailed(!r.data)}})
      .catch(()=>{if(!c.signal.aborted){setRounds(undefined);setFailed(true)}})
    return ()=>c.abort()
  },[session,kind,visible])
  return <section className="grid gap-2" aria-label="Biên bản cuộc họp">
    <Button variant="outline" aria-expanded={visible} onClick={()=>{show(v=>!v);setRounds(undefined);setSelected("");setFailed(false)}}>Biên bản cuộc họp</Button>
    {visible&&(failed?<p role="alert">Chưa thể đọc phân công hội đồng.</p>:!rounds?<p>Đang tải phân công…</p>:!rounds.length?<p>Bạn chưa có vòng hội đồng trong phạm vi.</p>:
      <label>Vòng hội đồng<ChoiceSelect className="w-full" value={selected} onValueChange={setSelected}><ChoiceOption value="">Chọn vòng</ChoiceOption>
        {rounds.map(r=><ChoiceOption key={r.id} value={r.id}>{r.title}</ChoiceOption>)}</ChoiceSelect></label>)}
    {visible&&rounds?.some(r=>r.id===selected)&&<MeetingList key={selected} session={session} round={selected} secretary={rounds.some(r=>r.id===selected&&r.secretary)}/>}
  </section>
}
function MeetingList({session,round,secretary}:{session:SignedInSession;round:string;secretary:boolean}){
  const [list,setList]=useState<List>(),[count,refresh]=useState(0),[message,setMessage]=useState(""),[busy,setBusy]=useState(false)
  const [title,setTitle]=useState(""),[date,setDate]=useState(""),[id,setId]=useState(()=>crypto.randomUUID())
  useEffect(()=>{
    const c=new AbortController()
    session.api.GET("/api/tenants/{slug}/review/rounds/{id}/meetings",{params:{path:{...session.params.path,id:round}},cache:"no-store",signal:c.signal})
      .then(r=>{if(!c.signal.aborted){setList(r.data);if(!r.data)setMessage("Cuộc họp ngoài phạm vi hiện tại.")}})
      .catch(()=>{if(!c.signal.aborted){setList(undefined);setMessage("Chưa thể tải cuộc họp.")}})
    return ()=>c.abort()
  },[session,round,count])
  async function create(){
    setBusy(true);setMessage("")
    try{
      const {data,error}=await session.api.POST("/api/tenants/{slug}/review/rounds/{id}/meetings",{params:{path:{...session.params.path,id:round}},body:{id,title,date}})
      if(!data)throw Error(error?.message||"Chưa thể lưu cuộc họp.")
      setId(crypto.randomUUID());setTitle("");setDate("");refresh(n=>n+1)
    }catch(e){setMessage(e instanceof Error?e.message:"Không thể kết nối.")}finally{setBusy(false)}
  }
  async function download(meeting:string,fileId:string){
    const {data}=await session.api.GET("/api/tenants/{slug}/review/meetings/{id}/files/{fileId}/download",{params:{path:{...session.params.path,id:meeting,fileId}},cache:"no-store"})
    if(!data){setList(undefined);refresh(n=>n+1);setMessage("Không thể tải biên bản trong phạm vi hiện tại.");return}
    const link=document.createElement("a");link.href=data.url;link.referrerPolicy="no-referrer";link.click()
  }
  return <div className="grid gap-3">
    {list&&secretary&&<ValidatedForm className="grid gap-2" onSubmit={e=>{e.preventDefault();void create()}}>
      <label>Tên cuộc họp<Input required maxLength={240} value={title} onChange={e=>setTitle(e.target.value)}/></label>
      <label>Ngày họp<DateInput required  value={date} onValueChange={setDate}/></label>
      <Button type="submit" disabled={busy}>Ghi cuộc họp</Button></ValidatedForm>}
    {list?.length===0&&<p>Vòng này chưa có cuộc họp.</p>}
    {list?.map(m=><section key={m.id} className="grid gap-2 rounded border p-3" aria-label={m.title}>
      <h4>{m.title}</h4><p>{m.date.split("-").reverse().join("/")}</p>
      {m.files.map(f=><div key={f.id}><Button variant="link" onClick={()=>void download(m.id,f.id).catch(()=>setMessage("Không thể tải biên bản."))}>{f.filename} · bản {f.revision}</Button>
        <p>{f.actor} · {format.format(new Date(f.attachedAt))}</p></div>)}
      {secretary&&<ProjectFile session={session} project={m.id} meeting revision={m.revision} onFile={()=>refresh(n=>n+1)}/>}
    </section>)}{message&&<p role="status">{message}</p>}
  </div>
}
