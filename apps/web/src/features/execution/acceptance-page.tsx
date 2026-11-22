import { Action, Grid, Metrics, Panel, RecordLink, Status, choice, fileField } from './controls'
import type { FeatureProps } from '../../demo/types'
import {
  activeRound,
  ballots,
  committee,
  conclude,
  eligible,
  gate,
  openRound,
  redo,
  reopenRound,
  submitBallot,
  takeIntoAcceptance,
} from './acceptance'
import { fmtDate, ids, member, officer, people, principal, related, today } from './model'
import type { Row } from './model'

function allowsEdge(p: FeatureProps, r: Row, to: string) {
  const wf = p.rows.find((x) => x.kind === 'workflow' && x.fields.version === r.fields.workflowVersion)
  if (!wf) return true
  try {
    return JSON.parse(wf.fields.edges).some(
      (e: { from: string; to: string; roles: string[] }) =>
        e.from === r.status && e.to === to && e.roles.includes(p.session.role),
    )
  } catch {
    return false
  }
}
export function AcceptancePage({ p, project }: { p: FeatureProps; project: Row }) {
  const staff = officer(p, project),
    reviewer = p.session.role === 'reviewer',
    stage = project.status
  const team = related(p, project, 'committee')[0],
    round = activeRound(p, project)
  const votes = ballots(p, project)
  const ownBallot =
    round &&
    related(p, project, 'ballot').find((x) => x.fields.roundId === round.id && x.owner === p.session.userId)
  const gaps = gate(p, project)
  return (
    <>
      {!reviewer && (
        <Panel
          title="Điều kiện nghiệm thu"
          tools={
            stage === 'IN_PROGRESS' &&
            (principal(p, project) || staff) &&
            allowsEdge(p, project, 'PENDING_ACCEPTANCE') && (
              <Action
                p={p}
                subject={project}
                primary
                label="Đăng ký nghiệm thu"
                fields={[fileField('Hồ sơ tổng kết cuối kỳ', 'Ho-so-tong-ket.pdf')]}
                save={(d) => takeIntoAcceptance(p, project, d.evidence)}
              />
            )
          }
        >
          {gaps.length ? (
            <ul>
              {gaps.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          ) : (
            <p>Kỳ cuối đã đạt. Sản phẩm đã duyệt đáp ứng từng loại cam kết.</p>
          )}
          {project.fields.finalEvidence && <p className="muted">{project.fields.finalEvidence}</p>}
          <div className="page-actions">
            <RecordLink p={p} feature="F04" id={project.id}>
              Xem báo cáo tiến độ
            </RecordLink>
            <RecordLink p={p} feature="F07" id={project.id}>
              Sản phẩm của đề tài
            </RecordLink>
          </div>
        </Panel>
      )}
      {stage !== 'IN_PROGRESS' && (
        <Panel
          title="Hội đồng nghiệm thu"
          tools={
            staff &&
            stage === 'PENDING_ACCEPTANCE' && (
              <>
                <Action
                  p={p}
                  subject={project}
                  label={team ? 'Sửa phân công' : 'Lập hội đồng'}
                  fields={[
                    {
                      name: 'decision',
                      label: 'Quyết định thành lập',
                      value: team?.fields.decision,
                      required: true,
                    },
                    {
                      name: 'members',
                      label: 'Thành viên đánh giá',
                      type: 'multi',
                      options: p.rows
                        .filter(
                          (r) =>
                            r.kind === 'profile' &&
                            r.owner !== project.owner &&
                            !member(project, r.owner) &&
                            (p.rows.some(
                              (x) =>
                                x.kind === 'account' && x.owner === r.owner && x.fields.persona === 'reviewer',
                            ) ||
                              r.owner === 'minh'),
                        )
                        .map((r) => [r.owner, r.title]),
                      value: team?.fields.members || 'minh',
                    },
                  ]}
                  save={(d) => committee(p, project, d)}
                />
                {team && (
                  <Action
                    p={p}
                    subject={project}
                    primary
                    label="Mở đợt đánh giá"
                    fields={[
                      { name: 'date', label: 'Ngày họp hội đồng', type: 'date', value: today, required: true },
                    ]}
                    save={(d) => openRound(p, project, d)}
                  />
                )}
              </>
            )
          }
        >
          {team ? (
            <p>
              {team.fields.decision} ·{' '}
              {ids(team.fields.members)
                .map((id) => people[id] || id)
                .join(', ')}
            </p>
          ) : (
            <p className="muted">Chưa có quyết định thành lập hội đồng.</p>
          )}
          {round && (
            <p className="muted">
              Ngày họp {fmtDate(round.fields.date)} · Bộ tiêu chí {round.fields.criteria || 'NT-2026-v1'}
            </p>
          )}
        </Panel>
      )}
      {round && (
        <Panel
          title="Phiếu đánh giá nghiệm thu"
          tools={
            eligible(p, project) &&
            ownBallot?.status !== 'SUBMITTED' && (
              <Action
                p={p}
                subject={project}
                label="Chấm phiếu"
                primary
                fields={[
                  {
                    name: 'science',
                    label: 'Chất lượng khoa học (0–100, trọng số 60%)',
                    type: 'number',
                    step: '0.01',
                    min: 0,
                    max: 100,
                    value: ownBallot?.fields.science,
                  },
                  {
                    name: 'impact',
                    label: 'Hiệu quả ứng dụng (0–100, trọng số 40%)',
                    type: 'number',
                    step: '0.01',
                    min: 0,
                    max: 100,
                    value: ownBallot?.fields.impact,
                  },
                  {
                    name: 'comment',
                    label: 'Nhận xét hội đồng',
                    type: 'long',
                    value: ownBallot?.fields.comment,
                  },
                  choice('mode', 'Hình thức lưu', { SUBMITTED: 'Gửi và khóa phiếu', DRAFT: 'Lưu nháp' }),
                ]}
                save={(d) => submitBallot(p, project, d, d.mode === 'DRAFT')}
              />
            )
          }
        >
          <Metrics
            values={[
              ['Phiếu đã gửi', votes.length + ' / ' + round.fields.minimum],
              ['Ngưỡng đạt', round.fields.threshold + ' / 100'],
              ['Kết quả', round.fields.aggregate ? round.fields.aggregate + ' / 100' : 'Chưa kết luận'],
            ]}
          />
          {(staff || reviewer) && (
            <Grid
              caption="Phiếu đã gửi"
              columns={['Người chấm', 'Khoa học', 'Ứng dụng', 'Điểm quy đổi']}
              rows={votes
                .filter((r) => staff || r.owner === p.session.userId)
                .map((r) => ({
                  id: r.id,
                  cells: [people[r.owner] || r.owner, r.fields.science, r.fields.impact, r.fields.total],
                }))}
            />
          )}
          <div className="page-actions">
            <Status value={round.status} />
            {staff && stage === 'UNDER_ACCEPTANCE' && (
              <Action
                p={p}
                label="Chốt kết luận"
                primary
                subject={project}
                description="Hệ thống tính điểm trung bình từ các phiếu nghiệm thu đã gửi của đợt này."
                save={() => conclude(p, project)}
              />
            )}
            {staff && ['FAILED', 'PASSED'].includes(stage) && allowsEdge(p, project, 'UNDER_ACCEPTANCE') && (
              <Action
                p={p}
                label="Mở lại đợt"
                subject={project}
                fields={[{ name: 'reason', label: 'Lý do mở lại', required: true }]}
                save={(d) => reopenRound(p, project, d.reason)}
              />
            )}
          </div>
        </Panel>
      )}
      {staff && stage === 'FAILED' && (
        <Action
          p={p}
          label="Cho làm lại"
          subject={project}
          fields={[
            { name: 'reason', label: 'Nội dung cần làm lại', type: 'long', required: true },
            { name: 'deadline', label: 'Hạn nộp lại', type: 'date', required: true },
          ]}
          save={(d) => redo(p, project, d)}
        />
      )}
      {['PASSED', 'COMPLETED'].includes(stage) && !reviewer && (
        <RecordLink p={p} feature="F05" id={project.id}>
          Mở sổ kinh phí và quyết toán
        </RecordLink>
      )}
    </>
  )
}
