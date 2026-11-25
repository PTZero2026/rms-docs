import { routeUrl } from "../../demo/catalog"
import { ValidatedForm } from "@rms/ui/components/validated-form"
import { useState } from 'react'
import { formatVietnamDate } from '../../format-date'
import { Button } from '@rms/ui/components/button'
import type { DemoRow, FeatureProps } from '../../demo/types'
import { catalog, codes, contributors, dateLabel, entries, evidenceLabels, featureInfo, money, names, requiredEvidence, scoped, sourceOf, statuses } from './model'
import { actions, actionNames, canEdit, needsReason, saveDraft, transition } from './workflow'
import type { Action } from './workflow'
import { canReadHours } from './hours'
import { Editor } from './editor'
import { Blank, EvidenceFields, Facts, Footer, messageOf, Modal, Problem, Status, TextField } from './controls'

export function categoryTitle(rows: DemoRow[], row: DemoRow) {
  const c = row.kind === 'student-project' ? rows.find(r => r.kind === 'ext-student-call' && r.id === row.fields.callId)
    : catalog(rows,sourceOf(row)).find(r => r.fields.code === row.fields.category)
  return c?.title || row.fields.category
}
function DecisionForm({ctx,row,action,close}: {ctx: FeatureProps; row: DemoRow; action: Action; close: () => void}) {
  let resultTypes: string[] = []
  let policyIssue = ''
  if (action === 'sendResult') {
    try { resultTypes = requiredEvidence(ctx.rows,row,'result') } catch (e) { policyIssue = messageOf(e) }
  }
  const [reason,setReason] = useState('')
  const [result,setResult] = useState((action === 'checkpoint' ? row.fields.progress : row.fields.resultSummary) || '')
  const [evidence,setEvidence] = useState<Record<string,string>>(() => {
    if (action !== 'sendResult') return {}
    const existing = entries(row)
    return Object.fromEntries(resultTypes.filter(c => existing[c]).map(c => [c,existing[c]]))
  })
  const needsPartner = action === 'submit' && row.kind === 'applied-project' && !row.fields.partner?.trim()
  const [partner,setPartner] = useState('')
  const [support,setSupport] = useState(row.fields.budget || '0')
  const [deadline,setDeadline] = useState('')
  const [minutes,setMinutes] = useState('')
  const [error,setError] = useState(policyIssue)
  const reasonRequired = needsReason.includes(action)
  const label = action === 'submit' && row.kind === 'student-project' ? 'Nộp đăng ký' : actionNames[action]
  return <Modal title={label} description={row.title} close={close}><ValidatedForm className="stack" noValidate onSubmit={e => { e.preventDefault()
    try {
      let source = row
      let current = ctx
      if (needsPartner && partner.trim()) {
        source = saveDraft(ctx,{...row,fields:{...row.fields,partner:partner.trim()}})
        current = {...ctx,rows:ctx.rows.map(r => r.id === source.id ? source : r)}
      }
      const updates = transition(current,source,action,{reason,result,evidence:JSON.stringify(evidence),support,deadline,minutes})
      ctx.commit(label + (reason.trim() ? ' · ' + reason.trim() : ''),updates,updates[0])
      close()
    } catch (e) { setError(messageOf(e)) }
  }}>
    <Problem message={error}/>
    {needsPartner && <TextField label="Đối tác ngoài" value={partner} onChange={setPartner} required hint="Nhập đối tác của hợp đồng để gửi chính hồ sơ này."/>}
    <Facts facts={[[ 'Trạng thái hiện tại', statuses[row.status] ],['Người thao tác',ctx.session.name]]}/>
    {['approve','pass','fail'].includes(action) && ['UNDER_REVIEW','UNDER_ACCEPTANCE'].includes(row.status) &&
      <TextField label="Số hoặc tên biên bản hội đồng" required value={minutes} onChange={setMinutes}/>}
    {action === 'checkpoint' && <TextField label="Nội dung báo cáo tiến độ" required multiline value={result} onChange={setResult}/>}
    {action === 'sendResult' && <><TextField label="Tóm tắt kết quả thực hiện" required multiline value={result} onChange={setResult}/>
      <EvidenceFields required={resultTypes} value={evidence} change={setEvidence}/></>}
    {action === 'approve' && row.kind === 'activity' && <TextField label="Kinh phí hỗ trợ được duyệt (VND)" type="number" value={support} onChange={setSupport}/>}
    {action === 'reopen' && <TextField label="Hạn nộp lại kết quả" type="date" required value={deadline} onChange={setDeadline}/>}
    {(reasonRequired || action === 'pass') && <TextField label={action === 'pass' || action === 'fail' ? 'Kết luận nghiệm thu' : 'Lý do'} required={reasonRequired} multiline value={reason} onChange={setReason}/>}
    <Footer label={label} close={close}/>
  </ValidatedForm></Modal>
}
export function Detail({ctx,row}: {ctx: FeatureProps; row: DemoRow}) {
  const feature = sourceOf(row)
  const f = row.fields
  const [edit,setEdit] = useState(false)
  const [decision,setDecision] = useState<Action>()
  const acts = actions(ctx.session,row)
  const back = () => ctx.go(feature)
  const facts: [string,string][] = [[featureInfo[feature].category,categoryTitle(ctx.rows,row)],['Đơn vị chủ trì',row.unit || 'Chưa chọn']]
  if (f.code) facts.push(['Mã hồ sơ',f.code])
  if (feature === 'F09') facts.push(['Cơ quan chủ trì cấp trên',f.agency],['Lĩnh vực',f.discipline])
  if (feature === 'F11') facts.push(['Đối tác ngoài',f.partner || 'Cần bổ sung trước khi gửi duyệt'])
  if (feature === 'F10') facts.push(['Trưởng nhóm',names[row.owner]],['Nhóm sinh viên',codes(f.group).map(id => names[id] || id).join(', ')],
    ['Mục tiêu',f.objective],['Sản phẩm dự kiến',f.product],['Xác nhận hướng dẫn', f.mentorConfirmation === row.id ? names[f.confirmedMentor] + ' đã xác nhận' : 'Chưa xác nhận'])
  else facts.push([feature === 'F12' ? 'Ngày diễn ra' : 'Thời gian thực hiện',dateLabel(f.start) + (feature === 'F12' ? '' : ' – ' + dateLabel(f.end))])
  if (feature === 'F12') {
    facts.push(['Nội dung hoạt động',f.description],['Đề nghị hỗ trợ',money(f.budget)])
    if (f.support) facts.push(['Kinh phí được duyệt',money(f.support)])
  } else if (feature !== 'F10') facts.push(['Tổng kinh phí',f.budget ? money(f.budget) : 'Chưa kê khai'])
  if (feature === 'F10') facts.push(['Quy trình',f.mode === 'FULL_LIFECYCLE' ? 'Xét duyệt và nghiệm thu qua hội đồng' : 'Rút gọn có nghiệm thu'])
  if (f.progress) facts.push(['Tiến độ ngày ' + dateLabel(f.progressDate),f.progress])
  if (f.reviewMinutes) facts.push(['Biên bản xét đề cương',f.reviewMinutes])
  if (f.finalMinutes) facts.push(['Biên bản hội đồng nghiệm thu',f.finalMinutes])
  if (f.resultSummary) facts.push(['Kết quả thực hiện',f.resultSummary])
  if (f.finalMentor) facts.push(['Xác nhận kết quả',names[f.finalMentor]])
  if (f.conclusion) facts.push(['Kết luận nghiệm thu',f.conclusion])
  if (f.reworkDeadline) facts.push(['Hạn nộp lại',dateLabel(f.reworkDeadline)])
  const ledger = ctx.rows.filter(r => r.fields.sourceId === row.id && scoped(ctx,r) && canReadHours(ctx.session,r))
  const history = ctx.audit.filter(e => e.recordId === row.id)
  if (edit) return <><h1>Chỉnh sửa hồ sơ</h1><Editor initial={row} ctx={ctx} close={() => setEdit(false)} finish={() => setEdit(false)}/></>
  return <>
    <div><Button variant="link" onClick={back}>← {featureInfo[feature].title}</Button></div>
    <div className="page-heading"><div><Status value={row.status}/><h1>{row.title}</h1></div></div>
    <div className="page-actions ext-actions">
      {canEdit(ctx.session,row) && <Button variant="outline" onClick={() => setEdit(true)}>Chỉnh sửa hồ sơ</Button>}
      {acts.map((a,i) => <Button key={a} variant={i === 0 ? 'default' : 'outline'} aria-haspopup="dialog" onClick={() => setDecision(a)}>
        {a === 'submit' && feature === 'F10' ? 'Nộp đăng ký' : actionNames[a]}</Button>)}
    </div>
    {f.reason && <div className="panel"><strong>Ghi chú xử lý gần nhất</strong><p>{f.reason}</p></div>}
    <div className="grid-two ext-detail"><section className="panel stack"><h2>Thông tin hồ sơ</h2><Facts facts={facts}/></section>
      <div className="stack"><section className="panel stack"><h2>{feature === 'F10' ? 'Giảng viên hướng dẫn' : 'Nhân sự tham gia'}</h2>
        {contributors(row).map(p => <div className="ext-line" key={p.id}><div><strong>{names[p.id] || p.id}</strong><p className="muted">{p.role}</p></div><b>{p.share}%</b></div>)}</section>
        <section className="panel stack"><h2>Minh chứng hồ sơ</h2>{Object.entries(entries(row)).filter(([,v]) => v.trim()).length ?
          <Facts facts={Object.entries(entries(row)).filter(([,v]) => v.trim()).map(([c,v]) => [evidenceLabels[c] || c,v])}/>
          : <p className="muted">Chưa có tham chiếu minh chứng.</p>}</section>
      </div>
    </div>
    {ledger.length > 0 && <section className="panel stack"><h2>Giờ giảng đã ghi sổ</h2>{ledger.map(r =>
      <div className="ext-line" key={r.id}><div>{names[r.owner]} · {r.fields.recognitionPeriodCode}<p className="muted">{r.fields.formulaVersion} · {statuses[r.status]}</p></div>
        <Button variant="link" asChild><a href={routeUrl('P03', r.id)}>{r.fields.hours} giờ →</a></Button></div>)}</section>}
    <section className="panel stack"><h2>Lịch sử xử lý</h2>{history.length ? history.map(e =>
      <div key={e.id} className="ext-line"><div>{e.action}<p className="muted">{e.actor} · {formatVietnamDate(e.at, 'minute')}</p></div></div>
    ) : <Blank title="Chưa có thao tác mới trên hồ sơ"/>}</section>
    {decision && <DecisionForm ctx={ctx} row={row} action={decision} close={() => setDecision(undefined)}/>}
  </>
}

