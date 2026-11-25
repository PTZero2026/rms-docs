import { useCallback,useEffect,useRef,useState,type MouseEvent } from "react"
import { Button } from "@rms/ui/components/button"
import type { operations } from "@rms/api-contracts"
import type { SignedInSession } from "../../../auth/session"
import { formatVietnamDate } from "../../../format-date"
import {reportBookmark,reportLocation} from "./location"

type Snapshot=operations["getCallReport"]["responses"][200]["content"]["application/json"]
type Filters=operations["getCallReportFilters"]["responses"][200]["content"]["application/json"]
const labels:Record<string,string>={DRAFT:"Nháp",SUBMITTED:"Đã nộp",UNDER_REVIEW:"Đang xét duyệt",APPROVED:"Đã phê duyệt",REJECTED:"Đã từ chối",IN_PROGRESS:"Đang thực hiện",COMPLETED:"Đã hoàn thành",
  SUSPENDED:"Tạm dừng",PENDING_ACCEPTANCE:"Chờ nghiệm thu",UNDER_ACCEPTANCE:"Đang nghiệm thu",PASSED:"Đạt nghiệm thu",FAILED:"Không đạt",CANCELLED:"Đã hủy"}
export default function CallReport({session,canExport,initialUnit=""}:{session:SignedInSession;canExport:boolean;initialUnit?:string|null}){
  const [filters,setFilters]=useState<Filters>(),[call,setCall]=useState(""),[unit,setUnit]=useState<string|null>(initialUnit),[snapshot,setSnapshot]=useState<Snapshot>()
  const [group,setGroup]=useState(""),[error,setError]=useState("")
  const [busy,setBusy]=useState(()=>!!reportBookmark(new URLSearchParams(location.search)))
  const panel=useRef<HTMLElement>(null)
  const readFilters=useCallback(async(signal?:AbortSignal)=>{
    const {data}=await session.api.GET("/api/tenants/{slug}/reports/calls/filters",{params:session.params,cache:"no-store",signal})
    if(signal?.aborted)return false
    setFilters(data)
    setUnit(current=>current&&!data?.units.some(u=>u.id===current)?null:current)
    return !!data
  },[session])
  useEffect(()=>{
    const c=new AbortController()
    const saved=reportBookmark(new URLSearchParams(location.search))
    const opts={cache:"no-store" as const,signal:c.signal}
    async function open(){
      const allowed=await readFilters(c.signal)
      if(c.signal.aborted)return
      if(!allowed){setError("Không thể mở phạm vi báo cáo.");return}
      if(!saved)return
      const result=await session.api.GET("/api/tenants/{slug}/reports/calls/snapshots/{id}",{params:{path:{...session.params.path,id:saved.id}},...opts})
      if(c.signal.aborted)return
      if(!result.data){
        setError(result.response.status===409?"Phạm vi đã thay đổi. Hãy tạo bản chụp mới.":"Không thể mở bản chụp trong phạm vi hiện tại.")
        return
      }
      const report=result.data
      setCall(report.callId)
      setUnit(saved.singleUnit&&report.unitIds.length===1?report.unitIds[0]:"")
      setGroup(saved.group==="*"||Object.hasOwn(report.groups,saved.group)?saved.group:"")
      setSnapshot(report)
    }
    void open().catch(()=>{if(!c.signal.aborted)setError("Không tải được kỳ báo cáo.")})
      .finally(()=>{if(saved&&!c.signal.aborted)setBusy(false)})
    // A document revived by Back must read the current account scope again.
    const hide=(e:PageTransitionEvent)=>{if(e.persisted&&panel.current)panel.current.style.visibility="hidden"}
    const recheck=(e:PageTransitionEvent)=>{if(e.persisted)location.reload()}
    window.addEventListener("pagehide",hide)
    window.addEventListener("pageshow",recheck)
    return ()=>{c.abort();window.removeEventListener("pagehide",hide);window.removeEventListener("pageshow",recheck)}
  },[session,readFilters])
  function clearSnapshot(){
    setSnapshot(undefined);setGroup("");setError("")
    if(reportBookmark(new URLSearchParams(location.search)))history.replaceState(history.state,"","?report=home")
  }
  function openProject(event:MouseEvent<HTMLAnchorElement>){
    if(!snapshot||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return
    event.preventDefault()
    history.replaceState(history.state,"","?"+reportLocation(snapshot.id,!!unit,group))
    history.pushState(null,"",event.currentTarget.href)
    window.dispatchEvent(new PopStateEvent("popstate"))
  }
  async function load(action:"generate"|"details"|"export",semantic=""){
    if(busy)return
    setBusy(true);setError("")
    let status=0
    try{
      const params={path:{...session.params.path,id:snapshot?.id??""}}
      if(action==="export"){
        if(!snapshot)return
        const r=await session.api.GET("/api/tenants/{slug}/reports/calls/snapshots/{id}/csv",{params,cache:"no-store",parseAs:"blob"})
        status=r.response.status
        if(!r.data)throw Error("Không thể xuất theo phạm vi hiện tại. Hãy tạo bản chụp mới.")
        const url=URL.createObjectURL(r.data),a=document.createElement("a");a.href=url;a.download="doi-chieu-"+snapshot.callCode+"-"+snapshot.id+".csv";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
      }else{
        const r=action==="generate"?await session.api.POST("/api/tenants/{slug}/reports/calls/snapshots",{params:session.params,body:{callId:call,...(unit?{unitId:unit}:{})}}):
          await session.api.GET("/api/tenants/{slug}/reports/calls/snapshots/{id}",{params,cache:"no-store"})
        status=r.response.status
        if(!r.data)throw Error(r.error?.message||"Bản chụp ngoài phạm vi.")
        setSnapshot(r.data);setGroup(semantic)
        if(new URLSearchParams(location.search).get("report")==="home"){
          history.replaceState(history.state,"","?"+reportLocation(r.data.id,!!unit,semantic))
        }
      }
    }catch(e){
      setSnapshot(undefined);setError(e instanceof Error?e.message:"Không thể tải báo cáo.")
      if([401,403,404,409].includes(status)){
        setFilters(undefined)
        await readFilters().catch(()=>setUnit(null))
      }
    }finally{setBusy(false)}
  }
  return <section ref={panel} aria-label="Báo cáo tiếp nhận" className="grid min-w-0 gap-3 py-4"><h2>Báo cáo tiếp nhận</h2>
    {filters&&<fieldset disabled={busy} className="flex flex-wrap items-end gap-3"><label>Kỳ báo cáo <select value={call} onChange={e=>{setCall(e.target.value);clearSnapshot()}}>
      <option value="">Chọn kỳ</option>{filters.calls.map(c=><option value={c.id} key={c.id}>{c.label}</option>)}</select></label>
      <label>Đơn vị báo cáo <select value={unit??"choose"} onChange={e=>{setUnit(e.target.value);clearSnapshot()}}>
        {unit===null&&<option disabled value="choose">Chọn phạm vi báo cáo</option>}<option value="">Các đơn vị trong quyền</option>
        {filters.units.map(u=><option key={u.id} value={u.id}>{u.label}</option>)}</select></label>
      <Button disabled={!call||unit===null||busy} onClick={()=>void load("generate")}>Tạo bản chụp</Button></fieldset>}
    {snapshot&&<><p>{snapshot.callCode} · Trích xuất {formatVietnamDate(snapshot.capturedAt, "second")} (giờ Việt Nam)</p>
      <p className="break-all">Mã bản chụp · <a className="underline" href={"?"+reportLocation(snapshot.id,!!unit,group)}>{snapshot.id}</a></p>
      <p>Phạm vi · {snapshot.units.join(", ")}. Tổng cộng {snapshot.total} hồ sơ.</p>
      <div className="flex flex-wrap gap-2"><Button variant={group==="*"?"default":"outline"} aria-pressed={group==="*"} disabled={busy} onClick={()=>void load("details","*")}>Tất cả mã đã cấp</Button>
        {Object.entries(snapshot.groups).map(([s,n])=><Button variant={group===s?"default":"outline"} key={s} aria-pressed={group===s} disabled={busy} onClick={()=>void load("details",s)}>{labels[s]??s} ({n})</Button>)}</div>
      {group&&<ul aria-label="Mã đối chứng" className="grid gap-2">{snapshot.rows.filter(r=>group==="*"||r.semantic===group).map(r=><li className="break-words rounded border p-2" key={r.id}>
        <a className="underline" href={"?project="+r.id} onClick={openProject}>{r.title}</a><p className="break-all">{r.code}</p><p>{r.unit} · {labels[r.semantic]??r.semantic}</p></li>)}</ul>}
      {canExport&&<Button disabled={busy} onClick={()=>void load("export")}>Xuất CSV đối chứng</Button>}</>}
    {error&&<p role="alert">{error}</p>}</section>
}
