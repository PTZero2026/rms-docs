---
id: US-35
feature: F02
epic: E1
channel: mobile
review_id: RV-40
status: Draft
updated: 2026-11-22
---

# Nghiệm thu độc lập US-35

Chạy `corepack pnpm dev` ở gốc repo, mở `/#/F02`. Chọn Phiên mô phỏng để đổi người hoặc đơn vị. Thử ở 360 và 390 CSS px, thu hẹp tới 320 để kiểm cuộn ngang.

Kỳ KG-2027-01 mở từ 01/11 đến 30/11/2026, kỳ thu đã đóng và một kỳ nháp. Đối chiếu tài khoản chủ nhiệm và chuyên viên.

Thực hiện [TC-01–04](test-plan.md), ghi mã nguồn, số đếm và trạng thái trước/sau. Đối chiếu với phiên của trường thứ hai.

**Đối chiếu khi nối backend.** Dùng hai phiên thử được cấp quyền, so nội dung trả về và thẩm quyền theo [hợp đồng](contracts/interaction.md). Lưu kết quả pilot trong báo cáo QA.

**Đối chiếu tích hợp cục bộ 24/11/2026.** Chrome dùng hai tài khoản OTP, tra cùng kỳ theo mã viết thường, xem đúng mẫu và hạn, lọc rỗng rồi xóa từ khóa. Cả hai chọn Tất cả khi kỳ còn nháp, chỉ chuyên viên thấy kỳ. Kiểm 320/360/390 px. PostgreSQL kiểm loại kỳ OPEN tương lai và hết hạn ở hai phía của mốc giờ Việt Nam. Ca trường B trả 404 khi biết ID của A. [Chrome](../../e2e/call/open-call/acceptance.spec.ts) · [PostgreSQL](../../apps/backend/test/db/call.test.mjs)
