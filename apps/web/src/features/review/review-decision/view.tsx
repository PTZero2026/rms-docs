import { ChoiceOption, ChoiceSelect } from "@rms/ui/components/choice-select"
import { Textarea } from "@rms/ui/components/textarea"
import { useState } from "react"
import { RoundAmendment } from "../amendment"
import { Button } from "@rms/ui/components/button"
import type { operations } from "@rms/api-contracts"
import type { SignedInSession } from "../../../auth/session"

export type Round=operations["getManagedRound"]["responses"][200]["content"]["application/json"]
type Ethics=operations["recordReviewEthics"]["requestBody"]["content"]["application/json"]
const labels:Record<string,string>={UNDER_REVIEW:"Đang xét duyệt",APPROVED:"Đã phê duyệt",REJECTED:"Đã từ chối",PASSED:"Đạt",FAILED:"Không đạt",
  EXEMPT:"Miễn thẩm định",PENDING:"Chờ hội đồng đạo đức",SUPPLEMENT:"Cần bổ sung"}
export const translated=(s:string)=>labels[s]??s
export function ReviewDecision({session,round,onChange}:{session:SignedInSession;round:Round;onChange:(r:Round)=>void}) {
  const [message,setMessage]=useState(""),[pending,setPending]=useState(false)
  const [result,setResult]=useState<Ethics["result"]>("SUPPLEMENT"),[note,setNote]=useState("")
  async function save(ethics:boolean) {
    setPending(true);setMessage("")
    try{
      const params={path:{...session.params.path,id:round.id}}
      const r=ethics?await session.api.PUT("/api/tenants/{slug}/review/rounds/{id}/ethics",{params,body:{result,note}}):
        await session.api.POST("/api/tenants/{slug}/review/rounds/{id}/conclusion",{params,body:{revision:round.decisionRevision}})
      if(!r.data)throw Error(r.error?.message??"Chưa thể lưu quyết định.")
      onChange(r.data);setMessage(ethics?"Đã ghi kết quả đạo đức.":"Đã chốt kết luận khoa học.")
    }catch(e){setMessage(e instanceof Error?e.message:"Không thể kết nối.")}finally{setPending(false)}
  }
  return <section className="grid gap-2 rounded border p-3"><h3>{round.title}</h3>
    <p>Trạng thái đề tài · {translated(round.projectStatus)}</p>
    <p>{round.count} phiếu hợp lệ · {round.conclusion?"Khoa học "+translated(round.conclusion):"Đang thu phiếu"}</p>
    {round.conclusion&&<p>Điểm trung bình {round.mean} · Ngưỡng đạt {round.passing} · Tối thiểu {round.minimum} phiếu</p>}
    <p>Người đủ điều kiện chấm · {round.eligible.map(e=>e.label).join(", ")}</p>
    {!round.conclusion&&<Button disabled={pending} onClick={()=>void save(false)}>Chốt kết luận khoa học</Button>}
    <p>Thẩm định đạo đức · {translated(round.ethics)}</p>{round.ethicsNote&&<p>{round.ethicsNote}</p>}
    {round.projectStatus==="UNDER_REVIEW"&&["PENDING","SUPPLEMENT"].includes(round.ethics)&&
      <fieldset disabled={pending} className="grid gap-2"><label>Kết quả của hội đồng đạo đức <ChoiceSelect value={result} onValueChange={choiceValue => setResult(choiceValue as Ethics["result"])}>
        <ChoiceOption value="SUPPLEMENT">Yêu cầu bổ sung</ChoiceOption><ChoiceOption value="APPROVED">Thông qua</ChoiceOption><ChoiceOption value="REJECTED">Từ chối cuối cùng</ChoiceOption></ChoiceSelect></label>
        <label>Căn cứ hoặc yêu cầu bổ sung<Textarea className="block w-full rounded border p-2" value={note} onChange={e=>setNote(e.target.value)}/></label>
        <Button disabled={!note.trim()} onClick={()=>void save(true)}>Ghi kết quả đạo đức</Button></fieldset>}
    <p role="status">{message}</p>
    <RoundAmendment session={session} id={round.id} status={[round.status,round.projectStatus].join("/")} onChanged={async()=>{
      const r=await session.api.GET("/api/tenants/{slug}/review/rounds/{id}",{params:{path:{...session.params.path,id:round.id}},cache:"no-store"})
      if(!r.data)throw Error("Cần tải lại vòng để xem trạng thái mới.")
      setMessage("");onChange(r.data)
    }}/></section>
}
export function OwnerResult({session,id}:{session:SignedInSession;id:string}){
  const [data,setData]=useState<operations["getReviewResult"]["responses"][200]["content"]["application/json"]>()
  const [error,setError]=useState("")
  async function load(){
    setData(undefined)
    try{
      const r=await session.api.GET("/api/tenants/{slug}/projects/{id}/review-result",{params:{path:{...session.params.path,id}},cache:"no-store"})
      if(!r.data)throw Error("Chưa có kết quả xét duyệt trong phạm vi của bạn.")
      setData(r.data);setError("")
    }catch(e){setError(e instanceof Error?e.message:"Không thể kết nối.")}
  }
  return <section className="grid gap-2"><Button variant="outline" onClick={()=>void load()}>Xem kết quả xét duyệt</Button>
    {data&&<><p>Đề tài · {translated(data.projectStatus)}</p><p>Khoa học · {data.conclusion?translated(data.conclusion):"Đang chấm"}</p>
      <p>Đạo đức · {translated(data.ethics)}</p>{data.ethicsNote&&<p>{data.ethicsNote}</p>}
      {!!data.comments.length&&<ul aria-label="Nhận xét công bố">{data.comments.map((c,i)=><li key={i}>{c}</li>)}</ul>}</>}
    {error&&<p role="status">{error}</p>}</section>
}
