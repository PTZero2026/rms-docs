import { Button } from "@rms/ui/components/button"
import { routeUrl } from "./catalog"

export function UnavailableRecord({ feature, title = "Không thể mở hồ sơ", detail = "Hồ sơ chưa có hoặc nằm ngoài phạm vi truy cập của bạn." }: {
  feature: string
  title?: string
  detail?: string
}) {
  return <section className="panel pad stack">
    <h1>{title}</h1><p>{detail}</p>
    <div><Button variant="outline" asChild><a href={routeUrl(feature)}>Về danh sách</a></Button></div>
  </section>
}
