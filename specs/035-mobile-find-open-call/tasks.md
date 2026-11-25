---
id: US-35
feature: F02
epic: E1
channel: mobile
review_id: RV-40
status: Draft
updated: 2026-11-24
---

# Tasks · Tra kỳ đang nhận theo mã trên điện thoại

Một story US1, mục tiêu độc lập: Tìm một kỳ theo mã và đọc đúng hạn trên màn hình 320 px mà không cuộn ngang. T001 dùng bộ mẫu v0. T002–T007 dành cho tích hợp hệ thống đích. Bản v0 và bằng chứng UI được theo dõi ở [báo cáo](../../docs/reviews/rms-v0-mobile.md).

## Chuẩn bị

- [x] T001 Chuẩn bị fixture đối chiếu ở `e2e/v0/mobile.spec.ts`. Kỳ KG-2027-01 mở từ 01/11 đến 30/11/2026, kỳ thu đã đóng và một kỳ nháp. Đối chiếu tài khoản chủ nhiệm và chuyên viên.

## Nền tảng

- [x] T002 Rà kiểu dữ liệu, quyền và hành vi theo [interaction.md](contracts/interaction.md) trong hợp đồng module `packages/api-contracts/call/`. Sinh kiểu dùng ở client sau khi duyệt.

## US1 · P2

- [x] T003 [P] [US1] Chuyển AC-01–04 thành ca nghiệm thu ở `e2e/tests/find-open-call.spec.ts` với phiên thật có/ngoài quyền.
- [x] T004 [P] [US1] Áp ràng buộc phạm vi và hành vi ở `apps/backend/src/modules/call/`. Truy vấn các kỳ trong phạm vi phiên, lọc theo thời gian hiệu lực rồi theo từ khóa. Mở chi tiết bằng id, kiểm quyền tại nguồn và kiểm lại điều kiện tiếp nhận trước khi lập đề xuất. Theo [data-model.md](data-model.md), kiểm `ProposalCall.id`, `ProposalCall.startDate`, `ProposalCall.endDate`, `ProposalCall.status`.
- [x] T005 [US1] Nối kiểu dữ liệu đã sinh và xử lý trạng thái rỗng ở `apps/web/src/features/mobile/CallCards.tsx`. Dùng callVisible trước receiving, lọc tên hoặc mã không phân biệt hoa thường và hiển thị ngày bằng dateLabel. Chi tiết dùng lại route F02 hiện hành.
- [x] T006 [US1] Kiểm RV-40 theo AC-01/04 và bộ dữ liệu biên, cập nhật kết quả thực tế tại `specs/035-mobile-find-open-call/quickstart.md`.

## Kiểm tra hồi quy

- [x] T007 Chạy bộ kiểm tích hợp, đối chiếu vai trò và desktop, ghi kết quả ở `docs/reviews/rms-v0-mobile.md`.

T001 → T002 → (T003 song song T004) → T005 → T006 → T007. Có thể bàn giao lát này riêng tại F02. [Quickstart](quickstart.md) · [Plan](plan.md).
