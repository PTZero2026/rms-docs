import { ValidatedForm } from "@rms/ui/components/validated-form"
import { ValueInput } from "@rms/ui/components/date-input"
import { ChoiceOption, ChoiceSelect } from "@rms/ui/components/choice-select"
import {useEffect,useState} from "react"
import {Button} from "@rms/ui/components/button"
import {Input} from "@rms/ui/components/input"
import type {operations} from "@rms/api-contracts"
import type {SignedInSession} from "../../../auth/session"
type Profile=operations["readProfessionalProfile"]["responses"][200]["content"]["application/json"]
type Data=Profile["data"]
export function ProfessionalProfile({id,session,onSaved}:{id:string;session:SignedInSession;onSaved:()=>void}){
  const [p,setProfile]=useState<Profile>(),[message,setMessage]=useState(""),[busy,setBusy]=useState(false)
  useEffect(()=>{
    const ctrl=new AbortController()
    session.api.GET("/api/tenants/{slug}/profiles/{id}/professional",{params:{path:{...session.params.path,id}},cache:"no-store",signal:ctrl.signal})
      .then(r=>{if(!ctrl.signal.aborted){setProfile(r.data);if(!r.data)setMessage("Không thể đọc hồ sơ công tác.")}})
      .catch(()=>{if(!ctrl.signal.aborted)setMessage("Không thể kết nối.")})
    return ()=>ctrl.abort()
  },[id,session])
  if(!p)return <p role="status">{message||"Đang tải hồ sơ công tác…"}</p>
  const profile=p,show=(key:keyof Data)=>profile.visible.includes(key),required=(key:keyof Data)=>profile.required.includes(key)
  function put<K extends keyof Data>(key:K,value:Data[K]){setProfile({...profile,data:{...profile.data,[key]:value}});setMessage("")}
  async function save(){
    setBusy(true)
    try{
      const {data,fullName,revision}=profile
      const r=await session.api.PUT("/api/tenants/{slug}/profiles/{id}/professional",{params:{path:{...session.params.path,id}},body:{data,fullName,revision}})
      if(!r.data)throw Error((r.error as {message?:string})?.message||"Không thể lưu hồ sơ công tác.")
      setProfile(r.data);setMessage("Đã lưu hồ sơ công tác.");onSaved()
    }catch(e){setMessage(e instanceof Error?e.message:"Không thể kết nối.")}finally{setBusy(false)}
  }
  const qualifications=p.data.qualifications??[],jobs=p.data.jobs??[]
  function select(key:"gender"|"position"|"affiliation",label:string,opts:{id:string;name:string}[]){
    return show(key)&&<label>{label}{required(key)?" *":""}<ChoiceSelect required={required(key)} value={profile.data[key]??""} onValueChange={choiceValue => put(key,choiceValue)}><ChoiceOption value="">Chọn</ChoiceOption>{opts.map(o=><ChoiceOption key={o.id} value={o.id}>{o.name}</ChoiceOption>)}</ChoiceSelect></label>
  }
  return <ValidatedForm className="grid gap-3" aria-label="Hồ sơ công tác" onSubmit={e=>{e.preventDefault();void save()}}>
    <h3>Hồ sơ công tác</h3><p>Trường/Viện · {p.institution}</p><p>Email · {p.email}</p>
    <label>Họ tên trên hồ sơ<Input required value={p.fullName} onChange={e=>setProfile({...p,fullName:e.target.value})}/></label>
    {select("gender","Giới tính",["Nam","Nữ","Khác"].map(v=>({id:v,name:v})))}
    {([["birthDate","Ngày sinh","date"],["phone","Điện thoại liên hệ","tel"],["address","Địa chỉ liên hệ","text"]] as const).map(([k,label,type])=>show(k)&&<label key={k}>{label}{required(k)?" *":""}<ValueInput type={type} required={required(k)} value={p.data[k]??""} onValueChange={next => put(k,next)}/></label>)}
    {select("affiliation","Phòng ban công tác",p.units)}{select("position","Chức vụ",p.positions.map(v=>({id:v,name:v})))}
    {show("qualifications")&&(["DEGREE","RANK"] as const).map(kind=>{
      const title=kind==="DEGREE"?"Học vị":"Học hàm",options=kind==="DEGREE"?p.degrees:p.ranks
      return <fieldset key={kind} className="grid gap-2"><legend>{title}</legend>
        {qualifications.map((q,i)=>q.kind===kind&&<div key={i} className="flex flex-wrap gap-2">
          <label>Loại {title.toLowerCase()}<ChoiceSelect value={q.name} onValueChange={choiceValue => put("qualifications",qualifications.map((v,j)=>j===i?{...v,name:choiceValue}:v))}>{options.map(v=><ChoiceOption value={v} key={v}>{v}</ChoiceOption>)}</ChoiceSelect></label>
          <label>Năm nhận {title.toLowerCase()}<Input type="number" value={q.year||""} onChange={e=>put("qualifications",qualifications.map((v,j)=>j===i?{...v,year:Number(e.target.value)}:v))}/></label>
          <Button type="button" variant="outline" onClick={()=>put("qualifications",qualifications.filter((_,j)=>i!==j))}>Xóa dòng {title.toLowerCase()}</Button></div>)}
        <Button type="button" variant="outline" disabled={!options.length} onClick={()=>put("qualifications",[...qualifications,{kind,name:options[0],year:new Date().getFullYear()}])}>Thêm {title.toLowerCase()}</Button></fieldset>
    })}
    {show("jobs")&&<fieldset className="grid gap-2"><legend>Quá trình công tác</legend>
      {jobs.map((j,i)=><div key={i} className="grid gap-1 rounded border p-2">{([["place","Nơi công tác","text"],["from","Từ ngày","date"],["to","Đến ngày","date"]] as const).map(([key,label,type])=><label key={key}>{label}<ValueInput type={type} required={key!=="to"} value={j[key]??""} onValueChange={next => put("jobs",jobs.map((v,n)=>n===i?{...v,[key]:key==="to"?next||null:next}:v))}/></label>)}{!j.to&&<p>Đang công tác</p>}
        <Button type="button" variant="outline" onClick={()=>put("jobs",jobs.filter((_,n)=>i!==n))}>Xóa quá trình</Button></div>)}
      <Button type="button" variant="outline" onClick={()=>put("jobs",[...jobs,{place:"",from:"",to:null}])}>Thêm quá trình công tác</Button></fieldset>}
    <Button type="submit" disabled={busy}>Lưu hồ sơ công tác</Button><p role="status">{message}</p></ValidatedForm>
}
