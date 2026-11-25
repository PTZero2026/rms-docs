---
story: US-30
feature: P03
review_id: RV-30
status: Draft
updated: 2026-11-21
---

# Tasks · Ghi giờ giảng từ một sự kiện hợp lệ

US-30 · Đợt C · [Plan](plan.md) · [Spec](spec.md). Đường dẫn dưới đây thuộc repo code đích.

## Phase 1 · Chuẩn bị

- [x] T001 Dựng bộ dữ liệu tenant thử bật P03, một sự kiện đã duyệt và hai phiên bản công thức mẫu có số giờ khác nhau, thêm tài khoản ngoài tenant trong `e2e/teaching-hour/teaching-hours/fixtures.ts`.

## Phase 2 · Nền tảng

- [x] T002 Định nghĩa thao tác ghi giờ giảng từ một sự kiện hợp lệ với đầu vào “Sự kiện hợp lệ, ngày nguồn, công thức hiệu lực và phân bổ” và đầu ra “Dòng giờ theo giảng viên/kỳ và căn cứ tính” trong `packages/api-contracts/teaching-hour/teaching-hours.yaml`; sinh type và kiểm phạm vi theo [hợp đồng](contracts/interaction.md).

## Phase 3 · US1 — Ghi giờ giảng từ một sự kiện hợp lệ

Mục tiêu độc lập: Chuyên viên đối chiếu giờ của một giảng viên với hoạt động nguồn và công thức có hiệu lực của trường. Dùng TC-01–04 của [quickstart](quickstart.md) để nghiệm thu.

- [x] T003 [P] [US1] Viết ca US-30.1 / US-30.2 và TC-04 trong `e2e/teaching-hour/teaching-hours/acceptance.spec.ts`; so kết quả với [quickstart](quickstart.md).
- [x] T004 [P] [US1] Áp ràng buộc [data-model.md](data-model.md) `TeachingHourRequest.sourceOccurredAt` khi đọc/ghi qua `apps/backend/src/modules/teaching-hour/teaching-hours/data.ts`.
- [x] T005 [US1] Thực hiện FR-001/002 trong `apps/backend/src/modules/teaching-hour/teaching-hours/service.ts`. Chọn đúng một công thức có hiệu lực theo sourceOccurredAt. Chốt khóa nguồn khi tạo dòng phân bổ; xử lý lại không nhân giờ. Bù sai lệch bằng dòng điều chỉnh có lý do. Kiểm nhánh AC-02 theo [quickstart](quickstart.md).
- [x] T006 [US1] Tích hợp điểm nhận việc nền trong `apps/backend/src/modules/teaching-hour/teaching-hours/consumer.ts`. Theo dõi đầu ra từ điểm đọc của sổ giờ P03 và lý lịch F08.
- [x] T007 [US1] Áp dụng kết luận RV-30 cho FR-003 trong `apps/backend/src/modules/teaching-hour/teaching-hours/service.ts` và kiểm TC-03 ở `e2e/teaching-hour/teaching-hours/boundary.spec.ts`. Dùng định mức có hiệu lực vào ngày nghiệp vụ của hoạt động nguồn. Khi nhận lại cùng sự kiện đã ghi, giữ nguyên số giờ, kỳ và phân bổ ban đầu. Người có quyền sửa sai bằng bản ghi điều chỉnh có lý do và ghi nhật ký.

## Phase 4 · Hồi quy

- [x] T008 Đối chiếu đủ bốn ca và chạy lại luồng tích hợp với P03, F08, B01. Lưu bằng chứng theo mẫu `e2e/teaching-hour/teaching-hours/review.md`. Đối chiếu thêm AC-01, AC-05, AC-06, AC-08 trong [P03](../../docs/features/P03-quy-doi-gio-giang/spec.md) ở phần áp dụng cho lát này. Dùng một hoạt động ở ranh giới ngày đổi công thức và một yêu cầu gửi lại cùng khóa. Đối chiếu sổ nguồn, kỳ, số giờ và phiên bản công thức.

## Phụ thuộc và cách giao

T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008. T003 và T004 dùng tệp riêng sau khi chốt giao tiếp. Giao lát US1 với dữ liệu mẫu trước, sau đó chạy lại bằng module thật. Dùng [RV-30](../review-decisions.md#rv-30) làm căn cứ đối chiếu số giờ khi nhận lại và khi điều chỉnh.
