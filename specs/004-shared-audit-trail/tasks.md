---
story: US-04
feature: P02
review_id: RV-04
status: Draft
updated: 2026-11-21
---

# Tasks · Tra căn cứ chuyển bước

US-04 · Đợt A · [Plan](plan.md) · [Spec](spec.md). Đường dẫn dưới đây thuộc repo code đích.

## Phase 1 · Chuẩn bị

- [ ] T001 Dựng bộ dữ liệu một chuyển bước thành công và hai người khác phạm vi, thêm tài khoản ngoài tenant trong `e2e/audit/audit-trail/fixtures.ts`.

## Phase 2 · Nền tảng

- [ ] T002 Định nghĩa thao tác tra căn cứ chuyển bước với đầu vào “Định danh đề tài và khoảng thời gian cần tra” và đầu ra “Danh sách sự kiện trong quyền, tác nhân, thời điểm, hành động” trong `packages/api-contracts/audit/audit-trail.yaml`; sinh type và kiểm phạm vi theo [hợp đồng](contracts/interaction.md).

## Phase 3 · US1 — Tra căn cứ chuyển bước

Mục tiêu độc lập: Chuyên viên có quyền mở lịch sử một đề tài để xác định ai chuyển bước và vào thời điểm nào. Dùng TC-01–04 của [quickstart](quickstart.md) để nghiệm thu.

- [ ] T003 [P] [US1] Viết ca US-04.1 / US-04.2 và TC-04 trong `e2e/audit/audit-trail/acceptance.spec.ts`; so kết quả với [quickstart](quickstart.md).
- [ ] T004 [P] [US1] Áp ràng buộc [data-model.md](data-model.md) `AuditLog.targetId` khi đọc/ghi qua `apps/backend/src/modules/audit/audit-trail/data.ts`.
- [ ] T005 [US1] Thực hiện FR-001/002 trong `apps/backend/src/modules/audit/audit-trail/service.ts`. Tra theo tenant, loại và ID đối tượng. Lọc quyền trước phân trang. Lưu người thực hiện và đơn vị của họ tại thời điểm chuyển bước. Khi trả sự kiện cho người còn quyền, dùng thông tin đã lưu đó. Kiểm nhánh AC-02 theo [quickstart](quickstart.md).
- [ ] T006 [US1] Tích hợp điểm tương tác trong `apps/web/src/features/audit/audit-trail/view.tsx`. Hiển thị danh sách sự kiện trong quyền, tác nhân, thời điểm, hành động; hiển thị riêng tình huống người ngoài phạm vi và cho người có quyền quay về dữ liệu nguồn.
- [ ] T007 [US1] Áp dụng kết luận RV-04 cho FR-003 trong `apps/backend/src/modules/audit/audit-trail/service.ts` và kiểm TC-03 ở `e2e/audit/audit-trail/boundary.spec.ts`. Kiểm quyền trên đề tài ở lúc đọc, giữ nguyên tác nhân và đơn vị của sự kiện gốc.

## Phase 4 · Hồi quy

- [ ] T008 Đối chiếu đủ bốn ca và chạy lại luồng tích hợp với P02, B03. Lưu bằng chứng theo mẫu `e2e/audit/audit-trail/review.md`. Đối chiếu thêm AC-01, AC-02, AC-05 trong [P02](../../docs/features/P02-audit/spec.md) ở phần áp dụng cho lát này. Đối chiếu một giao dịch thành công với một giao dịch rollback: chỉ giao dịch thành công có sự kiện chuyển bước.

## Phụ thuộc và cách giao

T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008. T003 và T004 dùng tệp riêng sau khi chốt giao tiếp. Giao lát US1 với dữ liệu mẫu trước, sau đó chạy lại bằng module thật. Dùng [RV-04](../review-decisions.md#rv-04) để đối chiếu cả hai lượt mở liên kết trong TC-03.
