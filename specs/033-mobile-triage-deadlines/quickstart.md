---
id: US-33
feature: B06
epic: E0
channel: mobile
review_id: RV-38
status: Draft
updated: 2026-11-22
---

# Nghiệm thu độc lập US-33

Chạy `corepack pnpm dev` ở gốc repo, mở `/#/B06`. Chọn Phiên mô phỏng để đổi người hoặc đơn vị. Thử ở 360 và 390 CSS px, thu hẹp tới 320 để kiểm cuộn ngang.

Phiên Lê Thanh Mai tại Thủy lợi ngày 21/11/2026. Báo cáo kỳ 2 hạn 18/11 và kỳ 3 hạn 28/11 cùng liên kết về đề tài nguồn.

Thực hiện [TC-01–04](test-plan.md), ghi mã nguồn, số đếm và trạng thái trước/sau. Đối chiếu với phiên của trường thứ hai.

**Đối chiếu khi nối backend.** Dùng hai phiên thử được cấp quyền, so nội dung trả về và thẩm quyền theo [hợp đồng](contracts/interaction.md). Lưu kết quả pilot trong báo cáo QA.

Ngày 24/11/2026, PostgreSQL đối chiếu đúng các ngày 18, 21 và 28/11. Trình duyệt dùng các hạn tương đối với hôm nay, một phiếu phản biện chưa có hạn và hai đề tài độc lập. 360/390 px có 4 việc, 1 quá hạn; mở đúng kỳ 2, audit nguồn giữ nguyên. Tắt tasks trong HOME.RESEARCHER làm trang chủ ẩn cả thẻ lẫn số, truy cập ID việc trả 404. [Ca trình duyệt](../../e2e/home/triage-deadlines/acceptance.spec.ts)
