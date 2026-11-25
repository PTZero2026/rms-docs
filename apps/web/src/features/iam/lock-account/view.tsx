import {CreateAccount} from "./CreateAccount"
import { formatVietnamDate } from "../../../format-date"
import {AuthorRequests} from "../author-request/AuthorRequests"
import { useCallback,useEffect,useState } from "react"
import type { operations } from "@rms/api-contracts"
import { Button } from "@rms/ui/components/button"
import { Input } from "@rms/ui/components/input"
import type { Account,SignedInSession } from "../../../auth/session"

type Profile=operations["getOwnProfile"]["responses"][200]["content"]["application/json"]
type Receipt=operations["lockAccount"]["responses"][200]["content"]["application/json"]
function status(p:Profile){return p.deletedAt?"Ngừng hoạt động":p.isActive?"Đang hoạt động":"Đã khóa"}
function errorMessage(res:Response) {return res.status===403?"Tài khoản không còn quyền thực hiện yêu cầu.":res.status===409?"Trạng thái đã thay đổi hoặc cần giữ quản trị viên cuối cùng.":"Không thể xử lý yêu cầu."}

export function OwnProfile({session}:{session:SignedInSession}) {
  const [requests,setRequests]=useState(false)
  const [profile,setProfile]=useState<Profile>(),[message,setMessage]=useState(""),[busy,setBusy]=useState(false)
  const read=useCallback(async()=>{
    const {data,response}=await session.api.GET("/api/tenants/{slug}/users/me",{params:session.params,cache:"no-store"})
    if(!data)throw Error(errorMessage(response))
    return data
  },[session])
  useEffect(()=>{let active=true;read().then(data=>{if(active)setProfile(data)}).catch(e=>{if(active)setMessage(e.message)});return ()=>{active=false}},[read])
  async function submit(save:boolean) {
    if(busy)return
    setBusy(true);setMessage("")
    try{
      if(save && profile) {
        const {fullName,phone,revision}=profile
        const {data,response}=await session.api.PATCH("/api/tenants/{slug}/users/me",{params:session.params,body:{fullName,phone,revision}})
        if(!data)throw Error(errorMessage(response))
        setProfile(data);setMessage("Đã lưu hồ sơ cá nhân.")
      }else{setProfile(await read())}
    }catch(e){setProfile(undefined);setMessage(e instanceof Error?e.message:"Không thể kết nối.")}
    finally{setBusy(false)}
  }
  return <section className="grid max-w-xl gap-3 py-4"><h2>Hồ sơ cá nhân</h2>
    {profile && <><label>Họ và tên<Input value={profile.fullName} maxLength={160} onChange={e=>setProfile({...profile,fullName:e.target.value})}/></label>
      <label>Điện thoại<Input value={profile.phone} maxLength={32} onChange={e=>setProfile({...profile,phone:e.target.value})}/></label>
      <Button disabled={busy||!profile.fullName.trim()} onClick={()=>void submit(true)}>Lưu hồ sơ cá nhân</Button></>}
    <Button variant="outline" disabled={busy} onClick={()=>void submit(false)}>Tải lại hồ sơ cá nhân</Button><p role="status">{message}</p>
    {profile&&<><Button variant="outline" aria-expanded={requests} onClick={()=>setRequests(!requests)}>Yêu cầu quyền tác giả</Button>
      {requests&&<AuthorRequests session={session} canApply={profile.userType==="user"}/>}</>}</section>
}

