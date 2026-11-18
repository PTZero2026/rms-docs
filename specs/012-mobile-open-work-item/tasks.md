---
story: US-12
feature: B06
review_id: RV-12
status: Draft
updated: 2026-11-18
---

# Tasks · Mở việc cần xử lý trên điện thoại

US-12 · Đợt A · [Plan](plan.md) · [Spec](spec.md). Đường dẫn dưới đây thuộc repo code đích.

## Phase 1 · Chuẩn bị

- [ ] T001 Dựng bộ dữ liệu một hồ sơ cần bổ sung, tài khoản đúng và sai phạm vi, thêm tài khoản ngoài tenant trong `e2e/home/open-work-item/fixtures.ts`.

## Phase 2 · Nền tảng

- [ ] T002 Định nghĩa thao tác mở việc cần xử lý trên điện thoại với đầu vào “Phiên người dùng, danh sách việc, liên kết của thẻ ở màn hình hẹp” và đầu ra “Chuyển tới đúng hồ sơ nguồn, giữ nguyên dữ liệu” trong `packages/api-contracts/home/open-work-item.yaml`; sinh type và kiểm phạm vi theo [hợp đồng](contracts/interaction.md).

## Phase 3 · US1 — Mở việc cần xử lý trên điện thoại

Mục tiêu độc lập: Chủ nhiệm dùng web trên điện thoại để tìm hồ sơ bị trả và mở đúng nơi sửa. Trang chủ chỉ đọc. Dùng TC-01–04 của [quickstart](quickstart.md) để nghiệm thu.

- [ ] T003 [P] [US1] Viết ca US-12.1 / US-12.2 và TC-04 trong `e2e/home/open-work-item/acceptance.spec.ts`; so kết quả với [quickstart](quickstart.md).
- [ ] T004 [P] [US1] Áp ràng buộc [data-model.md](data-model.md) `ResearchProject.id` khi đọc/ghi qua `apps/backend/src/modules/home/open-work-item/data.ts`.
- [ ] T005 [US1] Thực hiện FR-001/002 trong `apps/backend/src/modules/home/open-work-item/service.ts`. Hiển thị thẻ theo trạng thái chuẩn của hồ sơ. Chạm thẻ mở route F01 của đúng hồ sơ; lấy lại quyền tại đích. Trang chủ chỉ đọc. Kiểm nhánh AC-02 theo [quickstart](quickstart.md).
- [ ] T006 [US1] Tích hợp điểm tương tác trong `apps/web/src/features/home/open-work-item/view.tsx`. Hiển thị chuyển tới đúng hồ sơ nguồn, giữ nguyên dữ liệu; hiển thị riêng tình huống người ngoài phạm vi và cho người có quyền quay về dữ liệu nguồn.
- [ ] T007 [US1] Áp dụng kết luận RV-12 cho FR-003 trong `apps/backend/src/modules/home/open-work-item/service.ts` và kiểm TC-03 ở `e2e/home/open-work-item/boundary.spec.ts`. Kiểm quyền khi mở liên kết, hướng người dùng về danh sách đã làm mới.

## Phase 4 · Hồi quy

- [ ] T008 Đối chiếu đủ bốn ca và chạy lại luồng tích hợp với B06, F01, B03. Lưu bằng chứng theo mẫu `e2e/home/open-work-item/review.md`. Đối chiếu thêm AC-03, AC-04, AC-05 trong [B06](../../docs/features/B06-trang-chu/spec.md) ở phần áp dụng cho lát này. Ở 360 và 390 px, chạm thẻ bằng một tay, quay lại danh sách; đối chiếu mã nguồn và trạng thái chưa thay đổi.

## Phụ thuộc và cách giao

T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008. T003 và T004 dùng tệp riêng sau khi chốt giao tiếp. Giao lát US1 với dữ liệu mẫu trước, sau đó chạy lại bằng module thật. Dùng [RV-12](../review-decisions.md#rv-12) để chốt nhánh biên trước khi nghiệm thu.
