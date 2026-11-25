import { routeUrl } from "../../demo/catalog"
import { ValidatedForm } from "@rms/ui/components/validated-form"
import { useState } from 'react'
import { Button } from '@rms/ui/components/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@rms/ui/components/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@rms/ui/components/table'
import type { DemoRow, FeatureProps } from '../../demo/types'
import { codes, dateLabel, names, officer, scoped, statuses } from './model'
import { adjustHours, balance, canReadHours, periodLabels, postHours, postOutput, recalculatedHours, rounded, totalBase } from './hours'
import { Blank, Facts, Footer, messageOf, Modal, pairs, Problem, SelectField, Status, TextField } from './controls'
import { RecordFilters } from './RecordFilters'
import { Formulas } from './formulas'
import { canRead } from './workflow'

const num = (n: number | string) => Number(n).toLocaleString('vi-VN',{maximumFractionDigits:2})
function Adjustment({ ctx, row, close }: { ctx: FeatureProps; row: DemoRow; close: () => void }) {
  const [mode,setMode] = useState('delta')
  const [input,setInput] = useState('')
  const [reason,setReason] = useState('')
  const [error,setError] = useState('')
  const possible = ctx.rows.filter(r => r.kind === 'ext-formula' && r.status === 'ACTIVE' && r.fields.activity === row.fields.activity && r.fields.periodType === row.fields.recognitionPeriodType)
  const [version,setVersion] = useState(row.fields.formulaId)
  const formula = possible.find(r => r.id === version)
  const current = balance(ctx.rows,row)
  const target = formula ? recalculatedHours(formula,row) : current
  const delta = mode === 'recalculate' ? String(rounded(target-current)) : input
  return <Modal title="Điều chỉnh giờ giảng" description={names[row.owner] + ' · ' + row.title} close={close}>
    <ValidatedForm className="stack" noValidate onSubmit={e => { e.preventDefault()
      try {
        const record = adjustHours(ctx,row,delta,reason)
        if (mode === 'recalculate' && formula) {
          record.fields.recalculatedWith = formula.id
          record.fields.formulaVersion = formula.fields.version
          record.fields.formulaId = formula.id
          record.fields.totalBase = String(totalBase(formula,Number(row.fields.contractValue)))
        }
        ctx.commit('Điều chỉnh ' + delta + ' giờ · ' + reason,[record],row); close()
      } catch (e) { setError(messageOf(e)) }
    }}><Problem message={error}/>
      <SelectField label="Cách điều chỉnh" value={mode} onChange={setMode} choices={pairs({delta:'Nhập số giờ tăng hoặc giảm',recalculate:'Tính lại theo phiên bản định mức'})}/>
      {mode === 'delta' ? <TextField label="Chênh lệch giờ (±)" type="number" required value={input} onChange={setInput}/>
        : <SelectField label="Phiên bản dùng tính lại" value={version} onChange={setVersion} choices={possible.map(r => ({value:r.id,label:r.fields.version + ' · ' + dateLabel(r.fields.validFrom)}))}/>}
      <Facts facts={[[ 'Hiện ghi nhận',num(current) + ' giờ' ],['Sau điều chỉnh',num(current + Number(delta || 0)) + ' giờ']]}/>
      <TextField label="Lý do điều chỉnh" required multiline value={reason} onChange={setReason}/>
      <Footer label="Ghi dòng điều chỉnh" close={close}/>
    </ValidatedForm></Modal>
}
function OutputForm({ctx,close}: {ctx: FeatureProps;close:()=>void}) {
  const possible = ctx.rows.filter(r => r.kind === 'output' && r.status === 'APPROVED' && r.fields.access === 'FULL' && scoped(ctx,r) && officer(ctx.session,r) && ['PATENT','ARTICLE'].includes(r.fields.type))
  const [id,setId] = useState(possible[0]?.id || '')
  const source = possible.find(r => r.id === id)
  const [category,setCategory] = useState('')
  const [date,setDate] = useState('')
  const [shares,setShares] = useState<Record<string,string>>({})
  const [error,setError] = useState('')
  const [notice,setNotice] = useState('')
  const authors = codes(source?.fields.authors)
  const types = source?.fields.type === 'PATENT' ? {PATENT:'Bằng sáng chế',UTILITY_SOLUTION:'Giải pháp hữu ích'} : {SCIE_Q1:'Bài báo SCIE Q1',SCIE_Q2:'Bài báo SCIE Q2'}
  return <Modal title="Quy đổi sản phẩm khoa học" description="Chọn sản phẩm F07 đã duyệt và đối chiếu căn cứ phân loại trước khi ghi sổ." close={close}>
    {!source ? <><Blank title="Chưa có sản phẩm đủ điều kiện"/><Button variant="outline" onClick={close}>Đóng</Button></> : <ValidatedForm className="stack" noValidate onSubmit={e => { e.preventDefault()
      try {
        const updates = postOutput(ctx,id,category,source.fields.reviewedAt?.slice(0,10) || date,shares)
        if (!updates.length) { setNotice('Sự kiện đã được ghi sổ. Tổng giờ và phân bổ được giữ nguyên.'); setError(''); return }
        ctx.commit('Quy đổi sản phẩm F07',updates,source); close()
      } catch(e) { setError(messageOf(e)); setNotice('') }
    }}><Problem message={error}/>{notice && <p role="status">{notice}</p>}
      <SelectField label="Sản phẩm đã duyệt" value={id} choices={possible.map(r => ({value:r.id,label:r.title}))} onChange={v => {setId(v);setCategory('');setShares({});setDate('');setNotice('');setError('')}}/>
      <SelectField label="Phân loại theo minh chứng" required value={category} choices={[{value:'',label:'Chọn phân loại'},...Object.entries(types).map(([value,label]) => ({value,label}))]} onChange={setCategory}/>
      {source.fields.reviewedAt ? <p>Ngày duyệt · {dateLabel(source.fields.reviewedAt)}</p> : <TextField label="Ngày nghiệp vụ theo văn bản duyệt" type="date" required value={date} onChange={setDate}/>}
      {authors.map(id => <TextField key={id} type="number" label={'Tỉ lệ đóng góp (%) · ' + (names[id] || id)} value={shares[id] || ''} onChange={v => setShares({...shares,[id]:v})}/>)}
      <Footer label="Quy đổi và ghi sổ" close={close}/>
    </ValidatedForm>}
  </Modal>
}
function HourDetail({ctx,record}: {ctx: FeatureProps;record:DemoRow}) {
  const base = record.fields.originalId ? ctx.rows.find(r => r.id === record.fields.originalId && canReadHours(ctx.session,r) && scoped(ctx,r)) : record
  const changes = base ? ctx.rows.filter(r => r.kind === 'hours' && r.fields.originalId === base.id && canReadHours(ctx.session,r) && scoped(ctx,r)) : []
  const canAdjust = base && ['admin','officer'].includes(ctx.session.role) && !changes.some(r => r.fields.revoked === 'true')
  const [editing,setEditing] = useState(false)
  const [notice,setNotice] = useState('')
  const f = record.fields
  const source = ctx.rows.find(r => r.id === f.sourceId && scoped(ctx,r))
  const profile = ctx.rows.find(r => r.kind === 'profile' && r.owner === record.owner && scoped(ctx,r))
  const sourceVisible = source && (source.kind === 'output' ? source.owner === ctx.session.userId || codes(source.fields.authors).includes(ctx.session.userId) || officer(ctx.session,source) : canRead(ctx.session,source))
  return <>
    <div><Button variant="link" asChild><a href={routeUrl('P03')}>← Sổ giờ giảng</a></Button></div>
    <div className="page-heading"><div><Status value={record.status}/><h1>{record.title}</h1><p className="muted">{names[record.owner] || record.owner} · {record.unit}</p></div></div>
    <div className="ext-actions">
      {canAdjust && <Button aria-haspopup="dialog" onClick={() => setEditing(true)}>Điều chỉnh giờ</Button>}
      {sourceVisible && <Button variant="outline" asChild><a href={routeUrl(f.sourceFeature, source.id)}>Mở hồ sơ nguồn {f.sourceFeature}</a></Button>}
      {profile && <Button variant="outline" asChild><a href={routeUrl('F08', profile.id)}>Mở lý lịch F08</a></Button>}
      {source && source.kind !== 'output' && officer(ctx.session,source) && <Button variant="outline" onClick={() => {
        try { const updates = postHours(ctx.rows,source)
          if (updates.length) ctx.commit('Ghi sổ sự kiện nguồn',updates,source)
          setNotice(updates.length ? 'Đã ghi sổ sự kiện.' : 'Đã đối chiếu sự kiện. Số giờ, phân bổ và phiên bản khớp lần ghi đầu.')
        } catch(e) {setNotice(messageOf(e))}
      }}>Đối chiếu sự kiện</Button>}
    </div>{notice && <p role="status">{notice}</p>}
    <section className="panel stack"><h2>Căn cứ quy đổi</h2><Facts facts={[
      ['Giờ của dòng',num(f.hours) + ' giờ'],['Định mức nguồn',num(f.totalBase) + ' giờ'],['Phân bổ', f.role + ' · ' + f.share + '%'],
      ['Phiên bản',f.formulaVersion],['Ngày nghiệp vụ nguồn',dateLabel(f.sourceOccurredAt)],['Kỳ ghi nhận',periodLabels[f.recognitionPeriodType] + ' ' + f.recognitionPeriodCode],
      ['Hồ sơ nguồn',f.sourceFeature + ' · ' + f.sourceId],['Khóa sự kiện',f.eventKey],
    ]}/></section>
    <section className="panel stack"><h2>Lịch sử dòng giờ</h2>
      {base && <div className="ext-line"><span>Ghi nhận ban đầu · {base.fields.formulaVersion}</span><b>{num(base.fields.hours)} giờ</b></div>}
      {changes.map(r => <div className="ext-line" key={r.id}><div>{r.fields.reason}<p className="muted">{names[r.fields.adjustedBy]} · {dateLabel(r.fields.adjustedAt)} · {r.fields.formulaVersion}</p></div><b>{num(r.fields.hours)} giờ</b></div>)}
      {base && <div className="ext-line"><strong>Tổng hiện tại</strong><strong>{num(balance(ctx.rows,base))} giờ</strong></div>}
    </section>
    {editing && base && <Adjustment ctx={ctx} row={base} close={() => setEditing(false)}/>}
  </>
}
export function Ledger({ctx}: {ctx: FeatureProps}) {
  const [filters,setFilters] = useState<Record<string,string>>({})
  const [output,setOutput] = useState(false)
  const visible = ctx.rows.filter(r => canReadHours(ctx.session,r) && scoped(ctx,r))
  if (ctx.route.id) {
    const r = visible.find(r => r.id === ctx.route.id)
    return r ? <HourDetail key={r.id} ctx={ctx} record={r}/> : <Blank title="Không tìm thấy dòng giờ trong phạm vi truy cập"><Button variant="link" asChild><a href={routeUrl('P03')}>Về sổ giờ giảng</a></Button></Blank>
  }
  const descriptors = [
    ['owner','Giảng viên'],['unit','Đơn vị'],['recognitionPeriodType','Loại kỳ'],['recognitionPeriodCode','Kỳ ghi nhận'],['sourceFeature','Nguồn'],['status','Loại dòng'],
  ]
  const value = (r: DemoRow, key:string) => key === 'owner' || key === 'unit' || key === 'status' ? r[key] : r.fields[key]
  const headers = ['Nguồn ghi nhận','Giảng viên','Kỳ','Phiên bản','Số giờ']
  const filterCount = Object.values(filters).filter(Boolean).length
  const rows = visible.filter(r => descriptors.every(([k]) => !filters[k] || filters[k] === value(r,k)))
  return <>
    <div className="page-heading"><div><h1>Giờ giảng quy đổi</h1><p className="muted">Tra cứu giờ theo giảng viên, kỳ ghi nhận và hồ sơ nguồn.</p></div>
      {ctx.session.role === 'officer' && <Button aria-haspopup="dialog" onClick={() => setOutput(true)}>Quy đổi sản phẩm F07</Button>}</div>
    <Tabs defaultValue="ledger">{ctx.session.role === 'admin' && <TabsList><TabsTrigger value="ledger">Sổ giờ giảng</TabsTrigger><TabsTrigger value="formulas">Công thức và kỳ</TabsTrigger></TabsList>}
      <TabsContent value="ledger" className="stack">
        <div className="metric-grid"><div className="metric"><span>Tổng giờ theo bộ lọc</span><strong>{num(rounded(rows.reduce((a,r) => a + Number(r.fields.hours),0)))}</strong></div>
          <div className="metric"><span>Giảng viên</span><strong>{new Set(rows.map(r => r.owner)).size}</strong></div>
          <div className="metric"><span>Nguồn ghi nhận</span><strong>{new Set(rows.map(r => r.fields.sourceId)).size}</strong></div></div>
        <section className="panel stack"><h2>Sổ chi tiết</h2><RecordFilters count={filterCount} clear={() => setFilters({})}>{descriptors.map(([k,label]) =>
          <SelectField key={k} label={label} value={filters[k] || ''} onChange={v => setFilters({...filters,[k]:v})} choices={[{value:'',label:'Tất cả'},...Array.from(new Set(visible.map(r => value(r,k)))).filter(Boolean).sort().map(v => ({value:v,label:names[v] || statuses[v] || periodLabels[v] || v}))]}/>)}</RecordFilters>
          {rows.length ? <Table className="data-table mobile-record-table" aria-label="Sổ chi tiết giờ giảng"><TableHeader><TableRow>{headers.map(h => <TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader>
            <TableBody>{rows.map(r => <TableRow key={r.id}><TableCell><Button variant="link" size="content" className="record-link" asChild><a href={routeUrl('P03', r.id)}>{r.title}</a></Button><small>{r.fields.sourceFeature} · {statuses[r.status]}</small></TableCell>
              <TableCell data-label={headers[1]}>{names[r.owner] || r.owner}</TableCell><TableCell data-label={headers[2]}>{r.fields.recognitionPeriodCode}</TableCell><TableCell data-label={headers[3]}>{r.fields.formulaVersion}</TableCell><TableCell data-label={headers[4]}>{num(r.fields.hours)}</TableCell></TableRow>)}</TableBody></Table>
          : <Blank title="Chưa có dòng giờ phù hợp">{filterCount ? 'Đổi điều kiện hoặc xóa bộ lọc để xem lại sổ giờ.' : 'Các hồ sơ đủ điều kiện sẽ xuất hiện sau khi quy đổi.'}</Blank>}
        </section>
      </TabsContent>
      {ctx.session.role === 'admin' && <TabsContent value="formulas"><Formulas ctx={ctx}/></TabsContent>}
    </Tabs>
    {output && <OutputForm ctx={ctx} close={() => setOutput(false)}/>}
  </>
}

