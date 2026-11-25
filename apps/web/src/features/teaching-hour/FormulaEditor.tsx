import {useEffect,useState} from "react"
import {Button} from "@rms/ui/components/button"
import {Input} from "@rms/ui/components/input"
import type {operations} from "@rms/api-contracts"
import type {SignedInSession} from "../../auth/session"
type Formula=operations["publishTeachingFormula"]["requestBody"]["content"]["application/json"]
const empty:Formula={kind:"activity",category:"",role:"LECTURER",periodType:"ACADEMIC_YEAR",from:"",to:"",hours:"",version:""}
export function FormulaEditor({session}:{session:SignedInSession}){
  const [rows,setRows]=useState<Formula[]>([]),[form,setForm]=useState(empty),[message,setMessage]=useState(""),[busy,setBusy]=useState(false)
  useEffect(()=>{
    const c=new AbortController()
    session.api.GET("/api/tenants/{slug}/teaching-hours/formulas",{params:session.params,signal:c.signal,cache:"no-store"}).then(r=>{if(!c.signal.aborted&&r.data)setRows(r.data)}).catch(()=>{if(!c.signal.aborted)setMessage("Không thể đọc định mức.")})
    return ()=>c.abort()
  },[session])
  async function publish(){
    setBusy(true)
    try{
      const r=await session.api.POST("/api/tenants/{slug}/teaching-hours/formulas",{params:session.params,body:form})
      if(!r.data)throw Error((r.error as {message?:string})?.message||"Không thể lưu định mức.")
      setRows([...rows,r.data]);setForm(empty);setMessage("Đã lưu phiên bản định mức.")
    }catch(e){setMessage(e instanceof Error?e.message:"Không thể kết nối.")}finally{setBusy(false)}
  }
  return <section className="grid max-w-xl gap-2 rounded border p-4" aria-label="Định mức giờ giảng"><h2>Định mức giờ giảng</h2>
    <ul>{rows.map(r=><li key={[r.kind,r.category,r.role,r.periodType,r.minVnd,r.version].join("/")}>{r.category} · {r.role} · {r.version} · {r.hours} giờ{r.kind==="applied-project"&&(" · Từ "+BigInt(r.minVnd??"0").toLocaleString("vi-VN")+" ₫"+(r.maxVnd?" đến dưới "+BigInt(r.maxVnd).toLocaleString("vi-VN")+" ₫":""))}</li>)}</ul>
    <label>Nguồn nghiệp vụ<select value={form.kind} onChange={e=>setForm({...form,minVnd:undefined,maxVnd:undefined,kind:e.target.value as Formula["kind"],role:e.target.value==="activity"?"LECTURER":e.target.value==="student-project"?"MENTOR":e.target.value==="product"?"CORRESPONDING_OR_FIRST":"PRINCIPAL"})}><option value="activity">Hoạt động khoa học</option><option value="upper-project">Nhiệm vụ cấp trên</option><option value="product">Sản phẩm khoa học</option><option value="student-project">Đề tài sinh viên</option><option value="applied-project">Dự án ứng dụng</option></select></label>
    <label>Loại kỳ<select value={form.periodType} onChange={e=>setForm({...form,periodType:e.target.value as Formula["periodType"]})}><option value="ACADEMIC_YEAR">Năm học</option><option value="FISCAL_YEAR">Năm tài khóa</option></select></label>
    {([["category","Mã loại hoạt động","text"],["role","Vai trò quy đổi","text"],["from","Hiệu lực từ","date"],["to","Hiệu lực đến","date"],["hours","Định mức giờ","text"],["version","Phiên bản định mức","text"]] as const).map(([key,label,type])=><label key={key}>{label}<Input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/></label>)}
    {form.kind==="applied-project"&&<fieldset className="grid gap-2"><legend>Khoảng giá trị hợp đồng</legend>
      <label>Từ số tiền (VND)<Input inputMode="numeric" value={form.minVnd??"0"} onChange={e=>setForm({...form,minVnd:e.target.value||undefined})}/></label>
      <label>Đến dưới số tiền (VND, có thể bỏ trống)<Input inputMode="numeric" value={form.maxVnd??""} onChange={e=>setForm({...form,maxVnd:e.target.value||null})}/></label>
    </fieldset>}
    <Button disabled={busy} onClick={()=>void publish()}>Lưu định mức</Button>{message&&<p role="status">{message}</p>}</section>
}
