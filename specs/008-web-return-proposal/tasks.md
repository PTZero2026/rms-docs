---
story: US-08
feature: F01
review_id: RV-08
status: Draft
updated: 2026-11-24
---

# Tasks · Trả hồ sơ cần bổ sung

US-08 · Đợt A · [Plan](plan.md) · [Spec](spec.md). Đường dẫn dưới đây thuộc repo code đích.

## Phase 1 · Chuẩn bị

- [X] T001 Dựng bộ dữ liệu hồ sơ đã nộp có mã, hai kỳ còn hạn và đã đóng, thêm tài khoản ngoài tenant trong `e2e/proposal/return-proposal/fixtures.ts`.

## Phase 2 · Nền tảng

- [X] T002 Định nghĩa thao tác trả hồ sơ cần bổ sung với đầu vào “Mã hồ sơ đã nộp, lý do trả, kỳ tiếp nhận” và đầu ra “Bản nháp mở lại và lý do gắn cùng mã cũ” trong `packages/api-contracts/proposal/return-proposal.yaml`; sinh type và kiểm phạm vi theo [hợp đồng](contracts/interaction.md).

## Phase 3 · US1 — Trả hồ sơ cần bổ sung

Mục tiêu độc lập: Chuyên viên ghi lý do để chủ nhiệm sửa và theo cùng một mã khi nộp lại. Dùng TC-01–04 của [quickstart](quickstart.md) để nghiệm thu.

- [X] T003 [P] [US1] Viết ca US-08.1 / US-08.2 và TC-04 trong `e2e/proposal/return-proposal/acceptance.spec.ts`; so kết quả với [quickstart](quickstart.md).
- [X] T004 [P] [US1] Áp ràng buộc [data-model.md](data-model.md) `ResearchProject.submittedAt` khi đọc/ghi qua `apps/backend/src/modules/proposal/return-proposal/data.ts`.
- [X] T005 [US1] Thực hiện FR-001/002 trong `apps/backend/src/modules/proposal/return-proposal/service.ts`. Kiểm hồ sơ đã nộp, hạn kỳ và lý do sau khi loại khoảng trắng. P01 thực hiện chuyển về nháp. Chỉ chủ nhiệm có quyền sửa lại sau khi thành công. Kiểm nhánh AC-02 theo [quickstart](quickstart.md).
- [X] T006 [US1] Tích hợp điểm tương tác trong `apps/web/src/features/proposal/return-proposal/view.tsx`. Hiển thị bản nháp mở lại và lý do gắn cùng mã cũ; hiển thị riêng tình huống đã hết hạn và cho người có quyền quay về dữ liệu nguồn.
- [X] T007 [US1] Áp dụng kết luận RV-08 cho FR-003 trong `apps/backend/src/modules/proposal/return-proposal/service.ts` và kiểm TC-03 ở `e2e/proposal/return-proposal/boundary.spec.ts`. Yêu cầu lý do có chữ nhìn thấy, hiển thị nguyên nội dung cho chủ nhiệm.

## Phase 4 · Hồi quy

- [X] T008 Đối chiếu đủ bốn ca và chạy lại luồng tích hợp với F01, F02, P01. Lưu bằng chứng theo mẫu `e2e/proposal/return-proposal/review.md`. Đối chiếu thêm AC-07, AC-08, AC-11 trong [F01](../../docs/features/F01-de-xuat-de-tai/spec.md) ở phần áp dụng cho lát này. So mã trước và sau, hai mốc thời gian nộp, nguyên văn lý do. Dùng ca hết hạn để kiểm không mở lại quyền sửa.

## Phụ thuộc và cách giao

T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008. T003 và T004 dùng tệp riêng sau khi chốt giao tiếp. Giao lát US1 với dữ liệu mẫu trước, sau đó chạy lại bằng module thật. Dùng [RV-08](../review-decisions.md#rv-08) để đối chiếu nhánh biên khi nghiệm thu.

[Biên bản F01](../../e2e/call/open-call/proposal-review.md). Dùng ca Chrome liên hoàn từ kỳ thật và bộ DB riêng cho cạnh tranh, hạn nộp, rollback và quyền.
