---
story: US-19
feature: F05
review_id: RV-19
status: Draft
updated: 2026-11-24
---

# Tasks · Ghi khoản chi kèm chứng từ

US-19 · Đợt B · [Plan](plan.md) · [Spec](spec.md). Đường dẫn dưới đây thuộc repo code đích.

## Phase 1 · Chuẩn bị

- [x] T001 Dựng bộ dữ liệu đề tài đang thực hiện, còn 2 triệu đồng, thêm tài khoản ngoài tenant trong `e2e/budget/record-expense/fixtures.ts`.

## Phase 2 · Nền tảng

- [x] T002 Định nghĩa thao tác ghi khoản chi kèm chứng từ với đầu vào “Đề tài, số VND nguyên, ngày chi, mô tả và tệp nếu có” và đầu ra “Khoản chi, số dư và cảnh báo vượt” trong `packages/api-contracts/budget/record-expense.yaml`; sinh type và kiểm phạm vi theo [hợp đồng](contracts/interaction.md).

## Phase 3 · US1 — Ghi khoản chi kèm chứng từ

Mục tiêu độc lập: Chủ nhiệm ghi khoản chi VND với ngày và minh chứng. Hệ thống tính số còn lại và cảnh báo khi vượt kinh phí thực hiện. Dùng TC-01–04 của [quickstart](quickstart.md) để nghiệm thu.

- [x] T003 [P] [US1] Viết ca US-19.1 / US-19.2 và TC-04 trong `e2e/budget/record-expense/acceptance.spec.ts`; so kết quả với [quickstart](quickstart.md).
- [x] T004 [P] [US1] Áp ràng buộc [data-model.md](data-model.md) `BudgetTransaction.amount` khi đọc/ghi qua `apps/backend/src/modules/budget/record-expense/data.ts`.
- [x] T005 [US1] Thực hiện FR-001/002 trong `apps/backend/src/modules/budget/record-expense/service.ts`. Chỉ cho chủ nhiệm ghi vào đề tài đang thực hiện của mình. Tính lại số dư sau lưu; chứng từ theo quyền của đề tài. Vượt ngân sách phát cảnh báo. Kiểm nhánh AC-02 theo [quickstart](quickstart.md).
- [x] T006 [US1] Tích hợp điểm tương tác trong `apps/web/src/features/budget/record-expense/view.tsx`. Hiển thị khoản chi, số dư và cảnh báo vượt; hiển thị riêng tình huống số tiền bằng 0 và cho người có quyền quay về dữ liệu nguồn.
- [x] T007 [US1] Áp dụng kết luận RV-19 cho FR-003 trong `apps/backend/src/modules/budget/record-expense/service.ts` và kiểm TC-03 ở `e2e/budget/record-expense/boundary.spec.ts`. Lưu khoản hợp lệ, hiển thị số vượt và số dư mới, để chuyên viên rà khi đóng.

## Phase 4 · Hồi quy

- [x] T008 Đối chiếu đủ bốn ca và chạy lại luồng tích hợp với F05, B03. Lưu bằng chứng theo mẫu `e2e/budget/record-expense/review.md`. Đối chiếu thêm AC-02, AC-04, AC-06 trong [F05](../../docs/features/F05-quan-ly-kinh-phi/spec.md) ở phần áp dụng cho lát này. So sổ chi trước và sau ba mức: 0, vừa hết số dư, vượt 1 triệu. Sau COMPLETED thử sửa dòng đã ghi.

## Phụ thuộc và cách giao

T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008. T003 và T004 dùng tệp riêng sau khi chốt giao tiếp. Giao lát US1 với dữ liệu mẫu trước, sau đó chạy lại bằng module thật. Dùng [RV-19](../review-decisions.md#rv-19) để đối chiếu nhánh biên khi nghiệm thu.

[Đối chiếu cục bộ](../../e2e/budget/budget-allocation/review.md). Ba lát dùng chung fixture giao đề tài và bộ chạy xuyên sổ để so được số dư trước và sau cùng một thao tác.
