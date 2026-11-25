import { CallCards } from '../mobile/CallCards'
import { usePhoneLayout } from '../mobile/usePhoneLayout'
import { useState } from 'react'
import { Button } from '@rms/ui/components/button'
import type { DemoRow, FeatureProps } from '../../demo/types'
import { blankCall, changeCall, referenceName, references, saveCall } from './calls'
import type { CallForm } from './calls'
import {
  callStatus,
  callVisible,
  canReadProject,
  dateLabel,
  ids,
  managed,
  receiving,
} from './model'
import {
  ActionDialog,
  Blank,
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

function CallEditor({
  app,
  call,
  done,
}: {
  app: FeatureProps
  call?: DemoRow
  done: (id: string) => void
}) {
  const [form, set] = useState<CallForm>(() => ({
    ...blankCall,
    ...call?.fields,
    title: call?.title || '',
  }))
  const { error, run } = useAction()
  const update = (key: keyof CallForm, value: string) => set({ ...form, [key]: value })
  return (
    <form
      className="panel stack"
      onSubmit={(event) => {
        event.preventDefault()
        run(() => {
          const next = saveCall(app, form, call?.id)
          app.commit(call ? 'Cập nhật kỳ nháp' : 'Lập kỳ nhận đề xuất', [next])
          done(next.id)
        })
      }}
    >
      <h2 className="section-heading">Cấu hình kỳ nhận đề xuất</h2>
      <div className="form-grid">
        <FieldText
          label="Tên kỳ"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
        />
        <FieldText
          label="Mã kỳ"
          value={form.code}
          onChange={(e) => update('code', e.target.value)}
        />
        <FieldText
          label="Bắt đầu nhận"
          type="date"
          value={form.start}
          onChange={(e) => update('start', e.target.value)}
        />
        <FieldText
          label="Hạn nhận hồ sơ"
          type="date"
          value={form.due}
          onChange={(e) => update('due', e.target.value)}
        />
      </div>
      <fieldset>
        <legend>Lĩnh vực tiếp nhận</legend>
        {references(app.rows, 'discipline').map((r) => (
          <label className="intake-check" key={r.id}>
            <input
              type="checkbox"
              checked={ids(form.disciplines).includes(r.id)}
              onChange={(e) =>
                update(
                  'disciplines',
                  (e.target.checked
                    ? [...ids(form.disciplines), r.id]
                    : ids(form.disciplines).filter((id) => id !== r.id)
                  ).join(','),
                )
              }
            />
            {r.title}
          </label>
        ))}
      </fieldset>
      <div className="form-grid">
        {(['template', 'criteria'] as const).map((key) => (
          <Choice
            key={key}
            label={key === 'template' ? 'Biểu mẫu thuyết minh' : 'Bộ tiêu chí xét duyệt'}
            value={form[key]}
            onChange={(e) => update(key, e.target.value)}
          >
            <option value="">Chọn từ danh mục</option>
            {references(app.rows, key).map((r) => (
              <option key={r.id} value={r.id} disabled={r.status !== 'ACTIVE'}>
                {r.title}
                {r.status !== 'ACTIVE' ? ' (hết hiệu lực)' : ''}
              </option>
            ))}
          </Choice>
        ))}
      </div>
      <Problem text={error} />
      <div className="intake-actions">
        <Button type="submit">Lưu kỳ nháp</Button>
        <Button variant="outline" type="button" onClick={() => done(call?.id || '')}>
          Hủy chỉnh sửa
        </Button>
      </div>
    </form>
  )
}
export function CallScreen(app: FeatureProps) {
  const phone = usePhoneLayout()
  const { route, session, rows, go } = app
  const [edit, setEdit] = useState(false)
  const [query, setQuery] = useState('')
  const [due, setDue] = useState('')
  const calls = rows.filter((r) => callVisible(app, r))
  const matches = calls.filter((c) =>
    (c.title + ' ' + c.fields.code)
      .toLocaleLowerCase('vi')
      .includes(query.trim().toLocaleLowerCase('vi')),
  )
  const call = calls.find((r) => r.id === route.id)
  const done = (id: string) => {
    setEdit(false)
    go('F02', id || undefined)
  }
  if (route.id === 'new' && session.role === 'officer')
    return (
      <>
        <Heading title="Lập kỳ nhận đề xuất" />
        <CallEditor app={app} done={done} />
      </>
    )
  if (route.id && !call) return <Blank />
  if (!call)
    return (
      <>
        <Heading
          title="Kỳ nhận đề xuất"
          detail={
            session.role === 'officer'
              ? 'Quản lý thời hạn, biểu mẫu và tiêu chí tiếp nhận của từng kỳ.'
              : 'Tra cứu thời hạn nhận hồ sơ và biểu mẫu của kỳ.'
          }
        >
          {session.role === 'officer' && (
            <Button onClick={() => go('F02', 'new')}>Lập kỳ mới</Button>
          )}
        </Heading>
        <Panel title="Danh sách kỳ">
          <FieldText
            label="Tìm theo tên hoặc mã kỳ"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {phone ? (
            <CallCards matches={matches} />
          ) : (
            <Grid
              heads={['Kỳ nhận đề xuất', 'Mã kỳ', 'Thời gian nhận', 'Trạng thái']}
              lines={matches.map((c) => ({
                id: c.id,
                cells: [
                  <LinkRecord feature="F02" id={c.id}>
                    {c.title}
                  </LinkRecord>,
                  c.fields.code,
                  dateLabel(c.fields.start) + ' – ' + dateLabel(c.fields.due),
                  <State value={callStatus(c)} />,
                ],
              }))}
            />
          )}
        </Panel>
      </>
    )
  const status = callStatus(call)
  const submitted = rows.filter((r) => r.fields.callId === call.id && canReadProject(app, r))
  const write = (action: 'open' | 'close' | 'cancel' | 'extend', title: string) =>
    app.commit(title, [changeCall(app, call.id, action, due)])
  return (
    <>
      <LinkRecord feature="F02">Danh sách kỳ</LinkRecord>
      <Heading title={call.title} detail={call.fields.code}>
        <State value={status} />
      </Heading>
      {edit && managed(app, call) ? (
        <CallEditor app={app} call={call} done={done} />
      ) : (
        <>
          <Panel title="Điều kiện tiếp nhận">
            <Facts
              items={[
                ['Bắt đầu nhận', dateLabel(call.fields.start)],
                ['Hạn nhận hồ sơ', dateLabel(call.fields.due)],
                [
                  'Lĩnh vực',
                  ids(call.fields.disciplines)
                    .map((id) => referenceName(rows, id))
                    .join(', '),
                ],
                ['Biểu mẫu', referenceName(rows, call.fields.template)],
                ['Bộ tiêu chí', referenceName(rows, call.fields.criteria)],
              ]}
            />
            <div className="intake-actions">
              {receiving(call) && session.role === 'researcher' && (
                <Button onClick={() => go('F01', 'new~' + call.id)}>Lập đề xuất cho kỳ này</Button>
              )}
              {managed(app, call) && (
                <>
                  {status === 'DRAFT' && (
                    <>
                      <Button variant="outline" onClick={() => setEdit(true)}>
                        Sửa cấu hình
                      </Button>
                      <ActionDialog
                        primary
                        trigger="Mở kỳ"
                        detail="Kiểm tra hiệu lực của lĩnh vực, biểu mẫu và bộ tiêu chí trước khi nhận hồ sơ."
                        onConfirm={() => write('open', 'Mở kỳ nhận đề xuất')}
                      />
                    </>
                  )}
                  {status === 'OPEN' && (
                    <ActionDialog
                      trigger="Đóng kỳ"
                      detail="Kỳ sẽ ngừng nhận đề xuất mới và hồ sơ nộp lại."
                      onConfirm={() => write('close', 'Đóng kỳ nhận đề xuất')}
                    />
                  )}
                  {['OPEN', 'DRAFT'].includes(status) && (
                    <ActionDialog
                      trigger="Hủy kỳ"
                      detail="Chỉ hủy kỳ chưa có hồ sơ từng nộp."
                      onConfirm={() => write('cancel', 'Hủy kỳ nhận đề xuất')}
                    />
                  )}
                  {['OPEN', 'CLOSED'].includes(status) && (
                    <ActionDialog
                      trigger={status === 'CLOSED' ? 'Gia hạn và mở lại' : 'Gia hạn nhận'}
                      detail="Chọn hạn mới sau hạn hiện tại và sau ngày 21/11/2026."
                      onConfirm={() => write('extend', 'Gia hạn kỳ nhận đề xuất')}
                    >
                      <FieldText
                        label="Hạn nhận mới"
                        type="date"
                        value={due}
                        onChange={(e) => setDue(e.target.value)}
                      />
                    </ActionDialog>
                  )}
                </>
              )}
            </div>
          </Panel>
          {(managed(app, call) || session.role === 'admin') && (
            <Panel title={'Hồ sơ trong phạm vi phụ trách (' + submitted.length + ')'}>
              <Grid
                heads={['Đề xuất', 'Đơn vị', 'Trạng thái']}
                lines={submitted.map((p) => ({
                  id: p.id,
                  cells: [
                    <LinkRecord feature="F01" id={p.id}>
                      {p.title || 'Đề xuất chưa đặt tên'}
                    </LinkRecord>,
                    p.unit,
                    <State value={p.status} />,
                  ],
                }))}
              />
            </Panel>
          )}
        </>
      )}
    </>
  )
}
