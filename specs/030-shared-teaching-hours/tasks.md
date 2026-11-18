---
story: US-30
feature: P03
review_id: RV-30
status: Draft
updated: 2026-11-18
---

# Tasks · Ghi giờ giảng từ một sự kiện hợp lệ

US-30 · Đợt C · [Plan](plan.md) · [Spec](spec.md). Đường dẫn dưới đây thuộc repo code đích.

## Phase 1 · Chuẩn bị

- [ ] T001 Dựng bộ dữ liệu tenant bật P03, một sự kiện đã duyệt, một công thức do trường xác nhận, thêm tài khoản ngoài tenant trong `e2e/teaching-hour/teaching-hours/fixtures.ts`.

## Phase 2 · Nền tảng

- [ ] T002 Định nghĩa thao tác ghi giờ giảng từ một sự kiện hợp lệ với đầu vào “Sự kiện hợp lệ, ngày nguồn, công thức hiệu lực và phân bổ” và đầu ra “Dòng giờ theo giảng viên/kỳ và căn cứ tính” trong `packages/api-contracts/teaching-hour/teaching-hours.yaml`; sinh type và kiểm phạm vi theo [hợp đồng](contracts/interaction.md).

## Phase 3 · US1 — Ghi giờ giảng từ một sự kiện hợp lệ

Mục tiêu độc lập: Chuyên viên đối chiếu giờ của một giảng viên với hoạt động nguồn và công thức có hiệu lực của trường. Dùng TC-01–04 của [quickstart](quickstart.md) để nghiệm thu.

- [ ] T003 [P] [US1] Viết ca US-30.1 / US-30.2 và TC-04 trong `e2e/teaching-hour/teaching-hours/acceptance.spec.ts`; so kết quả với [quickstart](quickstart.md).
- [ ] T004 [P] [US1] Áp ràng buộc [data-model.md](data-model.md) `TeachingHourRequest.sourceOccurredAt` khi đọc/ghi qua `apps/backend/src/modules/teaching-hour/teaching-hours/data.ts`.
- [ ] T005 [US1] Thực hiện FR-001/002 trong `apps/backend/src/modules/teaching-hour/teaching-hours/service.ts`. Chọn đúng một công thức có hiệu lực theo sourceOccurredAt. Chốt khóa nguồn khi tạo dòng phân bổ; xử lý lại không nhân giờ. Bù sai lệch bằng dòng điều chỉnh có lý do. Kiểm nhánh AC-02 theo [quickstart](quickstart.md).
- [ ] T006 [US1] Tích hợp điểm nhận việc nền trong `apps/backend/src/modules/teaching-hour/teaching-hours/consumer.ts`. Theo dõi đầu ra từ điểm đọc của sổ giờ P03 và lý lịch F08.
- [ ] T007 [US1] Áp dụng kết luận RV-30 cho FR-003 trong `apps/backend/src/modules/teaching-hour/teaching-hours/service.ts` và kiểm TC-03 ở `e2e/teaching-hour/teaching-hours/boundary.spec.ts`. Dùng ngày sự kiện gốc, khóa nguồn và phân bổ theo công thức của kỳ; sửa sai bằng điều chỉnh có lý do.

## Phase 4 · Hồi quy

- [ ] T008 Đối chiếu đủ bốn ca và chạy lại luồng tích hợp với P03, F08, B01. Lưu bằng chứng theo mẫu `e2e/teaching-hour/teaching-hours/review.md`. Đối chiếu thêm AC-01, AC-05 trong [P03](../../docs/features/P03-quy-doi-gio-giang/spec.md) ở phần áp dụng cho lát này. Dùng một hoạt động ở ranh giới ngày đổi công thức và một yêu cầu gửi lại cùng khóa. Đối chiếu sổ nguồn, kỳ, số giờ và phiên bản công thức.

## Phụ thuộc và cách giao

T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008. T003 và T004 dùng tệp riêng sau khi chốt giao tiếp. Giao lát US1 với dữ liệu mẫu trước, sau đó chạy lại bằng module thật. Dùng [RV-30](../review-decisions.md#rv-30) để chốt nhánh biên trước khi nghiệm thu.
