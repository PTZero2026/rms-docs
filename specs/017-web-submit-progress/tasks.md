---
story: US-17
feature: F04
review_id: RV-17
status: Draft
updated: 2026-11-24
---

# Tasks · Nộp báo cáo tiến độ

US-17 · Đợt B · [Plan](plan.md) · [Spec](spec.md). Đường dẫn dưới đây thuộc repo code đích.

## Phase 1 · Chuẩn bị

- [x] T001 Dựng bộ dữ liệu kỳ chờ nộp của đề tài đang làm và đề tài tạm dừng, thêm tài khoản ngoài tenant trong `e2e/progress/submit-progress/fixtures.ts`.

## Phase 2 · Nền tảng

- [x] T002 Định nghĩa thao tác nộp báo cáo tiến độ với đầu vào “Báo cáo chờ, nội dung và tệp, thời điểm nhận” và đầu ra “Báo cáo SUBMITTED, dấu trễ và giờ nhận” trong `packages/api-contracts/progress/submit-progress.yaml`; sinh type và kiểm phạm vi theo [hợp đồng](contracts/interaction.md).

## Phase 3 · US1 — Nộp báo cáo tiến độ

Mục tiêu độc lập: Chủ nhiệm đính báo cáo của kỳ và nộp để chuyên viên theo dõi được cả thời điểm nộp trễ. Dùng TC-01–04 của [quickstart](quickstart.md) để nghiệm thu.

- [x] T003 [P] [US1] Viết ca US-17.1 / US-17.2 và TC-04 trong `e2e/progress/submit-progress/acceptance.spec.ts`; so kết quả với [quickstart](quickstart.md).
- [x] T004 [P] [US1] Áp ràng buộc [data-model.md](data-model.md) `ProgressReport.submittedAt` khi đọc/ghi qua `apps/backend/src/modules/progress/submit-progress/data.ts`.
- [x] T005 [US1] Thực hiện FR-001/002 trong `apps/backend/src/modules/progress/submit-progress/service.ts`. So submittedAt với dueDate theo giờ nghiệp vụ. Quá hạn vẫn nhận và đánh dấu trễ; kiểm lại trạng thái đề tài ngay trước khi ghi. Kiểm nhánh AC-02 theo [quickstart](quickstart.md).
- [x] T006 [US1] Tích hợp điểm tương tác trong `apps/web/src/features/progress/submit-progress/view.tsx`. Hiển thị báo cáo SUBMITTED, dấu trễ và giờ nhận; hiển thị riêng tình huống đề tài tạm dừng và cho người có quyền quay về dữ liệu nguồn.
- [x] T007 [US1] Áp dụng kết luận RV-17 cho FR-003 trong `apps/backend/src/modules/progress/submit-progress/service.ts` và kiểm TC-03 ở `e2e/progress/submit-progress/boundary.spec.ts`. Nhận hồ sơ, ghi giờ và nhãn trễ, chặn khi đề tài tạm dừng.

## Phase 4 · Hồi quy

- [x] T008 Đối chiếu đủ bốn ca và chạy lại luồng tích hợp với F04, B04. Lưu bằng chứng theo mẫu `e2e/progress/submit-progress/review.md`. Đối chiếu thêm AC-03, AC-08, AC-09 trong [F04](../../docs/features/F04-quan-ly-tien-do/spec.md) ở phần áp dụng cho lát này. Thử ngay tại hạn và sau hạn một giây trên đề tài đang làm, sau đó thử cùng dữ liệu khi SUSPENDED.

## Phụ thuộc và cách giao

T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008. T003 và T004 dùng tệp riêng sau khi chốt giao tiếp. Giao lát US1 với dữ liệu mẫu trước, sau đó chạy lại bằng module thật. Dùng [RV-17](../review-decisions.md#rv-17) để đối chiếu nhánh biên khi nghiệm thu.
