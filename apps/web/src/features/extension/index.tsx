import { useState } from 'react'
import { Button } from '@rms/ui/components/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@rms/ui/components/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@rms/ui/components/table'
import type { FeatureProps } from '../../demo/types'
import type { Source } from './model'
import { featureInfo, money, names, scoped, statuses, uid } from './model'
import { canCreate, canRead, newRecord } from './workflow'
import { Blank, SelectField, Status, TextField } from './controls'
import { categoryTitle, Detail } from './detail'
import { Editor } from './editor'
import { Calls, PolicyEditor } from './management'
import { Ledger } from './ledger'
import './extension.css'

const descriptions: Record<Source,string> = {
  F09: 'Theo dõi nhiệm vụ do cơ quan cấp trên giao, quyết định phê duyệt và kết quả thực hiện.',
  F10: 'Quản lý đăng ký theo đợt, xác nhận hướng dẫn và kết quả nghiệm thu của nhóm sinh viên.',
  F11: 'Theo dõi hợp đồng, đối tác và kết quả bàn giao của các dự án ứng dụng.',
  F12: 'Kê khai hội nghị, phục vụ cộng đồng và sở hữu trí tuệ để xét hỗ trợ và ghi nhận giờ giảng.',
}
const fold = (s:string) => s.toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replaceAll('đ','d')
function RecordList({ctx,feature}: {ctx:FeatureProps;feature:Source}) {
  const info = featureInfo[feature]
  const all = ctx.rows.filter(r => r.kind === info.kind && scoped(ctx,r) && canRead(ctx.session,r))
  const [query,setQuery] = useState('')
  const [filters,setFilters] = useState<Record<string,string>>({})
  const [policy,setPolicy] = useState(false)
  const cols = feature === 'F11' ? ['Loại dự án','Trạng thái','Đơn vị','Năm'] : [info.category,'Trạng thái','Đơn vị']
  const lookup = (r: typeof all[number],k: string) => k === 'Trạng thái' ? r.status : k === 'Đơn vị' ? r.unit : k === 'Năm' ? r.fields.start?.slice(0,4) : categoryTitle(ctx.rows,r)
  const rows = all.filter(r => fold([r.title,r.fields.code,r.fields.partner,r.fields.agency].join(' ')).includes(fold(query.trim())) && cols.every(k => !filters[k] || filters[k] === lookup(r,k)))
  const staff = ctx.session.role === 'officer'
  const student = feature === 'F10'
  const pending = all.filter(r => ['PENDING_APPROVAL','SUBMITTED','RESULT_PENDING','FINAL_SUBMITTED','UNDER_REVIEW','UNDER_ACCEPTANCE'].includes(r.status))
  return <>
    <div className="page-heading"><div><h1>{info.title}</h1><p className="muted">{descriptions[feature]}</p></div>
      {canCreate(ctx.session,feature) && <Button onClick={() => ctx.go(feature,'new')}>{info.create}</Button>}
      {ctx.session.role === 'admin' && !student && <Button variant="outline" onClick={() => setPolicy(true)}>Quy tắc minh chứng</Button>}
    </div>
    <Tabs defaultValue="list">
      {(student || staff) && <TabsList><TabsTrigger value="list">Hồ sơ ({all.length})</TabsTrigger>
        {staff && <TabsTrigger value="queue">Chờ xét ({pending.length})</TabsTrigger>}
        {student && <TabsTrigger value="calls">Đợt đăng ký</TabsTrigger>}</TabsList>}
      {['list',...(staff ? ['queue'] : [])].map(mode => {
        const shown = mode === 'queue' ? rows.filter(r => pending.includes(r)) : rows
        return <TabsContent key={mode} value={mode}><section className="panel stack">
          <h2>{mode === 'queue' ? 'Hàng đợi phê duyệt' : 'Danh sách hồ sơ'}</h2>
          <div className="ext-filters"><TextField label={feature === 'F11' ? 'Tìm tên, mã hoặc đối tác' : 'Tìm tên hoặc mã hồ sơ'} type="search" value={query} onChange={setQuery}/>
            {cols.map(k => <SelectField key={k} label={k} value={filters[k] || ''} onChange={v => setFilters({...filters,[k]:v})}
              choices={[{value:'',label:'Tất cả'},...Array.from(new Set(all.map(r => lookup(r,k)))).filter(Boolean).sort().map(v => ({value:v,label:statuses[v] || v}))]}/>)}</div>
          {shown.length ? <Table className="data-table"><TableHeader><TableRow>{['Hồ sơ',student ? 'Trưởng nhóm / GVHD' : info.category,feature === 'F11' ? 'Giá trị hợp đồng' : 'Đơn vị','Trạng thái'].map(h => <TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader>
            <TableBody>{shown.map(r => <TableRow key={r.id}><TableCell><button className="record-link" onClick={() => ctx.go(feature,r.id)}>{r.title}</button>
              <small>{[r.fields.code,feature === 'F11' ? r.fields.partner || 'Chưa có đối tác' : student ? categoryTitle(ctx.rows,r) : r.fields.agency].filter(Boolean).join(' · ')}</small></TableCell>
              <TableCell>{student ? <>{names[r.owner]}<small>{r.fields.confirmedMentor ? names[r.fields.confirmedMentor] : 'Chưa xác nhận GVHD'}</small></> : categoryTitle(ctx.rows,r)}</TableCell>
              <TableCell>{feature === 'F11' ? money(r.fields.budget) : r.unit || '—'}</TableCell><TableCell><Status value={r.status}/></TableCell></TableRow>)}</TableBody></Table>
            : <Blank title={mode === 'queue' ? 'Không có hồ sơ chờ xét phù hợp' : 'Không có hồ sơ phù hợp'}>{query || Object.values(filters).some(Boolean)
              ? <Button variant="link" onClick={() => { setFilters({}); setQuery('') }}>Xóa bộ lọc</Button> : 'Danh sách hiển thị theo phạm vi của tài khoản.'}</Blank>}
        </section></TabsContent>
      })}
      {student && <TabsContent value="calls"><Calls ctx={ctx}/></TabsContent>}
    </Tabs>
    {policy && <PolicyEditor ctx={ctx} feature={feature} close={() => setPolicy(false)}/>}
  </>
}
function SourcePage({ctx,feature}: {ctx:FeatureProps;feature:Source}) {
  const [id] = useState(() => uid(feature.toLowerCase()))
  if (ctx.route.id === 'new' && canCreate(ctx.session,feature)) return <>
    <header className="page-heading"><div><h1>{featureInfo[feature].create}</h1><p className="muted">{featureInfo[feature].title}</p></div></header>
    <section className="panel"><Editor ctx={ctx} initial={newRecord(ctx,feature,id)} close={() => ctx.go(feature)} finish={r => ctx.go(feature,r.id)}/></section>
  </>
  if (ctx.route.id) {
    const row = ctx.rows.find(r => r.id === ctx.route.id && r.kind === featureInfo[feature].kind && scoped(ctx,r) && canRead(ctx.session,r))
    return row ? <Detail ctx={ctx} row={row}/> : <Blank title="Không tìm thấy hồ sơ trong phạm vi truy cập"><Button variant="link" onClick={() => ctx.go(feature)}>Về danh sách</Button></Blank>
  }
  return <RecordList ctx={ctx} feature={feature}/>
}
export default function Extension(ctx: FeatureProps) {
  if (!ctx.e4Enabled) return <Blank title="Trường chưa bật hoạt động mở rộng"><Button variant="link" onClick={() => ctx.go('B06')}>Về tổng quan</Button></Blank>
  const feature = ctx.route.feature
  const key = [ctx.session.tenant,ctx.session.userId,ctx.session.role,feature,ctx.route.id].join('/')
  return <div className="extension-workspace stack" key={key}>{feature === 'P03' ? <Ledger ctx={ctx}/> : Object.hasOwn(featureInfo,feature) ?
    <SourcePage ctx={ctx} feature={feature as Source}/> : <Blank title="Không tìm thấy chức năng"/>}</div>
}

