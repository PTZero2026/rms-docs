import { useState } from 'react'
import { ProposalTeam } from './ProposalTeam'
import { ProposalFiles, attachments } from './ProposalFiles'
import { Button } from '@rms/ui/components/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@rms/ui/components/tabs'
import type { DemoRow, FeatureProps } from '../../demo/types'
import { referenceName } from './calls'
import { dateLabel, find, ids, names, receiving } from './model'
import { blankProposal, proposalForm, saveDraft, submissionIssues, submitProposal } from './proposals'
import type { ProposalForm } from './proposals'
import { ActionDialog, Area, Blank, Choice, Facts, FieldText, Heading, Panel, Problem, useAction } from './ui'

export function ProposalEditor({
  app,
  project,
  callId,
  done,
}: {
  app: FeatureProps
  project?: DemoRow
  callId?: string
  done: (id?: string) => void
}) {
  const calls = app.rows.filter((r) => r.kind === 'call' && (receiving(r) || r.id === project?.fields.callId))
  const [form, setForm] = useState<ProposalForm>(() =>
    project ? proposalForm(project) : { ...blankProposal, callId: callId || calls[0]?.id || '' },
  )
  const [tab, setTab] = useState('general')
  const { error, run } = useAction()
  const id = project?.id
  const call = find(app.rows, 'call', form.callId)
  const update = (key: keyof ProposalForm, value: string) => setForm({ ...form, [key]: value })
  const [openedRevision] = useState(() => JSON.stringify(project))
  const draft = () => {
    if (JSON.stringify(project) !== openedRevision)
      throw Error(
        'Đề xuất đã thay đổi ở phiên khác. Nội dung bạn nhập vẫn còn ở đây. Sao chép phần cần giữ rồi mở lại hồ sơ.',
      )
    return saveDraft(app, form, id)
  }
  const preview: DemoRow = {
    kind: 'project',
    id: id || '',
    unit: app.session.unit,
    status: 'DRAFT',
    owner: app.session.userId,
    title: form.title,
    fields: { ...project?.fields, ...form },
  }
  const issues = submissionIssues(preview, call)
  const save = () => {
    const p = draft()
    app.commit('Lưu nháp đề xuất', [p])
    done(p.id)
  }
  const submit = () => {
    const p = draft()
    const next = submitProposal({ ...app, rows: [...app.rows.filter((r) => r.id !== p.id), p] }, p.id)
    app.commit('Nộp đề xuất đề tài', [next])
    done(next.id)
  }
  if (!calls.length) return <Blank>Chưa có kỳ đang nhận đề xuất.</Blank>
  return (
    <>
      <Heading
        title={id ? 'Chỉnh sửa đề xuất' : 'Lập đề xuất đề tài'}
        detail={'Chủ nhiệm · ' + app.session.name}
      />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="intake-steps" aria-label="Các bước lập hồ sơ">
          {Object.entries({
            general: 'Thông tin chung',
            method: 'Thuyết minh',
            team: 'Thành viên',
            budget: 'Dự toán',
            files: 'Tài liệu',
            submit: 'Xem lại và nộp',
          }).map(([key, title]) => (
            <TabsTrigger key={key} value={key}>
              {title}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="general">
          <Panel title="Thông tin chung">
            <Choice
              label="Kỳ nhận đề xuất"
              value={form.callId}
              disabled={Boolean(id)}
              onChange={(e) => setForm({ ...form, callId: e.target.value, discipline: '' })}
            >
              {calls.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </Choice>
            <FieldText
              label="Tên đề tài"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
            />
            <Choice
              label="Lĩnh vực nghiên cứu"
              value={form.discipline}
              onChange={(e) => update('discipline', e.target.value)}
            >
              <option value="">Chọn lĩnh vực</option>
              {ids(call?.fields.disciplines).map((key) => (
                <option key={key} value={key}>
                  {referenceName(app.rows, key)}
                </option>
              ))}
            </Choice>
            <Facts
              items={[
                ['Đơn vị chủ trì', app.session.unit],
                ['Hạn nhận hồ sơ', dateLabel(call?.fields.due)],
              ]}
            />
          </Panel>
        </TabsContent>
        <TabsContent value="method">
          <Panel title={referenceName(app.rows, call?.fields.template || '')}>
            <Area
              label="Mục tiêu nghiên cứu"
              value={form.objective}
              onChange={(e) => update('objective', e.target.value)}
            />
            <Area
              label="Phương pháp nghiên cứu"
              value={form.method}
              onChange={(e) => update('method', e.target.value)}
            />
            <Area
              label="Sản phẩm dự kiến"
              value={form.outcome}
              onChange={(e) => update('outcome', e.target.value)}
            />
          </Panel>
        </TabsContent>
        <TabsContent value="team">
          <Panel title="Thành viên thực hiện">
            <p>Chủ nhiệm · {app.session.name}</p>
            <ProposalTeam owner={app.session.userId} form={form} setForm={setForm} />
          </Panel>
        </TabsContent>
        <TabsContent value="budget">
          <Panel title="Dự toán và thời gian thực hiện">
            <div className="form-grid">
              <FieldText
                label="Kinh phí đề xuất (VND)"
                type="number"
                min="0"
                step="1"
                value={form.requestedBudget}
                onChange={(e) => update('requestedBudget', e.target.value)}
              />
              <FieldText
                label="Thời gian thực hiện (tháng)"
                type="number"
                min="1"
                step="1"
                value={form.durationMonths}
                onChange={(e) => update('durationMonths', e.target.value)}
              />
            </div>
          </Panel>
        </TabsContent>
        <TabsContent value="files">
          <Panel title="Tài liệu đính kèm">
            <ProposalFiles
              files={attachments(form.attachments, form.attachment)}
              change={(files) => setForm({ ...form, attachments: JSON.stringify(files), attachment: '' })}
            />
          </Panel>
        </TabsContent>
        <TabsContent value="submit">
          <Panel title="Đối chiếu trước khi nộp">
            <Facts
              items={[
                ['Tên đề tài', form.title],
                ['Kỳ', call?.title],
                [
                  'Thành viên',
                  [app.session.name, ...ids(form.memberIds).map((uid) => names[uid])].join(', '),
                ],
                [
                  'Kinh phí đề xuất',
                  form.requestedBudget && Number(form.requestedBudget).toLocaleString('vi-VN') + ' VND',
                ],
                ['Thời gian', form.durationMonths && form.durationMonths + ' tháng'],
              ]}
            />
            {issues.length ? (
              <ul className="intake-issues">
                {issues.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            ) : (
              <p>Hồ sơ đủ trường bắt buộc của kỳ.</p>
            )}
            <ActionDialog
              disabled={Boolean(issues.length)}
              primary
              trigger="Nộp đề xuất"
              detail="Xác nhận gửi hồ sơ cho Phòng KHCN. Hồ sơ được khóa sau khi nộp."
              onConfirm={submit}
            />
          </Panel>
        </TabsContent>
      </Tabs>
      <Problem text={error} />
      <div className="intake-actions">
        <Button onClick={() => run(save)}>Lưu nháp</Button>
        <Button variant="outline" onClick={() => done(id)}>
          Quay lại
        </Button>
        {tab !== 'submit' && (
          <Button variant="outline" onClick={() => setTab('submit')}>
            Xem lại và nộp
          </Button>
        )}
      </div>
    </>
  )
}
