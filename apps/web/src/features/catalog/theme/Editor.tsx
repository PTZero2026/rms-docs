import { useCallback, useEffect, useLayoutEffect, useState } from "react"
import type { components } from "@rms/api-contracts"
import { defaultTheme, themeIssues, type Palette, type ThemeTokens } from "@rms/api-contracts/theme"
import { applyTheme } from "@rms/ui/theme"
import { Button } from "@rms/ui/components/button"
import { Input } from "@rms/ui/components/input"
import { Dialog,DialogContent,DialogTitle,DialogDescription,DialogTrigger } from "@rms/ui/components/dialog"
import type { SignedInSession } from "../../../auth/session"

type Snapshot = components["schemas"]["Editor"]
const labels: Record<keyof Palette,string> = {background:"Màu nền",foreground:"Chữ trên nền",primary:"Nút chính",primaryForeground:"Chữ trên nút",muted:"Nền phụ",mutedForeground:"Chữ trên nền phụ",ring:"Viền focus"}
function Preview({tokens,mode}:{tokens:ThemeTokens;mode:"light"|"dark"}) {
  const [region,setRegion] = useState<HTMLDivElement|null>(null)
  useLayoutEffect(()=>{ if(region) return applyTheme(region,tokens,mode) },[region,tokens,mode])
  return <div ref={setRegion} className="grid gap-3 rounded-lg border bg-background p-4 text-foreground" style={{fontFamily:"var(--rms-font)"}}>
    <h3>Xem thử biểu mẫu</h3><label>Tên đề tài<Input /></label>
    <Dialog><DialogTrigger asChild><Button>Xem thử hộp thoại</Button></DialogTrigger>
      <DialogContent portalContainer={region}><DialogTitle>Kiểm tra hồ sơ</DialogTitle>
        <DialogDescription>Nhập tên đề tài trước khi nộp.</DialogDescription></DialogContent></Dialog>
  </div>
}
export default function ThemeEditor({session,onApply}:{session:SignedInSession;onApply:(t:ThemeTokens)=>void}) {
  const [data,setData] = useState<Snapshot>()
  const [tokens,setTokens] = useState<ThemeTokens>(defaultTheme)
  const [mode,setMode] = useState<"light"|"dark">("light")
  const [source,setSource] = useState(1)
  const [message,setMessage] = useState("")
  const [busy,setBusy] = useState(false)
  const options = {params:session.params,cache:"no-store" as const}
  const load = useCallback(async () => {
    const {data} = await session.api.GET("/api/tenants/{slug}/catalog/theme/editor",{params:session.params,cache:"no-store"})
    if(!data) throw Error("Không thể đọc giao diện của đơn vị.")
    return data
  },[session])
  function show(next:Snapshot) {setData(next);setTokens(next.draft?.tokens??next.active.tokens);setSource(next.history[1]??1)}
  useEffect(()=>{let mounted=true;load().then(s=>{if(mounted) show(s)}).catch(()=>{if(mounted) setMessage("Không thể tải giao diện.")});return()=>{mounted=false}},[load])
  const invalid=themeIssues(tokens)
  const saved = data?.draft && JSON.stringify(data.draft.tokens)===JSON.stringify(tokens)
  async function change(kind:"save"|"publish"|"rollback"|"reload") {
    if (!data || busy) return
    setBusy(true);setMessage("")
    try {
      const revision={expectedRevision:data.active.revision,expectedDraft:data.draft?.serial??0}
      const result = kind==="save" ? await session.api.PUT("/api/tenants/{slug}/catalog/theme/draft",{...options,body:{...revision,tokens}}) :
        kind==="publish" ? await session.api.POST("/api/tenants/{slug}/catalog/theme/apply",{...options,body:revision}) :
        kind==="rollback" ? await session.api.POST("/api/tenants/{slug}/catalog/theme/rollback",{...options,body:{expectedRevision:revision.expectedRevision,sourceRevision:source}}) : undefined
      if(result && !result.response.ok) throw Error(result.response.status===409?"Phiên bản đã đổi. Hãy tải lại.":"Không thể lưu thay đổi. Kiểm tra quyền và các trường đã nhập.")
      const next=await load();show(next);onApply(next.active.tokens)
      setMessage(kind==="save"?"Đã lưu nháp.":kind==="publish"?"Đã áp dụng giao diện.":kind==="rollback"?"Đã khôi phục giao diện.":"Đã tải lại.")
    } catch(e){setMessage(e instanceof Error?e.message:"Không thể kết nối.")}
    finally{setBusy(false)}
  }
  if(!data) return <p role="status">{message||"Đang đọc giao diện…"}</p>
  return <section className="grid gap-4 py-4"><h2>Giao diện đơn vị · Phiên bản {data.active.revision}</h2>
    <label>Chế độ xem trước <select value={mode} onChange={e=>setMode(e.target.value==="dark"?"dark":"light")}><option value="light">Sáng</option><option value="dark">Tối</option></select></label>
    <label>Phông chữ <select value={tokens.font} onChange={e=>setTokens({...tokens,font:e.target.value as ThemeTokens["font"]})}><option value="geist">Geist</option><option value="system">Hệ thống</option><option value="serif">Georgia</option></select></label>
    <label>Bo góc <select value={tokens.radius} onChange={e=>setTokens({...tokens,radius:e.target.value as ThemeTokens["radius"]})}><option value="sm">Nhỏ</option><option value="md">Vừa</option><option value="lg">Lớn</option></select></label>
    <div className="grid gap-3 sm:grid-cols-2">{(Object.keys(labels) as (keyof Palette)[]).map(k=><label className="grid gap-1" key={k}>{labels[k]}
      <Input aria-invalid={invalid.includes(mode+"."+k)} value={tokens[mode][k]} onChange={e=>setTokens({...tokens,[mode]:{...tokens[mode],[k]:e.target.value}})} />
    </label>)}</div>
    {invalid.length>0 && <p role="alert">Kiểm tra mã màu và độ tương phản tại {invalid.join(", ")}.</p>}
    <Preview tokens={tokens} mode={mode}/>
    <div className="flex flex-wrap gap-2">
      <Button disabled={busy||!!invalid.length} onClick={()=>void change("save")}>Lưu nháp</Button>
      <Button disabled={busy||!saved||!!invalid.length} onClick={()=>void change("publish")}>Áp dụng</Button>
      <Button variant="outline" disabled={busy} onClick={()=>void change("reload")}>Tải lại giao diện</Button>
    </div>
    {data.history.length>1 && <div className="flex flex-wrap gap-2"><label>Khôi phục về <select value={source} onChange={e=>setSource(Number(e.target.value))}>{data.history.slice(1).map(v=><option key={v} value={v}>Phiên bản {v}</option>)}</select></label>
      <Button variant="outline" disabled={busy} onClick={()=>void change("rollback")}>Khôi phục phiên bản</Button></div>}
    <p role="status">{message}</p>
  </section>
}
