---
story: US-03
feature: P01
review_id: RV-03
status: Draft
updated: 2026-11-21
---

# Tasks · Giữ quy trình của hồ sơ đang chạy

US-03 · Đợt A · [Plan](plan.md) · [Spec](spec.md). Đường dẫn dưới đây thuộc repo code đích.

## Phase 1 · Chuẩn bị

- [ ] T001 Dựng bộ dữ liệu một hồ sơ ghim phiên bản 1 và một mẫu phiên bản 2, thêm tài khoản ngoài tenant trong `e2e/workflow/workflow-version/fixtures.ts`.

## Phase 2 · Nền tảng

- [ ] T002 Định nghĩa thao tác giữ quy trình của hồ sơ đang chạy với đầu vào “Mẫu quy trình, phiên bản và các bước có trạng thái chuẩn” và đầu ra “Phiên bản khả dụng cho hồ sơ mới hoặc danh sách bước lỗi” trong `packages/api-contracts/workflow/workflow-version.yaml`; sinh type và kiểm phạm vi theo [hợp đồng](contracts/interaction.md).

## Phase 3 · US1 — Giữ quy trình của hồ sơ đang chạy

Mục tiêu độc lập: Người quản lý quy trình phát hành một phiên bản cho hồ sơ mới để quy chế mới có ngày áp dụng rõ ràng. Dùng TC-01–04 của [quickstart](quickstart.md) để nghiệm thu.

- [ ] T003 [P] [US1] Viết ca US-03.1 / US-03.2 và TC-04 trong `e2e/workflow/workflow-version/acceptance.spec.ts`; so kết quả với [quickstart](quickstart.md).
- [ ] T004 [P] [US1] Áp ràng buộc [data-model.md](data-model.md) `WorkflowInstance.templateId` khi đọc/ghi qua `apps/backend/src/modules/workflow/workflow-version/data.ts`.
- [ ] T005 [US1] Thực hiện FR-001/002 trong `apps/backend/src/modules/workflow/workflow-version/service.ts`. Kiểm trạng thái chuẩn ở từng bước và hai đầu mỗi transition trước khi kích hoạt. Gán template đang hiệu lực khi tạo instance, giữ graph cũ cho instance cũ. Kiểm nhánh AC-02 theo [quickstart](quickstart.md).
- [ ] T006 [US1] Tích hợp điểm tương tác trong `apps/web/src/features/workflow/workflow-version/view.tsx`. Hiển thị phiên bản khả dụng cho hồ sơ mới hoặc danh sách bước lỗi; hiển thị riêng tình huống mẫu có bước thiếu trạng thái chuẩn và cho người có quyền quay về dữ liệu nguồn.
- [ ] T007 [US1] Áp dụng kết luận RV-03 cho FR-003 trong `apps/backend/src/modules/workflow/workflow-version/service.ts` và kiểm TC-03 ở `e2e/workflow/workflow-version/boundary.spec.ts`. Chọn phiên bản đang hiệu lực khi tạo hồ sơ, giữ phiên bản của hồ sơ đã tồn tại.

## Phase 4 · Hồi quy

- [ ] T008 Đối chiếu đủ bốn ca và chạy lại luồng tích hợp với B01, P01. Lưu bằng chứng theo mẫu `e2e/workflow/workflow-version/review.md`. Đối chiếu thêm AC-03, AC-05 trong [P01](../../docs/features/P01-workflow-engine/spec.md) ở phần áp dụng cho lát này. Đọc templateId và bước kế tiếp của cả hai hồ sơ sau khi v2 hiệu lực. Mẫu có cạnh mồ côi cũng phải bị từ chối.

## Phụ thuộc và cách giao

T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008. T003 và T004 dùng tệp riêng sau khi chốt giao tiếp. Giao lát US1 với dữ liệu mẫu trước, sau đó chạy lại bằng module thật. Dùng [RV-03](../review-decisions.md#rv-03) để đối chiếu phiên bản và bước thực tế trong TC-03.
