---
story: US-02
feature: B01
review_id: RV-02
status: Draft
updated: 2026-11-18
---

# Tasks · Ghi đè một cấu hình của trường

US-02 · Đợt A · [Plan](plan.md) · [Spec](spec.md). Đường dẫn dưới đây thuộc repo code đích.

## Phase 1 · Chuẩn bị

- [ ] T001 Dựng bộ dữ liệu hai tenant dùng cùng một khóa cấu hình, thêm tài khoản ngoài tenant trong `e2e/catalog/config-override/fixtures.ts`.

## Phase 2 · Nền tảng

- [ ] T002 Định nghĩa thao tác ghi đè một cấu hình của trường với đầu vào “Khóa cấu hình, nội dung mới, trường đang quản trị” và đầu ra “Giá trị đọc hiệu lực tại A và giá trị chung tại B” trong `packages/api-contracts/catalog/config-override.yaml`; sinh type và kiểm phạm vi theo [hợp đồng](contracts/interaction.md).

## Phase 3 · US1 — Ghi đè một cấu hình của trường

Mục tiêu độc lập: Quản trị tenant điều chỉnh một giá trị dùng cho kỳ xét của trường, các trường khác tiếp tục dùng giá trị chung. Dùng TC-01–04 của [quickstart](quickstart.md) để nghiệm thu.

- [ ] T003 [P] [US1] Viết ca US-02.1 / US-02.2 và TC-04 trong `e2e/catalog/config-override/acceptance.spec.ts`; so kết quả với [quickstart](quickstart.md).
- [ ] T004 [P] [US1] Áp ràng buộc [data-model.md](data-model.md) `SysConfiguration.tenantId` khi đọc/ghi qua `apps/backend/src/modules/catalog/config-override/data.ts`.
- [ ] T005 [US1] Thực hiện FR-001/002 trong `apps/backend/src/modules/catalog/config-override/service.ts`. Xác định tenant từ phiên quản trị. Ghi override riêng, xóa mục cache đúng phạm vi, rồi thử đọc cùng key ở A và B. Xử lý giá trị lớn bằng cơ chế của B01. Kiểm nhánh AC-02 theo [quickstart](quickstart.md).
- [ ] T006 [US1] Tích hợp điểm tương tác trong `apps/web/src/features/catalog/config-override/view.tsx`. Hiển thị giá trị đọc hiệu lực tại A và giá trị chung tại B; hiển thị riêng tình huống tenant B chỉ có giá trị chung và cho người có quyền quay về dữ liệu nguồn.
- [ ] T007 [US1] Áp dụng kết luận RV-02 cho FR-003 trong `apps/backend/src/modules/catalog/config-override/service.ts` và kiểm TC-03 ở `e2e/catalog/config-override/boundary.spec.ts`. Làm mất hiệu lực mục trong bộ nhớ đệm của trường vừa sửa trước lần đọc kế tiếp.

## Phase 4 · Hồi quy

- [ ] T008 Đối chiếu đủ bốn ca và chạy lại luồng tích hợp với B01, B03. Lưu bằng chứng theo mẫu `e2e/catalog/config-override/review.md`. Đối chiếu thêm AC-02, AC-05, AC-07 trong [B01](../../docs/features/B01-danh-muc-cau-hinh/spec.md) ở phần áp dụng cho lát này. Lưu ba giá trị đối chứng: trước khi ghi, sau ghi tại A, sau ghi tại B. Người dùng thường gửi lệnh ghi nhận từ chối.

## Phụ thuộc và cách giao

T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008. T003 và T004 dùng tệp riêng sau khi chốt giao tiếp. Giao lát US1 với dữ liệu mẫu trước, sau đó chạy lại bằng module thật. Dùng [RV-02](../review-decisions.md#rv-02) để chốt nhánh biên trước khi nghiệm thu.
