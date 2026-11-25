---
story: US-10
feature: F03
review_id: RV-10
status: Draft
updated: 2026-11-24
---

# Tasks · Gửi phiếu chấm cá nhân

US-10 · Đợt A · [Plan](plan.md) · [Spec](spec.md). Đường dẫn dưới đây thuộc repo code đích.

## Phase 1 · Chuẩn bị

- [x] T001 Dựng bộ dữ liệu một thành viên được phân công và một thành viên có xung đột lợi ích, thêm tài khoản ngoài tenant trong `e2e/review/submit-score/fixtures.ts`.

## Phase 2 · Nền tảng

- [x] T002 Định nghĩa thao tác gửi phiếu chấm cá nhân với đầu vào “Đợt, thành viên, điểm và nhận xét theo tiêu chí” và đầu ra “Phiếu đã nộp, tổng trọng số và trạng thái khóa” trong `packages/api-contracts/review/submit-score.yaml`; sinh type và kiểm phạm vi theo [hợp đồng](contracts/interaction.md).

## Phase 3 · US1 — Gửi phiếu chấm cá nhân

Mục tiêu độc lập: Thành viên hội đồng nhập điểm theo tiêu chí và nhận xét để phiếu hợp lệ được tính đúng trọng số. Dùng TC-01–04 của [quickstart](quickstart.md) để nghiệm thu.

- [x] T003 [P] [US1] Viết ca US-10.1 / US-10.2 và TC-04 trong `e2e/review/submit-score/acceptance.spec.ts`; so kết quả với [quickstart](quickstart.md).
- [x] T004 [P] [US1] Áp ràng buộc [data-model.md](data-model.md) `CriterionScore.score` khi đọc/ghi qua `apps/backend/src/modules/review/submit-score/data.ts`.
- [x] T005 [US1] Thực hiện FR-001/002 trong `apps/backend/src/modules/review/submit-score/service.ts`. Kiểm lại quan hệ với đề tài, đủ từng tiêu chí và giới hạn điểm. Tính tổng từ điểm và trọng số phía máy chủ, khóa phiếu ngay khi SUBMITTED. Kiểm nhánh AC-02 theo [quickstart](quickstart.md).
- [x] T006 [US1] Tích hợp điểm tương tác trong `apps/web/src/features/review/submit-score/view.tsx`. Hiển thị phiếu đã nộp, tổng trọng số và trạng thái khóa; hiển thị riêng tình huống người chấm là thành viên đề tài và cho người có quyền quay về dữ liệu nguồn.
- [x] T007 [US1] Áp dụng kết luận RV-10 cho FR-003 trong `apps/backend/src/modules/review/submit-score/service.ts` và kiểm TC-03 ở `e2e/review/submit-score/boundary.spec.ts`. Kiểm lại phân công và quan hệ với đề tài ngay lúc gửi.

## Phase 4 · Hồi quy

- [x] T008 Đối chiếu đủ bốn ca và chạy lại luồng tích hợp với F03, B03. Lưu bằng chứng theo mẫu `e2e/review/submit-score/review.md`. Đối chiếu thêm AC-02, AC-06, AC-07 trong [F03](../../docs/features/F03-xet-duyet-hoi-dong/spec.md) ở phần áp dụng cho lát này. Thử điểm bằng tối đa, vượt tối đa và thiếu một tiêu chí. Chỉ phiếu hợp lệ được tính vào số lượng đã gửi.

## Phụ thuộc và cách giao

T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008. T003 và T004 dùng tệp riêng sau khi chốt giao tiếp. Giao lát US1 với dữ liệu mẫu trước, sau đó chạy lại bằng module thật. Dùng [RV-10](../review-decisions.md#rv-10) để đối chiếu nhánh biên khi nghiệm thu.
