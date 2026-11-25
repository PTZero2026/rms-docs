---
id: US-33
feature: B06
epic: E0
channel: mobile
review_id: RV-38
status: Draft
updated: 2026-11-24
---

# Tasks · Tìm việc quá hạn trên điện thoại

Một story US1, mục tiêu độc lập: Xác định và mở kỳ 2 từ B06 qua tối đa hai lần chạm. T001 dùng bộ mẫu v0. T002–T007 dành cho tích hợp hệ thống đích. Bản v0 và bằng chứng UI được theo dõi ở [báo cáo](../../docs/reviews/rms-v0-mobile.md).

## Chuẩn bị

- [x] T001 Chuẩn bị fixture đối chiếu ở `e2e/v0/mobile.spec.ts`. Phiên Lê Thanh Mai tại Thủy lợi ngày 21/11/2026. Báo cáo kỳ 2 hạn 18/11 và kỳ 3 hạn 28/11 cùng liên kết về đề tài nguồn.

## Nền tảng

- [x] T002 Rà kiểu dữ liệu, quyền và hành vi theo [interaction.md](contracts/interaction.md) trong hợp đồng module `packages/api-contracts/home/`. Sinh kiểu dùng ở client sau khi duyệt.

## US1 · P1

- [x] T003 [P] [US1] Chuyển AC-01–04 thành ca nghiệm thu ở `e2e/tests/triage-deadlines.spec.ts` với phiên thật có/ngoài quyền.
- [x] T004 [P] [US1] Áp ràng buộc phạm vi và hành vi ở `apps/backend/src/modules/home/`. Đọc danh sách việc, thứ tự hạn và đích nguồn sau khi áp cấu hình HOME theo vai trò. Máy chủ lấy tenant và người dùng từ phiên. Danh sách rỗng trả tập rỗng, thu hồi quyền kiểm lại tại đích. Theo [data-model.md](data-model.md), kiểm `WorkItem.dueDate`, `WorkItem.id`, `WorkItem.targetId`.
- [x] T005 [US1] Nối kiểu dữ liệu đã sinh và xử lý trạng thái rỗng ở `apps/web/src/features/mobile/DeadlineQueue.tsx`. Dùng dashboardTasks và cùng tập rowVisible, hiển thị số quá hạn và liên kết đến từng đích theo thứ tự hạn.
- [x] T006 [US1] Kiểm RV-38 theo AC-01/02 và bộ dữ liệu biên, cập nhật kết quả thực tế tại `specs/033-mobile-triage-deadlines/quickstart.md`.

## Kiểm tra hồi quy

- [x] T007 Chạy bộ kiểm tích hợp, đối chiếu vai trò và desktop, ghi kết quả ở `docs/reviews/rms-v0-mobile.md`.

T001 → T002 → (T003 song song T004) → T005 → T006 → T007. Có thể bàn giao lát này riêng tại B06. [Quickstart](quickstart.md) · [Plan](plan.md).

Đối chiếu cục bộ ngày 24/11/2026. [Ca tích hợp trang chủ](../../e2e/home/triage-deadlines/acceptance.spec.ts).
