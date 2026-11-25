---
story: US-14
feature: F04
review_id: RV-14
status: Draft
updated: 2026-11-24
---

# Tasks · Giao thực hiện đề tài đã duyệt

US-14 · Đợt B · [Plan](plan.md) · [Spec](spec.md). Đường dẫn dưới đây thuộc repo code đích.

## Phase 1 · Chuẩn bị

- [x] T001 Dựng bộ dữ liệu đề tài APPROVED và mẫu hồ sơ giao, thêm tài khoản ngoài tenant trong `e2e/progress/assign-project/fixtures.ts`.

## Phase 2 · Nền tảng

- [x] T002 Định nghĩa thao tác giao thực hiện đề tài đã duyệt với đầu vào “Quyết định/hợp đồng, ngân sách, kỳ thực hiện, tệp căn cứ” và đầu ra “Hồ sơ giao EFFECTIVE và đề tài IN_PROGRESS” trong `packages/api-contracts/progress/assign-project.yaml`; sinh type và kiểm phạm vi theo [hợp đồng](contracts/interaction.md).

## Phase 3 · US1 — Giao thực hiện đề tài đã duyệt

Mục tiêu độc lập: Chuyên viên xác nhận căn cứ giao để từ một quyết định phê duyệt tạo hồ sơ thực hiện có chủ nhiệm và kinh phí duyệt. Dùng TC-01–04 của [quickstart](quickstart.md) để nghiệm thu.

- [x] T003 [P] [US1] Viết ca US-14.1 / US-14.2 và TC-04 trong `e2e/progress/assign-project/acceptance.spec.ts`; so kết quả với [quickstart](quickstart.md).
- [x] T004 [P] [US1] Áp ràng buộc [data-model.md](data-model.md) `ProjectAssignment.approvedBudget` khi đọc/ghi qua `apps/backend/src/modules/progress/assign-project/data.ts`.
- [x] T005 [US1] Thực hiện FR-001/002 trong `apps/backend/src/modules/progress/assign-project/service.ts`. Chỉ chuyên viên có quyền mới xác nhận. Đánh dấu hồ sơ giao EFFECTIVE cùng lần chuyển IN_PROGRESS, giữ bản tham chiếu cho F05. Kiểm nhánh AC-02 theo [quickstart](quickstart.md).
- [x] T006 [US1] Tích hợp điểm tương tác trong `apps/web/src/features/progress/assign-project/view.tsx`. Hiển thị hồ sơ giao EFFECTIVE và đề tài IN_PROGRESS; hiển thị riêng tình huống thiếu căn cứ bắt buộc và cho người có quyền quay về dữ liệu nguồn.
- [x] T007 [US1] Áp dụng kết luận RV-14 cho FR-003 trong `apps/backend/src/modules/progress/assign-project/service.ts` và kiểm TC-03 ở `e2e/progress/assign-project/boundary.spec.ts`. Yêu cầu tệp căn cứ đọc được theo phạm vi đề tài trước khi xác nhận giao.

## Phase 4 · Hồi quy

- [x] T008 Đối chiếu đủ bốn ca và chạy lại luồng tích hợp với F03, F04, P01. Lưu bằng chứng theo mẫu `e2e/progress/assign-project/review.md`. Đối chiếu thêm AC-01, AC-14 trong [F04](../../docs/features/F04-quan-ly-tien-do/spec.md) ở phần áp dụng cho lát này. Lần lượt rút số quyết định, ngân sách hoặc tệp trước khi xác nhận. Mỗi lần nêu đúng trường thiếu và đề tài còn APPROVED.

## Phụ thuộc và cách giao

T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008. T003 và T004 dùng tệp riêng sau khi chốt giao tiếp. Giao lát US1 với dữ liệu mẫu trước, sau đó chạy lại bằng module thật. Dùng [RV-14](../review-decisions.md#rv-14) để đối chiếu nhánh biên khi nghiệm thu.
