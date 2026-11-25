---
id: US-34
feature: B04
epic: E0
channel: mobile
review_id: RV-39
status: Draft
updated: 2026-11-22
---

# Nghiệm thu độc lập US-34

Chạy `corepack pnpm dev` ở gốc repo, mở `/#/B04`. Chọn Phiên mô phỏng để đổi người hoặc đơn vị. Thử ở 360 và 390 CSS px, thu hẹp tới 320 để kiểm cuộn ngang.

Hai tin IN_APP chưa đọc của Mai, một tin từ kỳ nhận và một từ báo cáo. Mở B04 bằng phiên Mai và đối chiếu với hộp thư người nhận khác.

Thực hiện [TC-01–04](test-plan.md), ghi mã nguồn, số đếm và trạng thái trước/sau. Đối chiếu với phiên của trường thứ hai.

**Đối chiếu khi nối backend.** Dùng hai phiên thử được cấp quyền, so nội dung trả về và thẩm quyền theo [hợp đồng](contracts/interaction.md). Lưu kết quả pilot trong báo cáo QA.

Ngày 24/11/2026, hai chủ nhiệm đăng nhập qua OTP ở 360 và 390 px. Số chưa đọc của mỗi người đi từ 2 xuống 1 rồi 0. Back và reload giữ bộ lọc; mở lại tin đã đọc giữ 0. Trường khác trả 404. [Ca tích hợp](../../e2e/notification/deadline-reminder/acceptance.spec.ts)
