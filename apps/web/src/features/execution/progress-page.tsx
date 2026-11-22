import { Action, fileField, Grid, Panel, RecordLink, Status } from './controls'
import type { FeatureProps } from '../../demo/types'
import {
  assign,
  isLate,
  pauseResume,
  reminderDays,
  reminders,
  reviewReport,
  schedule,
  submitReport,
} from './progress'
import { fmtDate, officer, principal, related, today, typeNames, vnd } from './model'
import type { Row } from './model'

function PeriodAction({ p, project, r }: { p: FeatureProps; project: Row; r?: Row }) {
  const next = 1 + Math.max(0, ...related(p, project, 'report').map((x) => Number(x.fields.period)))
  return (
    <Action
      p={p}
      label={r ? 'Đổi lịch' : 'Lập kỳ báo cáo'}
      primary={!r}
      subject={project}
      fields={[
        {
          name: 'period',
          label: 'Kỳ số',
          type: 'number',
          min: 1,
          value: r?.fields.period || String(next),
          required: true,
        },
        { name: 'topic', label: 'Nội dung theo dõi', value: r?.fields.topic },
        { name: 'dueDate', label: 'Hạn nộp', type: 'date', value: r?.fields.dueDate, required: true },
      ]}
      save={(d) => schedule(p, project, d, r)}
    />
  )
}
function ReportTools({ p, project, r }: { p: FeatureProps; project: Row; r: Row }) {
  if (project.status !== 'IN_PROGRESS') return null
  const staff = officer(p, project)
  const pending = ['PENDING_SUBMISSION', 'REVISION_REQUESTED'].includes(r.status)
  return (
    <div className="exec-row-tools">
      {principal(p, project) && pending && (
        <Action
          p={p}
          subject={r}
          label={r.status === 'REVISION_REQUESTED' ? 'Nộp lại' : 'Nộp báo cáo'}
          primary
          fields={[
            {
              name: 'content',
              label: 'Kết quả thực hiện trong kỳ',
              type: 'long',
              value: r.fields.content,
              required: true,
            },
            fileField('Tệp báo cáo', 'Bao-cao-ky-' + r.fields.period + '.pdf', r.fields.evidence),
          ]}
          save={(d) => submitReport(p, project, r, d)}
        />
      )}
      {staff && r.status === 'PENDING_SUBMISSION' && <PeriodAction p={p} project={project} r={r} />}
      {staff && r.status === 'SUBMITTED' && (
        <Action
          p={p}
          subject={r}
          label="Duyệt đạt"
          primary
          save={() => reviewReport(p, project, r, 'PASSED', '')}
        />
      )}
      {staff && ['PASSED', 'SUBMITTED'].includes(r.status) && (
        <Action
          p={p}
          subject={r}
          label={r.status === 'PASSED' ? 'Mở lại báo cáo' : 'Yêu cầu chỉnh sửa'}
          fields={[{ name: 'comment', label: 'Nhận xét và yêu cầu bổ sung', type: 'long', required: true }]}
          save={(d) => reviewReport(p, project, r, 'REVISION_REQUESTED', d.comment)}
        />
      )}
    </div>
  )
}
export function ProgressPage({ p, project }: { p: FeatureProps; project: Row }) {
  const staff = officer(p, project)
  const assignment = related(p, project, 'assignment')[0]
  const reports = related(p, project, 'report').sort(
    (a, b) => Number(a.fields.period) - Number(b.fields.period),
  )
  const running = project.status === 'IN_PROGRESS'
  return (
    <>
      <Panel
        title="Quyết định giao thực hiện"
        tools={
          staff &&
          project.status === 'APPROVED' && (
            <Action
              p={p}
              subject={project}
              label="Giao đề tài"
              confirm="Xác nhận giao đề tài"
              primary
              fields={[
                { name: 'decision', label: 'Số quyết định hoặc hợp đồng', required: true },
                { name: 'signed', label: 'Ngày ký', type: 'date', value: today, required: true },
                { name: 'effective', label: 'Ngày hiệu lực', type: 'date', value: today, required: true },
                { name: 'start', label: 'Bắt đầu thực hiện', type: 'date', value: today, required: true },
                { name: 'end', label: 'Kết thúc thực hiện', type: 'date', required: true },
                {
                  name: 'amount',
                  label: 'Kinh phí được duyệt (VND)',
                  type: 'number',
                  min: 1,
                  value: project.fields.requestedBudget,
                  required: true,
                },
                ...(!project.fields.commitments
                  ? Object.entries(typeNames).map(([k, label]) => ({
                      name: 'count' + k,
                      label: 'Số ' + label.toLocaleLowerCase('vi') + ' cam kết',
                      type: 'number' as const,
                      min: 0,
                      max: 999,
                      value: '0',
                    }))
                  : []),
                fileField('Văn bản căn cứ', 'QD-giao-de-tai.pdf'),
                { name: 'note', label: 'Lý do điều chỉnh so với đề xuất', type: 'long' },
              ]}
              save={(d) => assign(p, project, d)}
            />
          )
        }
      >
        {assignment ? (
          <dl className="exec-facts">
            <div>
              <dt>Số văn bản</dt>
              <dd>{assignment.fields.decision}</dd>
            </div>
            <div>
              <dt>Thời gian thực hiện</dt>
              <dd>
                {fmtDate(assignment.fields.start)} – {fmtDate(assignment.fields.end)}
              </dd>
            </div>
            <div>
              <dt>Kinh phí được duyệt</dt>
              <dd>{vnd(assignment.fields.amount)}</dd>
            </div>
            <div>
              <dt>Văn bản căn cứ</dt>
              <dd>{assignment.fields.evidence}</dd>
            </div>
          </dl>
        ) : (
          <p className="muted">
            Chờ quyết định giao của chuyên viên. Sản phẩm dự kiến trong đề xuất:{' '}
            {project.fields.outcome || 'Chưa ghi nhận'}.
          </p>
        )}
      </Panel>
      <Panel
        title="Lịch báo cáo tiến độ"
        tools={
          staff &&
          running && (
            <>
              <PeriodAction p={p} project={project} />
              <Action
                p={p}
                subject={project}
                label="Phát nhắc hạn"
                description={
                  'Nhắc chủ nhiệm các kỳ đến hạn sau ' +
                  reminderDays(p) +
                  ' ngày. Mỗi mốc chỉ phát một thông báo.'
                }
                save={() => reminders(p, project)}
              />
            </>
          )
        }
      >
        <Grid
          caption="Kỳ báo cáo"
          columns={['Kỳ báo cáo', 'Hạn nộp', 'Tình trạng', 'Xử lý']}
          rows={reports.map((r) => ({
            id: r.id,
            cells: [
              <div>
                <strong>{r.title}</strong>
                {r.fields.content && <p>{r.fields.content}</p>}
                {r.fields.evidence && <small>{r.fields.evidence}</small>}
                {r.fields.officerComment && <p>Nhận xét: {r.fields.officerComment}</p>}
              </div>,
              <div>
                {fmtDate(r.fields.dueDate)}
                {isLate(r) && <p className="exec-alert">Trễ hạn</p>}
              </div>,
              <div>
                <Status value={r.status} />
                {r.fields.submittedAt && <small className="block">Nộp {fmtDate(r.fields.submittedAt)}</small>}
              </div>,
              <ReportTools p={p} project={project} r={r} />,
            ],
          }))}
        />
      </Panel>
      <div className="page-actions">
        {staff && ['IN_PROGRESS', 'SUSPENDED'].includes(project.status) && (
          <Action
            p={p}
            subject={project}
            label={running ? 'Tạm dừng đề tài' : 'Tiếp tục thực hiện'}
            fields={[{ name: 'reason', label: 'Lý do', type: 'long', required: true }]}
            save={(d) => pauseResume(p, project, d.reason)}
          />
        )}
        {project.status !== 'APPROVED' && (
          <RecordLink p={p} feature="F06" id={project.id}>
            Hồ sơ nghiệm thu
          </RecordLink>
        )}
      </div>
      {project.fields.reason && <p className="muted">Lý do điều chỉnh tiến độ: {project.fields.reason}</p>}
    </>
  )
}
