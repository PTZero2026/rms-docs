import { ChoiceOption, ChoiceSelect } from "@rms/ui/components/choice-select"
import { Checkbox } from "@rms/ui/components/checkbox"
import {useState} from "react"
import {Button} from "@rms/ui/components/button"
import {Input} from "@rms/ui/components/input"
import type {operations} from "@rms/api-contracts"
import type {SignedInSession} from "../../auth/session"

type Page=operations["listStudentProjects"]["responses"][200]["content"]["application/json"]
type Props={session:SignedInSession;item:Page["items"][number];refresh:()=>void}

export function StudentAmendment({session,item,refresh}:Props){
  const [people,setPeople]=useState<Page["people"]>(),[busy,setBusy]=useState(false),[error,setError]=useState("")
  const [title,setTitle]=useState(item.title),[objective,setObjective]=useState(item.objective),[product,setProduct]=useState(item.product)
  const [members,setMembers]=useState(item.members),[mentorId,setMentor]=useState(item.mentorId),[reason,setReason]=useState("")
  const params={path:{...session.params.path,id:item.id}}
  async function edit(){
    setBusy(true);setError("")
    try{
      const r=await session.api.GET("/api/tenants/{slug}/student-projects/{id}/amendment",{params,cache:"no-store"})
      if(!r.data)throw Error(r.error?.message??"Không thể mở danh sách của khoa.")
      setPeople(r.data)
    }catch(e){setError(e instanceof Error?e.message:"Không thể kết nối.")}finally{setBusy(false)}
  }
  async function save(){
    setBusy(true);setError("")
    try{
      const r=await session.api.POST("/api/tenants/{slug}/student-projects/{id}/amendment",{params,
        body:{revision:item.revision,title,objective,product,members,mentorId,reason}})
      if(!r.data)throw Error(r.error?.message??"Không thể điều chỉnh đề tài.")
      refresh()
    }catch(e){setError(e instanceof Error?e.message:"Không thể kết nối.")}finally{setBusy(false)}
  }
  return <div className="grid gap-2">
    {!people?<Button variant="outline" disabled={busy} onClick={()=>void edit()}>Điều chỉnh hồ sơ đã duyệt</Button>:
      <fieldset className="grid gap-2 rounded border p-3" disabled={busy}><legend>Điều chỉnh sau phê duyệt</legend>
        <label>Tên đề tài điều chỉnh<Input value={title} maxLength={500} onChange={e=>setTitle(e.target.value)}/></label>
        <label>Mục tiêu điều chỉnh<Input value={objective} maxLength={4000} onChange={e=>setObjective(e.target.value)}/></label>
        <label>Sản phẩm dự kiến sau điều chỉnh<Input value={product} maxLength={4000} onChange={e=>setProduct(e.target.value)}/></label>
        <label>Giảng viên phụ trách bản điều chỉnh<ChoiceSelect value={mentorId} onValueChange={setMentor}>
          {!people.some(p=>p.id===mentorId&&p.kind==="MENTOR")&&<ChoiceOption value={mentorId}>Chọn giảng viên hiện hành</ChoiceOption>}
          {people.filter(p=>p.kind==="MENTOR").map(p=><ChoiceOption key={p.id} value={p.id}>{p.label}</ChoiceOption>)}</ChoiceSelect></label>
        <fieldset><legend>Nhóm sinh viên sau điều chỉnh</legend>
          {people.filter(p=>p.kind==="STUDENT").map(p=><label key={p.id} className="block"><Checkbox checked={members.includes(p.id)} disabled={p.id===item.leader}
            onCheckedChange={checked => setMembers(checked?[...members,p.id]:members.filter(id=>id!==p.id))}/> {p.label}{p.id===item.leader?" · Trưởng nhóm":""}</label>)}
          {item.members.filter(id=>!people.some(p=>p.id===id)).map(id=><label className="block" key={id}><Checkbox checked={members.includes(id)} disabled={id===item.leader}
            onCheckedChange={checked => setMembers(checked?[...members,id]:members.filter(v=>v!==id))}/> {item.memberLabels[item.members.indexOf(id)]} · Đã rời danh sách của khoa</label>)}
        </fieldset>
        <label>Lý do điều chỉnh<Input value={reason} maxLength={2000} onChange={e=>setReason(e.target.value)}/></label>
        <Button disabled={!reason.trim()||!title.trim()} onClick={()=>void save()}>Gửi bản điều chỉnh cho GVHD</Button>
        <Button variant="outline" onClick={()=>setPeople(undefined)}>Đóng biểu mẫu</Button>
      </fieldset>}
    {error&&<p role="alert">{error}</p>}
  </div>
}
