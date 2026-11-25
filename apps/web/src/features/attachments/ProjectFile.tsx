import { useState } from "react"
import { Input } from "@rms/ui/components/input"
import { Button } from "@rms/ui/components/button"
import type { SignedInSession } from "../../auth/session"

type Props={session:SignedInSession;project:string;revision:number;meeting?:boolean;extension?:{module:"upper-project"|"activity"|"applied-project"|"student-project"|"product";evidenceType:string};onFile:(id:string,name:string)=>void}
export function ProjectFile({session,project,revision,extension,meeting=false,onFile}:Props){
  const [file,setFile]=useState<File>(),[busy,setBusy]=useState(false),[message,setMessage]=useState("")
  async function upload(){
    if(!file||busy)return
    setBusy(true);setMessage("")
    try{
      if(!file.size||file.size>20*1024*1024)throw Error("Tệp cần có nội dung và tối đa 20 MiB.")
      const digest=await crypto.subtle.digest("SHA-256",await file.arrayBuffer())
      const sha256=Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,"0")).join("")
      const path={...session.params.path,projectId:project}
      const request={filename:file.name,size:file.size,mime:file.type,sha256,resourceVersion:revision}
      const target={...session.params.path,id:project}
      async function createIntent(){
        if(meeting)return session.api.POST("/api/tenants/{slug}/review/meetings/{id}/files",{params:{path:target},body:request})
        if(extension)return session.api.POST("/api/tenants/{slug}/extensions/{module}/{id}/files",{params:{path:{...target,module:extension.module}},body:{...request,evidenceType:extension.evidenceType}})
        return session.api.POST("/api/tenants/{slug}/projects/{projectId}/files/intents",{params:{path},body:request})
      }
      const intent=await createIntent()
      if(!intent.data)throw Error("Không thể cấp phiếu tải. Kiểm tra loại tệp và phiên bản hồ sơ.")
      const form=new FormData()
      for(const [k,v] of Object.entries(intent.data.fields))form.append(k,v)
      form.append("file",file)
      const uploaded=await fetch(intent.data.url,{method:"POST",body:form,credentials:"omit",redirect:"error"})
      if(!uploaded.ok)throw Error("Kho tệp chưa nhận được dữ liệu.")
      async function finalize(fileId:string){
        if(meeting)return session.api.POST("/api/tenants/{slug}/review/meetings/{id}/files/{fileId}/finalize",{params:{path:{...target,fileId}}})
        if(extension)return session.api.POST("/api/tenants/{slug}/extensions/{module}/{id}/files/{fileId}/finalize",{params:{path:{...target,module:extension.module,fileId}}})
        return session.api.POST("/api/tenants/{slug}/projects/{projectId}/files/{id}/finalize",{params:{path:{...path,id:fileId}}})
      }
      const result=await finalize(intent.data.id)
      if(!result.data)throw Error("Tệp không khớp phiếu hoặc hồ sơ đã thay đổi.")
      setMessage("Đã xác nhận tệp "+result.data.filename);onFile(result.data.id,result.data.filename)
    }catch(e){setMessage(e instanceof Error?e.message:"Không thể tải tệp.")}finally{setBusy(false)}
  }
  return <div className="grid gap-2"><label>Tải tệp căn cứ<Input type="file" accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png" onChange={e=>setFile(e.target.files?.[0])}/></label>
    <Button type="button" variant="outline" disabled={!file||busy} onClick={()=>void upload()}>{busy?"Đang xác minh…":"Tải và xác nhận tệp"}</Button>
    <p role="status">{message}</p></div>
}
