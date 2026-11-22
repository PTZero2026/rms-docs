import Config from "./Config"
import Accounts from "./Accounts"
import Audit from "./Audit"
import Workflow from "./Workflow"
import Notifications from "./Notifications"
import type { FeatureProps } from "../../demo/types"
export default function Platform(p: FeatureProps) {
  switch (p.route.feature) {
    case "B01":
      return <Config {...p} />
    case "B03":
      return <Accounts {...p} />
    case "B04":
      return <Notifications {...p} />
    case "P01":
      return <Workflow {...p} />
    default:
      return <Audit {...p} />
  }
}
