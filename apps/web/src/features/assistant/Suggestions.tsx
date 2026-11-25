import {useEffect,useState} from "react"
import type {operations} from "@rms/api-contracts"
import {Button} from "@rms/ui/components/button"
import type {SignedInSession} from "../../auth/session"
type Card=operations["readSourceSuggestion"]["responses"][200]["content"]["application/json"]
type History=operations["listSourceSuggestions"]["responses"][200]["content"]["application/json"]
type Kind="proposal"|"product"
const route="/api/tenants/{slug}/assistant/{module}/{id}" as const,one="/api/tenants/{slug}/assistant/{module}/{id}/{suggestionId}" as const
export function Suggestions({session,id,kind}:{session:SignedInSession;id:string;kind:Kind}){
  const [items,setItems]=useState<History>(),[card,setCard]=useState<Card>(),[message,setMessage]=useState(""),[busy,setBusy]=useState(false),[opened,setOpened]=useState("")
  useEffect(()=>{
    const ctrl=new AbortController()
    session.api.GET(route,{params:{path:{...session.params.path,module:kind,id}},cache:"no-store",signal:ctrl.signal}).then(r=>{if(!ctrl.signal.aborted)setItems(r.data)}).catch(()=>{})
    return ()=>ctrl.abort()
  },[session,id,kind])
  async function load(suggestionId?:string,decision?:{field:string;choice:"use"|"discard"},reveal?:string){
    setBusy(true);setMessage("");setOpened("");setCard(undefined)
    try{
      const path={...session.params.path,module:kind,id}
      const r=!suggestionId?await session.api.POST(route,{params:{path}}):decision?
        await session.api.POST(one,{params:{path:{...path,suggestionId}},body:decision}):
        await session.api.GET(one,{params:{path:{...path,suggestionId}},cache:"no-store"})
      if(!r.data)throw Error(r.response.status===503?"Trợ lý đang gián đoạn. Có thể tiếp tục rà thủ công.":"Nguồn không còn trong phạm vi xử lý.")
      const data=r.data
      setCard(data);if(reveal)setOpened(reveal)
      if(!suggestionId)setItems(old=>[{id:data.id,at:new Date().toISOString()},...(old??[])])
    }catch(e){setMessage(e instanceof Error?e.message:"Không thể kết nối.")}finally{setBusy(false)}
  }
  if(!items)return null
  return <section className="grid gap-2 rounded border p-4" aria-label="Trợ lý có dẫn chứng"><h3>{kind==="proposal"?"Đối chiếu mục bắt buộc":"Thẻ đọc tài liệu"}</h3>
    <Button variant="outline" disabled={busy} onClick={()=>void load()}>{kind==="proposal"?"Rà bản thuyết minh":"Lập thẻ đọc"}</Button>
    {items.length>0&&<Button variant="outline" disabled={busy} onClick={()=>void load(items[0].id)}>Mở lại bản gần nhất</Button>}
    {card&&<><p>Nguồn {card.sourceVersion} · Mẫu {card.templateVersion} · Mô hình {card.model} · Lệnh {card.prompt}</p>
      {card.metadata&&<p>{card.metadata.title} · {card.metadata.authors} · {card.metadata.year} · <a className="underline" target="_blank" rel="noreferrer" href={"https://doi.org/"+encodeURI(card.metadata.doi)}>DOI {card.metadata.doi}</a></p>}
      {card.fields.map(f=><article className="rounded border p-2" key={f.key}><h4>{f.label}</h4><p>{f.text??"Chưa đủ căn cứ"}</p>
        {f.location&&<Button variant="link" disabled={busy} onClick={()=>void load(card.id,undefined,f.key)}>Mở căn cứ · {f.location}</Button>}
        {opened===f.key&&f.text&&<blockquote>{f.location} — {f.text}</blockquote>}
        {f.choice&&<p>{f.choice==="use"?"Đã chọn dùng":"Đã bỏ gợi ý"}</p>}
        <Button variant="outline" disabled={busy||!f.text} onClick={()=>void load(card.id,{field:f.key,choice:"use"})}>Dùng trường này</Button>
        <Button variant="outline" disabled={busy} onClick={()=>void load(card.id,{field:f.key,choice:"discard"})}>Bỏ trường này</Button></article>)}</>}
    {message&&<p role="status">{message}</p>}</section>
}
export function ReadingLibrary({session}:{session:SignedInSession}){
  const [items,setItems]=useState<operations["listReadingLibrary"]["responses"][200]["content"]["application/json"]>([]),[id,setId]=useState("")
  useEffect(()=>{
    const c=new AbortController()
    session.api.GET("/api/tenants/{slug}/assistant/library",{params:session.params,cache:"no-store",signal:c.signal}).then(r=>{if(!c.signal.aborted)setItems(r.data??[])}).catch(()=>{})
    return ()=>c.abort()
  },[session])
  return <section className="grid gap-3 py-3" aria-label="Thư viện DOI"><h2>Thư viện DOI</h2>
    {items.length===0&&<p>Chưa có tài liệu được phép lập thẻ.</p>}{items.map(x=><Button variant="outline" key={x.id} onClick={()=>setId(x.id)}>{x.title} · {x.doi}</Button>)}
    {id&&<Suggestions key={id} session={session} id={id} kind="product"/>}</section>
}
