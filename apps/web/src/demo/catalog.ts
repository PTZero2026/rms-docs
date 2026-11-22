import {
  Activity,
  Award,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardCheck,
  FileBadge,
  FileText,
  FlaskConical,
  GraduationCap,
  History,
  House,
  Network,
  Settings2,
  SquareUserRound,
  UsersRound,
  Wallet,
} from "lucide-react"
import type { Role } from "./types"
export const items = [
  { id: "B06", label: "Tổng quan", icon: House, group: "Không gian làm việc" },
  { id: "B04", label: "Thông báo", icon: Bell, group: "Không gian làm việc" },
  { id: "F02", label: "Kỳ nhận đề xuất", icon: CalendarDays, group: "Quản lý nghiên cứu" },
  { id: "F01", label: "Đề xuất đề tài", icon: FileText, group: "Quản lý nghiên cứu" },
  { id: "F03", label: "Xét duyệt hội đồng", icon: UsersRound, group: "Quản lý nghiên cứu" },
  { id: "F04", label: "Tiến độ đề tài", icon: Activity, group: "Quản lý nghiên cứu" },
  { id: "F05", label: "Kinh phí", icon: Wallet, group: "Quản lý nghiên cứu" },
  { id: "F06", label: "Nghiệm thu", icon: ClipboardCheck, group: "Quản lý nghiên cứu" },
  { id: "F07", label: "Sản phẩm khoa học", icon: BookOpen, group: "Kết quả nghiên cứu" },
  { id: "F08", label: "Lý lịch khoa học", icon: SquareUserRound, group: "Kết quả nghiên cứu" },
  { id: "B02", label: "Báo cáo thống kê", icon: ChartNoAxesCombined, group: "Kết quả nghiên cứu" },
  { id: "F09", label: "Đề tài cấp trên", icon: Building2, group: "Hoạt động mở rộng" },
  { id: "F10", label: "Đề tài sinh viên", icon: GraduationCap, group: "Hoạt động mở rộng" },
  { id: "F11", label: "Dự án sản xuất", icon: BriefcaseBusiness, group: "Hoạt động mở rộng" },
  { id: "F12", label: "Hoạt động khoa học", icon: FlaskConical, group: "Hoạt động mở rộng" },
  { id: "P03", label: "Giờ giảng quy đổi", icon: Award, group: "Hoạt động mở rộng" },
  { id: "B01", label: "Cấu hình đơn vị", icon: Settings2, group: "Quản trị" },
  { id: "B03", label: "Tài khoản & quyền", icon: FileBadge, group: "Quản trị" },
  { id: "P01", label: "Quy trình đề tài", icon: Network, group: "Quản trị" },
  { id: "P02", label: "Nhật ký hoạt động", icon: History, group: "Quản trị" },
]
export function canOpen(id: string, role: Role, e4: boolean) {
  if (!items.some((i) => i.id === id)) return false
  if (!e4 && ["F09", "F10", "F11", "F12", "P03"].includes(id)) return false
  if (id === "B01" || id === "P01") return role === "admin"
  if (id === "B02") return role === "officer" || role === "admin"
  if (role === "user") return ["B06", "B03", "B04", "F08", "P02"].includes(id)
  if (role === "student") return ["B06", "B04", "B03", "F10", "F02", "F08", "P02"].includes(id)
  if (role === "reviewer")
    return ["B06", "B04", "B03", "F02", "F03", "F06", "F08", "P02"].includes(id)
  return true
}
export function routeUrl(feature: string, id?: string) {
  return "#/" + encodeURIComponent(feature) + (id ? "/" + encodeURIComponent(id) : "")
}
export function readRoute() {
  try {
    const [feature, id] = location.hash.replace(/^#\/?/, "").split("/").map(decodeURIComponent)
    return { feature: feature || "B06", id }
  } catch {
    return { feature: "invalid" }
  }
}
export const statusNames: Record<string, string> = {
  DRAFT: "Bản nháp",
  SUBMITTED: "Đã nộp",
  UNDER_REVIEW: "Đang xét duyệt",
  UNDER_ACCEPTANCE: "Đang nghiệm thu",
  SENT: "Đã gửi",
  ERROR: "Lỗi gửi",
  DISABLED: "Ngừng hoạt động",
  APPROVED: "Đã phê duyệt",
  REJECTED: "Từ chối",
  IN_PROGRESS: "Đang thực hiện",
  PENDING_ACCEPTANCE: "Chờ nghiệm thu",
  PASSED: "Đạt nghiệm thu",
  FAILED: "Không đạt",
  COMPLETED: "Hoàn thành",
  SUSPENDED: "Tạm dừng",
  CANCELLED: "Đã hủy",
  OPEN: "Đang mở",
  CLOSED: "Đã đóng",
  ACTIVE: "Đang hoạt động",
  LOCKED: "Đã khóa",
  ARCHIVED: "Đã lưu trữ",
  PENDING: "Chờ duyệt",
  READ: "Đã đọc",
  UNREAD: "Chưa đọc",
}
export const vietnamDate = (iso: string, time = false) => {
  const date = new Date(iso)
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "Asia/Ho_Chi_Minh",
        ...(time ? { hour: "2-digit", minute: "2-digit" } : {}),
      }).format(date)
}
