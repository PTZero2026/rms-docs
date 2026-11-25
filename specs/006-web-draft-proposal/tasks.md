---
story: US-06
feature: F01
review_id: RV-06
status: Draft
updated: 2026-11-24
---

# Tasks · Lưu nháp thuyết minh

US-06 · Đợt A · [Plan](plan.md) · [Spec](spec.md). Đường dẫn dưới đây thuộc repo code đích.

## Phase 1 · Chuẩn bị

- [X] T001 Dựng bộ dữ liệu kỳ mở, hai nhà nghiên cứu độc lập, thêm tài khoản ngoài tenant trong `e2e/proposal/draft-proposal/fixtures.ts`.

## Phase 2 · Nền tảng

- [X] T002 Định nghĩa thao tác lưu nháp thuyết minh với đầu vào “Kỳ mở, chủ nhiệm, phần thuyết minh đã soạn” và đầu ra “Định danh nháp và nội dung đã lưu” trong `packages/api-contracts/proposal/draft-proposal.yaml`; sinh type và kiểm phạm vi theo [hợp đồng](contracts/interaction.md).

## Phase 3 · US1 — Lưu nháp thuyết minh

Mục tiêu độc lập: Chủ nhiệm lưu đề xuất của mình trong kỳ đang mở để hoàn thiện qua nhiều lần trước khi xin xét. Dùng TC-01–04 của [quickstart](quickstart.md) để nghiệm thu.

- [X] T003 [P] [US1] Viết ca US-06.1 / US-06.2 và TC-04 trong `e2e/proposal/draft-proposal/acceptance.spec.ts`; so kết quả với [quickstart](quickstart.md).
- [X] T004 [P] [US1] Áp ràng buộc [data-model.md](data-model.md) `ResearchProject.principalInvestigatorId` khi đọc/ghi qua `apps/backend/src/modules/proposal/draft-proposal/data.ts`.
- [X] T005 [US1] Thực hiện FR-001/002 trong `apps/backend/src/modules/proposal/draft-proposal/service.ts`. Lưu hồ sơ và thành viên chủ nhiệm cùng giao dịch; truy xuất nháp kiểm chủ sở hữu. Giữ yêu cầu điền đủ thuyết minh cho bước nộp. Kiểm nhánh AC-02 theo [quickstart](quickstart.md).
- [X] T006 [US1] Tích hợp điểm tương tác trong `apps/web/src/features/proposal/draft-proposal/view.tsx`. Hiển thị định danh nháp và nội dung đã lưu; hiển thị riêng tình huống nhà nghiên cứu khác ngoài phạm vi và cho người có quyền quay về dữ liệu nguồn.
- [X] T007 [US1] Áp dụng kết luận RV-06 cho FR-003 trong `apps/backend/src/modules/proposal/draft-proposal/service.ts` và kiểm TC-03 ở `e2e/proposal/draft-proposal/boundary.spec.ts`. Cho lưu bản nháp thiếu trường bắt buộc của lần nộp khi đã xác định kỳ và chủ nhiệm.

## Phase 4 · Hồi quy

- [X] T008 Đối chiếu đủ bốn ca và chạy lại luồng tích hợp với F02, B03. Lưu bằng chứng theo mẫu `e2e/proposal/draft-proposal/review.md`. Đối chiếu thêm AC-01, AC-06 trong [F01](../../docs/features/F01-de-xuat-de-tai/spec.md) ở phần áp dụng cho lát này. Sau khi đăng nhập lại, so nội dung đã lưu, đúng một chủ nhiệm và trường mã còn trống.

## Phụ thuộc và cách giao

T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008. T003 và T004 dùng tệp riêng sau khi chốt giao tiếp. Giao lát US1 với dữ liệu mẫu trước, sau đó chạy lại bằng module thật. Dùng [RV-06](../review-decisions.md#rv-06) để đối chiếu nhánh biên khi nghiệm thu.

[Biên bản F01](../../e2e/call/open-call/proposal-review.md). Dùng ca Chrome liên hoàn từ kỳ thật và bộ DB riêng cho cạnh tranh, hạn nộp, rollback và quyền.
