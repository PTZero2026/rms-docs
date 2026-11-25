import {useEffect,useState} from "react"
import {Button} from "@rms/ui/components/button"

type Read<T>=(signal:AbortSignal)=>Promise<{data?:T;response:Response}>

export function useHomeRead<T>(read:Read<T>,onAccessLost:()=>void){
  const [attempt,setAttempt]=useState(0)
  const [result,setResult]=useState<{read:Read<T>;attempt:number;data?:T}>()
  useEffect(()=>{
    const controller=new AbortController()
    async function load(){
      let data:T|undefined
      try {
        const result=await read(controller.signal)
        if(controller.signal.aborted)return
        if(result.response.status===401||result.response.status===403){
          onAccessLost()
          return
        }
        data=result.data
      } catch { /* The card offers a local retry. */ }
      if(!controller.signal.aborted)setResult({read,attempt,data})
    }
    void load()
    return ()=>controller.abort()
  },[read,attempt,onAccessLost])
  const current=result?.read===read&&result.attempt===attempt?result:undefined
  return {data:current?.data,failed:!!current&&current.data===undefined,retry:()=>setAttempt(n=>n+1)}
}

export function WidgetFeedback({failed,retry}:{failed:boolean;retry:()=>void}){
  if(failed)return <div className="grid justify-items-start gap-2">
    <p role="alert">Không tải được mục này.</p>
    <Button variant="outline" onClick={retry}>Thử lại</Button>
  </div>
  return <div role="status" className="py-2">
    <span className="sr-only">Đang tải mục này…</span>
    <div aria-hidden="true" className="h-3 w-32 rounded bg-muted motion-safe:animate-pulse"/>
  </div>
}
