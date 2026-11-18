---
story: US-22
feature: F06
review_id: RV-22
status: Draft
updated: 2026-11-18
---

# Tasks · Đăng ký nghiệm thu khi đủ điều kiện

US-22 · Đợt B · [Plan](plan.md) · [Spec](spec.md). Đường dẫn dưới đây thuộc repo code đích.

## Phase 1 · Chuẩn bị

- [ ] T001 Dựng bộ dữ liệu đề tài đang thực hiện, dữ liệu kỳ cuối và sản phẩm đã duyệt, thêm tài khoản ngoài tenant trong `e2e/acceptance/request-acceptance/fixtures.ts`.

## Phase 2 · Nền tảng

- [ ] T002 Định nghĩa thao tác đăng ký nghiệm thu khi đủ điều kiện với đầu vào “Đề tài đang thực hiện, kết quả kỳ cuối, cam kết và hồ sơ cuối” và đầu ra “Danh mục thiếu hoặc hồ sơ PENDING_ACCEPTANCE và thông báo” trong `packages/api-contracts/acceptance/request-acceptance.yaml`; sinh type và kiểm phạm vi theo [hợp đồng](contracts/interaction.md).

## Phase 3 · US1 — Đăng ký nghiệm thu khi đủ điều kiện

Mục tiêu độc lập: Chủ nhiệm nộp hồ sơ cuối khi kỳ cuối đã đạt và đủ sản phẩm cam kết để phòng khoa học tiếp nhận nghiệm thu. Dùng TC-01–04 của [quickstart](quickstart.md) để nghiệm thu.

- [ ] T003 [P] [US1] Viết ca US-22.1 / US-22.2 và TC-04 trong `e2e/acceptance/request-acceptance/acceptance.spec.ts`; so kết quả với [quickstart](quickstart.md).
- [ ] T004 [P] [US1] Áp ràng buộc [data-model.md](data-model.md) `ProgressReport.status` khi đọc/ghi qua `apps/backend/src/modules/acceptance/request-acceptance/data.ts`.
- [ ] T005 [US1] Thực hiện FR-001/002 trong `apps/backend/src/modules/acceptance/request-acceptance/service.ts`. Đọc lại điều kiện lúc đăng ký. Chỉ khi kỳ cuối đạt và từng loại đủ mới chuyển PENDING_ACCEPTANCE, ghi audit và báo chuyên viên. Kiểm nhánh AC-02 theo [quickstart](quickstart.md).
- [ ] T006 [US1] Tích hợp điểm tương tác trong `apps/web/src/features/acceptance/request-acceptance/view.tsx`. Hiển thị danh mục thiếu hoặc hồ sơ PENDING_ACCEPTANCE và thông báo; hiển thị riêng tình huống thiếu một sản phẩm cam kết và cho người có quyền quay về dữ liệu nguồn.
- [ ] T007 [US1] Áp dụng kết luận RV-22 cho FR-003 trong `apps/backend/src/modules/acceptance/request-acceptance/service.ts` và kiểm TC-03 ở `e2e/acceptance/request-acceptance/boundary.spec.ts`. Kiểm từng loại cam kết tại lúc nộp cùng kết quả kỳ cuối.

## Phase 4 · Hồi quy

- [ ] T008 Đối chiếu đủ bốn ca và chạy lại luồng tích hợp với F04, F07, F06. Lưu bằng chứng theo mẫu `e2e/acceptance/request-acceptance/review.md`. Đối chiếu thêm AC-01, AC-07 trong [F06](../../docs/features/F06-nghiem-thu/spec.md) ở phần áp dụng cho lát này. Thử thiếu kỳ cuối, thiếu sản phẩm đúng loại và đầy đủ cả hai. Chỉ trường hợp cuối có thông báo tiếp nhận.

## Phụ thuộc và cách giao

T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008. T003 và T004 dùng tệp riêng sau khi chốt giao tiếp. Giao lát US1 với dữ liệu mẫu trước, sau đó chạy lại bằng module thật. Dùng [RV-22](../review-decisions.md#rv-22) để chốt nhánh biên trước khi nghiệm thu.
