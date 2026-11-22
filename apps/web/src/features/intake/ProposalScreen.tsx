import { useState } from 'react'
import { attachments } from './ProposalFiles'
import { assignments } from './ProposalTeam'
import { Button } from '@rms/ui/components/button'
import type { DemoRow, FeatureProps } from '../../demo/types'
import { EvidencePanel } from './EvidencePanel'
import { ProposalEditor } from './ProposalEditor'
import { referenceName } from './calls'
import {
  author,
  canReadProject,
  canTransition,
  config,
  dateLabel,
  find,
  ids,
  label,
  managed,
  names,
  receiving,
  timeLabel,
} from './model'
import { processProposal } from './proposals'
import { roundFor, summarize } from './reviews'
import {
  ActionDialog,
  Area,
  Blank,
  Choice,
  Facts,
  FieldText,
  Grid,
  Heading,
  LinkRecord,
  Panel,
  State,
} from './ui'

export function ProposalFacts({ app, p }: { app: FeatureProps; p: DemoRow }) {
  const f = p.fields
  const team = assignments(f.assignments)
  return (
    <Panel title="Hồ sơ đề xuất">
      <Facts
        items={[
          ['Chủ nhiệm', names[p.owner] || p.owner],
          ['Đơn vị chủ trì', p.unit],
          ['Kỳ nhận', find(app.rows, 'call', f.callId)?.title],
          ['Lĩnh vực', f.discipline && referenceName(app.rows, f.discipline)],
          ['Thời gian', f.durationMonths && f.durationMonths + ' tháng'],
          [
            'Kinh phí đề xuất',
            f.requestedBudget && Number(f.requestedBudget).toLocaleString('vi-VN') + ' VND',
          ],
          [
            'Thành viên',
            ids(f.memberIds)
              .map((id) =>
                [
                  names[id] || id,
                  team[id]?.role === 'SECRETARY' ? 'Thư ký' : '',
                  team[id]?.responsibility,
                ]
                  .filter(Boolean)
                  .join(' · '),
              )
              .join(', ') || 'Chỉ có chủ nhiệm',
          ],
          [
            'Tài liệu đính kèm',
            attachments(f.attachments, f.attachment)
              .map((file) => [file.title, file.format].filter(Boolean).join(' · '))
              .join(', ') || 'Chưa có',
          ],
        ]}
      />
      {[
        ['Mục tiêu nghiên cứu', f.objective],
        ['Phương pháp nghiên cứu', f.method],
        ['Sản phẩm dự kiến', f.outcome],
      ].map(([title, body]) => (
        <div key={title} className="intake-reading">
          <h3>{title}</h3>
          <p>{body || 'Chưa nhập'}</p>
        </div>
      ))}
    </Panel>
  )
}
function ProposalList({ app, projects }: { app: FeatureProps; projects: DemoRow[] }) {
  const [term, setTerm] = useState('')
  const [status, setStatus] = useState('')
  const [callId, setCall] = useState('')
  const [selected, select] = useState<string[]>([])
  const filtered = projects.filter(
    (r) =>
      (!status || r.status === status) &&
      (!callId || r.fields.callId === callId) &&
      (r.title + ' ' + r.fields.code + ' ' + names[r.owner])
        .toLocaleLowerCase('vi')
        .includes(term.toLocaleLowerCase('vi')),
  )
  const officer = app.session.role === 'officer'
  const checked = filtered.filter(
    (p) =>
      selected.includes(p.id) &&
      p.status === 'SUBMITTED' &&
      p.fields.finalized !== 'true' &&
      p.fields.checked === 'true',
  )
  return (
    <>
      <Heading
        title="Đề xuất đề tài"
        detail={
          officer
            ? 'Tiếp nhận, kiểm tra và chốt hồ sơ đưa ra hội đồng.'
            : 'Theo dõi hồ sơ từ bản nháp đến quyết định xét duyệt.'
        }
      >
        {app.session.role === 'researcher' && (
          <Button onClick={() => app.go('F01', 'new')}>Lập đề xuất</Button>
        )}
      </Heading>
      <Panel title={officer ? 'Hồ sơ tiếp nhận' : 'Danh sách đề xuất'}>
        <div className="toolbar">
          <FieldText
            label="Tìm đề tài"
            type="search"
            placeholder="Tên, mã hoặc chủ nhiệm"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
          <Choice label="Kỳ nhận đề xuất" value={callId} onChange={(e) => setCall(e.target.value)}>
            <option value="">Tất cả kỳ</option>
            {app.rows
              .filter((c) => c.kind === 'call' && projects.some((p) => p.fields.callId === c.id))
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
          </Choice>
          <Choice label="Trạng thái" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            {[...new Set(projects.map((p) => p.status))].map((s) => (
              <option key={s} value={s}>
                {label(s)}
              </option>
            ))}
          </Choice>
        </div>
        <Grid
          heads={[...(officer ? ['Chọn'] : []), 'Đề tài', 'Mã theo dõi', 'Trạng thái', 'Hạn nhận']}
          lines={filtered.map((p) => ({
            id: p.id,
            cells: [
              ...(officer
                ? [
                    p.status === 'SUBMITTED' &&
                    p.fields.checked === 'true' &&
                    p.fields.finalized !== 'true' ? (
                      <input
                        aria-label={'Chọn ' + p.title}
                        type="checkbox"
                        checked={selected.includes(p.id)}
                        onChange={(e) =>
                          select(
                            e.target.checked
                              ? [...selected, p.id]
                              : selected.filter((id) => id !== p.id),
                          )
                        }
                      />
                    ) : null,
                  ]
                : []),
              <LinkRecord feature="F01" id={p.id}>
                {p.title || 'Đề xuất chưa đặt tên'}
              </LinkRecord>,
              p.fields.code || 'Chưa cấp mã',
              <State value={p.status} />,
              dateLabel(find(app.rows, 'call', p.fields.callId)?.fields.due),
            ],
          }))}
        />
        {officer && checked.length > 0 && (
          <ActionDialog
            trigger={'Chốt danh sách (' + checked.length + ')'}
            detail="Các hồ sơ được chọn sẽ sẵn sàng bàn giao sang xét duyệt."
            onConfirm={() => {
              if (new Set(checked.map((p) => p.fields.callId)).size !== 1)
                throw new Error('Chọn các hồ sơ thuộc cùng một kỳ.')
              app.commit(
                'Chốt danh sách xét duyệt',
                checked.map((p) => processProposal(app, p.id, 'finalize')),
              )
              select([])
            }}
          />
        )}
      </Panel>
    </>
  )
}
export function ProposalScreen(app: FeatureProps) {
  const [edit, setEdit] = useState(false)
  const [reason, setReason] = useState('')
  const { route, go } = app
  const projects = app.rows.filter((r) => canReadProject(app, r))
  const project = projects.find((p) => p.id === route.id)
  const done = (id?: string) => {
    setEdit(false)
    go('F01', id)
  }
  if (!route.id) return <ProposalList app={app} projects={projects} />
  if (route.id === 'new' || route.id.startsWith('new~')) {
    const callId = route.id.split('~')[1]
    if (app.session.role !== 'researcher' || (callId && !receiving(find(app.rows, 'call', callId))))
      return <Blank />
    return <ProposalEditor app={app} callId={callId} done={done} />
  }
  if (!project) return <Blank />
  const own = author(app, project),
    officer = managed(app, project)
  if (edit && own && project.status === 'DRAFT')
    return <ProposalEditor app={app} project={project} done={done} />
  const call = find(app.rows, 'call', project.fields.callId)
  const r = roundFor(app.rows, project.id)
  const process = (action: 'return' | 'cancel' | 'finalize' | 'check', title: string) => {
    const next = processProposal(app, project.id, action, reason)
    app.commit(title, [next])
    setReason('')
  }
  return (
    <>
      <LinkRecord feature="F01">Danh sách đề xuất</LinkRecord>
      <Heading
        title={project.title || 'Đề xuất chưa đặt tên'}
        detail={project.fields.code || 'Chưa cấp mã theo dõi'}
      >
        <State value={project.status} />
      </Heading>
      {project.fields.reason && (
        <p className="intake-result">
          {project.status === 'CANCELLED' ? 'Lý do hủy' : 'Lý do trả bổ sung'} ·{' '}
          {project.fields.reason}
        </p>
      )}
      <div className="intake-actions">
        {own && project.status === 'DRAFT' && (
          <Button onClick={() => setEdit(true)}>Chỉnh sửa đề xuất</Button>
        )}
        {officer && project.status === 'SUBMITTED' && (
          <>
            {project.fields.checked !== 'true' && (
              <ActionDialog
                trigger="Đánh dấu đã kiểm tra"
                detail="Xác nhận đã đối chiếu lĩnh vực, thuyết minh và tài liệu đính kèm."
                onConfirm={() => process('check', 'Đánh dấu đã kiểm tra')}
              />
            )}
            {project.fields.checked === 'true' && project.fields.finalized !== 'true' && (
              <ActionDialog
                trigger="Chốt sang xét duyệt"
                detail="Bàn giao hồ sơ đã kiểm tra cho chuyên viên tổ chức hội đồng."
                onConfirm={() => process('finalize', 'Chốt sang xét duyệt')}
              />
            )}
            {project.fields.finalized === 'true' && (
              <LinkRecord feature="F03" id={project.id}>
                Mở đợt xét duyệt
              </LinkRecord>
            )}
            <ActionDialog
              trigger="Trả lại bổ sung"
              disabled={!receiving(call)}
              detail="Chủ nhiệm sẽ nhận được lý do và có thể sửa, nộp lại trong thời hạn."
              onConfirm={() => process('return', 'Trả lại bổ sung')}
            >
              <Area
                label="Lý do trả lại"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </ActionDialog>
          </>
        )}
        {(officer || own) &&
          canTransition(app, project, 'CANCELLED') &&
          ['DRAFT', 'SUBMITTED'].includes(project.status) && (
            <ActionDialog
              trigger="Hủy đề xuất"
              detail="Hồ sơ đã hủy vẫn được lưu để đối chiếu."
              onConfirm={() => process('cancel', 'Hủy đề xuất')}
            >
              <Area
                label="Lý do hủy đề xuất"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </ActionDialog>
          )}
        {project.status === 'APPROVED' && (
          <LinkRecord feature="F04" id={project.id}>
            Theo dõi thực hiện
          </LinkRecord>
        )}
      </div>
      {r && (
        <Panel title="Tiến trình xét duyệt">
          <Facts
            items={[
              ['Bắt đầu xét duyệt', timeLabel(r.fields.openedAt)],
              [
                'Kết luận khoa học',
                r.fields.conclusion ? label(r.fields.conclusion) : 'Đang thu phiếu',
              ],
              ['Thẩm định đạo đức', label(r.fields.ethics)],
              ['Nội dung thẩm định', r.fields.ethicsNote],
            ]}
          />
          {own && r.status === 'CONCLUDED' && ['APPROVED', 'REJECTED'].includes(project.status) && (
            <>
              {(config(app.rows, 'PROPOSAL_REVIEW.PUBLIC_SCORE') ?? r.fields.publicScore) ===
                'true' && <p>Điểm tổng hợp · {r.fields.aggregate}</p>}
              {(config(app.rows, 'PROPOSAL_REVIEW.PUBLIC_COMMENTS') ?? r.fields.publicComments) ===
              'true' ? (
                summarize(app.rows, project, r)
                  .sheets.filter((s) => s.fields.comment)
                  .map((s) => <blockquote key={s.id}>{s.fields.comment}</blockquote>)
              ) : (
                <p className="muted">Hội đồng không công khai nhận xét của đợt này.</p>
              )}
            </>
          )}
          {officer && (
            <LinkRecord feature="F03" id={project.id}>
              Xem đợt xét duyệt
            </LinkRecord>
          )}
        </Panel>
      )}
      <ProposalFacts app={app} p={project} />
      {own && project.status === 'DRAFT' && app.aiEnabled && (
        <EvidencePanel app={app} project={project} />
      )}
      <Panel title="Lịch sử hồ sơ">
        {project.fields.submittedAt && (
          <p>Nộp gần nhất · {timeLabel(project.fields.submittedAt)}</p>
        )}
        <Grid
          heads={['Thời điểm', 'Thao tác', 'Người thực hiện']}
          lines={app.audit
            .filter((a) => a.recordId === project.id)
            .slice()
            .reverse()
            .map((a) => ({ id: a.id, cells: [timeLabel(a.at), a.action, a.actor] }))}
          empty="Chưa có thao tác ghi nhật ký trong phiên mô phỏng."
        />
      </Panel>
    </>
  )
}
