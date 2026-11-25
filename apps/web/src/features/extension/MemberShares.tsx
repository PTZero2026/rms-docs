import type { operations } from "@rms/api-contracts"
import { Button } from "@rms/ui/components/button"
import { Input } from "@rms/ui/components/input"

export type Members = NonNullable<operations["saveEvidenceEntry"]["requestBody"]["content"]["application/json"]["members"]>
type Contributor = Members[number] & {role?:"MEMBER"|"SECRETARY"}
export function MemberShares({members,onChange,roles=false}:{members:Contributor[];onChange?:(value:Contributor[])=>void;roles?:boolean}) {
  const principal = 100-members.reduce((total,m)=>total+m.share,0)
  function update(index:number,fields:Partial<Contributor>){
    onChange?.(members.map((m,i)=>i===index?{...m,...fields}:m))
  }
  return <fieldset className="grid gap-2"><legend>Phân bổ đóng góp</legend>
    <p>Chủ nhiệm · {principal}%</p>
    {members.map((m,i)=>onChange?<div key={i} className="flex flex-wrap items-end gap-2">
      <label>Email thành viên {i+1}<Input type="email" value={m.email} onChange={e=>update(i,{email:e.target.value})}/></label>
      {roles&&<label>Vai trò người tham gia {i+1}<select value={m.role??"MEMBER"} onChange={e=>update(i,{role:e.target.value as Contributor["role"]})}>
        <option value="MEMBER">Thành viên</option><option value="SECRETARY">Thư ký / điều phối</option></select></label>}
      <label>Tỷ lệ thành viên {i+1} (%)<Input type="number" min={1} max={99} value={m.share||""} onChange={e=>update(i,{share:Number(e.target.value)})}/></label>
      <Button type="button" variant="outline" aria-label={"Bỏ thành viên "+(i+1)} onClick={()=>onChange(members.filter((_,j)=>j!==i))}>Bỏ</Button>
    </div>:<p key={m.email}>{m.email} · {m.role==="SECRETARY"?"Thư ký / điều phối":"Thành viên"} · {m.share}%</p>)}
    {onChange&&<Button type="button" variant="outline" disabled={members.length>=99} onClick={()=>onChange([...members,{email:"",share:0}])}>Thêm thành viên</Button>}
  </fieldset>
}
