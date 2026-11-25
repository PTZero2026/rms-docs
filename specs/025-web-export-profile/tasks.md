---
story: US-25
feature: F08
review_id: RV-25
status: Draft
updated: 2026-11-21
---

# Tasks · Xuất lý lịch nghiên cứu của cá nhân

US-25 · Đợt B · [Plan](plan.md) · [Spec](spec.md). Đường dẫn dưới đây thuộc repo code đích.

## Phase 1 · Chuẩn bị

- [x] T001 Dựng bộ dữ liệu hai phiên bản v1 và v2 có tiêu đề khác nhau của cùng một mẫu tenant, một người có hai vai trò trên cùng sản phẩm đã duyệt và một sản phẩm đang chờ duyệt, thêm tài khoản ngoài tenant trong `e2e/profile/export-profile/fixtures.ts`.

## Phase 2 · Nền tảng

- [x] T002 Định nghĩa thao tác xuất lý lịch nghiên cứu của cá nhân với đầu vào “Cá nhân, mẫu tenant, sản phẩm duyệt và vai trò” và đầu ra “Bản lý lịch theo mẫu, từng đầu ra chỉ xuất hiện một lần” trong `packages/api-contracts/profile/export-profile.yaml`; sinh type và kiểm phạm vi theo [hợp đồng](contracts/interaction.md).

## Phase 3 · US1 — Xuất lý lịch nghiên cứu của cá nhân

Mục tiêu độc lập: Nhà nghiên cứu lấy lý lịch theo mẫu đơn vị, tái dùng đề tài và sản phẩm đã đủ điều kiện tổng hợp. Dùng TC-01–04 của [quickstart](quickstart.md) để nghiệm thu.

- [x] T003 [P] [US1] Viết ca US-25.1 / US-25.2 và TC-04 trong `e2e/profile/export-profile/acceptance.spec.ts`; so kết quả với [quickstart](quickstart.md).
- [x] T004 [P] [US1] Áp ràng buộc [data-model.md](data-model.md) `ResearchOutput.id` khi đọc/ghi qua `apps/backend/src/modules/profile/export-profile/data.ts`.
- [x] T005 [US1] Thực hiện FR-001/002 trong `apps/backend/src/modules/profile/export-profile/service.ts`. Khử trùng theo ID sản phẩm trước khi đổ mẫu. Kiểm chủ hồ sơ hoặc quyền xem của chuyên viên, ghi `EXPORT_CV` cho lần xuất. Kiểm nhánh AC-02 theo [quickstart](quickstart.md).
- [x] T006 [US1] Tích hợp điểm tương tác trong `apps/web/src/features/profile/export-profile/view.tsx`. Hiển thị bản lý lịch theo mẫu, từng đầu ra chỉ xuất hiện một lần; hiển thị riêng tình huống người dùng ngoài phạm vi và cho người có quyền quay về dữ liệu nguồn.
- [x] T007 [US1] Áp dụng kết luận RV-25 cho FR-003 trong `apps/backend/src/modules/profile/export-profile/service.ts` và kiểm TC-03 ở `e2e/profile/export-profile/boundary.spec.ts`. Xác định phiên bản hiệu lực của mẫu đã chọn cho lần xuất. Dùng phiên bản đó khi tạo tệp và ghi mã mẫu, phiên bản vào `EXPORT_CV`. Kiểm hai lần xuất trước và sau khi kích hoạt v2.

## Phase 4 · Hồi quy

- [x] T008 Đối chiếu đủ bốn ca và chạy lại luồng tích hợp với F08, F07, P03. Lưu bằng chứng theo mẫu `e2e/profile/export-profile/review.md`. Đối chiếu thêm AC-09, AC-12, AC-13 trong [F08](../../docs/features/F08-ly-lich-khoa-hoc/spec.md) ở phần áp dụng cho lát này. TC-01 kiểm sản phẩm đã duyệt gắn qua hai vai trò chỉ xuất hiện một lần, sản phẩm chờ duyệt vắng mặt. Với TC-03, so tiêu đề trên hai tệp với phiên bản trong từng sự kiện `EXPORT_CV`.

## Phụ thuộc và cách giao

T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008. T003 và T004 dùng tệp riêng sau khi chốt giao tiếp. Giao lát US1 với dữ liệu mẫu trước, sau đó chạy lại bằng module thật. Dùng [RV-25](../review-decisions.md#rv-25) làm căn cứ nghiệm thu thay đổi phiên bản mẫu.
