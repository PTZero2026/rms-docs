---
story: US-24
feature: F05
review_id: RV-24
status: Draft
updated: 2026-11-18
---

# Tasks · Quyết toán và đóng hồ sơ

US-24 · Đợt B · [Plan](plan.md) · [Spec](spec.md). Đường dẫn dưới đây thuộc repo code đích.

## Phase 1 · Chuẩn bị

- [ ] T001 Dựng bộ dữ liệu đề tài PASSED, kịch bản F05 cơ bản, điều kiện F06 AC-10 cần PO xác định trước khi giao, thêm tài khoản ngoài tenant trong `e2e/budget/close-project/fixtures.ts`.

## Phase 2 · Nền tảng

- [ ] T002 Định nghĩa thao tác quyết toán và đóng hồ sơ với đầu vào “Hồ sơ PASSED, người quyết toán, kết quả rà và sai lệch nếu đã có” và đầu ra “Hồ sơ COMPLETED, sổ bị khóa, nhật ký quyết toán” trong `packages/api-contracts/budget/close-project.yaml`; sinh type và kiểm phạm vi theo [hợp đồng](contracts/interaction.md).

## Phase 3 · US1 — Quyết toán và đóng hồ sơ

Mục tiêu độc lập: Chuyên viên khóa sổ theo dõi kinh phí của một đề tài nghiệm thu đạt để ghi nhận hoàn thành. Dùng TC-01–04 của [quickstart](quickstart.md) để nghiệm thu.

- [ ] T003 [P] [US1] Viết ca US-24.1 / US-24.2 và TC-04 trong `e2e/budget/close-project/acceptance.spec.ts`; so kết quả với [quickstart](quickstart.md).
- [ ] T004 [P] [US1] Áp ràng buộc [data-model.md](data-model.md) `ResearchProject.status` khi đọc/ghi qua `apps/backend/src/modules/budget/close-project/data.ts`.
- [ ] T005 [US1] Thực hiện FR-001/002 trong `apps/backend/src/modules/budget/close-project/service.ts`. Một lệnh đóng duy nhất qua dịch vụ miền kiểm quyết toán và quyền. Lưu khóa kinh phí, trạng thái COMPLETED và audit nguyên tử. Ghi kết quả rà thủ công hoặc căn cứ chặn theo cấu hình đã duyệt. Cổng quyết định RV-24 áp dụng trước khi sửa luồng đóng sổ.
- [ ] T006 [US1] Tích hợp điểm tương tác trong `apps/web/src/features/budget/close-project/view.tsx`. Hiển thị hồ sơ COMPLETED, sổ bị khóa, nhật ký quyết toán; hiển thị riêng tình huống chủ nhiệm và cho người có quyền quay về dữ liệu nguồn.
- [ ] T007 [US1] Áp dụng kết luận RV-24 cho FR-003 trong `apps/backend/src/modules/budget/close-project/service.ts` và kiểm TC-03 ở `e2e/budget/close-project/boundary.spec.ts`. Khuyến nghị rà thủ công theo F05 BR-07 cho pilot. Khi có dữ liệu đối soát và còn MISMATCHED, F06 AC-10 chặn. PO cùng tài chính phải thống nhất hai spec trước khi giao task chuyển trạng thái.

## Phase 4 · Hồi quy

- [ ] T008 Đối chiếu đủ bốn ca và chạy lại luồng tích hợp với F05, F06, P01, P02. Lưu bằng chứng theo mẫu `e2e/budget/close-project/review.md`. Đối chiếu thêm AC-05, AC-07 trong [F05](../../docs/features/F05-quan-ly-kinh-phi/spec.md) ở phần áp dụng cho lát này. Thử khóa ở đơn vị cơ bản, chặn khi đã biết MISMATCHED và gửi lại sau khi thành công. Kiểm mọi lối sửa/xóa chi sau khóa.

## Phụ thuộc và cách giao

T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008. T003 và T004 dùng tệp riêng sau khi chốt giao tiếp. Giao lát US1 với dữ liệu mẫu trước, sau đó chạy lại bằng module thật. Hoãn thay đổi trạng thái thật ở T005/T007 cho tới khi PO và tài chính thống nhất F05/F06.
