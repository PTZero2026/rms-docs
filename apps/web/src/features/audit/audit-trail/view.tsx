import { useEffect,useState } from "react"
import type { operations } from "@rms/api-contracts"
import { Button } from "@rms/ui/components/button"
import { Input } from "@rms/ui/components/input"
import { Acceptance } from "../../acceptance/view"
import Products from "../../product/view"
import Budget from "../../budget/view"
import ProgressPanel from "../../progress/view"
import ProposalEditor from "../../proposal/Editor"
import type { SignedInSession } from "../../../auth/session"

type Trail=operations["getProjectTrail"]["responses"][200]["content"]["application/json"]
type Projects=operations["listAccessibleProjects"]["responses"][200]["content"]["application/json"]
const date=new Intl.DateTimeFormat("vi-VN",{timeZone:"Asia/Ho_Chi_Minh",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false})
const actions:Record<string,string>={WORKFLOW_TRANSITION:"Chuyển bước",PROJECT_CREATED:"Tạo hồ sơ",FILE_ATTACHED:"Gắn tệp"}
const field="project"
function currentId(){return new URLSearchParams(location.search).get(field)??""}
function link(id:string){const url=new URL(location.href);if(id)url.searchParams.set(field,id);else url.searchParams.delete(field);return url.pathname+url.search}
export default function ProjectHistory({session}:{session:SignedInSession}) {
  const [id,setId]=useState(currentId),[search,setSearch]=useState(""),[find,setFind]=useState("")
  const [skip,setSkip]=useState(0),[reload,setReload]=useState(0)
  const [dates,setDates]=useState({from:"",to:""}),[range,setRange]=useState({from:"",to:""})
  const [pinned,setPinned]=useState<{id:string;version:number;step:string}>()
  const [acceptance,setAcceptance]=useState(false)
  const [products,setProducts]=useState(false)
  const [budget,setBudget]=useState(false)
  const [progress,setProgress]=useState(false)
  const [editing,setEditing]=useState(false)
  const [projects,setProjects]=useState<Projects>(),[trail,setTrail]=useState<Trail>(),[error,setError]=useState("")
  function select(next:string) {
    setAcceptance(false);setProducts(false);setBudget(false);setProgress(false);setEditing(false);history.pushState(null,"",link(next));setId(next);setSkip(0);setTrail(undefined);setProjects(undefined);setError("")
  }
  useEffect(()=>{
    const back=()=>{setId(currentId());setTrail(undefined);setProjects(undefined);setSkip(0);setError("")}
    addEventListener("popstate",back);return ()=>removeEventListener("popstate",back)
  },[])
  useEffect(()=>{
    const controller=new AbortController()
    const opts={cache:"no-store" as const,signal:controller.signal}
    async function read() {
      if(id) {
        const {data}=await session.api.GET("/api/tenants/{slug}/projects/{projectId}/audit",{...opts,params:{
          path:{...session.params.path,projectId:id},query:{skip,from:range.from?range.from+"T00:00:00+07:00":undefined,to:range.to?range.to+"T23:59:59.999999+07:00":undefined}}})
        if(!data)throw Error("Không thể mở lịch sử trong phạm vi hiện tại.")
        if(!controller.signal.aborted)setTrail(data)
        const instance=await session.api.GET("/api/tenants/{slug}/projects/{projectId}/workflow",{...opts,params:{path:{...session.params.path,projectId:id}}})
        if(!controller.signal.aborted)setPinned(instance.data?{id,version:instance.data.version,step:instance.data.step}:undefined)
      }else{
        const {data}=await session.api.GET("/api/tenants/{slug}/projects",{...opts,params:{path:session.params.path,query:{search:find,skip}}})
        if(!data)throw Error("Không thể tải danh sách hồ sơ.")
        if(!controller.signal.aborted)setProjects(data)
      }
    }
    read().catch(e=>{if(!controller.signal.aborted){setTrail(undefined);setProjects(undefined);setError(e.message)}})
    return ()=>controller.abort()
  },[id,session,find,range,skip,reload])
  function refresh(){setError("");setTrail(undefined);setProjects(undefined);setReload(n=>n+1)}
  const total=(id?trail:projects)?.total??0, size=id?25:20
  return <section className="grid gap-4 py-4" aria-label="Tra cứu hồ sơ">
    {id?<><Button className="justify-self-start" variant="outline" onClick={()=>select("")}>Về danh sách hồ sơ</Button>
      <h2>Lịch sử hồ sơ</h2>
      {!error && <form className="flex flex-wrap items-end gap-2" onSubmit={e=>{e.preventDefault();setSkip(0);setRange({...dates});refresh()}}>
        <label>Từ ngày<Input type="date" value={dates.from} onChange={e=>setDates({...dates,from:e.target.value})}/></label>
        <label>Đến ngày<Input type="date" value={dates.to} onChange={e=>setDates({...dates,to:e.target.value})}/></label>
        <Button variant="outline">Lọc sự kiện</Button></form>}
      {trail && <><h3>{trail.project.title}</h3>{trail.project.hasProposal&&<Button variant="outline" onClick={()=>setEditing(!editing)}>Mở thuyết minh</Button>}
        <Button variant="outline" onClick={()=>setProgress(!progress)}>Giao đề tài và tiến độ</Button>
        <Button variant="outline" onClick={()=>setBudget(!budget)}>Kinh phí đề tài</Button>
        <Button variant="outline" onClick={()=>setProducts(!products)}>Sản phẩm khoa học</Button>
        <Button variant="outline" onClick={()=>setAcceptance(!acceptance)}>Nghiệm thu đề tài</Button>
        {acceptance&&<Acceptance key={id} id={id} session={session}/>}
        {products&&<Products key={id} id={id} session={session}/>}
        {budget&&<Budget key={id} id={id} session={session}/>}
        {progress&&<ProgressPanel key={id} id={id} session={session}/>}
        {editing && trail.project.hasProposal && <ProposalEditor key={id} session={session} id={id}/>}{pinned?.id===id&&<p>Quy trình v{pinned.version} · Bước {pinned.step}</p>}<p>{trail.total} sự kiện · Giờ Việt Nam</p>
        <ol className="grid gap-3">{trail.items.map(row=><li key={row.id} className="rounded border p-3">
          <strong>{actions[row.action]??row.action}</strong> · <time dateTime={row.at}>{date.format(new Date(row.at))}</time>
          <p>{row.actorLabel}{row.unitLabel?" · "+row.unitLabel:""}</p>
          {(row.before||row.after)&&<p>{row.before??"Khởi tạo"} → {row.after}</p>}
          {row.reason && <p>{row.reason}</p>}{row.onBehalfOf && <p>Đại diện cho {row.onBehalfOf}</p>}
        </li>)}</ol></>}
    </>:<><h2>Hồ sơ nghiên cứu</h2>
      <form className="flex items-end gap-2" onSubmit={e=>{e.preventDefault();setSkip(0);setFind(search);refresh()}}>
        <label>Tên đề tài<Input value={search} onChange={e=>setSearch(e.target.value)}/></label><Button>Tìm hồ sơ</Button></form>
      {projects && <><p>{projects.total} hồ sơ trong phạm vi</p><ul>{projects.items.map(p=><li key={p.id}>
        <a className="underline" href={link(p.id)} onClick={e=>{if(!e.ctrlKey&&!e.metaKey){e.preventDefault();select(p.id)}}}>{p.title}</a>
        <span> · {p.status}</span></li>)}</ul></>}</>}
    {(skip>0||total>size)&&<div><Button disabled={!skip} onClick={()=>setSkip(Math.max(0,skip-size))}>Trang trước</Button>
      <Button disabled={skip+size>=total} onClick={()=>setSkip(skip+size)}>Trang sau</Button></div>}
    {error && <p role="alert">{error}</p>}<Button className="justify-self-start" variant="outline" onClick={refresh}>Tải lại {id?"lịch sử":"danh sách"}</Button>
  </section>
}
