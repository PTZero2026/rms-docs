import { useCallback,useEffect,useState } from "react"
import type { components } from "@rms/api-contracts"
import { semanticCodes } from "@rms/api-contracts/workflow"
import { Button } from "@rms/ui/components/button"
import { Input } from "@rms/ui/components/input"
import type { SignedInSession } from "../../../auth/session"

type Graph=components["schemas"]["WorkflowGraph"]
type Step=Graph["steps"][number]
type Edge=Graph["transitions"][number]
function choices<T extends string>(label:string,values:readonly T[],selected:T[],change:(next:T[])=>void) {
  return <fieldset><legend>{label}</legend><div className="flex flex-wrap gap-3">{values.map(v=><label key={v}><input type="checkbox" checked={selected.includes(v)} onChange={e=>change(e.target.checked?[...selected,v]:selected.filter(x=>x!==v))}/> {v}</label>)}</div></fieldset>
}
export default function WorkflowEditor({session}:{session:SignedInSession}) {
  const [graph,setGraph]=useState<Graph>(),[version,setVersion]=useState(0)
  const [si,setSi]=useState(0),[ei,setEi]=useState(0)
  const [busy,setBusy]=useState(false),[message,setMessage]=useState("")
  const load=useCallback(async()=>{
    const {data}=await session.api.GET("/api/tenants/{slug}/workflow/active",{params:session.params,cache:"no-store"})
    if(!data)throw Error("Không thể đọc mẫu quy trình.")
    return data
  },[session])
  useEffect(()=>{let active=true;load().then(x=>{if(active){setVersion(x.version);setGraph(x.graph)}}).catch(e=>{if(active)setMessage(e.message)});return()=>{active=false}},[load])
  if(!graph)return <p role="status">{message||"Đang đọc mẫu quy trình…"}</p>
  const g=graph, step=g.steps[si],edge=g.transitions[ei]
  function updateStep(patch:Partial<Step>) {
    const rename=patch.code!==undefined && patch.code!==step.code
    setGraph({...g,steps:g.steps.map((s,i)=>i===si?{...s,...patch}:s),
      transitions:rename?g.transitions.map(t=>({...t,from:t.from===step.code?patch.code!:t.from,to:t.to===step.code?patch.code!:t.to})):g.transitions})
  }
  function updateEdge(patch:Partial<Edge>){setGraph({...g,transitions:g.transitions.map((t,i)=>i===ei?{...t,...patch}:t)})}
  async function activate(){
    setBusy(true);setMessage("")
    try{
      const result=await session.api.PUT("/api/tenants/{slug}/workflow/active",{params:session.params,body:{version,graph:g}})
      if(!result.data) {
        const err=result.error as {message?:string}|undefined
        throw Error(result.response.status===409?"Phiên bản đã đổi. Tải lại mẫu trước khi soạn tiếp.":err?.message??"Không thể kích hoạt mẫu.")
      }
      setVersion(result.data.version);setGraph(result.data.graph);setMessage("Đã kích hoạt mẫu cho hồ sơ mới.")
    }catch(e){setMessage(e instanceof Error?e.message:"Không thể kết nối.")}finally{setBusy(false)}
  }
  return <section className="grid gap-4 py-4"><h2>Mẫu quy trình · {version?"Phiên bản "+version:"Chưa kích hoạt"}</h2>
    <fieldset disabled={busy} className="grid gap-3 rounded border p-4"><legend>Bước xử lý</legend>
      <label>Chọn bước <select value={si} onChange={e=>setSi(+e.target.value)}>{g.steps.map((s,i)=><option key={i} value={i}>{s.code||"Bước mới"}</option>)}</select></label>
      {step && <><label>Mã bước<Input value={step.code} onChange={e=>updateStep({code:e.target.value})}/></label>
        <label>Trạng thái chuẩn <select value={step.semantic} onChange={e=>updateStep({semantic:e.target.value as Step["semantic"]})}>{semanticCodes.map(code=><option key={code}>{code}</option>)}</select></label>
        <div className="flex gap-4"><label><input type="checkbox" checked={step.initial} onChange={e=>updateStep({initial:e.target.checked})}/> Bước đầu</label>
        <label><input type="checkbox" checked={step.final} onChange={e=>updateStep({final:e.target.checked})}/> Kết thúc</label></div></>}
      <div className="flex gap-2"><Button variant="outline" onClick={()=>{setSi(g.steps.length);setGraph({...g,steps:[...g.steps,{code:"",semantic:"DRAFT",initial:false,final:false}]})}}>Thêm bước</Button>
      {step && <Button variant="outline" onClick={()=>{setSi(0);setGraph({...g,steps:g.steps.filter((_,i)=>i!==si)})}}>Bỏ bước</Button>}</div>
    </fieldset>
    <fieldset disabled={busy} className="grid gap-3 rounded border p-4"><legend>Chuyển bước</legend>
      <label>Chọn thao tác <select value={ei} onChange={e=>setEi(+e.target.value)}>{g.transitions.map((t,i)=><option key={i} value={i}>{t.code||"Thao tác mới"}</option>)}</select></label>
      {edge && <><label>Mã thao tác<Input value={edge.code} onChange={e=>updateEdge({code:e.target.value})}/></label>
        <div className="flex flex-wrap gap-3">{(["from","to"] as const).map(k=><label key={k}>{k==="from"?"Bước nguồn":"Bước đích"} <select value={edge[k]} onChange={e=>updateEdge({[k]:e.target.value})}>{g.steps.map((s,i)=><option key={i}>{s.code}</option>)}</select></label>)}</div>
        {choices("Vai trò thực hiện",["admin","staff","author","user"],edge.roles,roles=>updateEdge({roles}))}
        {choices("Điều kiện",["requireComment","validateProposalContent","authorCancellableOnly"],edge.guards,guards=>updateEdge({guards}))}
        {choices("Tác vụ sau chuyển",["syncProposalStatus","setRevisionDeadline","clearRevision","notify"],edge.effects,effects=>updateEdge({effects}))}
        <label><input type="checkbox" checked={edge.requiresComment} onChange={e=>updateEdge({requiresComment:e.target.checked})}/> Bắt buộc ghi lý do</label></>}
      <div className="flex gap-2"><Button variant="outline" onClick={()=>{setEi(g.transitions.length);setGraph({...g,transitions:[...g.transitions,{code:"",from:g.steps[0]?.code??"",to:g.steps[1]?.code??"",roles:["staff"],requiresComment:false,guards:[],effects:[]}]})}}>Thêm thao tác</Button>
      {edge && <Button variant="outline" onClick={()=>{setEi(0);setGraph({...g,transitions:g.transitions.filter((_,i)=>i!==ei)})}}>Bỏ thao tác</Button>}</div>
    </fieldset><div className="flex flex-wrap gap-2"><Button disabled={busy} onClick={()=>void activate()}>Kích hoạt phiên bản {version+1}</Button>
      <Button variant="outline" disabled={busy} onClick={()=>void load().then(x=>{setGraph(x.graph);setVersion(x.version);setSi(0);setEi(0);setMessage("")}).catch(e=>setMessage(e.message))}>Tải lại mẫu</Button></div><p role="status">{message}</p></section>
}
