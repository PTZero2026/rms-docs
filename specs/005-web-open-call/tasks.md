---
story: US-05
feature: F02
review_id: RV-05
status: Draft
updated: 2026-11-18
---

# Tasks · Mở một kỳ nhận đề xuất

US-05 · Đợt A · [Plan](plan.md) · [Spec](spec.md). Đường dẫn dưới đây thuộc repo code đích.

## Phase 1 · Chuẩn bị

- [ ] T001 Dựng bộ dữ liệu một kỳ nháp, danh mục còn hiệu lực, thêm tài khoản ngoài tenant trong `e2e/call/open-call/fixtures.ts`.

## Phase 2 · Nền tảng

- [ ] T002 Định nghĩa thao tác mở một kỳ nhận đề xuất với đầu vào “Mã kỳ, cửa sổ thời gian, danh mục, bộ tiêu chí” và đầu ra “Kỳ OPEN hiển thị ở danh sách tiếp nhận” trong `packages/api-contracts/call/open-call.yaml`; sinh type và kiểm phạm vi theo [hợp đồng](contracts/interaction.md).

## Phase 3 · US1 — Mở một kỳ nhận đề xuất

Mục tiêu độc lập: Chuyên viên thiết lập mã kỳ, thời gian, bộ tiêu chí và mở đợt để giảng viên biết nơi nộp đúng hạn. Dùng TC-01–04 của [quickstart](quickstart.md) để nghiệm thu.

- [ ] T003 [P] [US1] Viết ca US-05.1 / US-05.2 và TC-04 trong `e2e/call/open-call/acceptance.spec.ts`; so kết quả với [quickstart](quickstart.md).
- [ ] T004 [P] [US1] Áp ràng buộc [data-model.md](data-model.md) `ProposalCall.endDate` khi đọc/ghi qua `apps/backend/src/modules/call/open-call/data.ts`.
- [ ] T005 [US1] Thực hiện FR-001/002 trong `apps/backend/src/modules/call/open-call/service.ts`. Kiểm lại mã kỳ không trùng và danh mục hiệu lực khi mở. Chỉ công bố cho người nộp sau khi trạng thái OPEN cùng sự kiện audit đã ghi. Kiểm nhánh AC-02 theo [quickstart](quickstart.md).
- [ ] T006 [US1] Tích hợp điểm tương tác trong `apps/web/src/features/call/open-call/view.tsx`. Hiển thị kỳ OPEN hiển thị ở danh sách tiếp nhận; hiển thị riêng tình huống ngày kết thúc trước ngày bắt đầu và cho người có quyền quay về dữ liệu nguồn.
- [ ] T007 [US1] Áp dụng kết luận RV-05 cho FR-003 trong `apps/backend/src/modules/call/open-call/service.ts` và kiểm TC-03 ở `e2e/call/open-call/boundary.spec.ts`. Kiểm lại danh mục và bộ tiêu chí tại thời điểm mở, chỉ rõ mục phải thay.

## Phase 4 · Hồi quy

- [ ] T008 Đối chiếu đủ bốn ca và chạy lại luồng tích hợp với B01, B03. Lưu bằng chứng theo mẫu `e2e/call/open-call/review.md`. Đối chiếu thêm AC-01, AC-02, AC-05 trong [F02](../../docs/features/F02-dot-keu-goi/spec.md) ở phần áp dụng cho lát này. So danh sách kỳ của giảng viên trước/sau mở; kiểm kỳ sai ngày và kỳ thiếu tiêu chí đều chưa mở.

## Phụ thuộc và cách giao

T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008. T003 và T004 dùng tệp riêng sau khi chốt giao tiếp. Giao lát US1 với dữ liệu mẫu trước, sau đó chạy lại bằng module thật. Dùng [RV-05](../review-decisions.md#rv-05) để chốt nhánh biên trước khi nghiệm thu.
