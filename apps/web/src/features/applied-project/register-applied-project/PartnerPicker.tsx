import type {operations} from "@rms/api-contracts"
import {Button} from "@rms/ui/components/button"

type Directory=operations["listAppliedProjects"]["responses"][200]["content"]["application/json"]["partnerDirectory"]

export function PartnerPicker({directory,selected,onChange}:{directory:Directory;selected:Directory;onChange:(rows:Directory)=>void}){
  if(!directory.length&&!selected.length)return null
  return <fieldset className="grid gap-2">
    <label>Chọn đối tác từ danh mục
      <select className="block border p-2" value="" onChange={e=>{
        const partner=directory.find(p=>p.code===e.target.value)
        if(partner)onChange([...selected,partner])
      }}>
        <option value="">Chọn đối tác</option>
        {directory.filter(p=>!selected.some(s=>s.code===p.code)).map(p=><option key={p.code} value={p.code}>{p.label} · {p.code}</option>)}
      </select>
    </label>
    {!!selected.length&&<ul>{selected.map(p=><li key={p.code}>{p.label} · {p.code}
      <Button variant="link" aria-label={"Bỏ "+p.label} onClick={()=>onChange(selected.filter(s=>s.code!==p.code))}>Bỏ</Button>
    </li>)}</ul>}
  </fieldset>
}
