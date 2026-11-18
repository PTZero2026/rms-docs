---
story: US-01
feature: B03
review_id: RV-01
status: Draft
updated: 2026-11-18
---

# Tasks · Khóa tài khoản của người rời đơn vị

US-01 · Đợt A · [Plan](plan.md) · [Spec](spec.md). Đường dẫn dưới đây thuộc repo code đích.

## Phase 1 · Chuẩn bị

- [ ] T001 Dựng bộ dữ liệu một tài khoản hoạt động, hai vai trò, thêm tài khoản ngoài tenant trong `e2e/iam/lock-account/fixtures.ts`.

## Phase 2 · Nền tảng

- [ ] T002 Định nghĩa thao tác khóa tài khoản của người rời đơn vị với đầu vào “Tài khoản đích và xác nhận khóa” và đầu ra “Trạng thái truy cập và sự kiện ACCOUNT_LOCKED” trong `packages/api-contracts/iam/lock-account.yaml`; sinh type và kiểm phạm vi theo [hợp đồng](contracts/interaction.md).

## Phase 3 · US1 — Khóa tài khoản của người rời đơn vị

Mục tiêu độc lập: Quản trị viên khóa một tài khoản khi người dùng rời đơn vị để ngừng truy cập nghiệp vụ. Dùng TC-01–04 của [quickstart](quickstart.md) để nghiệm thu.

- [ ] T003 [P] [US1] Viết ca US-01.1 / US-01.2 và TC-04 trong `e2e/iam/lock-account/acceptance.spec.ts`; so kết quả với [quickstart](quickstart.md).
- [ ] T004 [P] [US1] Áp ràng buộc [data-model.md](data-model.md) `User.isActive` khi đọc/ghi qua `apps/backend/src/modules/iam/lock-account/data.ts`.
- [ ] T005 [US1] Thực hiện FR-001/002 trong `apps/backend/src/modules/iam/lock-account/service.ts`. Dùng thao tác khóa của B03. Kiểm cả tài khoản vừa khóa và phiên đang giữ token. Trả trạng thái sau cùng cho thao tác lặp, tránh hai sự kiện ACCOUNT_LOCKED cho một lần đổi. Kiểm nhánh AC-02 theo [quickstart](quickstart.md).
- [ ] T006 [US1] Tích hợp điểm tương tác trong `apps/web/src/features/iam/lock-account/view.tsx`. Hiển thị trạng thái truy cập và sự kiện ACCOUNT_LOCKED; hiển thị riêng tình huống người chỉ có quyền xem và cho người có quyền quay về dữ liệu nguồn.
- [ ] T007 [US1] Áp dụng kết luận RV-01 cho FR-003 trong `apps/backend/src/modules/iam/lock-account/service.ts` và kiểm TC-03 ở `e2e/iam/lock-account/boundary.spec.ts`. Kiểm trạng thái tại yêu cầu nghiệp vụ kế tiếp, kể cả phiên đã mở.

## Phase 4 · Hồi quy

- [ ] T008 Đối chiếu đủ bốn ca và chạy lại luồng tích hợp với B03, P02. Lưu bằng chứng theo mẫu `e2e/iam/lock-account/review.md`. Đối chiếu thêm AC-09, AC-12 trong [B03](../../docs/features/B03-quan-ly-nguoi-dung/spec.md) ở phần áp dụng cho lát này. Lập biên bản trước/sau cho lần khóa đầu và thử lại bằng phiên cũ; đối chiếu actor, tài khoản đích và giờ khóa.

## Phụ thuộc và cách giao

T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008. T003 và T004 dùng tệp riêng sau khi chốt giao tiếp. Giao lát US1 với dữ liệu mẫu trước, sau đó chạy lại bằng module thật. Dùng [RV-01](../review-decisions.md#rv-01) để chốt nhánh biên trước khi nghiệm thu.
