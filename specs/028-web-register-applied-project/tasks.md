---
story: US-28
feature: F11
review_id: RV-28
status: Draft
updated: 2026-11-21
---

# Tasks · Kê khai dự án phục vụ sản xuất

US-28 · Đợt C · [Plan](plan.md) · [Spec](spec.md). Đường dẫn dưới đây thuộc repo code đích.

## Phase 1 · Chuẩn bị

- [x] T001 Dựng bộ dữ liệu tenant bật F11, danh mục đơn vị và một đối tác, thêm tài khoản ngoài tenant trong `e2e/applied-project/register-applied-project/fixtures.ts`.

## Phase 2 · Nền tảng

- [x] T002 Định nghĩa thao tác kê khai dự án phục vụ sản xuất với đầu vào “Đơn vị chủ trì, đối tác ngoài và tổng kinh phí” và đầu ra “Đầu mục dự án ứng dụng với kinh phí tổng” trong `packages/api-contracts/applied-project/register-applied-project.yaml`; sinh type và kiểm phạm vi theo [hợp đồng](contracts/interaction.md).

## Phase 3 · US1 — Kê khai dự án phục vụ sản xuất

Mục tiêu độc lập: Người kê khai ghi đơn vị chủ trì, đối tác ngoài và tổng kinh phí VND để phòng khoa học xét dự án ứng dụng. Dùng TC-01–04 của [quickstart](quickstart.md) để nghiệm thu.

- [x] T003 [P] [US1] Viết ca US-28.1 / US-28.2 và TC-04 trong `e2e/applied-project/register-applied-project/acceptance.spec.ts`; so kết quả với [quickstart](quickstart.md).
- [x] T004 [P] [US1] Áp ràng buộc [data-model.md](data-model.md) `AppliedProject.totalBudgetVnd` khi đọc/ghi qua `apps/backend/src/modules/applied-project/register-applied-project/data.ts`.
- [x] T005 [US1] Thực hiện FR-001/002 trong `apps/backend/src/modules/applied-project/register-applied-project/service.ts`. Cho chọn hoặc nhập đối tác theo danh mục của trường. Lưu tổng VND tại đầu mục. Kiểm có viện khi lưu và có ít nhất một đối tác khi gửi duyệt. Kiểm nhánh AC-02 theo [quickstart](quickstart.md).
- [x] T006 [US1] Tích hợp điểm tương tác trong `apps/web/src/features/applied-project/register-applied-project/view.tsx`. Hiển thị đầu mục dự án ứng dụng với kinh phí tổng; hiển thị yêu cầu bổ sung đối tác khi gửi duyệt, cho lưu nháp thiếu đối tác và cho người có quyền quay về dữ liệu nguồn.
- [x] T007 [US1] Áp dụng kết luận RV-28 cho FR-003 trong `apps/backend/src/modules/applied-project/register-applied-project/service.ts` và kiểm TC-03 ở `e2e/applied-project/register-applied-project/boundary.spec.ts`. Kiểm lưu và mở lại nháp khi danh sách đối tác rỗng. Trên cùng mã hồ sơ, xác minh gửi thiếu đối tác giữ Nháp và gửi lại sau khi thêm đối tác chuyển Chờ duyệt.

## Phase 4 · Hồi quy

- [x] T008 Đối chiếu đủ bốn ca và chạy lại luồng tích hợp với F11, B01. Lưu bằng chứng theo mẫu `e2e/applied-project/register-applied-project/review.md`. Đối chiếu thêm AC-01, AC-02, AC-03 trong [F11](../../docs/features/F11-du-an-phuc-vu-san-xuat/spec.md) ở phần áp dụng cho lát này. Đối chiếu số tiền ở đầu mục với dữ liệu nhập và kiểm số dòng F05 trước/sau bằng nhau.

## Phụ thuộc và cách giao

T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008. T003 và T004 dùng tệp riêng sau khi chốt giao tiếp. Giao lát US1 với dữ liệu mẫu trước, sau đó chạy lại bằng module thật. Dùng [RV-28](../review-decisions.md#rv-28) làm căn cứ nghiệm thu hai thao tác lưu nháp và gửi duyệt.
