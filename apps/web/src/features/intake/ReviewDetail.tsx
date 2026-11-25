import { ChoiceOption } from "@rms/ui/components/choice-select"
import { Checkbox } from "@rms/ui/components/checkbox"
import { useState } from 'react'
import { Button } from '@rms/ui/components/button'
import type { DemoRow, FeatureProps } from '../../demo/types'
import { config, label, managed, names, timeLabel } from './model'
import { conclude, criteria, openRound, recordEthics, reopen, score, summarize } from './reviews'
import { ProposalFacts } from './ProposalScreen'
import {
  ActionDialog,
  Area,
  Choice,
  Facts,
  FieldText,
  Grid,
  Heading,
  LinkRecord,
  Panel,
  Problem,
  State,
  useAction,
} from './ui'

function ScoreForm({ app, p, round }: { app: FeatureProps; p: DemoRow; round: DemoRow }) {
  const sheet = app.rows.find(
    (s) => s.kind === 'score' && s.owner === app.session.userId && s.fields.roundId === round.id,
  )
  const [points, setPoints] = useState<string[]>(() =>
    sheet ? JSON.parse(sheet.fields.points) : criteria.map(() => ''),
  )
  const [comment, setComment] = useState(sheet?.fields.comment || '')
  const { error, run } = useAction()
  const locked = sheet?.status === 'SUBMITTED'
  const send = (action: 'draft' | 'submit') => {
    const s = score(app, p.id, points, comment, action)
    app.commit(action === 'submit' ? 'Gửi phiếu chấm cá nhân' : 'Lưu phiếu chấm nháp', [s])
  }
  return (
    <Panel title="Phiếu chấm của tôi">
      <p className="muted">
        {locked
          ? 'Phiếu đã gửi và đã khóa.'
          : sheet
            ? 'Đã lưu nháp. Hoàn thiện các tiêu chí trước khi gửi.'
            : 'Chấm từng tiêu chí trên thang 10 điểm.'}
      </p>
      {criteria.map((c, i) => (
        <div className="intake-score" key={c.title}>
          <FieldText
            label={c.title + ' (' + Math.round(c.weight * 100) + '%)'}
            type="number"
            step="0.01"
            min="0"
            max="10"
            readOnly={locked}
            value={points[i]}
            onChange={(e) => setPoints(points.map((v, j) => (j === i ? e.target.value : v)))}
          />
        </div>
      ))}
      <Area
        label="Nhận xét chung"
        readOnly={locked}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      {locked ? (
        <p className="intake-result">Tổng điểm có trọng số · {sheet.fields.total}/10</p>
      ) : (
        <div className="intake-actions">
          <Button variant="outline" onClick={() => run(() => send('draft'))}>
            Lưu phiếu nháp
          </Button>
          <ActionDialog
            primary
            trigger="Gửi phiếu chấm"
            detail="Phiếu đã gửi được tính vào kết quả và khóa chỉnh sửa."
            onConfirm={() => send('submit')}
          />
        </div>
      )}
      <Problem text={error} />
    </Panel>
  )
}
function RoundManagement({ app, p, r }: { app: FeatureProps; p: DemoRow; r: DemoRow }) {
  const stats = summarize(app.rows, p, r)
  const [ethics, setEthics] = useState<'SUPPLEMENT' | 'APPROVED' | 'REJECTED'>('SUPPLEMENT')
  const [note, setNote] = useState('')
  const [reason, setReason] = useState('')
  const write = (action: string, updates: DemoRow[]) => {
    if (updates.length)
      app.commit(action, updates, updates.find((row) => row.id === p.id) || updates[0])
  }
  return (
    <>
      <Panel title="Tiến độ thu phiếu">
        <Facts
          items={[
            ['Hội đồng', r.title],
            ['Mở xét duyệt', timeLabel(r.fields.openedAt)],
            ['Phiếu đã gửi', stats.count + ' / ' + stats.eligible + ' thành viên hợp lệ'],
            ['Phiếu tối thiểu', stats.minimum],
            ['Điểm trung bình', stats.count ? stats.mean.toFixed(2) + ' / 10' : 'Chưa có phiếu'],
            ['Ngưỡng đạt', stats.passing + ' / 10'],
          ]}
        />
        <Grid
          heads={['Người chấm', 'Điểm có trọng số', 'Nhận xét đã gửi']}
          lines={stats.sheets.map((s, i) => ({
            id: s.id,
            cells: [
              config(app.rows, 'PROPOSAL_REVIEW.SHOW_REVIEWER_NAMES') === 'true'
                ? names[s.owner] || s.owner
                : 'Thành viên ' + (i + 1),
              s.fields.total,
              s.fields.comment || '—',
            ],
          }))}
        />
        {r.status === 'COLLECTING_SCORES' && (
          <div className="intake-actions">
            <ActionDialog
              primary
              trigger="Chốt kết luận khoa học"
              disabled={stats.missing > 0 || !stats.policyValid}
              detail={
                'Điểm trung bình ' +
                stats.mean.toFixed(2) +
                ' / 10. Kết luận theo ngưỡng ' +
                stats.passing +
                ' điểm.'
              }
              onConfirm={() => write('Chốt kết luận khoa học', conclude(app, p.id))}
            />
            {!stats.policyValid && <span>Kiểm tra ngưỡng và số phiếu tối thiểu tại B01.</span>}
            {stats.missing > 0 && (
              <span className="muted">Còn thiếu {stats.missing} phiếu hợp lệ.</span>
            )}
          </div>
        )}
        {r.status === 'CONCLUDED' && (
          <>
            <p className="intake-result">
              Kết luận khoa học · {label(r.fields.conclusion)} · {timeLabel(r.fields.concludedAt)}
            </p>
            {['APPROVED', 'REJECTED', 'UNDER_REVIEW'].includes(p.status) && (
              <ActionDialog
                trigger="Mở lại đợt"
                detail="Ghi lý do để lưu vết quyết định mở lại đợt xét duyệt."
                onConfirm={() =>
                  write('Mở lại đợt xét duyệt · ' + reason, reopen(app, p.id, reason))
                }
              >
                <Area
                  label="Lý do mở lại"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </ActionDialog>
            )}
          </>
        )}
      </Panel>
      <Panel title="Thẩm định đạo đức">
        <Facts
          items={[
            ['Tình trạng', label(r.fields.ethics)],
            ['Căn cứ hoặc yêu cầu bổ sung', r.fields.ethicsNote],
            ['Quyết định đề tài', label(p.status)],
          ]}
        />
        {p.status === 'UNDER_REVIEW' && ['PENDING', 'SUPPLEMENT'].includes(r.fields.ethics) && (
          <ActionDialog
            trigger="Ghi kết quả đạo đức"
            detail="Ghi lại kết quả từ hội đồng đạo đức và căn cứ tương ứng."
            onConfirm={() => write('Ghi kết quả đạo đức', recordEthics(app, p.id, ethics, note))}
          >
            <Choice
              label="Kết quả thẩm định"
              value={ethics}
              onValueChange={choiceValue => setEthics(choiceValue as typeof ethics)}
            >
              <ChoiceOption value="SUPPLEMENT">Yêu cầu bổ sung</ChoiceOption>
              <ChoiceOption value="APPROVED">Thông qua</ChoiceOption>
              <ChoiceOption value="REJECTED">Từ chối cuối cùng</ChoiceOption>
            </Choice>
            <Area
              label="Nội dung biên bản hoặc yêu cầu bổ sung"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </ActionDialog>
        )}
      </Panel>
    </>
  )
}
export function ReviewDetail({
  app,
  p,
  round,
}: {
  app: FeatureProps
  p: DemoRow
  round?: DemoRow
}) {
  const councils = app.rows.filter((r) => r.kind === 'council' && managed(app, r))
  const [council, setCouncil] = useState(councils[0]?.id || '')
  const [ethics, setEthics] = useState(false)
  return (
    <>
      <LinkRecord feature="F03">Danh sách xét duyệt</LinkRecord>
      <Heading title={p.title} detail={p.fields.code}>
        <State value={p.status} />
      </Heading>
      {app.session.role === 'reviewer' && round ? (
        <div className="grid-two">
          <ProposalFacts app={app} p={p} />
          <ScoreForm app={app} p={p} round={round} />
        </div>
      ) : (
        <>
          {round ? (
            <RoundManagement app={app} p={p} r={round} />
          ) : (
            <Panel title="Mở đợt xét duyệt">
              <Choice
                label="Hội đồng được phân công"
                value={council}
                onValueChange={setCouncil}
              >
                <ChoiceOption value="">Chọn hội đồng</ChoiceOption>
                {councils.map((c) => (
                  <ChoiceOption key={c.id} value={c.id}>
                    {c.title}
                  </ChoiceOption>
                ))}
              </Choice>
              <label className="intake-check">
                <Checkbox
                  checked={ethics}
                  onCheckedChange={setEthics}
                />
                Hồ sơ bắt buộc thẩm định đạo đức
              </label>
              <ActionDialog
                primary
                trigger="Mở đợt chấm"
                detail="Giao hồ sơ cho hội đồng theo bộ tiêu chí của kỳ. Thành viên có xung đột lợi ích được loại khỏi danh sách chấm."
                onConfirm={() => {
                  const updates = openRound(app, p.id, council, ethics)
                  if (updates.length) app.commit('Mở đợt xét duyệt', updates)
                }}
              />
            </Panel>
          )}
          <ProposalFacts app={app} p={p} />
        </>
      )}
    </>
  )
}
