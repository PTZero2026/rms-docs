import {ProfessionalProfile} from "../professional/view"
import {TeachingLedger} from "../../teaching-hour/TeachingLedger"
import { useEffect,useState } from "react"
import { Button } from "@rms/ui/components/button"
import type { operations } from "@rms/api-contracts"
import type { SignedInSession } from "../../../auth/session"

type Profile=operations["getScientificProfile"]["responses"][200]["content"]["application/json"]
const path="/api/tenants/{slug}/profiles/{id}/cv" as const
export function ScientificProfile({id,session,manager}:{id:string;session:SignedInSession;manager:boolean}){
  const [profile,setProfile]=useState<Profile>(),[message,setMessage]=useState(""),[busy,setBusy]=useState(false)
  const [editing,setEditing]=useState(false)
  const [showLedger,setShowLedger]=useState(false),[round,setRound]=useState(0)
  useEffect(()=>{
    const controller=new AbortController()
    session.api.GET(path,{params:{path:{...session.params.path,id}},signal:controller.signal,cache:"no-store"}).then(r=>{
      if(!controller.signal.aborted){setProfile(r.data);setMessage(r.data?"":"Hồ sơ ngoài phạm vi hoặc không còn hiệu lực.")}
    }).catch(()=>{if(!controller.signal.aborted)setMessage("Không thể tải lý lịch khoa học.")})
    return ()=>controller.abort()
  },[session,id,round])
  async function download(){
    setBusy(true);setMessage("")
    try{
      const params={path:{...session.params.path,id}}
      const {data}=await session.api.POST("/api/tenants/{slug}/profiles/{id}/cv/exports",{params})
      if(!data)throw Error("Không thể xuất hồ sơ. Kiểm tra quyền và phiên bản mẫu đang áp dụng.")
      const file=await session.api.GET("/api/tenants/{slug}/profiles/{id}/cv/exports/{exportId}/file",{params:{path:{...params.path,exportId:data.id}},parseAs:"blob",cache:"no-store"})
      if(!file.data)throw Error("Không thể tải bản xuất. Hãy mở lại hồ sơ.")
      const link=document.createElement("a"),url=URL.createObjectURL(file.data)
      link.href=url;link.download=data.code+"-"+data.version+".pdf";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
      setMessage("Đã xuất "+data.code+" · "+data.version)
    }catch(e){setMessage(e instanceof Error?e.message:"Không thể kết nối.")}finally{setBusy(false)}
  }
  function records(rows:Profile["projects"]){return rows.length?<ul>{rows.map(row=><li key={row.id}>{row.projectId?<a className="underline" href={"?project="+row.projectId}>{row.title}</a>:row.title} · {row.label}</li>)}</ul>:<p>Chưa có dữ liệu.</p>}
  return <section className="grid max-w-3xl gap-3 rounded border p-4" aria-label="Lý lịch khoa học"><h2>Lý lịch khoa học</h2>
    {profile&&<><h3>{profile.name}</h3><p>{profile.email} · {profile.unit}</p><Button variant="outline" onClick={()=>setEditing(!editing)}>Thông tin công tác và học vị</Button>{editing&&<ProfessionalProfile id={id} session={session} onSaved={()=>setRound(n=>n+1)}/>}<h3>Đề tài tham gia</h3>{records(profile.projects)}
    <h3>Sản phẩm khoa học đã duyệt</h3>{records(profile.outputs)}{profile.hours&&<><h3>Giờ giảng quy đổi</h3>{profile.hours.map(p=><p key={p.code}>{p.code} · {p.total} giờ</p>)}{!profile.hours.length&&<p>Chưa ghi nhận giờ.</p>}
    <Button variant="outline" onClick={()=>setShowLedger(!showLedger)}>Xem sổ giờ giảng</Button>{showLedger&&<TeachingLedger session={session} person={id} manager={manager} onAdjusted={()=>setRound(n=>n+1)}/>}</>}<Button disabled={busy} onClick={()=>void download()}>Xuất lý lịch PDF</Button></>}
    {message&&<p role="status">{message}</p>}</section>
}
