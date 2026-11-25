import {useCallback} from "react"
import type {operations} from "@rms/api-contracts"
import {Button} from "@rms/ui/components/button"
import type {SignedInSession} from "../../auth/session"
import {HomeWork} from "./open-work-item/view"
import {useHomeRead,WidgetFeedback} from "./widget-load"

type Layout=operations["getHomeLayout"]["responses"][200]["content"]["application/json"]
type Widget=operations["getHomeWidget"]["parameters"]["path"]["widget"]
type Target=Layout["shortcuts"][number]
type Props={session:SignedInSession;open:(target:Target)=>void;canReport:boolean;onAccessLost:()=>void}
const shortcuts:Record<Target,string>={profile:"Hoàn thiện lý lịch",reports:"Xem báo cáo kỳ",calls:"Tra cứu kỳ đề xuất"}
const labels:Record<Widget,string>={profile:"Lý lịch cá nhân",projects:"Số liệu nhanh",teaching:"Giờ giảng",activity:"Thông báo gần đây"}
const timestamp=new Intl.DateTimeFormat("vi-VN",{timeZone:"Asia/Ho_Chi_Minh",day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})

function HomeWidget({widget,session,open,canReport,onAccessLost}:Props & {widget:Widget}){
  const read=useCallback(async(signal:AbortSignal)=>{
    const {data,response}=await session.api.GET("/api/tenants/{slug}/home/widgets/{widget}",{
      params:{path:{...session.params.path,widget}},cache:"no-store",signal,
    })
    return {data:response.status===404?null:data,response}
  },[session,widget])
  const {data,failed,retry}=useHomeRead(read,onAccessLost)
  if(data===null)return null
  return <section className={widget==="profile"?"grid justify-items-start gap-1":"rounded border p-3"} aria-label={labels[widget]}>
    {(widget!=="profile"||failed)&&<h3>{labels[widget]}</h3>}
    {data===undefined?<WidgetFeedback failed={failed} retry={retry}/>:
      data.widget==="profile"?<>
        <p>Xin chào, {data.name}</p>
        {data.profileIncomplete&&<Button variant="link" onClick={()=>open("profile")}>Bổ sung thông tin còn thiếu trong lý lịch</Button>}
      </>:data.widget==="activity"?<>
        {data.notices.length?<ul>{data.notices.map(n=><li key={n.id}><a className="underline" href={"?inbox=all&notice="+n.id}>{n.title} · {timestamp.format(new Date(n.createdAt))}</a></li>)}</ul>:<p>Bạn chưa có thông báo.</p>}
        <a className="underline" href="?inbox=all">Xem tất cả thông báo</a>
      </>:<>
        <dl>{data.counters.map(r=><div key={r.code} className="flex justify-between gap-2"><dt>{r.label}</dt><dd>{r.value.toLocaleString("vi-VN")}</dd></div>)}</dl>
        <p>Cập nhật {timestamp.format(new Date(data.capturedAt))}</p>
        {data.widget==="projects"&&canReport&&<a className="underline" href="?report=home">Mở báo cáo theo kỳ</a>}
        {data.widget==="teaching"&&<Button variant="link" onClick={()=>open("profile")}>Xem giờ trong lý lịch</Button>}
      </>}
  </section>
}

export function Overview(props:Props) {
  const {session,open,onAccessLost}=props
  const read=useCallback((signal:AbortSignal)=>
    session.api.GET("/api/tenants/{slug}/home/layout",{params:session.params,cache:"no-store",signal}),[session])
  const {data:layout,failed,retry}=useHomeRead(read,onAccessLost)
  if(!layout)return failed?<div role="alert">Chưa tải được trang chủ. <Button variant="outline" onClick={retry}>Thử tải trang chủ</Button></div>:<p role="status">Đang tải trang chủ…</p>
  return <section className="grid gap-3" aria-label="Trang chủ cá nhân">
    <HomeWidget {...props} widget="profile"/>
    {layout.widgets.map(widget=>{
      if(widget==="tasks")return <HomeWork key={widget} session={session} onAccessLost={onAccessLost} onCalls={()=>open("calls")}/>
      if(widget==="shortcuts")return <section key={widget} className="flex flex-wrap gap-2" aria-label="Lối tắt">
        {layout.shortcuts.map(s=><Button key={s} variant="outline" onClick={()=>open(s)}>{shortcuts[s]}</Button>)}</section>
      return <HomeWidget key={widget} {...props} widget={widget}/>
    })}
  </section>
}
