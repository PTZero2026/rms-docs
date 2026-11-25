import type {SignedInSession} from "../../auth/session"
import {useProductTypes} from "../product/useProductTypes"
import { Input } from "@rms/ui/components/input"
export function CommitmentFields({session,value,onChange}:{session:SignedInSession;value:Record<string,number>;onChange:(v:Record<string,number>)=>void}){
  const {choices,error,label}=useProductTypes(session)
  const codes=[...new Set([...(choices??[]).map(t=>t.code),...Object.keys(value)])]
  return <details><summary>Sản phẩm cam kết</summary><fieldset className="grid gap-2 sm:grid-cols-2">
    {error&&<p role="alert">{error}</p>}
    {choices?.length===0&&<p>Chưa có loại sản phẩm đang dùng.</p>}
    {codes.map(k=><label key={k}>{label(k)} (số lượng)
      <Input type="number" min={0} max={999} step={1} value={value[k]??""} onChange={e=>{
        const next={...value};if(!e.target.value || Number(e.target.value)===0)delete next[k];else next[k]=Number(e.target.value);onChange(next)
      }}/></label>)}</fieldset></details>
}
