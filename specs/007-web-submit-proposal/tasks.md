---
story: US-07
feature: F01
review_id: RV-07
status: Draft
updated: 2026-11-18
---

# Tasks · Nộp đề xuất và nhận mã theo dõi

US-07 · Đợt A · [Plan](plan.md) · [Spec](spec.md). Đường dẫn dưới đây thuộc repo code đích.

## Phase 1 · Chuẩn bị

- [ ] T001 Dựng bộ dữ liệu hai hồ sơ nháp, đồng hồ cố định trong hạn và sau hạn, thêm tài khoản ngoài tenant trong `e2e/proposal/submit-proposal/fixtures.ts`.

## Phase 2 · Nền tảng

- [ ] T002 Định nghĩa thao tác nộp đề xuất và nhận mã theo dõi với đầu vào “Định danh nháp, bản biểu mẫu và nội dung lần nộp” và đầu ra “Mã đề tài, giờ tiếp nhận, trạng thái và quyền sửa” trong `packages/api-contracts/proposal/submit-proposal.yaml`; sinh type và kiểm phạm vi theo [hợp đồng](contracts/interaction.md).

## Phase 3 · US1 — Nộp đề xuất và nhận mã theo dõi

Mục tiêu độc lập: Chủ nhiệm nộp thuyết minh đủ trường, nhận mã duy nhất và thời điểm tiếp nhận để tra cứu sau kỳ. Dùng TC-01–04 của [quickstart](quickstart.md) để nghiệm thu.

- [ ] T003 [P] [US1] Viết ca US-07.1 / US-07.2 và TC-04 trong `e2e/proposal/submit-proposal/acceptance.spec.ts`; so kết quả với [quickstart](quickstart.md).
- [ ] T004 [P] [US1] Áp ràng buộc [data-model.md](data-model.md) `ResearchProject.projectCode` khi đọc/ghi qua `apps/backend/src/modules/proposal/submit-proposal/data.ts`.
- [ ] T005 [US1] Thực hiện FR-001/002 trong `apps/backend/src/modules/proposal/submit-proposal/service.ts`. Kiểm cửa sổ thời gian, lĩnh vực và toàn bộ trường bắt buộc tại máy chủ. Cấp mã trong giao dịch chuyển bước. Nếu đã có mã sau lần bổ sung, tái sử dụng mã đó. Kiểm nhánh AC-02 theo [quickstart](quickstart.md).
- [ ] T006 [US1] Tích hợp điểm tương tác trong `apps/web/src/features/proposal/submit-proposal/view.tsx`. Hiển thị mã đề tài, giờ tiếp nhận, trạng thái và quyền sửa; hiển thị riêng tình huống nháp đủ trường, đã quá hạn và cho người có quyền quay về dữ liệu nguồn.
- [ ] T007 [US1] Áp dụng kết luận RV-07 cho FR-003 trong `apps/backend/src/modules/proposal/submit-proposal/service.ts` và kiểm TC-03 ở `e2e/proposal/submit-proposal/boundary.spec.ts`. Nhận khi thời điểm máy chủ tiếp nhận bằng hạn và kỳ còn mở, từ chối sau hạn.

## Phase 4 · Hồi quy

- [ ] T008 Đối chiếu đủ bốn ca và chạy lại luồng tích hợp với F01, F02, P01, P02. Lưu bằng chứng theo mẫu `e2e/proposal/submit-proposal/review.md`. Đối chiếu thêm AC-02, AC-03, AC-04 trong [F01](../../docs/features/F01-de-xuat-de-tai/spec.md) ở phần áp dụng cho lát này. Gửi song song hai yêu cầu cho cùng nháp và hai nháp khác nhau; đối chiếu tính duy nhất, khóa sửa và audit.

## Phụ thuộc và cách giao

T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008. T003 và T004 dùng tệp riêng sau khi chốt giao tiếp. Giao lát US1 với dữ liệu mẫu trước, sau đó chạy lại bằng module thật. Dùng [RV-07](../review-decisions.md#rv-07) để chốt nhánh biên trước khi nghiệm thu.
