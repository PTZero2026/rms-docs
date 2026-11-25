import {useEffect,useState} from "react"
import type {operations} from "@rms/api-contracts"
import {outputTypes} from "@rms/api-contracts/products"
import type {SignedInSession} from "../../auth/session"

type Choices=operations["listProductTypes"]["responses"][200]["content"]["application/json"]
export function useProductTypes(session:SignedInSession){
  const [choices,setChoices]=useState<Choices>(),[error,setError]=useState("")
  const [version,setVersion]=useState(0)
  useEffect(()=>{
    const ctrl=new AbortController()
    session.api.GET("/api/tenants/{slug}/product-types",{params:session.params,signal:ctrl.signal,cache:"no-store"}).then(({data,error})=>{
      if(ctrl.signal.aborted)return
      if(!data)throw Error(error?.message??"Chưa đọc được danh mục loại sản phẩm.")
      setChoices(data);setError("")
    }).catch(e=>{if(!ctrl.signal.aborted){setChoices(undefined);setError(e instanceof Error?e.message:"Không thể kết nối.")}})
    return ()=>ctrl.abort()
  },[session,version])
  function label(code:string){
    return choices?.find(type=>type.code===code)?.label??(Object.hasOwn(outputTypes,code)?outputTypes[code as keyof typeof outputTypes]:code)
  }
  return {choices,error,label,reload:()=>setVersion(n=>n+1)}
}
