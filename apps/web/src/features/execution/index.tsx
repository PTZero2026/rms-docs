import { ChoiceOption, ChoiceSelect } from "@rms/ui/components/choice-select"
import { Checkbox } from "@rms/ui/components/checkbox"
import { useState } from 'react'
import type { FeatureProps } from '../../demo/types'
import { AcceptancePage } from './acceptance-page'
import { BudgetPage, FeePolicy } from './budget-page'
import { ProductPage } from './product-page'
import { ProfilePage } from './profile-page'
import { ProgressPage } from './progress-page'
import { eligible } from './acceptance'
import { balance } from './budget'
import { Grid, Heading, Metrics, NoData, Panel, RecordLink, Search, Status } from './controls'
import { fmtDate, officer, people, principal, related, scoped, states, vnd } from './model'
import type { Row } from './model'
import { isLate } from './progress'
import './execution.css'

const titles: Record<string, string> = {
  F04: 'Tiến độ đề tài',
  F05: 'Kinh phí và quyết toán',
  F06: 'Nghiệm thu đề tài',
}
const stages: Record<string, string[]> = {
  F04: [
    'APPROVED',
    'IN_PROGRESS',
    'SUSPENDED',
    'PENDING_ACCEPTANCE',
    'UNDER_ACCEPTANCE',
    'PASSED',
    'FAILED',
    'COMPLETED',
  ],
  F05: ['IN_PROGRESS', 'SUSPENDED', 'PENDING_ACCEPTANCE', 'UNDER_ACCEPTANCE', 'PASSED', 'FAILED', 'COMPLETED'],
  F06: ['IN_PROGRESS', 'PENDING_ACCEPTANCE', 'UNDER_ACCEPTANCE', 'PASSED', 'FAILED', 'COMPLETED'],
}
function canView(p: FeatureProps, r: Row) {
  const f = p.route.feature
  if (r.kind !== 'project' || !stages[f]?.includes(r.status)) return false
  if (f === 'F05') return principal(p, r) || officer(p, r)
  if (f === 'F06' && p.session.role === 'reviewer') return Boolean(eligible(p, r))
  return scoped(p, r)
}
function lastPeriod(p: FeatureProps, r: Row) {
  const reports = related(p, r, 'report')
  return reports
    .filter((x) => ['PENDING_SUBMISSION', 'REVISION_REQUESTED', 'SUBMITTED'].includes(x.status))
    .sort((a, b) => a.fields.dueDate.localeCompare(b.fields.dueDate))[0]
}
function ProjectList({ p, projects }: { p: FeatureProps; projects: Row[] }) {
  const [query, setQuery] = useState(''),
    [status, setStatus] = useState(''),
    [late, setLate] = useState(false)
  const f = p.route.feature,
    progress = f === 'F04',
    budget = f === 'F05',
    fresh = p.route.id === 'new'
  const reports = projects.flatMap((r) => related(p, r, 'report')),
    pendingReports = reports.filter((r) => ['PENDING_SUBMISSION', 'REVISION_REQUESTED'].includes(r.status))
  const list = projects.filter(
    (r) =>
      (!fresh ||
        (progress
          ? r.status === 'APPROVED'
          : budget
            ? r.status === 'IN_PROGRESS'
            : r.status === 'IN_PROGRESS' || r.status === 'PENDING_ACCEPTANCE')) &&
      (!status || r.status === status) &&
      (!late || related(p, r, 'report').some((x) => isLate(x) && pendingReports.includes(x))) &&
      (r.title + ' ' + r.fields.code + ' ' + r.unit)
        .toLocaleLowerCase('vi')
        .includes(query.trim().toLocaleLowerCase('vi')),
  )
  const count = (s: string) => String(projects.filter((r) => r.status === s).length)
  let values: [string, string][]
  if (progress)
    values = [
      ['Chờ giao đề tài', count('APPROVED')],
      ['Đang thực hiện', count('IN_PROGRESS')],
      ['Kỳ quá hạn chưa nộp', String(pendingReports.filter(isLate).length)],
    ]
  else if (budget)
    values = [
      [
        'Tổng kinh phí đã cấp',
        vnd(
          projects
            .flatMap((r) => related(p, r, 'allocation'))
            .reduce((s, r) => s + BigInt(r.fields.amount), 0n),
        ),
      ],
      ['Chờ quyết toán', count('PASSED')],
      ['Đã khóa sổ', count('COMPLETED')],
    ]
  else
    values = [
      ['Chờ nghiệm thu', count('PENDING_ACCEPTANCE')],
      ['Đang thu phiếu', count('UNDER_ACCEPTANCE')],
      ['Đạt nghiệm thu', count('PASSED')],
    ]
  return (
    <>
      <Heading title={titles[f]} />
      {budget && p.session.role === 'admin' && <FeePolicy p={p} />}
      <Metrics values={values} />
      <Panel
        title={
          fresh
            ? 'Chọn đề tài để thực hiện'
            : progress
              ? 'Theo dõi từng đề tài'
              : budget
                ? 'Sổ kinh phí đề tài'
                : 'Hồ sơ nghiệm thu'
        }
      >
        <div className="toolbar">
          <Search label="Tìm theo tên, mã đề tài hoặc đơn vị" value={query} set={setQuery} />
          <ChoiceSelect aria-label="Lọc trạng thái đề tài" value={status} onValueChange={setStatus}>
            <ChoiceOption value="">Mọi trạng thái</ChoiceOption>
            {stages[f].map((s) => (
              <ChoiceOption key={s} value={s}>
                {states[s]}
              </ChoiceOption>
            ))}
          </ChoiceSelect>
          {progress && (
            <label>
              <Checkbox checked={late} onCheckedChange={setLate} /> Kỳ quá hạn
              chưa nộp
            </label>
          )}
        </div>
        <Grid
          caption="Đề tài trong phạm vi"
          columns={[
            'Đề tài',
            'Chủ nhiệm',
            progress ? 'Mốc báo cáo' : budget ? 'Kinh phí còn lại' : 'Hội đồng',
            'Trạng thái',
          ]}
          rows={list.map((r) => {
            const period = progress && lastPeriod(p, r)
            const metric = progress
              ? period
                ? period.title + ' · ' + fmtDate(period.fields.dueDate)
                : '—'
              : budget
                ? related(p, r, 'allocation').length
                  ? vnd(balance(p, r))
                  : 'Chờ xác nhận cấp'
                : related(p, r, 'committee')[0]?.fields.decision || 'Chưa phân công'
            return {
              id: r.id,
              cells: [
                <div>
                  <RecordLink p={p} feature={f} id={r.id}>
                    {r.title}
                  </RecordLink>
                  <p className="exec-meta">
                    {r.fields.code} · {r.unit}
                  </p>
                </div>,
                people[r.owner] || r.owner,
                metric,
                <Status value={r.status} />,
              ],
            }
          })}
        />
      </Panel>
    </>
  )
}
function ProjectFeature(p: FeatureProps) {
  const projects = p.rows.filter((r) => canView(p, r)),
    { feature, id } = p.route
  if (!id || id === 'new') return <ProjectList p={p} projects={projects} />
  const project = projects.find(
    (r) =>
      r.id === id ||
      related(p, r, feature === 'F04' ? 'report' : feature === 'F05' ? 'expense' : 'round').some(
        (x) => x.id === id,
      ),
  )
  if (!project)
    return (
      <NoData
        title="Không thể mở đề tài"
        detail="Hồ sơ chưa vào giai đoạn này hoặc nằm ngoài phạm vi được phân."
      />
    )
  return (
    <>
      <RecordLink p={p} feature={feature}>
        ← {titles[feature]}
      </RecordLink>
      <Heading
        title={project.title}
        sub={[project.fields.code, project.unit, people[project.owner] || project.owner]
          .filter(Boolean)
          .join(' · ')}
        tools={<Status value={project.status} />}
      />
      {feature === 'F04' ? (
        <ProgressPage p={p} project={project} />
      ) : feature === 'F05' ? (
        <BudgetPage p={p} project={project} />
      ) : (
        <AcceptancePage p={p} project={project} />
      )}
    </>
  )
}
export default function Execution(p: FeatureProps) {
  return (
    <div
      className="exec-workspace"
      key={[p.route.feature, p.route.id, p.session.tenant, p.session.userId, p.session.role].join('-')}
    >
      {p.route.feature === 'F07' ? (
        <ProductPage {...p} />
      ) : p.route.feature === 'F08' ? (
        <ProfilePage {...p} />
      ) : stages[p.route.feature] ? (
        <ProjectFeature {...p} />
      ) : (
        <NoData title="Không tìm thấy nghiệp vụ" />
      )}
    </div>
  )
}
