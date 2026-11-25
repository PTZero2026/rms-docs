---
story: US-20
feature: F07
review_id: RV-20
status: Draft
updated: 2026-11-24
---

# Tasks · Nộp sản phẩm khoa học kèm minh chứng

US-20 · Đợt B · [Plan](plan.md) · [Spec](spec.md). Đường dẫn dưới đây thuộc repo code đích.

## Phase 1 · Chuẩn bị

- [x] T001 Dựng bộ dữ liệu một đề tài đang làm, minh chứng và hai tài khoản, thêm tài khoản ngoài tenant trong `e2e/product/submit-output/fixtures.ts`.

## Phase 2 · Nền tảng

- [x] T002 Định nghĩa thao tác nộp sản phẩm khoa học kèm minh chứng với đầu vào “Đề tài, loại sản phẩm, thông tin công bố, tác giả, minh chứng” và đầu ra “Sản phẩm chờ duyệt gắn đúng đề tài” trong `packages/api-contracts/product/submit-output.yaml`; sinh type và kiểm phạm vi theo [hợp đồng](contracts/interaction.md).

## Phase 3 · US1 — Nộp sản phẩm khoa học kèm minh chứng

Mục tiêu độc lập: Chủ nhiệm khai một sản phẩm thuộc đề tài trong phạm vi để chuyên viên kiểm tra đầu ra cam kết. Dùng TC-01–04 của [quickstart](quickstart.md) để nghiệm thu.

- [x] T003 [P] [US1] Viết ca US-20.1 / US-20.2 và TC-04 trong `e2e/product/submit-output/acceptance.spec.ts`; so kết quả với [quickstart](quickstart.md).
- [x] T004 [P] [US1] Áp ràng buộc [data-model.md](data-model.md) `ResearchOutput.researchProjectId` khi đọc/ghi qua `apps/backend/src/modules/product/submit-output/data.ts`.
- [x] T005 [US1] Thực hiện FR-001/002 trong `apps/backend/src/modules/product/submit-output/service.ts`. Kiểm loại/tệp bắt buộc cùng quyền liên kết đề tài ngay lúc gửi. Chỉ đưa vào hàng chờ duyệt sau khi các điều kiện này đạt. Kiểm nhánh AC-02 theo [quickstart](quickstart.md).
- [x] T006 [US1] Tích hợp điểm tương tác trong `apps/web/src/features/product/submit-output/view.tsx`. Hiển thị sản phẩm chờ duyệt gắn đúng đề tài; hiển thị riêng tình huống thiếu minh chứng bắt buộc và cho người có quyền quay về dữ liệu nguồn.
- [x] T007 [US1] Áp dụng kết luận RV-20 cho FR-003 trong `apps/backend/src/modules/product/submit-output/service.ts` và kiểm TC-03 ở `e2e/product/submit-output/boundary.spec.ts`. Kiểm lại quyền sử dụng tệp tại lúc gửi, yêu cầu thay tệp khi quyền hết hiệu lực.

## Phase 4 · Hồi quy

- [x] T008 Đối chiếu đủ bốn ca và chạy lại luồng tích hợp với F07, B03. Lưu bằng chứng theo mẫu `e2e/product/submit-output/review.md`. Đối chiếu thêm AC-01, AC-05, AC-07 trong [F07](../../docs/features/F07-san-pham-khoa-hoc/spec.md) ở phần áp dụng cho lát này. Thử ba bộ: đủ minh chứng, thiếu tệp, tệp còn nhưng đã thu quyền; kiểm cả hàng chờ lẫn nội dung nháp.

## Phụ thuộc và cách giao

T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008. T003 và T004 dùng tệp riêng sau khi chốt giao tiếp. Giao lát US1 với dữ liệu mẫu trước, sau đó chạy lại bằng module thật. Dùng [RV-20](../review-decisions.md#rv-20) để đối chiếu nhánh biên khi nghiệm thu.

[Đối chiếu cục bộ và đường dẫn mã kiểm thực tế](../../e2e/product/submit-output/review.md). Fixture, ca cạnh tranh và ca trình duyệt dùng chung theo vòng đời đề tài.
