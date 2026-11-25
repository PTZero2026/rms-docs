---
story: US-11
feature: F03
review_id: RV-11
status: Draft
updated: 2026-11-21
---

# Tasks · Chốt kết quả xét duyệt

US-11 · Đợt A · [Plan](plan.md) · [Spec](spec.md). Đường dẫn dưới đây thuộc repo code đích.

## Phase 1 · Chuẩn bị

- [x] T001 Dựng bộ dữ liệu ba bộ phiếu dựng sẵn ở trên, dưới và bằng ngưỡng, thêm tài khoản ngoài tenant trong `e2e/review/review-decision/fixtures.ts`.

## Phase 2 · Nền tảng

- [x] T002 Định nghĩa thao tác chốt kết quả xét duyệt với đầu vào “Đợt khoa học, ngưỡng và phiếu đã nộp hoặc kết luận khoa học đã lưu, yêu cầu và kết quả đạo đức nếu áp dụng” và đầu ra “Kết luận đợt, trạng thái đề tài và số phiếu thiếu nếu bị chặn” trong `packages/api-contracts/review/review-decision.yaml`; sinh type và kiểm phạm vi theo [hợp đồng](contracts/interaction.md).

## Phase 3 · US1 — Chốt kết quả xét duyệt

Mục tiêu độc lập: Chuyên viên kết luận theo số phiếu và ngưỡng điểm để công bố đúng quyết định của đợt. Dùng TC-01–04 của [quickstart](quickstart.md) để nghiệm thu.

- [x] T003 [P] [US1] Viết ca US-11.1 / US-11.2 và TC-04 trong `e2e/review/review-decision/acceptance.spec.ts`; so kết quả với [quickstart](quickstart.md).
- [x] T004 [P] [US1] Áp ràng buộc [data-model.md](data-model.md) `EvaluationRound.conclusion` khi đọc/ghi qua `apps/backend/src/modules/review/review-decision/data.ts`.
- [x] T005 [US1] Thực hiện FR-001/002 trong `apps/backend/src/modules/review/review-decision/service.ts`. Tính số phiếu hợp lệ trước điểm tổng hợp. Bằng ngưỡng cho kết quả đạt. Khi phải thẩm định đạo đức, tách lưu kết luận khoa học khỏi bước công bố phê duyệt cuối. Kiểm nhánh AC-02 theo [quickstart](quickstart.md).
- [x] T006 [US1] Tích hợp điểm tương tác trong `apps/web/src/features/review/review-decision/view.tsx`. Hiển thị kết luận đợt, trạng thái đề tài và số phiếu thiếu nếu bị chặn; hiển thị riêng tình huống chưa đủ phiếu và cho người có quyền quay về dữ liệu nguồn.
- [x] T007 [US1] Áp dụng kết luận RV-11 cho FR-003 trong `apps/backend/src/modules/review/review-decision/service.ts` và kiểm TC-03 ở `e2e/review/review-decision/boundary.spec.ts`. Kiểm cả nhánh chờ, bổ sung, thông qua và từ chối cuối cùng. Xử lý lại cùng kết quả thông qua chỉ gửi một thông báo phê duyệt.

## Phase 4 · Hồi quy

- [x] T008 Đối chiếu đủ bốn ca và chạy lại luồng tích hợp với F03, P01, B04. Lưu bằng chứng theo mẫu `e2e/review/review-decision/review.md`. Đối chiếu thêm AC-03, AC-04, AC-05 trong [F03](../../docs/features/F03-xet-duyet-hoi-dong/spec.md) ở phần áp dụng cho lát này. Đối chiếu trạng thái, audit và thông báo với từng biến thể TC-01/TC-03 trong quickstart.

## Phụ thuộc và cách giao

T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008. T003 và T004 dùng tệp riêng sau khi chốt giao tiếp. Giao lát US1 với dữ liệu mẫu trước, sau đó chạy lại bằng module thật. Dùng [RV-11](../review-decisions.md#rv-11) làm căn cứ nghiệm thu nhánh đạo đức.
