import { useId, useState } from 'react'
import { Button } from '@rms/ui/components/button'
import type { DemoRow, FeatureProps } from '../../demo/types'
import { managingBodies } from './catalogue'
import { catalog, codes, contributors, dateLabel, entries, featureInfo, names, openCall, requiredEvidence, scoped, sourceOf, studentsIn, teachers, units } from './model'
import type { Contributor } from './model'
import { EvidenceFields, Footer, options, pairs, Problem, SelectField, TextField, messageOf } from './controls'
import { saveDraft } from './workflow'

function TeamEditor({ team, change, mentoring, eligible }: { team: Contributor[]; change: (v: Contributor[]) => void; mentoring: boolean; eligible: Record<string,string> }) {
  const update = (i: number, patch: Partial<Contributor>) => change(team.map((p,n) => i === n ? { ...p,...patch } : p))
  const available = Object.keys(eligible).filter(id => !team.some(p => p.id === id))
  return <fieldset className="ext-group"><legend>{mentoring ? 'Giảng viên hướng dẫn' : 'Phân công và tỉ lệ đóng góp'}</legend>
    {team.map((p,i) => <div className="ext-team" key={i}>
      <SelectField label={mentoring ? 'Người hướng dẫn' : 'Người tham gia'} value={p.id} choices={pairs(eligible).filter(c => c.value === p.id || available.includes(c.value))} onChange={id => update(i,{id})}/>
      {!mentoring && <SelectField label="Vai trò" choices={options(['Chủ nhiệm','Thành viên','Điều phối'])} value={p.role} onChange={role => update(i,{role})}/>}
      {!mentoring && <TextField label="Đóng góp (%)" type="number" value={String(p.share)} onChange={v => update(i,{share:Number(v)})}/>}
      {team.length > 1 && <Button type="button" variant="outline" aria-label={'Bỏ ' + names[p.id]} onClick={() => change(team.filter((_,n) => i !== n))}>Bỏ</Button>}
    </div>)}
    {!mentoring && available.length > 0 && <Button type="button" variant="outline" onClick={() => change([...team,{id:available[0],role:'Thành viên',share:0}])}>Thêm thành viên</Button>}
  </fieldset>
}
export function Editor({ ctx, initial, finish, close }: { ctx: FeatureProps; initial: DemoRow; finish: (r: DemoRow) => void; close: () => void }) {
  const [row,setRow] = useState(initial)
  const [reason,setReason] = useState('')
  const [error,setError] = useState('')
  const feature = sourceOf(row)
  const info = featureInfo[feature]
  const student = feature === 'F10'
  const partnerList = useId()
  const f = row.fields
  const set = (key: string, value: string) => setRow(r => ({...r,fields:{...r.fields,[key]:value}}))
  const group = codes(f.group)
  const calls = ctx.rows.filter(r => r.kind === 'ext-student-call' && r.unit === row.unit && scoped(ctx,r))
  const hasPolicy = student ? calls.some(r => r.id === f.callId) : catalog(ctx.rows,feature).some(c => c.fields.code === f.category)
  const required = hasPolicy ? requiredEvidence(ctx.rows,row,'declaration') : []
  const call = calls.find(r => r.id === f.callId)
  const creatingStudent = student && ctx.session.role === 'officer' && !ctx.rows.some(record => record.id === row.id)
  const unitsAllowed = ctx.session.role === 'officer' ? units.filter(u => scoped(ctx,{...row,unit:u})) : [ctx.session.unit]
  const setUnit = (unit: string) => setRow(r => ({...r, unit,
    owner: creatingStudent ? Object.keys(studentsIn(unit))[0] : r.owner, fields: {...r.fields, scopeUnit: unit || ctx.session.unit, group: creatingStudent ? Object.keys(studentsIn(unit))[0] : r.fields.group,
    callId: student ? ctx.rows.find(c => c.kind === 'ext-student-call' && c.unit === unit && openCall(c))?.id || '' : r.fields.callId }}))
  return <form className="stack ext-editor" noValidate onSubmit={e => {
    e.preventDefault()
    try {
      const saved = saveDraft(ctx,row,reason)
      ctx.commit((initial.status === 'DRAFT' ? 'Lưu hồ sơ' : 'Thay đổi sau phê duyệt') + (reason.trim() ? ' · ' + reason.trim() : ''),[saved],saved)
      finish(saved)
    } catch (e) { setError(messageOf(e)) }
  }}>
    <Problem message={error}/>
    <fieldset className="ext-group"><legend>Thông tin đăng ký</legend>
      <TextField label={feature === 'F12' ? 'Tên hoạt động' : feature === 'F11' ? 'Tên dự án' : 'Tên đề tài'} value={row.title} required onChange={title => setRow({...row,title})}/>
      <div className="form-grid ext-grid">
        <SelectField label="Đơn vị chủ trì" required={feature !== 'F09'} value={row.unit} onChange={setUnit}
          choices={[{value:'',label:'Chọn đơn vị'},...options(unitsAllowed)]}/>
        {student
          ? <SelectField label="Đợt đăng ký" required value={f.callId} onChange={v => set('callId',v)}
              choices={[{value:'',label:'Chọn đợt'},...calls.map(c => ({ value:c.id,label:c.title + (openCall(c) ? '' : ' · đã đóng') }))]}
              hint={call && 'Hạn đăng ký ' + dateLabel(call.fields.end) + ' · Nhóm ' + call.fields.min + '–' + call.fields.max + ' sinh viên'}/>
          : <SelectField label={info.category} required value={f.category} onChange={v => set('category',v)}
              choices={catalog(ctx.rows,feature).map(c => ({ value:c.fields.code,label:c.title }))}/>}
        {feature === 'F09' && <SelectField label="Cơ quan chủ trì cấp trên" required value={f.agency} onChange={v => set('agency',v)}
          choices={[{value:'',label:'Chọn cơ quan'},...options(managingBodies(ctx.rows))]}/>}
        {feature !== 'F12' && <TextField label={feature === 'F11' ? 'Số hợp đồng' : 'Mã đề tài'} value={f.code} onChange={v => set('code',v)}/>}
        {feature === 'F09' && <TextField label="Lĩnh vực nghiên cứu" value={f.discipline} onChange={v => set('discipline',v)}/>}
        {!student && <TextField label={feature === 'F12' ? 'Ngày diễn ra' : 'Ngày bắt đầu'} type="date" value={f.start} required onChange={v => set('start',v)}/>}
        {!student && feature !== 'F12' && <TextField label="Ngày kết thúc" type="date" value={f.end} required onChange={v => set('end',v)}/>}
        {feature === 'F11' && <><TextField label="Đối tác ngoài" hint="Cần ít nhất một đối tác trước khi gửi duyệt." list={partnerList} value={f.partner} onChange={v => set('partner',v)}/>
          <datalist id={partnerList}><option>Công ty Khai thác công trình thủy lợi Sông Nhuệ</option><option>Công ty CP Kỹ thuật nước Việt</option></datalist></>}
        {!student && <TextField label={feature === 'F12' ? 'Đề nghị hỗ trợ (VND)' : 'Tổng kinh phí (VND)'} type="number" value={f.budget} onChange={v => set('budget',v)}/>}
      </div>
      {student && <><TextField label="Mục tiêu nghiên cứu" required multiline value={f.objective} onChange={v => set('objective',v)}/>
        <TextField label="Sản phẩm dự kiến" required value={f.product} onChange={v => set('product',v)}/></>}
      {feature === 'F12' && <TextField label={f.category === 'CONFERENCE' ? 'Hội nghị và nội dung báo cáo' : f.category === 'IP' ? 'Đối tượng và phạm vi bảo hộ' : 'Nội dung và đơn vị thụ hưởng'}
        required multiline value={f.description} onChange={v => set('description',v)}/>}
    </fieldset>
    {student && <fieldset className="ext-group"><legend>Nhóm sinh viên</legend>
      {creatingStudent ? <SelectField label="Trưởng nhóm" value={row.owner} choices={pairs(studentsIn(row.unit))} onChange={owner => setRow({...row,owner,fields:{...f,group:[...new Set([...group,owner])].join(',')}})}/>
        : <p className="muted">Trưởng nhóm · {names[row.owner]}</p>}
      <div className="ext-checks">{Object.entries(studentsIn(row.unit)).map(([id,name]) => <label key={id}><input type="checkbox" checked={group.includes(id)}
        disabled={id === row.owner} onChange={e => set('group',(e.target.checked ? [...group,id] : group.filter(p => p !== id)).join(','))}/>{name}</label>)}</div>
    </fieldset>}
    <TeamEditor eligible={student ? Object.fromEntries(Object.entries(teachers).filter(([id]) => ctx.rows.some(a => a.kind === 'account' && a.owner === id && a.status === 'ACTIVE' && a.fields.userType === 'author') || id === 'mai' || contributors(row).some(p => p.id === id))) : teachers} mentoring={student} team={contributors(row)} change={v => set('contributors',JSON.stringify(v))}/>
    {(!student || required.length > 0) && <EvidenceFields required={required} value={entries(row)} change={v => set('evidence',JSON.stringify(v))}/>}
    {initial.status !== 'DRAFT' && <TextField label="Lý do thay đổi sau phê duyệt" required multiline value={reason} onChange={setReason}/>}
    <Footer label={initial.status === 'DRAFT' ? 'Lưu bản nháp' : 'Lưu thay đổi'} close={close}/>
  </form>
}

