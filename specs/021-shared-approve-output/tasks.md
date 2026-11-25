---
story: US-21
feature: F07
review_id: RV-21
status: Draft
updated: 2026-11-24
---

# Tasks · Duyệt sản phẩm để tính vào cam kết

US-21 · Đợt B · [Plan](plan.md) · [Spec](spec.md). Đường dẫn dưới đây thuộc repo code đích.

## Phase 1 · Chuẩn bị

- [x] T001 Dựng bộ dữ liệu một sản phẩm đang chờ và cam kết cùng loại, thêm tài khoản ngoài tenant trong `e2e/product/approve-output/fixtures.ts`.

## Phase 2 · Nền tảng

- [x] T002 Định nghĩa thao tác duyệt sản phẩm để tính vào cam kết với đầu vào “Sản phẩm chờ duyệt, chứng cứ và cam kết theo loại” và đầu ra “Người duyệt, giờ duyệt, số đầu ra được tính” trong `packages/api-contracts/product/approve-output.yaml`; sinh type và kiểm phạm vi theo [hợp đồng](contracts/interaction.md).

## Phase 3 · US1 — Duyệt sản phẩm để tính vào cam kết

Mục tiêu độc lập: Chuyên viên duyệt một sản phẩm hợp lệ để hệ thống phản ánh đúng số sản phẩm đạt theo loại. Dùng TC-01–04 của [quickstart](quickstart.md) để nghiệm thu.

- [x] T003 [P] [US1] Viết ca US-21.1 / US-21.2 và TC-04 trong `e2e/product/approve-output/acceptance.spec.ts`; so kết quả với [quickstart](quickstart.md).
- [x] T004 [P] [US1] Áp ràng buộc [data-model.md](data-model.md) `ResearchOutput.approvalStatus` khi đọc/ghi qua `apps/backend/src/modules/product/approve-output/data.ts`.
- [x] T005 [US1] Thực hiện FR-001/002 trong `apps/backend/src/modules/product/approve-output/service.ts`. Từ chối người chỉ có quyền kê khai. Khi duyệt, khóa trường chính và đếm theo ID, cho F04/F06 đọc cùng số đạt. Kiểm nhánh AC-02 theo [quickstart](quickstart.md).
- [x] T006 [US1] Tích hợp điểm tương tác trong `apps/web/src/features/product/approve-output/view.tsx`. Hiển thị người duyệt, giờ duyệt, số đầu ra được tính; hiển thị riêng tình huống chủ nhiệm chỉ có quyền kê khai và cho người có quyền quay về dữ liệu nguồn.
- [x] T007 [US1] Áp dụng kết luận RV-21 cho FR-003 trong `apps/backend/src/modules/product/approve-output/service.ts` và kiểm TC-03 ở `e2e/product/approve-output/boundary.spec.ts`. Tổng hợp theo định danh sản phẩm đã duyệt, độc lập số lần gửi lệnh.

## Phase 4 · Hồi quy

- [x] T008 Đối chiếu đủ bốn ca và chạy lại luồng tích hợp với F07, F04, F06. Lưu bằng chứng theo mẫu `e2e/product/approve-output/review.md`. Đối chiếu thêm AC-03, AC-08, AC-11 trong [F07](../../docs/features/F07-san-pham-khoa-hoc/spec.md) ở phần áp dụng cho lát này. Dùng cam kết hai bài; duyệt lại cùng một bài vẫn chỉ đạt một trên hai.

## Phụ thuộc và cách giao

T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008. T003 và T004 dùng tệp riêng sau khi chốt giao tiếp. Giao lát US1 với dữ liệu mẫu trước, sau đó chạy lại bằng module thật. Dùng [RV-21](../review-decisions.md#rv-21) để đối chiếu nhánh biên khi nghiệm thu.

[Đối chiếu cục bộ và đường dẫn mã kiểm thực tế](../../e2e/product/submit-output/review.md). Fixture, ca cạnh tranh và ca trình duyệt dùng chung theo vòng đời đề tài.
