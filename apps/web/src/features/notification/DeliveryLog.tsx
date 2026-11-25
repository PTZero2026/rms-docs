import { ChoiceOption, ChoiceSelect } from "@rms/ui/components/choice-select"
import { Checkbox } from "@rms/ui/components/checkbox"
import {useEffect,useState} from "react"
import {Button} from "@rms/ui/components/button"
import type {operations} from "@rms/api-contracts"
import type {SignedInSession} from "../../auth/session"

type Page=operations["listNotificationDeliveries"]["responses"][200]["content"]["application/json"]
type Entry=Page["items"][number]
type Filter="all"|"failed"|"reconcile"
const labels={ready:"Chờ gửi",leased:"Đang gửi",sent:"Đã gửi",failed:"Gửi lỗi",reconcile:"Chờ đối soát",skipped:"Đã bỏ qua"}
const date=new Intl.DateTimeFormat("vi-VN",{timeZone:"Asia/Ho_Chi_Minh",day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})

export function DeliveryLog({session}:{session:SignedInSession}){
  const [filter,setFilter]=useState<Filter>("failed"),[skip,setSkip]=useState(0),[revision,reload]=useState(0)
  const [page,setPage]=useState<Page>(),[selected,setSelected]=useState<string[]>([]),[message,setMessage]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false)
  useEffect(()=>{
    const c=new AbortController()
    session.api.GET("/api/tenants/{slug}/notifications/deliveries",{params:{path:session.params.path,query:{filter,skip}},cache:"no-store",signal:c.signal}).then(r=>{
      if(c.signal.aborted)return
      if(!r.data)throw Error("Chưa thể mở nhật ký trong phạm vi hiện tại.")
      setPage(r.data)
    }).catch(e=>{if(!c.signal.aborted){setPage(undefined);setError(e.message)}})
    return ()=>c.abort()
  },[session,skip,filter,revision])
  function refresh(){setPage(undefined);setSelected([]);setError("");reload(n=>n+1)}
  async function resend(rows:Entry[]){
    setBusy(true);setMessage("");setError("")
    try{
      const r=await session.api.POST("/api/tenants/{slug}/notifications/deliveries/resend",{params:session.params,body:{items:rows.map(({id,revision})=>({id,revision}))}})
      if(!r.data)throw Error(r.response.status===409?"Lượt gửi đã thay đổi. Kiểm tra lại nhật ký.":"Chưa thể đưa lượt gửi vào hàng đợi.")
      setMessage("Đã đưa "+r.data.count+" lượt gửi vào hàng đợi.");setSkip(0);refresh()
    }catch(e){refresh();setError(e instanceof Error?e.message:"Không thể kết nối.")}finally{setBusy(false)}
  }
  return <section aria-label="Nhật ký gửi thông báo" className="grid min-w-0 gap-3 rounded border p-3">
    <h3>Nhật ký gửi thông báo</h3><label>Trạng thái gửi <ChoiceSelect disabled={busy} value={filter} onValueChange={choiceValue => {setFilter(choiceValue as Filter);setSkip(0);setMessage("");refresh()}}>
      <ChoiceOption value="failed">Chỉ lỗi</ChoiceOption><ChoiceOption value="reconcile">Chờ đối soát</ChoiceOption><ChoiceOption value="all">Tất cả lượt gửi</ChoiceOption></ChoiceSelect></label>
    {page&&<><p>{page.total} lượt gửi</p><ul className="grid gap-2">{page.items.map(row=><li className="grid gap-1 rounded border p-2" key={row.id}>
      <strong>{row.recipient}</strong><p>{row.title} · {row.channel==="smtp"?"Email":row.channel==="sms"?"SMS":"Trong ứng dụng"}</p>
      <p>{labels[row.status]} · {row.attempts} lần thử · {date.format(new Date(row.createdAt))}</p>
      {row.channel==="smtp"&&<p className="break-all">Message-ID · {"<"+row.id+"@rms.invalid>"}</p>}
      {row.channel==="sms"&&<p className="break-all">Mã đối soát SMS · {row.id}</p>}
      {row.templateMissing&&<p>Thiếu mẫu cho kênh này. Hệ thống đã dùng nội dung mặc định.</p>}
      {row.error&&<p>Mã phản hồi · {row.error}</p>}
      {row.status==="failed"&&row.channel!=="in_app"&&<div className="flex flex-wrap items-center gap-3">
        <label><Checkbox disabled={busy} checked={selected.includes(row.id)} onCheckedChange={checked => setSelected(checked?[...selected,row.id]:selected.filter(id=>id!==row.id))}/> Chọn lượt gửi</label>
        <Button disabled={busy} variant="outline" onClick={()=>void resend([row])}>Gửi lại</Button></div>}
    </li>)}</ul>
    {selected.length>0&&<Button disabled={busy} onClick={()=>void resend(page.items.filter(r=>selected.includes(r.id)))}>Gửi lại đã chọn ({selected.length})</Button>}
    {(skip>0||page.total>20)&&<div><Button disabled={busy||skip===0} onClick={()=>{setSkip(skip-20);refresh()}}>Trang trước</Button>
      <Button disabled={busy||skip+20>=page.total} onClick={()=>{setSkip(skip+20);refresh()}}>Trang sau</Button></div>}</>}
    {message&&<p role="status">{message}</p>}{error&&<p role="alert">{error}</p>}
    <Button variant="outline" disabled={busy} onClick={refresh}>Tải lại nhật ký</Button>
  </section>
}
