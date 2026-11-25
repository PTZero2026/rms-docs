import {useEffect,useState} from "react"
import type {operations} from "@rms/api-contracts"
import {Input} from "@rms/ui/components/input"
import {Button} from "@rms/ui/components/button"
import type {SignedInSession} from "../../../auth/session"
type Command=operations["precreateAccount"]["requestBody"]["content"]["application/json"]
export function CreateAccount({session,onCreated}:{session:SignedInSession;onCreated:()=>void}){
  const [units,setUnits]=useState<{id:string;name:string}[]>([]),[form,setForm]=useState<Command>(()=>({commandId:crypto.randomUUID(),email:"",fullName:"",userType:"user",unitId:""})),[message,setMessage]=useState(""),[busy,setBusy]=useState(false)
  useEffect(()=>{
    const c=new AbortController()
    session.api.GET("/api/tenants/{slug}/admin/units",{params:session.params,cache:"no-store",signal:c.signal}).then(r=>{if(!c.signal.aborted)setUnits(r.data??[])}).catch(()=>{})
    return ()=>c.abort()
  },[session])
  async function send(){
    setBusy(true)
    try{
      const r=await session.api.POST("/api/tenants/{slug}/admin/users",{params:session.params,body:form})
      if(!r.data)throw Error((r.error as {message?:string})?.message||"Chưa thể cấp tài khoản.")
      setMessage("Đã cấp tài khoản "+r.data.email);setForm({commandId:crypto.randomUUID(),email:"",fullName:"",unitId:"",userType:"user"});onCreated()
    }catch(e){setMessage(e instanceof Error?e.message:"Không thể kết nối.")}finally{setBusy(false)}
  }
  return <form className="grid max-w-xl gap-2" onSubmit={e=>{e.preventDefault();void send()}}><h3>Cấp tài khoản</h3>
    <label>Email tài khoản<Input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
    <label>Họ tên người được cấp<Input required value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})}/></label>
    <label>Đơn vị công tác<select required value={form.unitId} onChange={e=>setForm({...form,unitId:e.target.value})}><option value="">Chọn đơn vị</option>{units.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select></label>
    <label>Vai trò tài khoản<select value={form.userType} onChange={e=>setForm({...form,userType:e.target.value as Command["userType"]})}>{["user","author","staff","admin"].map(r=><option key={r}>{r}</option>)}</select></label>
    <Button disabled={busy}>Tạo tài khoản</Button>{message&&<p role="status">{message}</p>}</form>
}
