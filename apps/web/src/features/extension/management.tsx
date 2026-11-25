import { ValidatedForm } from "@rms/ui/components/validated-form"
import { Checkbox } from "@rms/ui/components/checkbox"
import { useState } from 'react'
import { Button } from '@rms/ui/components/button'
import type { DemoRow, FeatureProps } from '../../demo/types'
import { encodePolicy } from './catalogue'
import { catalog, codes, dateLabel, evidenceLabels, officer, openCall, scoped, today, uid, units, validDate } from './model'
import type { Source } from './model'
import { Blank, Footer, messageOf, Modal, options, Problem, SelectField, TextField } from './controls'

function CheckTypes({ title, value, change }: { title: string; value: string; change: (v:string) => void }) {
  const selected = codes(value)
  return <fieldset className="ext-group"><legend>{title}</legend><div className="ext-checks">{Object.entries(evidenceLabels).map(([k,name]) =>
    <label key={k}><Checkbox checked={selected.includes(k)} onCheckedChange={checked => change((checked ? [...selected,k] : selected.filter(c => c !== k)).join(','))}/>{name}</label>)}</div></fieldset>
}
function CallEditor({ctx,initial,close}: {ctx: FeatureProps; initial: DemoRow; close: () => void}) {
  const [r,set] = useState(initial)
  const [error,setError] = useState('')
  const field = (k: string,v:string) => set({...r,fields:{...r.fields,[k]:v}})
  return <Modal title="Cấu hình đợt sinh viên" description="Phạm vi khoa, thời hạn và điều kiện nộp đề tài." close={close}>
    <ValidatedForm className="stack" noValidate onSubmit={e => { e.preventDefault()
      try {
        if (!ctx.e4Enabled || !officer(ctx.session,r) || !scoped(ctx,r)) throw new Error('Thiếu quyền quản lý đợt của khoa.')
        const f = r.fields
        if (!r.title.trim() || ![f.start,f.end,f.finalDue].every(validDate) || f.start > f.end || f.end > f.finalDue)
          throw new Error('Nhập tên đợt và kiểm tra thứ tự các mốc thời gian.')
        if (![f.min,f.max].every(n => Number.isInteger(Number(n)) && Number(n) >= 1) || Number(f.min) > Number(f.max)) throw new Error('Giới hạn nhóm phải là số nguyên dương, tối thiểu không vượt tối đa.')
        if (ctx.rows.some(s => s.fields.callId === r.id) && r.unit !== initial.unit) throw new Error('Đợt đã có đăng ký, cần giữ đơn vị chủ trì.')
        ctx.commit('Lưu đợt đăng ký sinh viên',[r],r); close()
      } catch(e) { setError(messageOf(e)) }
    }}>
      <Problem message={error}/><TextField label="Tên đợt" required value={r.title} onChange={title => set({...r,title})}/>
      <div className="ext-grid">
        <SelectField label="Khoa" choices={options(units.filter(unit => scoped(ctx,{...r,unit})))} value={r.unit} onChange={unit => set({...r,unit})}/>
        <SelectField label="Quy trình của đề tài nộp mới" value={r.fields.mode || 'SIMPLIFIED'} onChange={v => field('mode',v)}
          choices={[{value:'SIMPLIFIED',label:'Rút gọn có nghiệm thu'},{value:'FULL_LIFECYCLE',label:'Hội đồng xét đề cương và nghiệm thu'}]}/>
        <SelectField label="Trạng thái đợt"  value={r.status} choices={[{value:'OPEN',label:'Mở đăng ký'},{value:'CLOSED',label:'Đóng đăng ký'}]} onChange={status => set({...r,status})}/>
        {([['start','Bắt đầu đăng ký'],['end','Hạn đăng ký'],['finalDue','Hạn nộp kết quả'],['min','Số SV tối thiểu'],['max','Số SV tối đa']] as const).map(([k,label]) =>
          <TextField key={k} label={label} type={['min','max'].includes(k) ? 'number' : 'date'} required value={r.fields[k]} onChange={v => field(k,v)}/>)}
      </div>
      <CheckTypes title="Minh chứng khi nộp đăng ký" value={r.fields.declaration} change={v => field('declaration',v)}/>
      <CheckTypes title="Minh chứng kết quả cuối" value={r.fields.result} change={v => field('result',v)}/>
      <Footer label="Lưu đợt" close={close}/>
    </ValidatedForm>
  </Modal>
}
export function Calls({ctx}: {ctx: FeatureProps}) {
  const [editing,setEditing] = useState<DemoRow>()
  const staff = ctx.session.role === 'officer'
  const rows = ctx.rows.filter(r => r.kind === 'ext-student-call' && scoped(ctx,r) && (staff ? officer(ctx.session,r) : r.unit === ctx.session.unit))
  const create = () => setEditing({ id:uid('call'),kind:'ext-student-call',title:'',owner:ctx.session.userId,unit:units.includes(ctx.session.unit) ? ctx.session.unit : units[0],status:'OPEN',
    fields:{start:today,end:'',finalDue:'',min:'1',max:'5',declaration:'',result:'FINAL_REPORT,PRODUCT'} })
  return <section className="panel stack"><div className="ext-title"><h2>Đợt đăng ký</h2>{staff && <Button onClick={create}>Mở đợt mới</Button>}</div>
    {rows.length === 0 && <Blank title="Chưa có đợt của khoa"/>}
    {rows.map(r => <div className="ext-line" key={r.id}><div><strong>{r.title}</strong><p className="muted">{r.unit} · {dateLabel(r.fields.start)} – {dateLabel(r.fields.end)} · Nhóm {r.fields.min}–{r.fields.max} SV</p></div>
      <span>{openCall(r) ? 'Đang nhận đăng ký' : 'Đã đóng đăng ký'}</span>{staff && <Button variant="outline" onClick={() => setEditing(r)}>Chỉnh sửa đợt</Button>}</div>)}
    {editing && <CallEditor ctx={ctx} initial={editing} close={() => setEditing(undefined)}/>}
  </section>
}
export function PolicyEditor({ctx,feature,close}: { ctx: FeatureProps; feature: Source; close: () => void }) {
  const items = catalog(ctx.rows,feature)
  const [row,setRow] = useState(items[0])
  const change = (key:string,v:string) => setRow({...row,fields:{...row.fields,[key]:v}})
  if (!row) return <Modal title="Quy tắc minh chứng" description="Chưa có loại hồ sơ đang hoạt động trong danh mục B01." close={close}><Button onClick={close}>Đóng</Button></Modal>
  return <Modal title="Quy tắc minh chứng" description="Quy tắc áp dụng cho hồ sơ của trường khi gửi và xét duyệt." close={close}>
    <ValidatedForm className="stack" onSubmit={e => { e.preventDefault()
      if (!ctx.e4Enabled || ctx.session.role !== 'admin') return
      const saved = encodePolicy(row)
      ctx.commit('Cập nhật quy tắc minh chứng ' + saved.title,[saved],saved); close()
    }}>
      <SelectField label="Loại hồ sơ" choices={items.map(r => ({value:r.id,label:r.title}))} value={row.id} onChange={id => setRow(items.find(r => r.id === id)!)}/>
      <CheckTypes title="Giai đoạn kê khai" value={row.fields.declaration} change={v => change('declaration',v)}/>
      {feature !== 'F12' && <><CheckTypes title="Giai đoạn kết quả" value={row.fields.result} change={v => change('result',v)}/>
        <SelectField label="Thời điểm ghi nhận giờ" value={row.fields.trigger} choices={[{value:'approval',label:'Khi duyệt kê khai'},{value:'result',label:'Khi duyệt kết quả'}]} onChange={v => change('trigger',v)}/></>}
      <Footer label="Lưu quy tắc" close={close}/>
    </ValidatedForm>
  </Modal>
}

