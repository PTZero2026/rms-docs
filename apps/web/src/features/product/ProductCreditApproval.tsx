import { ChoiceOption, ChoiceSelect } from "@rms/ui/components/choice-select"
import {useEffect,useState} from "react"
import {Button} from "@rms/ui/components/button"
import {Input} from "@rms/ui/components/input"
import type {operations} from "@rms/api-contracts"
import type {SignedInSession} from "../../auth/session"

type Credits=NonNullable<operations["decideProduct"]["requestBody"]["content"]["application/json"]["credits"]>
type Author={id:string;label:string}
export function useProductHours(session:SignedInSession){
  const [enabled,setEnabled]=useState(false)
  useEffect(()=>{
    const c=new AbortController()
    session.api.GET("/api/tenants/{slug}/features",{params:session.params,signal:c.signal,cache:"no-store"}).then(r=>{
      if(!c.signal.aborted)setEnabled(r.data?.modules.includes("P03")??false)
    }).catch(()=>{})
    return ()=>c.abort()
  },[session])
  return enabled
}

export function ProductCreditApproval({enabled,authors,busy,approve}:{enabled:boolean;authors:Author[];busy:boolean;approve:(credits?:Credits)=>void}){
  const [lead,setLead]=useState(""),[shares,setShares]=useState<Record<string,number>>({})
  const multiple=enabled&&authors.length>1
  const total=authors.reduce((sum,a)=>sum+(shares[a.id]??0),0)
  const valid=!!lead&&(shares[lead]??0)>0&&total===100&&authors.every(a=>Number.isInteger(shares[a.id]??0)&&(shares[a.id]??0)>=0&&(shares[a.id]??0)<=100)
  function submit(){
    if(!multiple){approve();return}
    const credits:Credits=authors.filter(a=>shares[a.id]>0).map(a=>({accountId:a.id,role:a.id===lead?"CORRESPONDING_OR_FIRST":"COAUTHOR",share:shares[a.id]}))
    approve(credits)
  }
  return <>{multiple&&<fieldset disabled={busy} className="grid gap-2"><legend>Phân bổ giờ công bố</legend>
    <label>Tác giả chính hoặc liên hệ<ChoiceSelect value={lead} onValueChange={choiceValue => {
      const id=choiceValue;setLead(id)
      if(!total&&id)setShares({[id]:100})
    }}><ChoiceOption value="">Chọn tác giả</ChoiceOption>{authors.map(a=><ChoiceOption key={a.id} value={a.id}>{a.label}</ChoiceOption>)}</ChoiceSelect></label>
    {authors.map(a=><label key={a.id}>Tỷ lệ % · {a.label}<Input type="number" min={0} max={100} step={1} value={shares[a.id]??0}
      onChange={e=>setShares({...shares,[a.id]:Number(e.target.value)})}/></label>)}
    <p>Tổng phân bổ · {total}%</p>
  </fieldset>}
  <Button disabled={busy||multiple&&!valid} onClick={submit}>Duyệt sản phẩm</Button></>
}
