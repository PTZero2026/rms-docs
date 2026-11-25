import { useEffect,useState,useSyncExternalStore } from "react"
import { Button } from "@rms/ui/components/button"
import type { operations } from "@rms/api-contracts"
import type { SignedInSession } from "../../auth/session"
import { FilterPair } from "../mobile/FilterPair"
import {DeliveryLog} from "./DeliveryLog"
import {Preferences} from "./Preferences"

type Page=operations["listInbox"]["responses"][200]["content"]["application/json"]
type Detail=operations["readNotice"]["responses"][200]["content"]["application/json"]
type InboxError={message:string;canRetryLoad:boolean}
const date=new Intl.DateTimeFormat("vi-VN",{timeZone:"Asia/Ho_Chi_Minh",day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})
function listen(fn:()=>void){addEventListener("popstate",fn);return ()=>removeEventListener("popstate",fn)}
function change(filter:"all"|"unread",id?:string){
  const query=new URLSearchParams({inbox:filter})
  if(id)query.set("notice",id)
  history.pushState(null,"",location.pathname+"?"+query)
  dispatchEvent(new PopStateEvent("popstate"))
}
export default function Inbox({session,admin=false,canManageDelivery=false}:{session:SignedInSession;admin?:boolean;canManageDelivery?:boolean}){
  const search=useSyncExternalStore(listen,()=>location.search)
  const query=new URLSearchParams(search),open=query.has("inbox"),id=query.get("notice")
  const filter=query.get("inbox")==="unread"?"unread":"all"
  if(!open)return <Button variant="outline" onClick={()=>change("all")}>Hộp thông báo</Button>
  return <InboxPage key={search} session={session} admin={admin} canManageDelivery={canManageDelivery} filter={filter} id={id}/>
}
function InboxPage({session,filter,id,admin,canManageDelivery}:{session:SignedInSession;filter:"unread"|"all";id:string|null;admin:boolean;canManageDelivery:boolean}){
  const [settings,setSettings]=useState(false),[logOpen,setLogOpen]=useState(false)
  const [skip,setSkip]=useState(0),[revision,refresh]=useState(0),[page,setPage]=useState<Page>(),[detail,setDetail]=useState<Detail>()
  const [error,setError]=useState<InboxError>(),[busy,setBusy]=useState(false)
  useEffect(()=>{
    const c=new AbortController(),opts={cache:"no-store" as const,signal:c.signal}
    let loadMessage=id?"Chưa thể mở thông báo.":"Không tải được thông báo."
    function failed(status?:number){
      if(c.signal.aborted)return
      setDetail(undefined)
      setPage(undefined)
      const denied=status===401||status===403
      const message=denied?"Tài khoản hiện tại không thể truy cập hộp thông báo.":loadMessage
      setError({message,canRetryLoad:status===undefined||status>=500||status===408||status===429})
    }
    async function load(){
      if(id){
        const r=await session.api.POST("/api/tenants/{slug}/notifications/{id}/read",{...opts,params:{path:{...session.params.path,id}}})
        if(!r.data){
          if(r.response.status===404)loadMessage="Thông báo ngoài phạm vi hiện tại."
          return failed(r.response.status)
        }
        if(!c.signal.aborted)setDetail(r.data)
      }
      loadMessage="Không tải được thông báo."
      const r=await session.api.GET("/api/tenants/{slug}/notifications",{...opts,params:{path:session.params.path,query:{filter,skip}}})
      if(!r.data)return failed(r.response.status)
      if(!c.signal.aborted){setPage(r.data);setError(undefined)}
    }
    load().catch(()=>failed())
    return ()=>c.abort()
  },[session,filter,id,skip,revision])
  async function markAll(){
    setBusy(true)
    try{
      const r=await session.api.POST("/api/tenants/{slug}/notifications/read-all",{params:session.params})
      if(!r.response.ok){
        if(r.response.status===401||r.response.status===403){setDetail(undefined);setPage(undefined)}
        throw Error()
      }
      setSkip(0);refresh(n=>n+1)
    }catch{setError({message:"Chưa thể đánh dấu tất cả đã đọc.",canRetryLoad:false})}finally{setBusy(false)}
  }
  const total=(filter==="unread"?page?.unread:page?.total)??0
  return <section className="grid min-w-0 gap-3 rounded border p-3" aria-label="Hộp thông báo">
    <h2>Hộp thông báo</h2>{page&&<p>{page.unread} tin chưa đọc</p>}
    {!id&&<><Button variant="outline" aria-expanded={settings} onClick={()=>setSettings(!settings)}>Tùy chọn nhận thông báo</Button>
      {settings&&<Preferences session={session} admin={admin} canViewTemplates={canManageDelivery||admin}/>}
      {canManageDelivery&&<Button variant="outline" aria-expanded={logOpen} onClick={()=>setLogOpen(!logOpen)}>Nhật ký gửi thông báo</Button>}
      {canManageDelivery&&logOpen&&<DeliveryLog session={session}/>}</>}
    {id?<><Button variant="outline" onClick={()=>change(filter)}>Về danh sách thông báo</Button>
      {detail&&<article><h3>{detail.title}</h3><time dateTime={detail.createdAt}>{date.format(new Date(detail.createdAt))}</time>
        <p className="break-words">{detail.body}</p>{detail.targetId&&<a className="underline" href={"?project="+detail.targetId}>Mở hồ sơ nguồn</a>}</article>}</>:
      <><FilterPair label="Lọc thông báo" options={["Tất cả","Chưa đọc"]} secondActive={filter==="unread"} onChange={v=>{setSkip(0);change(v?"unread":"all")}}/>
        {page?.items.map(n=><Button variant="ghost" size="content" className="grid min-h-11 gap-1 rounded border p-3 text-start" key={n.id} onClick={()=>change(filter,n.id)}>
          <strong>{n.title}</strong><span>{n.readAt?"Đã đọc":"Chưa đọc"} · {date.format(new Date(n.createdAt))}</span></Button>)}
        {page&&!total&&<p>{filter==="unread"?"Bạn đã đọc hết thông báo.":"Hộp thông báo đang trống."}</p>}
        {!!page?.unread&&<Button variant="outline" disabled={busy} onClick={markAll}>Đánh dấu tất cả đã đọc</Button>}
        {total>20&&<div><Button disabled={!skip} onClick={()=>setSkip(Math.max(0,skip-20))}>Trang trước</Button>
          <Button disabled={skip+20>=total} onClick={()=>setSkip(skip+20)}>Trang sau</Button></div>}
      </>}
    {error&&<div className="grid justify-items-start gap-2"><p role="alert">{error.message}</p>
      {error.canRetryLoad&&<Button variant="outline" onClick={()=>{setError(undefined);refresh(n=>n+1)}}>Thử lại</Button>}
    </div>}
  </section>
}
