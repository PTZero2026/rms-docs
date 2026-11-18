---
story: US-18
feature: F05
review_id: RV-18
status: Draft
updated: 2026-11-18
---

# Tasks · Xác nhận kinh phí được cấp

US-18 · Đợt B · [Plan](plan.md) · [Spec](spec.md). Đường dẫn dưới đây thuộc repo code đích.

## Phase 1 · Chuẩn bị

- [ ] T001 Dựng bộ dữ liệu quyết định giao hiệu lực, hạn mức và tỷ lệ hợp lệ, thêm tài khoản ngoài tenant trong `e2e/budget/budget-allocation/fixtures.ts`.

## Phase 2 · Nền tảng

- [ ] T002 Định nghĩa thao tác xác nhận kinh phí được cấp với đầu vào “Quyết định giao hiệu lực, tổng cấp, tỷ lệ và trần phí” và đầu ra “Tổng cấp, phần phí và kinh phí thực hiện bằng VND” trong `packages/api-contracts/budget/budget-allocation.yaml`; sinh type và kiểm phạm vi theo [hợp đồng](contracts/interaction.md).

## Phase 3 · US1 — Xác nhận kinh phí được cấp

Mục tiêu độc lập: Chuyên viên ghi tổng cấp, phí quản lý và phần được dùng cho nghiên cứu để chủ nhiệm theo dõi số khả dụng. Dùng TC-01–04 của [quickstart](quickstart.md) để nghiệm thu.

- [ ] T003 [P] [US1] Viết ca US-18.1 / US-18.2 và TC-04 trong `e2e/budget/budget-allocation/acceptance.spec.ts`; so kết quả với [quickstart](quickstart.md).
- [ ] T004 [P] [US1] Áp ràng buộc [data-model.md](data-model.md) `BudgetAllocation.managementFeeAmount` khi đọc/ghi qua `apps/backend/src/modules/budget/budget-allocation/data.ts`.
- [ ] T005 [US1] Thực hiện FR-001/002 trong `apps/backend/src/modules/budget/budget-allocation/service.ts`. Tính phí theo F05 BR-10: làm tròn xuống đến đồng rồi lấy mức thấp hơn với trần nếu có. Áp override trong khoảng cho phép, ghi người đổi. Tổng cấp không vượt mức duyệt. Kiểm nhánh AC-02 theo [quickstart](quickstart.md).
- [ ] T006 [US1] Tích hợp điểm tương tác trong `apps/web/src/features/budget/budget-allocation/view.tsx`. Hiển thị tổng cấp, phần phí và kinh phí thực hiện bằng VND; hiển thị riêng tình huống chủ nhiệm và cho người có quyền quay về dữ liệu nguồn.
- [ ] T007 [US1] Áp dụng kết luận RV-18 cho FR-003 trong `apps/backend/src/modules/budget/budget-allocation/service.ts` và kiểm TC-03 ở `e2e/budget/budget-allocation/boundary.spec.ts`. Dùng mức trần trước khi tính phần được dùng, lưu giá trị đã áp dụng để tra lại.

## Phase 4 · Hồi quy

- [ ] T008 Đối chiếu đủ bốn ca và chạy lại luồng tích hợp với F04, F05, B01. Lưu bằng chứng theo mẫu `e2e/budget/budget-allocation/review.md`. Đối chiếu thêm AC-01, AC-07 trong [F05](../../docs/features/F05-quan-ly-kinh-phi/spec.md) ở phần áp dụng cho lát này. Đối chiếu cả mẫu 100 triệu và 300 triệu; thay đổi tỷ lệ chung sau xác nhận phải giữ nguyên khoản đã ghi.

## Phụ thuộc và cách giao

T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008. T003 và T004 dùng tệp riêng sau khi chốt giao tiếp. Giao lát US1 với dữ liệu mẫu trước, sau đó chạy lại bằng module thật. Dùng [RV-18](../review-decisions.md#rv-18) để chốt nhánh biên trước khi nghiệm thu.
