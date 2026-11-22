import { useState } from 'react'
import { Button } from '@rms/ui/components/button'
import type { DemoRow, FeatureProps } from '../../demo/types'
import { label, scopeUnit, timeLabel } from './model'
import {
  exportReport,
  grouped,
  makeReport,
  readReport,
  reportAccess,
  reportUnits,
  reportVisible,
} from './reports'
import {
  Blank,
  Choice,
  Facts,
  Grid,
  Heading,
  LinkRecord,
  Panel,
  State,
  useAction,
  Problem,
} from './ui'

function Snapshot({ app, report }: { app: FeatureProps; report: DemoRow }) {
  const [state, setState] = useState<string>(() =>
    history.state?.intakeReportId === report.id ? history.state.intakeStatus || '' : '',
  )
  function setFilter(status: string) {
    setState(status)
    history.replaceState({ ...history.state, intakeReportId: report.id, intakeStatus: status }, '')
  }
  const { error, run } = useAction()
  const lines = readReport(app, report.id)
  const groups = grouped(lines)
  const filtered = lines.filter((l) => !state || l.status === state)
  function download() {
    const csv = exportReport(app, report.id)
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download =
      'doi-chieu-' +
      report.fields.callCode.replace(/[^A-Za-z0-9_-]/g, '-') +
      '-' +
      report.id.slice(-8) +
      '.csv'
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return (
    <>
      <LinkRecord feature="B02">Các báo cáo kỳ</LinkRecord>
      <Heading title={report.title} detail="Bản chụp báo cáo kỳ nhận đề xuất">
        <Button onClick={() => run(download)}>Xuất đối chứng CSV</Button>
      </Heading>
      <Panel title="Số liệu tại thời điểm trích xuất">
        <Facts
          items={[
            ['Tổng số đề tài', <span className="intake-count">{lines.length}</span>],
            ['Phạm vi', report.unit],
            ['Mã kỳ', report.fields.callCode],
            ['Trích xuất (giờ Việt Nam)', timeLabel(report.fields.extractedAt)],
          ]}
        />
        <div className="intake-actions">
          <Button
            variant={state ? 'outline' : 'default'}
            aria-pressed={!state}
            onClick={() => setFilter('')}
          >
            Tất cả ({lines.length})
          </Button>
          {[...groups].map(([key, count]) => (
            <Button
              variant={state === key ? 'default' : 'outline'}
              key={key}
              aria-pressed={state === key}
              onClick={() => setFilter(key)}
            >
              {label(key)} ({count})
            </Button>
          ))}
        </div>
      </Panel>
      <Panel title={'Danh sách đối chứng (' + filtered.length + ')'}>
        <Grid
          heads={['Mã đề tài', 'Tên tại thời điểm trích xuất', 'Đơn vị', 'Trạng thái']}
          lines={filtered.map((l) => ({
            id: l.id,
            cells: [
              <LinkRecord feature="F01" id={l.id}>
                {l.code}
              </LinkRecord>,
              l.title,
              l.unit,
              <State value={l.status} />,
            ],
          }))}
          empty="Không có đề tài đã cấp mã trong phạm vi trích xuất."
        />
      </Panel>
      <Problem text={error} />
    </>
  )
}
export function ReportScreen(app: FeatureProps) {
  const scope = scopeUnit(app)
  const calls = app.rows.filter(
    (c) =>
      c.kind === 'call' &&
      (!scope ||
        c.unit === scope ||
        app.rows.some((p) => p.kind === 'project' && p.fields.callId === c.id && p.unit === scope)),
  )
  const [callId, setCall] = useState(calls[0]?.id || '')
  const [unit, setUnit] = useState(scope || '*')
  const { error, run } = useAction()
  if (!reportAccess(app)) return <Blank />
  const reports = app.rows
    .filter((r) => reportVisible(app, r))
    .sort((a, b) => b.fields.extractedAt.localeCompare(a.fields.extractedAt))
  if (app.route.id && app.route.id !== 'new') {
    const report = reports.find((r) => r.id === app.route.id)
    return report ? (
      <Snapshot app={app} report={report} />
    ) : (
      <Blank>
        Chưa có bản chụp trong phạm vi hiện tại. Hãy tạo lại báo cáo theo quyền được giao.
      </Blank>
    )
  }
  return (
    <>
      <Heading
        title="Báo cáo kỳ nhận đề xuất"
        detail="Đối chiếu các đề tài đã cấp mã theo kỳ và đơn vị."
      />
      <form
        className="panel stack"
        onSubmit={(e) => {
          e.preventDefault()
          run(() => {
            const r = makeReport(app, callId, unit)
            app.commit('Tạo bản chụp báo cáo kỳ', [r])
            app.go('B02', r.id)
          })
        }}
      >
        <h2 className="section-heading">Tạo bản chụp</h2>
        <div className="form-grid">
          <Choice label="Kỳ báo cáo" value={callId} onChange={(e) => setCall(e.target.value)}>
            {calls.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.fields.code})
              </option>
            ))}
          </Choice>
          <Choice label="Phạm vi đơn vị" value={unit} onChange={(e) => setUnit(e.target.value)}>
            {!scope && <option value="*">Tất cả đơn vị được giao</option>}
            {reportUnits(app).map((u) => (
              <option key={u}>{u}</option>
            ))}
          </Choice>
        </div>
        <div>
          <Button type="submit" disabled={!calls.length}>
            Tạo báo cáo
          </Button>
        </div>
        <Problem text={error} />
      </form>
      <Panel title="Bản chụp đã tạo">
        <Grid
          heads={['Kỳ báo cáo', 'Thời điểm trích xuất', 'Phạm vi', 'Số đề tài']}
          lines={reports.map((r) => ({
            id: r.id,
            cells: [
              <LinkRecord feature="B02" id={r.id}>
                {r.title}
              </LinkRecord>,
              timeLabel(r.fields.extractedAt),
              r.unit,
              readReport(app, r.id).length,
            ],
          }))}
          empty="Chưa có bản chụp báo cáo trong phạm vi hiện tại."
        />
      </Panel>
    </>
  )
}
