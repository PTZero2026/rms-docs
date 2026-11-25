import { ChoiceOption, ChoiceSelect } from "@rms/ui/components/choice-select"
import { Textarea } from "@rms/ui/components/textarea"
import {useEffect,useState} from "react"
import {Button} from "@rms/ui/components/button"
import {Input} from "@rms/ui/components/input"
import type {operations} from "@rms/api-contracts"
import type {SignedInSession} from "../../auth/session"

const endpoint="/api/tenants/{slug}/notifications/templates/{code}/{channel}"
type Template=operations["getNoticeTemplate"]["responses"][200]["content"]["application/json"]
type Preview=operations["previewNoticeTemplate"]["responses"][200]["content"]["application/json"]
type Props={
  session:SignedInSession
  code:string
  highPriority:boolean
  admin:boolean
  onDenied:()=>void
  onSaved:(value:Template)=>void
}

export function NoticeTemplate(props:Props){
  const [channel,setChannel]=useState<Template["channel"]>("in_app")
  return <section aria-label="Mẫu thông báo theo kênh" className="grid min-w-0 gap-3 rounded border p-3">
    <h3 className="font-semibold">Mẫu thông báo theo kênh</h3>
    <label>Kênh của mẫu
      <ChoiceSelect className="w-full" value={channel} onValueChange={choiceValue => setChannel(choiceValue as Template["channel"])}>
        <ChoiceOption value="in_app">Trong ứng dụng</ChoiceOption><ChoiceOption value="smtp">Email</ChoiceOption>{props.highPriority&&<ChoiceOption value="sms">SMS</ChoiceOption>}
      </ChoiceSelect>
    </label>
    <TemplateForm key={props.code+channel} {...props} channel={channel}/>
  </section>
}

function TemplateForm({session,code,channel,admin,onDenied,onSaved}:Props & {channel:Template["channel"]}){
  const [saved,setSaved]=useState<Template>()
  const [title,setTitle]=useState(""),[body,setBody]=useState("")
  const [refresh,setRefresh]=useState(0),[busy,setBusy]=useState(false)
  const [error,setError]=useState(""),[message,setMessage]=useState("")
  const [preview,setPreview]=useState<Preview>(),[confirm,setConfirm]=useState(false)
  const [conflict,setConflict]=useState(false)
  const slug=session.params.path.slug
  useEffect(()=>{
    const c=new AbortController()
    session.api.GET(endpoint,{params:{path:{slug,code,channel}},signal:c.signal,cache:"no-store"}).then(r=>{
      if(c.signal.aborted)return
      if(r.response.status===401||r.response.status===403){onDenied();return}
      if(!r.data)throw Error()
      setSaved(r.data);setTitle(r.data.title??"");setBody(r.data.body??"");setConflict(false)
    }).catch(()=>{if(!c.signal.aborted)setError("Chưa tải được mẫu thông báo.")})
    return ()=>c.abort()
  },[session,slug,code,channel,refresh,onDenied])
  function resetFeedback(){setError("");setMessage("");setPreview(undefined);setConfirm(false)}
  function reload(){
    resetFeedback();setSaved(undefined);setRefresh(n=>n+1)
  }
  async function submit(action:"preview"|"save"|"remove"){
    if(!saved||busy)return
    resetFeedback();setBusy(true)
    const options={params:{path:{slug,code,channel}},body:{title:action==="remove"?null:title,
      body:action==="remove"?null:body,revision:saved.revision}}
    try{
      const result=action==="preview"
        ?await session.api.POST("/api/tenants/{slug}/notifications/templates/{code}/{channel}/preview",options)
        :await session.api.PUT(endpoint,options)
      if(result.response.status===401||result.response.status===403){onDenied();return}
      if(!result.data){
        if(result.response.status===409)setConflict(true)
        throw Error(result.error?.message??"Chưa xác nhận được kết quả. Tải bản hiện hành để kiểm tra.")
      }
      if("revision" in result.data){
        setSaved(result.data);setTitle(result.data.title??"");setBody(result.data.body??"");onSaved(result.data)
        setMessage(action==="remove"?"Đã gỡ mẫu thông báo.":"Đã lưu mẫu thông báo.")
      }else setPreview(result.data)
    }catch(e){setError(e instanceof Error?e.message:"Chưa kết nối được dịch vụ thông báo.")}
    finally{setBusy(false)}
  }
  return <>
    {saved&&<>
      {saved.body===null&&<p role="status">Thiếu mẫu cho kênh này.</p>}
      <p className="break-words text-sm">Biến có thể dùng · {saved.variables.map(v=>"{{"+v+"}}").join(", ")}</p>
      <fieldset className="grid min-w-0 gap-2" disabled={busy}>
        <label>Tiêu đề mẫu<Input value={title} readOnly={!admin} maxLength={180} onChange={e=>{resetFeedback();setTitle(e.target.value)}}/></label>
        <label>Nội dung mẫu<Textarea className="block w-full rounded border p-2" rows={4} maxLength={4000}
          readOnly={!admin} value={body} onChange={e=>{resetFeedback();setBody(e.target.value)}}/></label>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={!title.trim()||!body.trim()} onClick={()=>void submit("preview")}>Xem trước</Button>
          {admin&&<Button disabled={conflict||!title.trim()||!body.trim()} onClick={()=>void submit("save")}>Lưu mẫu</Button>}
          {admin&&saved.body!==null&&<Button disabled={conflict} variant="outline" onClick={()=>setConfirm(true)}>Gỡ mẫu</Button>}
        </div>
        {confirm&&<div className="grid justify-items-start gap-2"><p>Thông báo mới của kênh này sẽ dùng nội dung mặc định.</p>
          <div className="flex gap-2"><Button onClick={()=>void submit("remove")}>Xác nhận gỡ mẫu</Button>
            <Button variant="outline" onClick={()=>setConfirm(false)}>Giữ mẫu</Button></div></div>}
      </fieldset>
    </>}
    {!saved&&!error&&<p role="status">Đang tải mẫu…</p>}
    {preview&&<section aria-label="Bản xem trước" className="grid gap-1 rounded border p-3">
      <h4>Bản xem trước với dữ liệu mẫu</h4><strong>{preview.title}</strong><p className="whitespace-pre-wrap break-words">{preview.body}</p>
    </section>}
    {error&&<p role="alert">{error}</p>}{message&&<p role="status">{message}</p>}
    <Button variant="outline" className="justify-self-start" disabled={busy} onClick={reload}>Tải bản hiện hành</Button>
  </>
}