export function AccountDirectory({session,actor}:{session:SignedInSession;actor:Account}) {
  const [list,setList]=useState<Profile[]>([]),[total,setTotal]=useState(0),[skip,setSkip]=useState(0)
  const [search,setSearch]=useState(""),[query,setQuery]=useState(""),[round,setRound]=useState(0)
  const [receipt,setReceipt]=useState<Receipt>(),[busy,setBusy]=useState(false),[message,setMessage]=useState("")
  const [confirm,setConfirm]=useState(false)
  const [queue,setQueue]=useState(false),[role,setRole]=useState<Profile["userType"]>("user"),[endAccess,setEndAccess]=useState(false)
  useEffect(()=>{
    let active=true
    session.api.GET("/api/tenants/{slug}/admin/users",{params:{path:session.params.path,query:{search:query,skip}},cache:"no-store"})
      .then(({data,response})=>{if(active){if(!data)throw Error(errorMessage(response));setList(data.items);setTotal(data.total)}})
      .catch(e=>{if(active){setList([]);setReceipt(undefined);setMessage(e.message)}})
    return ()=>{active=false}
  },[session,query,skip,round])
  async function open(id:string) {
    setBusy(true);setMessage("");setConfirm(false);setReceipt(undefined)
    try{
      const {data,response}=await session.api.GET("/api/tenants/{slug}/admin/users/{id}",{params:{path:{...session.params.path,id}},cache:"no-store"})
      if(!data)throw Error(errorMessage(response))
      setReceipt(data);setRole(data.account.userType);setEndAccess(false)
    }catch(e){setMessage(e instanceof Error?e.message:"Không thể kết nối.")}finally{setBusy(false)}
  }
  async function administer(remove:boolean) {
    if(!receipt||busy)return
    const params={path:{...session.params.path,id:receipt.account.id}}
    setBusy(true);setMessage("")
    try{
      const result=remove?await session.api.DELETE("/api/tenants/{slug}/admin/users/{id}",{params}):
        await session.api.POST("/api/tenants/{slug}/admin/users/{id}/change-role",{params,body:{userType:role}})
      if(!result.data)throw Error(errorMessage(result.response))
      setReceipt(result.data);setEndAccess(false);setRound(n=>n+1)
    }catch(e){setMessage(e instanceof Error?e.message:"Không thể kết nối.")}finally{setBusy(false)}
  }
  async function change() {
    if(!receipt || busy)return
    setBusy(true);setMessage("")
    const params={path:{...session.params.path,id:receipt.account.id}}
    try{
      const result=receipt.account.isActive?await session.api.POST("/api/tenants/{slug}/admin/users/{id}/lock",{params}):
        await session.api.POST("/api/tenants/{slug}/admin/users/{id}/unlock",{params})
      if(!result.data)throw Error(errorMessage(result.response))
      setReceipt(result.data);setConfirm(false);setRound(n=>n+1)
    }catch(e){setMessage(e instanceof Error?e.message:"Không thể kết nối.")}finally{setBusy(false)}
  }
  return <section className="grid gap-4 py-4"><h2>Người dùng trong phạm vi</h2>{actor.userType==="admin"&&<details><summary>Cấp tài khoản mới</summary><CreateAccount session={session} onCreated={()=>setRound(n=>n+1)}/></details>}
    {actor.userType==="admin"&&<><Button variant="outline" aria-expanded={queue} onClick={()=>setQueue(!queue)}>Xét yêu cầu quyền tác giả</Button>
      {queue&&<AuthorRequests session={session} queue/>}</>}
    <form className="flex items-end gap-2" onSubmit={e=>{e.preventDefault();setQuery(search);setSkip(0);setRound(n=>n+1)}}>
      <label>Tên hoặc email<Input value={search} onChange={e=>setSearch(e.target.value)}/></label><Button>Tìm người dùng</Button></form>
    <p>{total} tài khoản</p>
    <ul className="grid gap-2">{list.map(row=><li key={row.id}><Button variant="outline" disabled={busy} onClick={()=>void open(row.id)}>{row.email}</Button> · {status(row)}</li>)}</ul>
    {(skip>0||total>20)&&<div><Button disabled={!skip} onClick={()=>setSkip(skip-20)}>Trang trước</Button><Button disabled={skip+20>=total} onClick={()=>setSkip(skip+20)}>Trang sau</Button></div>}
    {receipt && <section className="rounded border p-4"><h3>{receipt.account.fullName||receipt.account.email}</h3>
      <p>{receipt.account.email} · {receipt.account.userType} · {status(receipt.account)}</p>
      <a className="underline" href={"?profile="+receipt.account.id}>Xem lý lịch khoa học</a>
      {actor.userType==="admin"&&!receipt.account.deletedAt&&<div className="flex flex-wrap items-end gap-2 py-2"><label>Vai trò tài khoản
        <select className="block rounded border p-2" value={role} onChange={e=>setRole(e.target.value as Profile["userType"])}>{["user","author","staff","admin"].map(v=><option key={v}>{v}</option>)}</select></label>
        <Button variant="outline" disabled={busy||role===receipt.account.userType} onClick={()=>void administer(false)}>Lưu vai trò</Button>
        {actor.id!==receipt.account.id&&<Button variant="outline" disabled={busy} onClick={()=>setEndAccess(!endAccess)}>Ngừng hoạt động</Button>}
        {endAccess&&<div><p>Ngừng hoạt động tài khoản {receipt.account.email} và giữ lịch sử nghiên cứu?</p><Button disabled={busy} onClick={()=>void administer(true)}>Xác nhận ngừng hoạt động</Button></div>}</div>}
      {receipt.event && <p>Sự kiện {receipt.event.action} · {formatVietnamDate(receipt.event.at, "second")}</p>}
      {actor.userType==="admin" && actor.id!==receipt.account.id && !receipt.account.deletedAt &&
        <Button disabled={busy} onClick={()=>setConfirm(true)}>{receipt.account.isActive?"Khóa tài khoản":"Mở khóa tài khoản"}</Button>}
      {confirm && <div role="group" aria-label="Xác nhận thay đổi quyền truy cập"><p>{receipt.account.isActive?"Khóa":"Mở khóa"} {receipt.account.email} tại {session.params.path.slug}?</p>
        <Button disabled={busy} onClick={()=>void change()}>Xác nhận thay đổi</Button> <Button variant="outline" onClick={()=>setConfirm(false)}>Quay lại</Button></div>}</section>}
    <p role="status">{message}</p></section>
}
