import { UnavailableRecord } from "../../demo/UnavailableRecord"
import { routeUrl } from "../../demo/catalog"
import { Button } from '@rms/ui/components/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@rms/ui/components/tabs'
import type { FeatureProps } from '../../demo/types'
import { CouncilScreen } from './CouncilScreen'
import { ReviewDetail } from './ReviewDetail'
import { author, ids, managed } from './model'
import { reviewerAccess, roundFor, summarize } from './reviews'
import { Grid, Heading, LinkRecord, Panel, State } from './ui'

export function ReviewScreen(app: FeatureProps) {
  const { rows, route, session } = app
  const officer = session.role === 'officer'
  const councils = rows.filter((r) => r.kind === 'council' && managed(app, r))
  const projects = rows.filter((p) => {
    if (p.kind !== 'project') return false
    const round = roundFor(rows, p.id)
    if (officer)
      return (
        managed(app, p) && (round || (p.status === 'SUBMITTED' && p.fields.finalized === 'true'))
      )
    return reviewerAccess(app, p, round) || (author(app, p) && !!round)
  })
  if (route.id === 'new' && officer) return <CouncilScreen app={app} />
  const council = councils.find((c) => c.id === route.id)
  if (council) return <CouncilScreen app={app} council={council} />
  if (route.id) {
    const p = projects.find((row) => row.id === route.id || roundFor(rows, row.id)?.id === route.id)
    if (!p) return <UnavailableRecord feature="F03" />
    if (author(app, p))
      return (
        <Panel title="Tiến trình của đề tài">
          <LinkRecord feature="F01" id={p.id}>
            {p.title}
          </LinkRecord>
          <State value={p.status} />
        </Panel>
      )
    return <ReviewDetail app={app} p={p} round={roundFor(rows, p.id)} />
  }
  const queue = (
    <Panel title={session.role === 'reviewer' ? 'Hồ sơ được phân công' : 'Hồ sơ xét duyệt'}>
      <Grid
        heads={['Đề tài', 'Mã theo dõi', 'Trạng thái', officer ? 'Phiếu hợp lệ' : 'Tiến độ']}
        lines={projects.map((p) => {
          const r = roundFor(rows, p.id)
          const sheet =
            r &&
            rows.find(
              (s) => s.kind === 'score' && s.fields.roundId === r.id && s.owner === session.userId,
            )
          let progress = 'Chờ mở đợt'
          if (r) {
            if (officer) {
              const s = summarize(rows, p, r)
              progress = s.count + ' / ' + s.eligible
            } else if (session.role === 'reviewer')
              progress =
                sheet?.status === 'SUBMITTED' ? 'Đã gửi phiếu' : sheet ? 'Phiếu nháp' : 'Chưa chấm'
            else progress = r.status === 'CONCLUDED' ? 'Đã có kết luận khoa học' : 'Đang xét duyệt'
          }
          return {
            id: p.id,
            cells: [
              <LinkRecord feature={author(app, p) ? 'F01' : 'F03'} id={p.id}>
                {p.title}
              </LinkRecord>,
              p.fields.code,
              <State value={p.status} />,
              progress,
            ],
          }
        })}
      />
    </Panel>
  )
  return (
    <>
      <Heading
        title={session.role === 'reviewer' ? 'Hàng chờ chấm của tôi' : 'Xét duyệt hội đồng'}
        detail={officer ? 'Phân công hội đồng, theo dõi phiếu và ghi nhận quyết định.' : undefined}
      >
        {officer && <Button asChild><a href={routeUrl('F03', 'new')}>Lập hội đồng</a></Button>}
      </Heading>
      {officer ? (
        <Tabs defaultValue="rounds">
          <TabsList aria-label="Nội dung xét duyệt">
            <TabsTrigger value="rounds">Đợt xét duyệt</TabsTrigger>
            <TabsTrigger value="councils">Hội đồng</TabsTrigger>
          </TabsList>
          <TabsContent value="rounds">{queue}</TabsContent>
          <TabsContent value="councils">
            <Panel title="Hội đồng đã lập">
              <Grid
                heads={['Tên hội đồng', 'Mã hội đồng', 'Thành viên']}
                lines={councils.map((c) => ({
                  id: c.id,
                  cells: [
                    <LinkRecord feature="F03" id={c.id}>
                      {c.title}
                    </LinkRecord>,
                    c.fields.code,
                    ids(c.fields.memberIds).length,
                  ],
                }))}
              />
            </Panel>
          </TabsContent>
        </Tabs>
      ) : (
        queue
      )}
    </>
  )
}
