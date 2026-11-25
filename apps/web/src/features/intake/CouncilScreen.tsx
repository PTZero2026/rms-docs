import { routeUrl } from "../../demo/catalog"
import { ValidatedForm } from "@rms/ui/components/validated-form"
import { Checkbox } from "@rms/ui/components/checkbox"
import { ChoiceOption } from "@rms/ui/components/choice-select"
import { useState } from 'react'
import { Button } from '@rms/ui/components/button'
import type { DemoRow, FeatureProps } from '../../demo/types'
import { managed, names } from './model'
import { councilRoles, councilUpdates, reviewerPool, saveCouncil } from './reviews'
import type { Seat } from './reviews'
import {
  Blank,
  Choice,
  FieldText,
  Grid,
  Heading,
  LinkRecord,
  Panel,
  Problem,
  useAction,
} from './ui'

export function CouncilScreen({ app, council }: { app: FeatureProps; council?: DemoRow }) {
  const existing: Seat[] = council ? JSON.parse(council.fields.seats) : []
  const [editing, setEditing] = useState(!council)
  const [title, setTitle] = useState(council?.title || '')
  const [code, setCode] = useState(council?.fields.code || '')
  const [seats, setSeats] = useState<Seat[]>(existing)
  const { error, run } = useAction()
  if (app.session.role !== 'officer' || (council && !managed(app, council))) return <Blank />
  const assigned = app.rows.filter(
    (r) => r.kind === 'review-round' && r.fields.councilId === council?.id && managed(app, r),
  )
  return (
    <>
      <LinkRecord feature="F03">Xét duyệt hội đồng</LinkRecord>
      <Heading title={council?.title || 'Lập hội đồng xét duyệt'} detail={council?.fields.code}>
        {council && !editing && <Button onClick={() => setEditing(true)}>Sửa phân công</Button>}
      </Heading>
      {editing ? (
        <ValidatedForm
          className="panel stack"
          onSubmit={(e) => {
            e.preventDefault()
            run(() => {
              const result = saveCouncil(app, title, code, seats, council?.id)
              app.commit('Lưu phân công hội đồng', councilUpdates(app, result))
              setEditing(false)
              app.go('F03', result.id)
            })
          }}
        >
          <h2 className="section-heading">Thông tin và phân công</h2>
          <div className="form-grid">
            <FieldText
              label="Tên hội đồng"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <FieldText label="Mã hội đồng" value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          {reviewerPool.map((uid) => {
            const seat = seats.find((s) => s.user === uid)
            return (
              <div key={uid} className="form-grid">
                <label className="intake-check">
                  <Checkbox
                    checked={!!seat}
                    onCheckedChange={checked => setSeats(
                        checked
                          ? [...seats, { user: uid, role: 'REVIEWER' }]
                          : seats.filter((s) => s.user !== uid),
                      )}
                  />
                  {names[uid]}
                </label>
                {seat && (
                  <Choice
                    label={'Chức danh của ' + names[uid]}
                    value={seat.role}
                    onValueChange={choiceValue => setSeats(
                        seats.map((s) =>
                          s.user === uid ? { ...s, role: choiceValue as Seat['role'] } : s,
                        ),
                      )}
                  >
                    {Object.entries(councilRoles).map(([value, text]) => (
                      <ChoiceOption key={value} value={value}>
                        {text}
                      </ChoiceOption>
                    ))}
                  </Choice>
                )}
              </div>
            )
          })}
          <Problem text={error} />
          <div className="intake-actions">
            <Button type="submit">Lưu hội đồng</Button>
            <Button type="button" variant="outline" asChild><a href={routeUrl('F03')}>
              Quay lại
            </a></Button>
          </div>
        </ValidatedForm>
      ) : (
        <>
          <Panel title="Thành phần hội đồng">
            <Grid
              heads={['Thành viên', 'Chức danh']}
              lines={existing.map((s) => ({
                id: s.user,
                cells: [names[s.user], councilRoles[s.role]],
              }))}
            />
          </Panel>
          <Panel title="Đợt đã phân công">
            <Grid
              heads={['Đề tài', 'Đợt đánh giá']}
              lines={assigned.map((r) => ({
                id: r.id,
                cells: [
                  <LinkRecord feature="F03" id={r.fields.projectId}>
                    {app.rows.find((p) => p.id === r.fields.projectId)?.title}
                  </LinkRecord>,
                  r.status === 'CONCLUDED' ? 'Đã kết luận' : 'Đang thu phiếu',
                ],
              }))}
            />
          </Panel>
        </>
      )}
    </>
  )
}
