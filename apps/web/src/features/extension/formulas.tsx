import { useState } from 'react'
import { Button } from '@rms/ui/components/button'
import type { DemoRow, FeatureProps } from '../../demo/types'
import { dateLabel, money, uid } from './model'
import { calendar, periodLabels, saveFormula } from './hours'
import { Footer, Modal, pairs, Problem, SelectField, TextField, messageOf } from './controls'

function FormulaEditor({ ctx, template, close }: { ctx: FeatureProps; template: DemoRow; close: () => void }) {
  const [r,setRow] = useState<DemoRow>(() => {
    const version = Math.max(...ctx.rows.filter(x => x.kind === template.kind && x.fields.activity === template.fields.activity)
      .map(x => Number(x.fields.version.replace(/^v/,'')) || 0)) + 1
    return {...template,id:uid('formula'),status:'ACTIVE',fields:{...template.fields,version:'v' + version,validFrom:'2027-01-01',validTo:'2027-12-31',poDecision:''}}
  })
  const [error,setError] = useState('')
  const f = r.fields
  const set = (k:string,v:string) => setRow({...r,fields:{...f,[k]:v}})
  const bands = f.bands ? JSON.parse(f.bands) as [number,number][] : []
  return <Modal title="Tạo phiên bản định mức" description={r.title + ' · Phân bổ theo tỉ lệ đóng góp của từng người.'} close={close}>
    <form className="stack" noValidate onSubmit={e => { e.preventDefault()
      try { const saved = saveFormula(ctx,r); ctx.commit('Tạo phiên bản định mức ' + f.version,[saved],saved); close() } catch(e) { setError(messageOf(e)) }
    }}><Problem message={error}/>
      <div className="ext-grid"><TextField label="Phiên bản" required value={f.version} onChange={v => set('version',v)}/>
        <SelectField label="Loại kỳ" choices={pairs(periodLabels)} value={f.periodType} onChange={v => set('periodType',v)}/>
        <TextField label="Hiệu lực từ" required type="date" value={f.validFrom} onChange={v => set('validFrom',v)}/>
        <TextField label="Hiệu lực đến" required type="date" value={f.validTo} onChange={v => set('validTo',v)}/>
        {!bands.length && <><TextField label="Giờ cơ sở" required type="number" value={f.base} onChange={v => set('base',v)}/>
        <TextField label="Hệ số" required type="number" value={f.multiplier} onChange={v => set('multiplier',v)}/></>}
      </div>
      {bands.length > 0 && <fieldset className="ext-group"><legend>Bậc giá trị hợp đồng</legend>{bands.map(([min,h],i) =>
        <TextField key={i} label={'Số giờ từ ' + money(String(min))} type="number" value={String(h)} onChange={v => set('bands',JSON.stringify(bands.map((b,n) => n === i ? [min,Number(v)] : b)))}/>)}</fieldset>}
      {f.activity === 'SCIE_Q2' && <TextField label="Số văn bản hoặc căn cứ PO xác nhận hệ số" required value={f.poDecision} onChange={v => set('poDecision',v)}/>}
      <Footer label="Lưu phiên bản" close={close}/>
    </form>
  </Modal>
}
function CalendarEditor({ctx,close}: {ctx:FeatureProps;close:()=>void}) {
  const original = ctx.rows.find(r => r.kind === 'ext-calendar')!
  const [f,set] = useState({...original.fields})
  const [error,setError] = useState('')
  return <Modal title="Lịch ghi nhận giờ giảng" description="Kỳ đã ghi trên các dòng giờ được giữ theo lịch tại lần quy đổi đầu tiên." close={close}>
    <form className="stack" onSubmit={e => { e.preventDefault()
      if (ctx.session.role !== 'admin' || !ctx.e4Enabled) return
      if (![f.academicMonth,f.fiscalMonth].every(v => Number.isInteger(Number(v)) && Number(v) >= 1 && Number(v) <= 12)) { setError('Chọn tháng mở kỳ từ 1 đến 12.'); return }
      const updated = {...original,fields:f}
      ctx.commit('Lưu lịch ghi nhận P03',[updated],updated); close()
    }}><Problem message={error}/><SelectField label="Kỳ dùng cho sự kiện mới" choices={pairs(periodLabels)} value={f.periodType} onChange={periodType => set({...f,periodType})}/>
      <TextField label="Tháng mở năm học" type="number" value={f.academicMonth} onChange={academicMonth => set({...f,academicMonth})}/>
      <TextField label="Tháng mở năm tài khóa" type="number" value={f.fiscalMonth} onChange={fiscalMonth => set({...f,fiscalMonth})}/>
      <Footer label="Lưu lịch" close={close}/>
    </form></Modal>
}
export function Formulas({ctx}: {ctx: FeatureProps}) {
  const rows = ctx.rows.filter(r => r.kind === 'ext-formula')
  const [editing,setEditing] = useState<DemoRow>()
  const [cal,setCal] = useState(false)
  return <section className="panel stack"><div className="ext-title"><div><h2>Định mức quy đổi</h2><p className="muted">Bộ định mức mô phỏng · Kỳ hiện hành theo {periodLabels[calendar(ctx.rows).periodType]?.toLocaleLowerCase('vi')}.</p></div>
    <Button variant="outline" onClick={() => setCal(true)}>Cấu hình lịch kỳ</Button></div>
    {rows.map(r => <div className="ext-line" key={r.id}><div><strong>{r.title} · {r.fields.version}</strong><p className="muted">{dateLabel(r.fields.validFrom)} – {dateLabel(r.fields.validTo)} · {periodLabels[r.fields.periodType]}</p>
      <p>{r.fields.bands ? (JSON.parse(r.fields.bands) as [number,number][]).map(([min,h]) => 'Từ ' + (min/1000000).toLocaleString('vi') + ' triệu: ' + h + ' giờ').join(' · ')
        : r.fields.base + ' giờ × ' + r.fields.multiplier}</p></div>
      {r.status !== 'ACTIVE' && <strong>Chờ PO xác nhận</strong>}<Button variant="outline" onClick={() => setEditing(r)}>Tạo phiên bản</Button></div>)}
    {editing && <FormulaEditor ctx={ctx} template={editing} close={() => setEditing(undefined)}/>}
    {cal && <CalendarEditor ctx={ctx} close={() => setCal(false)}/>}
  </section>
}

