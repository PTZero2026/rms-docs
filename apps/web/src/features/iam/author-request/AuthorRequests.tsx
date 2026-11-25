import { ValidatedForm } from "@rms/ui/components/validated-form"
import { Textarea } from "@rms/ui/components/textarea"
import { useEffect, useState } from "react"
import type { operations } from "@rms/api-contracts"
import { Button } from "@rms/ui/components/button"
import { Input } from "@rms/ui/components/input"
import type { SignedInSession } from "../../../auth/session"

type Entry=operations["submitAuthorRequest"]["responses"][200]["content"]["application/json"]
const labels={PENDING:"Chờ duyệt",APPROVED:"Đã duyệt",REJECTED:"Đã từ chối"}

export function AuthorRequests({session,queue=false,canApply=false}:{session:SignedInSession;queue?:boolean;canApply?:boolean}) {
  const [items,setItems]=useState<Entry[]>(),[message,setMessage]=useState(""),[busy,setBusy]=useState(false),[refresh,setRefresh]=useState(0)
  const [selected,setSelected]=useState(""),[note,setNote]=useState("")
  useEffect(()=>{
    const controller=new AbortController()
    const options={params:session.params,cache:"no-store" as const,signal:controller.signal}
    const load=queue?session.api.GET("/api/tenants/{slug}/users/author-requests",options):session.api.GET("/api/tenants/{slug}/users/me/author-request",options)
    load.then(({data})=>{
      if(controller.signal.aborted)return
      setItems(data)
      if(!data)setMessage("Không đọc được yêu cầu trong phạm vi tài khoản.")
    }).catch(()=>{if(!controller.signal.aborted){setItems(undefined);setMessage("Không thể kết nối.")}})
    return ()=>controller.abort()
  },[queue,session,refresh])

  async function perform(send:()=>Promise<{data?:Entry;error?:unknown}>,success:string) {
    if(busy)return
    setBusy(true);setMessage("")
    try{
      const result=await send()
      if(!result.data)throw Error((result.error as {message?:string})?.message||"Yêu cầu chưa được lưu.")
      setSelected("");setNote("");setMessage(success);setRefresh(n=>n+1)
    }catch(e){setMessage(e instanceof Error?e.message:"Không thể kết nối.")}finally{setBusy(false)}
  }
  function submit(form:FormData) {
    const field=(k:string)=>String(form.get(k)??"").trim()
    const data={academicTitle:field("title"),specialty:field("specialty"),evidenceFileUrls:field("evidence").split(/\r?\n/).map(s=>s.trim()).filter(Boolean),
      licenseNo:field("license")||undefined,researchDirection:field("direction")||undefined,graduationYear:field("year")?Number(field("year")):undefined}
    void perform(()=>session.api.POST("/api/tenants/{slug}/users/me/author-request",{params:session.params,body:data}),"Đã gửi yêu cầu lên tác giả.")
  }
  function review(id:string,approve:boolean) {
    const options={params:{path:{...session.params.path,id}},body:{adminNote:note}}
    void perform(()=>approve?session.api.PATCH("/api/tenants/{slug}/users/author-requests/{id}/approve",options):
      session.api.PATCH("/api/tenants/{slug}/users/author-requests/{id}/reject",options),approve?"Đã duyệt quyền tác giả.":"Đã từ chối yêu cầu.")
  }
  return <section className="grid gap-3" aria-label={queue?"Duyệt yêu cầu tác giả":"Yêu cầu quyền tác giả"}>
    {items&&canApply&&items[0]?.status!=="APPROVED"&&!items.some(r=>r.status==="PENDING")&&<ValidatedForm className="grid gap-2" onSubmit={e=>{e.preventDefault();submit(new FormData(e.currentTarget))}}>
      <label>Học hàm hoặc học vị<Input name="title" required maxLength={160}/></label>
      <label>Chuyên môn<Input name="specialty" required maxLength={240}/></label>
      <label>Số chứng chỉ<Input name="license" maxLength={100}/></label>
      <label>Năm tốt nghiệp<Input name="year" type="number" min={1}/></label>
      <label>Hướng nghiên cứu<Input name="direction" maxLength={2000}/></label>
      <label>Đường dẫn minh chứng HTTPS, mỗi dòng một đường dẫn<Textarea className="block w-full rounded border p-2" name="evidence" required/></label>
      <Button type="submit" disabled={busy}>Gửi yêu cầu lên tác giả</Button></ValidatedForm>}
    {items?.length===0&&<p>{queue?"Chưa có yêu cầu chờ duyệt.":"Chưa có yêu cầu."}</p>}
    {items?.map(r=><article key={r.id} className="grid gap-2 rounded border p-3"><h4>{r.email} · {labels[r.status]}</h4>
      <p>{r.application.academicTitle} · {r.application.specialty}</p>
      {r.application.licenseNo&&<p>Số chứng chỉ · {r.application.licenseNo}</p>}
      {r.application.graduationYear&&<p>Năm tốt nghiệp · {r.application.graduationYear}</p>}
      {r.application.researchDirection&&<p>Hướng nghiên cứu · {r.application.researchDirection}</p>}
      {r.application.evidenceFileUrls.map(url=><a className="break-all underline" key={url} href={url} target="_blank" rel="noreferrer">{url}</a>)}
      {r.adminNote&&<p>Ý kiến quản trị · {r.adminNote}</p>}
      {queue&&(selected===r.id?<div className="grid gap-2"><label>Ý kiến thẩm định<Input value={note} onChange={e=>setNote(e.target.value)}/></label>
        <div><Button disabled={busy} onClick={()=>review(r.id,true)}>Duyệt quyền tác giả</Button> <Button variant="outline" disabled={busy||!note.trim()} onClick={()=>review(r.id,false)}>Từ chối yêu cầu</Button></div></div>:
        <Button variant="outline" onClick={()=>{setSelected(r.id);setNote("")}}>Thẩm định {r.email}</Button>)}</article>)}
    <Button variant="outline" disabled={busy} onClick={()=>setRefresh(n=>n+1)}>Tải lại yêu cầu</Button><p role="status">{message}</p>
  </section>
}
