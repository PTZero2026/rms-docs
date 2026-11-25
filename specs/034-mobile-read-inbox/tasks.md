---
id: US-34
feature: B04
epic: E0
channel: mobile
review_id: RV-39
status: Draft
updated: 2026-11-24
---

# Tasks · Đọc lần lượt tin cá nhân chưa đọc

Một story US1, mục tiêu độc lập: Từ danh sách chưa đọc có hai tin, mở một tin rồi quay lại thấy đúng một tin chưa đọc. T001 dùng bộ mẫu v0. T002–T007 dành cho tích hợp hệ thống đích. Bản v0 và bằng chứng UI được theo dõi ở [báo cáo](../../docs/reviews/rms-v0-mobile.md).

## Chuẩn bị

- [x] T001 Chuẩn bị fixture đối chiếu ở `e2e/v0/mobile.spec.ts`. Hai tin IN_APP chưa đọc của Mai, một tin từ kỳ nhận và một từ báo cáo. Mở B04 bằng phiên Mai và đối chiếu với hộp thư người nhận khác.

## Nền tảng

- [x] T002 Rà kiểu dữ liệu, quyền và hành vi theo [interaction.md](contracts/interaction.md) trong hợp đồng module `packages/api-contracts/notification/`. Sinh kiểu dùng ở client sau khi duyệt.

## US1 · P1

- [x] T003 [P] [US1] Chuyển AC-01–04 thành ca nghiệm thu ở `e2e/tests/read-inbox.spec.ts` với phiên thật có/ngoài quyền.
- [x] T004 [P] [US1] Áp ràng buộc phạm vi và hành vi ở `apps/backend/src/modules/notification/`. Lấy hộp thư trong phạm vi người nhận. Ghi READ có điều kiện theo tenant, người nhận và id, lặp lại cho cùng kết quả. Truy cập id ngoài phạm vi trả lỗi chung. Quyền mở hồ sơ đích kiểm độc lập. Theo [data-model.md](data-model.md), kiểm `Notification.recipientId`, `Notification.tenantId`, `Notification.status`.
- [x] T005 [US1] Nối kiểu dữ liệu đã sinh và xử lý trạng thái rỗng ở `apps/web/src/features/platform/Notifications.tsx`. Ràng buộc nguồn hộp thư theo inbox, lưu bộ lọc trong route và đánh dấu đúng tin khi mở. Kiểm lại người nhận ở thao tác ghi.
- [x] T006 [US1] Kiểm RV-39 theo AC-01/02/03 và bộ dữ liệu biên, cập nhật kết quả thực tế tại `specs/034-mobile-read-inbox/quickstart.md`.

## Kiểm tra hồi quy

- [x] T007 Chạy bộ kiểm tích hợp, đối chiếu vai trò và desktop, ghi kết quả ở `docs/reviews/rms-v0-mobile.md`.

T001 → T002 → (T003 song song T004) → T005 → T006 → T007. Có thể bàn giao lát này riêng tại B04. [Quickstart](quickstart.md) · [Plan](plan.md).

Bằng chứng tích hợp cục bộ ngày 24/11/2026 nằm ở [báo cáo worker và hộp thư](../../e2e/notification/deadline-reminder/review.md). Ca quyền/nhận tin dùng chung fixture nguồn tại backend và luồng trình duyệt trong cùng thư mục báo cáo.
