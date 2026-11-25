import { ChoiceOption, ChoiceSelect } from "@rms/ui/components/choice-select"
import { Checkbox } from "@rms/ui/components/checkbox"
import {useEffect,useState} from "react"
import {Button} from "@rms/ui/components/button"
import type {operations} from "@rms/api-contracts"
import {allowedWidgets,type HomeRole,type HomeWidget} from "@rms/api-contracts/home-layout"
import type {SignedInSession} from "../../../auth/session"
import {formatVietnamDate} from "../../../format-date"

const endpoint="/api/tenants/{slug}/catalog/configurations/home-layouts/{role}"
type Settings=operations["getHomeLayoutSettings"]["responses"][200]["content"]["application/json"]
const roles:Record<HomeRole,string>={user:"Người dùng cơ bản",author:"Nhà nghiên cứu",staff:"Chuyên viên",admin:"Quản trị"}
const labels:Record<HomeWidget,string>={tasks:"Việc cần làm",projects:"Số liệu nhanh",activity:"Thông báo gần đây",shortcuts:"Lối tắt",teaching:"Giờ giảng"}
const sources={default:"Mặc định của hệ thống",shared:"Cấu hình dùng chung",tenant:"Cấu hình của trường"}
const actions={CREATE:"Tạo bản riêng",UPDATE:"Cập nhật",DELETE:"Xóa bản riêng"}
type Props={session:SignedInSession;close:()=>void;onAccessLost:()=>void}

function describe(widgets:HomeWidget[]|null){
  if(widgets===null)return "Chưa có dữ liệu đối chiếu"
  return widgets.length?widgets.map(w=>labels[w]).join(" → "):"Ẩn tất cả thẻ"
}

