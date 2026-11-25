---
story: US-01
feature: B03
review_id: RV-01
status: Draft
updated: 2026-11-24
---

# Tasks · Khóa tài khoản của người rời đơn vị

US-01 · Đợt A · [Plan](plan.md) · [Spec](spec.md). Đường dẫn dưới đây thuộc repo code đích.

## Phase 1 · Chuẩn bị

- [X] T001 Dựng bộ dữ liệu một tài khoản đích đang hoạt động và hai người thao tác riêng biệt (một admin, một user chỉ xem), thêm tài khoản ngoài tenant trong `e2e/iam/lock-account/fixtures.ts`.

## Phase 2 · Nền tảng

- [X] T002 Định nghĩa thao tác khóa tài khoản của người rời đơn vị với đầu vào “Tài khoản đích và xác nhận khóa” và đầu ra “Trạng thái truy cập và sự kiện ACCOUNT_LOCKED” trong `packages/api-contracts/iam/lock-account.yaml`; sinh type và kiểm phạm vi theo [hợp đồng](contracts/interaction.md).

## Phase 3 · US1 — Khóa tài khoản của người rời đơn vị

Mục tiêu độc lập: Quản trị viên khóa một tài khoản khi người dùng rời đơn vị để ngừng truy cập nghiệp vụ. Dùng TC-01–04 của [quickstart](quickstart.md) để nghiệm thu.

- [X] T003 [P] [US1] Viết ca US-01.1 / US-01.2 và TC-04 trong `e2e/iam/lock-account/acceptance.spec.ts`; so kết quả với [quickstart](quickstart.md).
- [X] T004 [P] [US1] Áp ràng buộc [data-model.md](data-model.md) `User.isActive` khi đọc/ghi qua `apps/backend/src/modules/iam/lock-account/data.ts`.
- [X] T005 [US1] Thực hiện FR-001/002 trong `apps/backend/src/modules/iam/lock-account/service.ts`. Dùng thao tác khóa của B03. Kiểm cả tài khoản vừa khóa và phiên đang giữ token. Trả trạng thái sau cùng cho thao tác lặp, tránh hai sự kiện ACCOUNT_LOCKED cho một lần đổi. Kiểm nhánh AC-02 theo [quickstart](quickstart.md).
- [X] T006 [US1] Tích hợp điểm tương tác trong `apps/web/src/features/iam/lock-account/view.tsx`. Hiển thị trạng thái truy cập và sự kiện ACCOUNT_LOCKED; hiển thị riêng tình huống người chỉ có quyền xem và cho người có quyền quay về dữ liệu nguồn.
- [X] T007 [US1] Áp dụng FR-003 ở lớp phân quyền backend dùng chung, dựa trên trạng thái do `apps/backend/src/modules/iam/lock-account/service.ts` ghi nhận và kiểm TC-03 ở `e2e/iam/lock-account/boundary.spec.ts`. Thử cả tải lại và lưu từ phiên đã mở, đối chiếu hồ sơ và lịch sử bằng tài khoản có quyền.

## Phase 4 · Hồi quy

- [X] T008 Đối chiếu đủ bốn ca và chạy lại luồng tích hợp với B03, P02. Lưu bằng chứng theo mẫu `e2e/iam/lock-account/review.md`. Đối chiếu thêm AC-08, AC-09, AC-12 trong [B03](../../docs/features/B03-quan-ly-nguoi-dung/spec.md) ở phần áp dụng cho lát này. Lập biên bản trước/sau cho lần khóa đầu và thử lại bằng phiên cũ; đối chiếu actor, tài khoản đích và giờ khóa.

## Phụ thuộc và cách giao

T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008. T003 và T004 dùng tệp riêng sau khi chốt giao tiếp. Giao lát US1 với dữ liệu mẫu trước, sau đó chạy lại bằng module thật. Dùng [RV-01](../review-decisions.md#rv-01) để đối chiếu kết quả TC-03 khi nghiệm thu.

[Biên bản US-01](../../e2e/iam/lock-account/review.md). Đã đối chiếu B03/AC-08, AC-09 và AC-12 qua phiên OTP, gồm POST tạo tài khoản bị từ chối trước khi gọi IdP.
