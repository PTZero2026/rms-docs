import { sourceAllowed } from '../../demo/source-rights.ts'
import { useState } from 'react'
import { Button } from '@rms/ui/components/button'
import type { DemoRow, FeatureProps } from '../../demo/types'
import { decideSuggestion, openEvidence, suggest } from './evidence'
import { timeLabel } from './model'
import { ActionDialog, Panel, Problem, useAction } from './ui'

export function EvidencePanel({ app, project }: { app: FeatureProps; project: DemoRow }) {
  const [consent, setConsent] = useState(false)
  const [opened, setOpened] = useState('')
  const { error, run } = useAction()
  const hints = app.rows.filter(
    (r) =>
      r.kind === 'proposal-evidence' && r.fields.projectId === project.id && r.owner === app.session.userId,
  )
  if (!sourceAllowed(app.rows, project))
    return (
      <Panel title="Đối chiếu thuyết minh">
        <p>Phiên bản này chưa được đơn vị cấp quyền dùng cho AI. Bạn có thể tiếp tục sửa thuyết minh.</p>
      </Panel>
    )
  return (
    <Panel title="Đối chiếu thuyết minh bằng AI mô phỏng">
      <label className="intake-check">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        Cho phép đối chiếu mục phương pháp trong bản nháp đã lưu
      </label>
      <div className="intake-actions">
        <Button
          variant="outline"
          disabled={!consent}
          onClick={() =>
            run(() => {
              const hint = suggest(app, project.id, consent)
              app.commit('Đối chiếu thuyết minh bằng trợ lý mô phỏng', [hint])
              setOpened(hint.id)
            })
          }
        >
          Rà mục phương pháp
        </Button>
      </div>
      <Problem text={error} />
      {[...hints].reverse().map((hint) => (
        <article key={hint.id} className="intake-result stack">
          <h3>{hint.title}</h3>
          <p className="intake-caption">
            {timeLabel(hint.fields.createdAt)} · {hint.fields.model} · Mẫu lệnh {hint.fields.promptVersion}
          </p>
          {opened === hint.id &&
            (hint.fields.excerpt &&
            (hint.fields.sourceVersion || '1') === (project.fields.revision || '1') &&
            project.fields.method?.includes(hint.fields.excerpt) ? (
              <div className="intake-sources">
                <blockquote>{hint.fields.excerpt}</blockquote>
                <p>
                  {hint.fields.location} · Bản nháp {hint.fields.sourceVersion || '1'} ·{' '}
                  {hint.fields.template} · Phiên bản {hint.fields.templateVersion}
                </p>
              </div>
            ) : (
              <p>Chưa đủ căn cứ từ bản nháp hiện tại. Bạn có thể sửa thuyết minh thủ công.</p>
            ))}
          <div className="intake-actions">
            <Button
              variant="outline"
              onClick={() =>
                run(() => {
                  openEvidence(app, hint.id)
                  setOpened(opened === hint.id ? '' : hint.id)
                })
              }
            >
              {opened === hint.id ? 'Thu gọn căn cứ' : 'Mở căn cứ'}
            </Button>
            {hint.status === 'PENDING' ? (
              (['ACCEPTED', 'DISMISSED'] as const).map((state) => (
                <ActionDialog
                  key={state}
                  trigger={state === 'ACCEPTED' ? 'Ghi nhận gợi ý' : 'Bỏ qua gợi ý'}
                  detail="Lưu lựa chọn của chủ nhiệm cho lần đối chiếu này."
                  onConfirm={() =>
                    app.commit('Xử lý gợi ý đối chiếu', [decideSuggestion(app, hint.id, state)])
                  }
                />
              ))
            ) : (
              <p>{hint.status === 'ACCEPTED' ? 'Đã ghi nhận' : 'Đã bỏ qua'}</p>
            )}
          </div>
        </article>
      ))}
    </Panel>
  )
}
