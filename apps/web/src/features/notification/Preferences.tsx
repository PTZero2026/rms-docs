import {useCallback,useEffect,useState} from "react"
import {Button} from "@rms/ui/components/button"
import {Input} from "@rms/ui/components/input"
import type {operations} from "@rms/api-contracts"
import type {SignedInSession} from "../../auth/session"

import {NoticeTemplate} from "./NoticeTemplate"

type Rows=operations["notificationPolicies"]["responses"][200]["content"]["application/json"]
export function Preferences({session,admin,canViewTemplates}:{session:SignedInSession;admin:boolean;canViewTemplates:boolean}){
  const [rows,setRows]=useState<Rows>(),[code,select]=useState("PROGRESS_REPORT_DUE_SOON"),[message,setMessage]=useState(""),[busy,setBusy]=useState(false)
  const [showTemplates,setShowTemplates]=useState(false)
  const onDenied=useCallback(()=>{
    setShowTemplates(false);setRows(undefined);setMessage("Tài khoản hiện tại thiếu quyền quản lý mẫu thông báo.")
  },[])
  const rule=rows?.find(r=>r.code===code)
  useEffect(()=>{
    const c=new AbortController()
    session.api.GET("/api/tenants/{slug}/notifications/preferences",{params:session.params,cache:"no-store",signal:c.signal})
      .then(r=>{if(!c.signal.aborted){setRows(r.data);if(!r.data)setMessage("Không thể đọc các nhóm thông báo.")}})
      .catch(()=>{if(!c.signal.aborted)setMessage("Không thể kết nối.")})
    return ()=>c.abort()
  },[session])
  async function submit(form:FormData,matrix:boolean){
    if(!rule||busy)return
    setBusy(true);setMessage("")
    try{
      const email=matrix?form.has("email"):rule.mandatory||!rule.email?rule.ownEmail:form.has("email")
      const sms=rule.highPriority?(matrix||rule.sms?form.has("sms"):rule.ownSms):undefined
      const result=matrix?await session.api.PUT("/api/tenants/{slug}/notifications/rules",{params:session.params,body:{code,email,sms,revision:rule.revision,title:String(form.get("title")??""),mailSubject:String(form.get("subject")??"")}}):
        await session.api.PUT("/api/tenants/{slug}/notifications/preferences",{params:session.params,body:{code,email,sms}})
      if(!result.data)throw Error(result.error?.message||"Không thể lưu thay đổi.")
      setRows(result.data);setMessage(matrix?"Đã cập nhật quy tắc của trường.":rule.highPriority?"Đã lưu tùy chọn nhận thông báo.":"Đã lưu tùy chọn nhận email.")
    }catch(e){setMessage(e instanceof Error?e.message:"Không thể kết nối.")}finally{setBusy(false)}
  }
  return <section className="grid gap-3 rounded border p-3" aria-label="Tùy chọn thông báo">
    <label>Nhóm sự kiện<select className="block w-full rounded border p-2" value={code} onChange={e=>{select(e.target.value);setMessage("")}}>
      {rows?.map(r=><option key={r.code} value={r.code}>{r.label}</option>)}</select></label>
    {rule&&<div key={rule.code+"-"+rule.revision+"-"+rule.ownEmail+"-"+rule.ownSms} className="grid gap-3">
      <form className="grid gap-2" onSubmit={e=>{e.preventDefault();void submit(new FormData(e.currentTarget),false)}}>
        <label><input type="checkbox" name="email" defaultChecked={rule.ownEmail} disabled={rule.mandatory||!rule.email}/> Nhận email cá nhân</label>
        {rule.mandatory&&<p>Email bắt buộc cho nhóm sự kiện này.</p>}
        {!rule.email&&<p>Trường đã tắt email cho sự kiện này.</p>}
        {rule.highPriority&&<><label><input type="checkbox" name="sms" defaultChecked={rule.ownSms} disabled={!rule.sms}/> Nhận SMS cá nhân</label>
          {!rule.hasPhone&&<p>Cập nhật số điện thoại trong hồ sơ để nhận SMS.</p>}
          {!rule.sms&&<p>Trường đã tắt SMS cho sự kiện này.</p>}</>}
        <Button disabled={busy||((rule.mandatory||!rule.email)&&!(rule.highPriority&&rule.sms))}>Lưu tùy chọn cá nhân</Button></form>
      {admin&&<form className="grid gap-2 border-t pt-3" aria-label="Quy tắc của trường" onSubmit={e=>{e.preventDefault();void submit(new FormData(e.currentTarget),true)}}>
        <label><input type="checkbox" name="email" defaultChecked={rule.email}/> Bật email toàn trường cho nhóm này</label>
        {rule.highPriority&&<label><input type="checkbox" name="sms" defaultChecked={rule.sms}/> Bật SMS toàn trường cho nhóm này</label>}
        <label>Tiêu đề trong ứng dụng<Input name="title" required maxLength={180} defaultValue={rule.title}/></label>
        <label>Tiêu đề email<Input name="subject" required maxLength={180} defaultValue={rule.mailSubject}/></label>
        <Button disabled={busy}>Lưu quy tắc của trường</Button></form>}
    </div>}
    {rule&&canViewTemplates&&<Button variant="outline" aria-expanded={showTemplates}
      onClick={()=>setShowTemplates(!showTemplates)}>Mẫu thông báo theo kênh</Button>}
    {rule&&showTemplates&&<NoticeTemplate key={code} session={session} code={code} highPriority={rule.highPriority} admin={admin} onDenied={onDenied}
      onSaved={value=>setRows(current=>current?.map(row=>row.code!==value.code?row:{...row,revision:value.revision,
        ...(value.channel==="sms"?{}:{[value.channel==="smtp"?"mailSubject":"title"]:value.title??row.label})}))}/>}
    <p role="status">{message}</p>
  </section>
}
