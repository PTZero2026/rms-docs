---
story: US-29
feature: F12
review_id: RV-29
status: Draft
updated: 2026-11-24
---

# Tasks · Kê khai một hoạt động khoa học

US-29 · Đợt C · [Plan](plan.md) · [Spec](spec.md). Đường dẫn dưới đây thuộc repo code đích.

## Phase 1 · Chuẩn bị

- [x] T001 Dựng bộ dữ liệu tenant bật F12, một loại hoạt động và một quy tắc minh chứng, thêm tài khoản ngoài tenant trong `e2e/activity/submit-activity/fixtures.ts`.

## Phase 2 · Nền tảng

- [x] T002 Định nghĩa thao tác kê khai một hoạt động khoa học với đầu vào “Loại hoạt động, tenant và bộ tệp minh chứng” và đầu ra “Hoạt động chờ duyệt hoặc danh sách minh chứng thiếu” trong `packages/api-contracts/activity/submit-activity.yaml`; sinh type và kiểm phạm vi theo [hợp đồng](contracts/interaction.md).

## Phase 3 · US1 — Kê khai một hoạt động khoa học

Mục tiêu độc lập: Giảng viên khai một hoạt động hội nghị có minh chứng theo cấu hình của trường để đề nghị ghi nhận. Dùng TC-01–04 của [quickstart](quickstart.md) để nghiệm thu.

- [x] T003 [P] [US1] Viết ca US-29.1 / US-29.2 và TC-04 trong `e2e/activity/submit-activity/acceptance.spec.ts`; so kết quả với [quickstart](quickstart.md).
- [x] T004 [P] [US1] Áp ràng buộc [data-model.md](data-model.md) `Activity.activityType` khi đọc/ghi qua `apps/backend/src/modules/activity/submit-activity/data.ts`.
- [x] T005 [US1] Thực hiện FR-001/002 trong `apps/backend/src/modules/activity/submit-activity/service.ts`. Lấy quy tắc theo tổ chức và loại, kiểm danh sách tệp tại lần gửi. Khi đủ thì vào hàng chờ. Giờ giảng phát sinh ở mốc duyệt riêng. Kiểm nhánh AC-02 theo [quickstart](quickstart.md).
- [x] T006 [US1] Tích hợp điểm tương tác trong `apps/web/src/features/activity/submit-activity/view.tsx`. Hiển thị hoạt động chờ duyệt hoặc danh sách minh chứng thiếu; hiển thị riêng tình huống thiếu minh chứng bắt buộc của loại hoạt động và cho người có quyền quay về dữ liệu nguồn.
- [x] T007 [US1] Áp dụng kết luận RV-29 cho FR-003 trong `apps/backend/src/modules/activity/submit-activity/service.ts` và kiểm TC-03 ở `e2e/activity/submit-activity/boundary.spec.ts`. Lấy bộ minh chứng của tenant và loại hoạt động tại bước gửi, nêu từng mục thiếu.

## Phase 4 · Hồi quy

- [x] T008 Đối chiếu đủ bốn ca và chạy lại luồng tích hợp với F12, B01. Lưu bằng chứng theo mẫu `e2e/activity/submit-activity/review.md`. Đối chiếu thêm AC-01, AC-02 trong [F12](../../docs/features/F12-hoat-dong-khoa-hoc/spec.md) ở phần áp dụng cho lát này. Cùng một loại hội nghị ở A/B yêu cầu bộ tệp khác nhau. Thiếu tệp ở A phải hiện đúng loại bị thiếu của A.

## Phụ thuộc và cách giao

T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008. T003 và T004 dùng tệp riêng sau khi chốt giao tiếp. Giao lát US1 với dữ liệu mẫu trước, sau đó chạy lại bằng module thật. Dùng [RV-29](../review-decisions.md#rv-29) để đối chiếu nhánh biên khi nghiệm thu.
