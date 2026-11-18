---
story: US-16
feature: B04
review_id: RV-16
status: Draft
updated: 2026-11-18
---

# Tasks · Nhắc hạn đúng một lần theo mốc

US-16 · Đợt B · [Plan](plan.md) · [Spec](spec.md). Đường dẫn dưới đây thuộc repo code đích.

## Phase 1 · Chuẩn bị

- [ ] T001 Dựng bộ dữ liệu một kỳ báo cáo đến mốc nhắc, đồng hồ giả lập, thêm tài khoản ngoài tenant trong `e2e/notification/deadline-reminder/fixtures.ts`.

## Phase 2 · Nền tảng

- [ ] T002 Định nghĩa thao tác nhắc hạn đúng một lần theo mốc với đầu vào “Đồng hồ nghiệp vụ, mốc nhắc, kỳ báo cáo, người nhận” và đầu ra “Một thông báo PROGRESS_REPORT_DUE_SOON theo khóa” trong `packages/api-contracts/notification/deadline-reminder.yaml`; sinh type và kiểm phạm vi theo [hợp đồng](contracts/interaction.md).

## Phase 3 · US1 — Nhắc hạn đúng một lần theo mốc

Mục tiêu độc lập: Chủ nhiệm nhận nhắc khi đến mốc cấu hình để kịp chuẩn bị báo cáo, dù tác vụ gửi được chạy lại. Dùng TC-01–04 của [quickstart](quickstart.md) để nghiệm thu.

- [ ] T003 [P] [US1] Viết ca US-16.1 / US-16.2 và TC-04 trong `e2e/notification/deadline-reminder/acceptance.spec.ts`; so kết quả với [quickstart](quickstart.md).
- [ ] T004 [P] [US1] Áp ràng buộc [data-model.md](data-model.md) `Notification.recipientId` khi đọc/ghi qua `apps/backend/src/modules/notification/deadline-reminder/data.ts`.
- [ ] T005 [US1] Thực hiện FR-001/002 trong `apps/backend/src/modules/notification/deadline-reminder/service.ts`. Chọn các kỳ chờ nộp chạm mốc N. Giữ khóa chống trùng bền qua chạy lại. Theo dõi lỗi email độc lập với thông báo trong ứng dụng. Kiểm nhánh AC-02 theo [quickstart](quickstart.md).
- [ ] T006 [US1] Tích hợp điểm nhận việc nền trong `apps/backend/src/modules/notification/deadline-reminder/consumer.ts`. Theo dõi đầu ra từ điểm đọc của hộp thông báo B04.
- [ ] T007 [US1] Áp dụng kết luận RV-16 cho FR-003 trong `apps/backend/src/modules/notification/deadline-reminder/service.ts` và kiểm TC-03 ở `e2e/notification/deadline-reminder/boundary.spec.ts`. Dùng một khóa theo tenant, đề tài, kỳ, người nhận và mốc; thử lại việc giao trên cùng thông báo.

## Phase 4 · Hồi quy

- [ ] T008 Đối chiếu đủ bốn ca và chạy lại luồng tích hợp với B04, F04, B01. Lưu bằng chứng theo mẫu `e2e/notification/deadline-reminder/review.md`. Đối chiếu thêm AC-07 trong [B04](../../docs/features/B04-thong-bao/spec.md) ở phần áp dụng cho lát này. Cố định đồng hồ tại mốc N, chạy hai lần với cùng kỳ, xem một thông báo đúng người; kiểm ngày ngoài mốc không phát sinh thêm.

## Phụ thuộc và cách giao

T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008. T003 và T004 dùng tệp riêng sau khi chốt giao tiếp. Giao lát US1 với dữ liệu mẫu trước, sau đó chạy lại bằng module thật. Dùng [RV-16](../review-decisions.md#rv-16) để chốt nhánh biên trước khi nghiệm thu.