function LayoutForm({session,role,changeRole,close,onAccessLost}:Props & {role:HomeRole;changeRole:(role:HomeRole)=>void}){
  const [current,setCurrent]=useState<Settings>()
  const [draft,setDraft]=useState<HomeWidget[]>([])
  const [page,setPage]=useState<{offset:number;data:Settings}>()
  const [request,setRequest]=useState({skip:0,reset:true})
  const [busy,setBusy]=useState(true),[stale,setStale]=useState(false)
  const [error,setError]=useState(""),[message,setMessage]=useState("")
  useEffect(()=>{
    const controller=new AbortController()
    async function read(){
      try {
        const {data,response}=await session.config.GET(endpoint,{params:{path:{...session.params.path,role},query:{skip:request.skip}},signal:controller.signal,cache:"no-store"})
        if(controller.signal.aborted)return
        if(response.status===401||response.status===403){onAccessLost();return}
        if(!data)throw Error()
        if(request.reset){setCurrent(data);setDraft(data.widgets);setStale(false)}
        setPage({offset:request.skip,data})
      } catch {if(!controller.signal.aborted)setError("Chưa tải được bố cục và lịch sử.")}
      finally {if(!controller.signal.aborted)setBusy(false)}
    }
    void read()
    return ()=>controller.abort()
  },[request,role,session,onAccessLost])

  function load(skip:number,reset:boolean){
    setBusy(true);setMessage("");setError("");setRequest({skip,reset})
  }
  function change(widgets:HomeWidget[]){
    setDraft(widgets);setMessage("")
  }
  function move(index:number,delta:number){
    const next=[...draft]
    const [widget]=next.splice(index,1)
    next.splice(index+delta,0,widget)
    change(next)
  }
  async function save(){
    if(!current||busy||stale)return
    setBusy(true);setError("");setMessage("")
    try {
      const {data,response}=await session.config.PUT(endpoint,{params:{path:{...session.params.path,role}},body:{revision:current.revision,widgets:draft}})
      if(response.status===401||response.status===403){onAccessLost();return}
      if(response.status===409){
        setStale(true);setError("Bố cục đã thay đổi. Tải bản hiện hành để xem và chỉnh sửa tiếp.");return
      }
      if(!data)throw Error()
      setCurrent(data);setDraft(data.widgets);setPage({offset:0,data});setMessage("Đã lưu cấu hình trang chủ.")
    } catch {setError("Chưa xác nhận được kết quả lưu. Tải bản hiện hành để kiểm tra.")}
    finally {setBusy(false)}
  }
  const ordered=[...draft,...allowedWidgets(role,true).filter(w=>!draft.includes(w))]
  const changed=current&&current.widgets.join(",")!==draft.join(",")
  return <section aria-label="Bố cục trang chủ theo vai trò" className="grid min-w-0 max-w-2xl gap-4 py-4">
    <header className="flex flex-wrap items-center justify-between gap-2"><h2>Bố cục trang chủ theo vai trò</h2>
      <Button variant="outline" disabled={busy} onClick={close}>Về cấu hình hệ thống</Button></header>
    <label className="grid gap-1">Vai trò áp dụng
      <ChoiceSelect value={role} disabled={busy} className="rounded border p-2" onValueChange={choiceValue => changeRole(choiceValue as HomeRole)}>
        {Object.entries(roles).map(([key,name])=><ChoiceOption key={key} value={key}>{name}</ChoiceOption>)}
      </ChoiceSelect>
    </label>
    {current&&<fieldset disabled={busy||stale} className="grid min-w-0 gap-2">
      <legend className="font-semibold">Thẻ và thứ tự hiển thị</legend>
      <p className="text-sm">{sources[current.source]} · {session.params.path.slug}</p>
      <ol className="divide-y rounded border px-2">
        {ordered.map((widget,i)=>{
          const selected=i<draft.length
          return <li key={widget} className="flex flex-wrap items-center justify-between gap-2 py-2">
            <label className="flex min-h-10 items-center gap-2"><Checkbox checked={selected} aria-label={labels[widget]}
              onCheckedChange={checked => change(checked?[...draft,widget]:draft.filter(w=>w!==widget))}/>{labels[widget]}</label>
            {selected&&<div className="flex gap-1">
              <Button variant="outline" size="sm" aria-label={"Đưa "+labels[widget]+" lên"} disabled={i===0} onClick={()=>move(i,-1)}>Lên</Button>
              <Button variant="outline" size="sm" aria-label={"Đưa "+labels[widget]+" xuống"} disabled={i===draft.length-1} onClick={()=>move(i,1)}>Xuống</Button>
            </div>}
          </li>
        })}
      </ol>
      <p className="text-sm">Thẻ giờ giảng chỉ xuất hiện khi trường bật E4 và P03.</p>
      <Button className="justify-self-start" disabled={!changed} onClick={()=>void save()}>Lưu bố cục</Button>
    </fieldset>}
    {busy&&<p role="status">Đang xử lý…</p>}
    {message&&<p role="status">{message}</p>}
    {error&&<div className="grid justify-items-start gap-2"><p role="alert">{error}</p>
      <Button variant="outline" disabled={busy} onClick={()=>load(0,true)}>Tải bản hiện hành</Button></div>}
    {page&&<section className="grid min-w-0 gap-2" aria-label="Lịch sử bố cục">
      <h3 className="font-semibold">Lịch sử bố cục</h3>
      {!page.data.total&&<p>Chưa có thay đổi của trường cho vai trò này.</p>}
      <ol className="grid gap-2">{page.data.history.map(entry=><li key={entry.id} className="grid gap-1 rounded border p-3">
        <div className="flex flex-wrap items-baseline justify-between gap-1"><strong>{actions[entry.action]}</strong>
          <time dateTime={entry.occurredAt} className="text-sm">{formatVietnamDate(entry.occurredAt,"second")}</time></div>
        <p className="break-all text-sm">{entry.actorEmail??entry.actorId}</p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 text-sm"><dt>Trước</dt><dd>{describe(entry.before)}</dd>
          <dt>Sau</dt><dd>{describe(entry.after)}</dd></dl>
      </li>)}</ol>
      {page.data.total>10&&<div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" disabled={busy||page.offset===0} onClick={()=>load(page.offset-10,false)}>Trang trước</Button>
        <span>{page.offset+1}–{Math.min(page.offset+10,page.data.total)} / {page.data.total}</span>
        <Button variant="outline" disabled={busy||page.offset+10>=page.data.total} onClick={()=>load(page.offset+10,false)}>Trang sau</Button>
      </div>}
    </section>}
  </section>
}

export function HomeLayoutEditor(props:Props){
  const [role,setRole]=useState<HomeRole>("author")
  return <LayoutForm key={role} {...props} role={role} changeRole={setRole}/>
}
