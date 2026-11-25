---
story: US-27
feature: F10
review_id: RV-27
status: Draft
updated: 2026-11-24
---

# Tasks · Xác nhận người hướng dẫn đề tài sinh viên

US-27 · Đợt C · [Plan](plan.md) · [Spec](spec.md). Đường dẫn dưới đây thuộc repo code đích.

## Phase 1 · Chuẩn bị

- [x] T001 Dựng bộ dữ liệu đợt bật F10, nhóm hợp lệ và một giảng viên, thêm tài khoản ngoài tenant trong `e2e/student-project/confirm-mentor/fixtures.ts`.

## Phase 2 · Nền tảng

- [x] T002 Định nghĩa thao tác xác nhận người hướng dẫn đề tài sinh viên với đầu vào “Đăng ký của nhóm, đợt, người hướng dẫn và xác nhận tương ứng” và đầu ra “Trạng thái đủ/thiếu xác nhận cho đúng đăng ký” trong `packages/api-contracts/student-project/confirm-mentor.yaml`; sinh type và kiểm phạm vi theo [hợp đồng](contracts/interaction.md).

## Phase 3 · US1 — Xác nhận người hướng dẫn đề tài sinh viên

Mục tiêu độc lập: Sinh viên xin xác nhận của giảng viên hướng dẫn để đủ điều kiện nộp đăng ký của nhóm. Dùng TC-01–04 của [quickstart](quickstart.md) để nghiệm thu.

- [x] T003 [P] [US1] Viết ca US-27.1 / US-27.2 và TC-04 trong `e2e/student-project/confirm-mentor/acceptance.spec.ts`; so kết quả với [quickstart](quickstart.md).
- [x] T004 [P] [US1] Áp ràng buộc [data-model.md](data-model.md) `StudentProject.id` khi đọc/ghi qua `apps/backend/src/modules/student-project/confirm-mentor/data.ts`.
- [x] T005 [US1] Thực hiện FR-001/002 trong `apps/backend/src/modules/student-project/confirm-mentor/service.ts`. Kiểm đợt và các điều kiện khác như dữ liệu tiền đề. Đối chiếu xác nhận theo mã hồ sơ trước khi nhận lần nộp chính thức. Kiểm nhánh AC-02 theo [quickstart](quickstart.md).
- [x] T006 [US1] Tích hợp điểm tương tác trong `apps/web/src/features/student-project/confirm-mentor/view.tsx`. Hiển thị trạng thái đủ/thiếu xác nhận cho đúng đăng ký; hiển thị riêng tình huống chưa ai xác nhận và cho người có quyền quay về dữ liệu nguồn.
- [x] T007 [US1] Áp dụng kết luận RV-27 cho FR-003 trong `apps/backend/src/modules/student-project/confirm-mentor/service.ts` và kiểm TC-03 ở `e2e/student-project/confirm-mentor/boundary.spec.ts`. Gắn xác nhận với đúng đăng ký, kiểm khi sinh viên nộp chính thức.

## Phase 4 · Hồi quy

- [x] T008 Đối chiếu đủ bốn ca và chạy lại luồng tích hợp với F10, B03. Lưu bằng chứng theo mẫu `e2e/student-project/confirm-mentor/review.md`. Đối chiếu thêm AC-04 trong [F10](../../docs/features/F10-de-tai-sinh-vien/spec.md) ở phần áp dụng cho lát này. Cùng sinh viên có hai đăng ký, chỉ một được GV xác nhận; chỉ hồ sơ đó qua bước kiểm người hướng dẫn.

## Phụ thuộc và cách giao

T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008. T003 và T004 dùng tệp riêng sau khi chốt giao tiếp. Giao lát US1 với dữ liệu mẫu trước, sau đó chạy lại bằng module thật. Dùng [RV-27](../review-decisions.md#rv-27) để đối chiếu nhánh biên khi nghiệm thu.
