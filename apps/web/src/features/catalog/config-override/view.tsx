import { ValidatedForm } from "@rms/ui/components/validated-form"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@rms/ui/components/alert-dialog"
import { ValueInput } from "@rms/ui/components/date-input"
import { Disclosure } from "@rms/ui/components/disclosure"
import { ChoiceOption, ChoiceSelect } from "@rms/ui/components/choice-select"
import { Checkbox } from "@rms/ui/components/checkbox"
import { Textarea } from "@rms/ui/components/textarea"
import { useCallback,useEffect,useId,useRef,useState } from "react"
import { Button } from "@rms/ui/components/button"
import { Input } from "@rms/ui/components/input"
import type { operations } from "@rms/api-contracts"
import type { SignedInSession } from "../../../auth/session"
import { formatVietnamDate } from "../../../format-date"
import { ConfigurationContent, inspectConfiguration, type ConfigurationDetail } from "./ConfigurationContent"

import {HomeLayoutEditor} from "./HomeLayoutEditor"

const collection="/api/tenants/{slug}/catalog/configurations"
const item="/api/tenants/{slug}/catalog/configurations/{key}"
type Listing=operations["listConfigurations"]["responses"][200]["content"]["application/json"]
type Row=Listing["items"][number]
const blank={key:"",description:"",refer:"GEOHUB",group:"",mime_type:"",encoding:"",active:true,public:false}
const labels={description:"Mô tả",refer:"Mã tham chiếu",group:"Nhóm",mime_type:"Loại nội dung",encoding:"Bảng mã"}
const filterLabels={keyword:"Từ khóa",refer:"Mã tham chiếu",group:"Nhóm",createdFrom:"Tạo từ",createdTo:"Tạo đến",modifiedFrom:"Sửa từ",modifiedTo:"Sửa đến"}
type Filters=NonNullable<operations["listConfigurations"]["parameters"]["query"]>
class ConfigurationAccessError extends Error {}
function failure(response:Response) {
  if (response.status===401 || response.status===403) return new ConfigurationAccessError(
    response.status===401?"Phiên đăng nhập đã hết hiệu lực.":"Tài khoản thiếu quyền thực hiện.")
  return Error(response.status===409?"Mã đã tồn tại trong phạm vi này.":response.status===413?"Nội dung vượt 20 MiB.":response.status===400?"Kiểm tra mã, nội dung và siêu dữ liệu.":"Không thể xử lý yêu cầu cấu hình.")
}
export default function ConfigurationView({session}:{session:SignedInSession}) {
  const contentField=useId()
  const [layoutOpen,setLayoutOpen]=useState(false)
  const [listing,setListing]=useState<Listing>()
  const [filters,setFilters]=useState<Filters>({}),[query,setQuery]=useState<Filters>({})
  const [form,setForm]=useState(blank),[editing,setEditing]=useState(false),[open,setOpen]=useState(false)
  const [text,setText]=useState(""),[mode,setMode]=useState("text"),[file,setFile]=useState<File>()
  const [message,setMessage]=useState(""),[busy,setBusy]=useState(false)
  const [detail,setDetail]=useState<ConfigurationDetail>()
  const [confirm,setConfirm]=useState<"save"|"delete">()
  const confirmOpener=useRef<HTMLButtonElement | null>(null)
  const [selected,setSelected]=useState<Row>()
  const slug=session.params.path.slug
  const accessGeneration=useRef(0)
  const clearPrivateView=useCallback(()=>{
    accessGeneration.current++
    setLayoutOpen(false);setListing(undefined);setDetail(undefined);setOpen(false);setSelected(undefined);setConfirm(undefined)
    setForm(blank);setText("");setFile(undefined)
  },[])
  const layoutAccessLost=useCallback(()=>{
    clearPrivateView()
    setMessage("Tài khoản thiếu quyền quản lý bố cục của trường.")
  },[clearPrivateView])
  const load=useCallback(async()=>{
    const {data,response}=await session.config.GET(collection,{params:{path:{slug},query:{limit:10,...query}},cache:"no-store"})
    if (!data) throw failure(response)
    return data
  },[session,slug,query])
  useEffect(()=>{
    let active=true
    const generation=accessGeneration.current
    load().then(v=>{
      if(active && generation===accessGeneration.current){setListing(v);setMessage("")}
    }).catch(e=>{
      if(active && generation===accessGeneration.current){
        if(e instanceof ConfigurationAccessError)clearPrivateView()
        setMessage(e.message)
      }
    })
    return ()=>{active=false}
  },[load,clearPrivateView])
  async function run(work:()=>Promise<void>) {
    if(busy)return
    setBusy(true);setMessage("")
    try{await work()}catch(e){
      if(e instanceof ConfigurationAccessError)clearPrivateView()
      setMessage(e instanceof Error?e.message:"Không thể kết nối.")
    }
    finally{setBusy(false)}
  }
  async function read(key:string) {
    const generation=accessGeneration.current
    setDetail(undefined)
    const {data:blob,response}=await session.config.GET(item,{params:{path:{slug,key}},parseAs:"blob",cache:"no-store"})
    if (!blob) throw failure(response)
    const preview=await inspectConfiguration(blob, response.headers.get("content-type") || blob.type)
    if(generation===accessGeneration.current) setDetail({
      key,scope:response.headers.get("x-rms-scope")==="shared"?"Đang dùng bản Chung":"Đang dùng bản của "+slug,
      cache:response.headers.get("x-cache")??"",blob,preview})
  }
  function start(row?:Row) {
    setEditing(!!row && row.scope===listing?.scope);setOpen(true);setSelected(row)
    setForm(row?{key:row.key,description:row.description,refer:row.refer,group:row.group,mime_type:row.mime,encoding:row.encoding,active:row.active,public:row.public}:{...blank})
    setText("");setFile(undefined);setMode("text");setConfirm(undefined);setMessage("")
  }
  async function save(detect=false) {
    const generation=accessGeneration.current
    const body:Record<string,string|boolean>={...form}
    if(!body.mime_type) delete body.mime_type
    if(!body.encoding) delete body.encoding
    const fields=new FormData()
    for(const [k,v] of Object.entries(body))fields.append(k,String(v))
    if(mode==="file" && file) {
      if(file.size>20*1024*1024)throw Error("Nội dung vượt 20 MiB.")
      fields.append("content",file)
    }else if(text)fields.append("content",text)
    const payload=mode==="base64"?{body:{...body,content:text||undefined}}:{body:{...body},bodySerializer:()=>fields}
    const result=editing&&!detect?await session.config.PUT(item,{params:{path:{slug,key:form.key}},...payload}):
      await session.config.POST(collection,{params:{path:{slug},query:{detect}},...payload})
    if(!result.data){
      const details=result.error as {message?:unknown}|undefined
      if(result.response.status===400&&typeof details?.message==="string")throw Error(details.message)
      throw failure(result.response)
    }
    if(generation!==accessGeneration.current)return
    if(detect){setMessage(`Xem trước · ${result.data.mime} · ${result.data.encoding} · ${result.data.size} byte`);return}
    setOpen(false);setConfirm(undefined)
    const next=await load()
    if(generation!==accessGeneration.current)return
    setListing(next);await read(form.key)
    if(generation===accessGeneration.current)setMessage("Đã lưu cấu hình.")
  }
  async function remove() {
    if(!selected)return
    const generation=accessGeneration.current
    const {response}=await session.config.DELETE(item,{params:{path:{slug,key:selected.key}}})
    if(!response.ok)throw failure(response)
    setDetail(undefined);setOpen(false);setConfirm(undefined)
    const next=await load()
    if(generation===accessGeneration.current){setListing(next);setMessage("Đã xóa cấu hình.")}
  }
  if(layoutOpen&&listing?.canWrite&&listing.scope==="tenant")return <HomeLayoutEditor session={session} onAccessLost={layoutAccessLost}
    close={()=>{setLayoutOpen(false);setQuery({...query})}}/>
  return <section className="grid gap-4 py-4" aria-label="Quản lý cấu hình">
    <h2>Cấu hình hệ thống</h2>
    {!listing&&message&&<Button variant="outline" disabled={busy} onClick={()=>setQuery({...query})}>Tải lại danh sách</Button>}
    <Disclosure title={<> Bộ lọc cấu hình </>}><ValidatedForm className="mt-3 flex flex-wrap items-end gap-2" onSubmit={e=>{e.preventDefault();setQuery({...filters,skip:0})}}>
      {Object.entries(filterLabels).map(([k,label])=><label key={k}>{label}<ValueInput type={/From|To/.test(k)?"date":"text"} onValueChange={next => setFilters({...filters,[k]:next||undefined})}/></label>)}
      {(["public","active"] as const).map(k=><label key={k}>{k==="active"?"Hoạt động":"Công khai"}<ChoiceSelect onValueChange={choiceValue => setFilters({...filters,[k]:choiceValue===""?undefined:choiceValue==="true"})}><ChoiceOption value="">Tất cả</ChoiceOption><ChoiceOption value="true">Có</ChoiceOption><ChoiceOption value="false">Không</ChoiceOption></ChoiceSelect></label>)}
      <Button type="submit" variant="outline">Tìm cấu hình</Button>
    </ValidatedForm></Disclosure>
    {listing && <><p>{listing.total} bản cấu hình</p>
      {listing.canWrite&&listing.scope==="tenant"&&<Button className="justify-self-start" variant="outline" disabled={busy}
        onClick={()=>{setOpen(false);setDetail(undefined);setLayoutOpen(true)}}>Bố cục trang chủ theo vai trò</Button>}
      {listing.canWrite && <Button className="justify-self-start" disabled={busy} onClick={()=>start()}>Thêm cấu hình</Button>}
      <div className="overflow-x-auto"><table className="w-full border-collapse text-left [&_th]:border-b [&_th]:px-3 [&_th]:py-2 [&_td]:border-b [&_td]:px-3 [&_td]:py-2 [&_button]:mr-2"><thead><tr><th>Mã</th><th>Phạm vi</th><th>Nhóm</th><th>Loại nội dung</th><th>Cập nhật</th><th>Thao tác</th></tr></thead>
        <tbody>{listing.items.map(row=><tr key={row.key+row.scope}><td>{row.key}</td><td>{row.scope==="shared"?"Chung":slug}</td><td>{row.group}</td><td>{row.mime}</td><td>{row.modified && formatVietnamDate(row.modified, "minute")}</td><td>
          <Button disabled={busy} variant="outline" onClick={()=>void run(()=>read(row.key))}>Đọc hiệu lực</Button>
          {listing.canWrite && <Button disabled={busy} variant="outline" onClick={()=>start(row)}>{row.scope===listing.scope?"Sửa":"Tạo bản riêng"}</Button>}
        </td></tr>)}</tbody></table></div>
      <div><Button disabled={!query.skip} onClick={()=>setQuery({...query,skip:Math.max(0,(query.skip??0)-10)})}>Trang trước</Button>
      <Button disabled={(query.skip??0)+10>=listing.total} onClick={()=>setQuery({...query,skip:(query.skip??0)+10})}>Trang sau</Button></div></>}
    {detail && <ConfigurationContent detail={detail} />}
    {open && listing?.canWrite && <fieldset disabled={busy} className="grid gap-3"><legend>{editing?"Sửa cấu hình":"Tạo cấu hình"} · {listing.scope==="shared"?"Chung":slug}</legend>
      <label>Mã cấu hình<Input value={form.key} disabled={editing} onChange={e=>setForm({...form,key:e.target.value})}/></label>
      {Object.entries(labels).map(([k,label])=><label key={k}>{label}<Input value={form[k as keyof typeof labels]} onChange={e=>setForm({...form,[k]:e.target.value})}/></label>)}
      {(["active","public"] as const).map(k=><label key={k}><Checkbox checked={form[k]} onCheckedChange={checked => setForm({...form,[k]:checked})}/> {k==="active"?"Đang hoạt động":"Đánh dấu công khai"}</label>)}
      <label>Cách nhập <ChoiceSelect value={mode} onValueChange={choiceValue => {setMode(choiceValue);setText("");setFile(undefined)}}><ChoiceOption value="text">Văn bản</ChoiceOption><ChoiceOption value="base64">Base64</ChoiceOption><ChoiceOption value="file">Tệp</ChoiceOption></ChoiceSelect></label>
      {mode==="file"?<label>Tệp nội dung<Input type="file" onChange={e=>setFile(e.target.files?.[0])}/></label>:<div><label htmlFor={contentField}>Nội dung</label><Textarea id={contentField} className="block w-full rounded border p-2" value={text} onChange={e=>setText(e.target.value)}/></div>}
      {editing && <p>Để trống nội dung để giữ bản hiện tại.</p>}
      <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={()=>void run(()=>save(true))}>Xem trước</Button>
      <Button aria-haspopup={editing && listing.scope==="shared" ? "dialog" : undefined} onClick={event=>{
        if(editing && listing.scope==="shared"){confirmOpener.current=event.currentTarget;setConfirm("save")}
        else void run(()=>save())
      }}>Lưu cấu hình</Button>
      {editing && <Button variant="destructive" aria-haspopup="dialog" onClick={event=>{confirmOpener.current=event.currentTarget;setConfirm("delete")}}>Xóa cấu hình</Button>}
      <Button variant="outline" onClick={()=>{setOpen(false);setConfirm(undefined)}}>Đóng biểu mẫu</Button></div>
      <AlertDialog open={!!confirm} onOpenChange={next=>{if(!next)setConfirm(undefined)}}>
        <AlertDialogContent onCloseAutoFocus={event=>{event.preventDefault();confirmOpener.current?.focus()}}>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm==="delete"?"Xóa cấu hình":"Ghi đè cấu hình"}</AlertDialogTitle>
            <AlertDialogDescription>{confirm==="delete"?"Xóa vĩnh viễn":"Ghi đè nội dung của"} {form.key} · {listing.scope==="shared"?"Chung cho mọi trường":slug}?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={()=>void run(()=>confirm==="delete"?remove():save())}>Xác nhận {form.key}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </fieldset>}
    <p role="status">{message}</p>
  </section>
}
