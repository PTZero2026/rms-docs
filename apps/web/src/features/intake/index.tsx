import type { FeatureProps } from '../../demo/types'
import { CallScreen } from './CallScreen'
import { ProposalScreen } from './ProposalScreen'
import { ReviewScreen } from './ReviewScreen'
import { ReportScreen } from './ReportScreen'
import { scopeUnit } from './model'
import { Blank } from './ui'
import './intake.css'

export default function Intake(app: FeatureProps) {
  const screens = { F01: ProposalScreen, F02: CallScreen, F03: ReviewScreen, B02: ReportScreen }
  const Screen = screens[app.route.feature as keyof typeof screens]
  const { tenant, userId, role } = app.session
  const key = [tenant, userId, role, scopeUnit(app), app.route.feature, app.route.id].join('/')
  return (
    <div className="intake stack" key={key}>
      {Screen ? <Screen {...app} /> : <Blank />}
    </div>
  )
}
