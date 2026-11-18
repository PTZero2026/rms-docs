---
story: US-15
feature: F04
review_id: RV-15
status: Draft
updated: 2026-11-18
---

# Tasks · Đặt hạn báo cáo theo kỳ

US-15 · Đợt B · [Plan](plan.md) · [Spec](spec.md). Đường dẫn dưới đây thuộc repo code đích.

## Phase 1 · Chuẩn bị

- [ ] T001 Dựng bộ dữ liệu một đề tài đang thực hiện và một mã kỳ, thêm tài khoản ngoài tenant trong `e2e/progress/report-period/fixtures.ts`.

## Phase 2 · Nền tảng

- [ ] T002 Định nghĩa thao tác đặt hạn báo cáo theo kỳ với đầu vào “Đề tài đang làm, mã kỳ và hạn nộp” và đầu ra “Một báo cáo PENDING_SUBMISSION cho kỳ mới” trong `packages/api-contracts/progress/report-period.yaml`; sinh type và kiểm phạm vi theo [hợp đồng](contracts/interaction.md).

## Phase 3 · US1 — Đặt hạn báo cáo theo kỳ

Mục tiêu độc lập: Chuyên viên lập một kỳ báo cáo có hạn nộp để chủ nhiệm biết thời điểm phải nộp tiến độ. Dùng TC-01–04 của [quickstart](quickstart.md) để nghiệm thu.

- [ ] T003 [P] [US1] Viết ca US-15.1 / US-15.2 và TC-04 trong `e2e/progress/report-period/acceptance.spec.ts`; so kết quả với [quickstart](quickstart.md).
- [ ] T004 [P] [US1] Áp ràng buộc [data-model.md](data-model.md) `ProgressReport.period` khi đọc/ghi qua `apps/backend/src/modules/progress/report-period/data.ts`.
- [ ] T005 [US1] Thực hiện FR-001/002 trong `apps/backend/src/modules/progress/report-period/service.ts`. Chống trùng ngay ở thao tác tạo để hai yêu cầu đồng thời chỉ tạo một kỳ. Trạng thái ban đầu PENDING_SUBMISSION cung cấp đầu vào cho B04. Kiểm nhánh AC-02 theo [quickstart](quickstart.md).
- [ ] T006 [US1] Tích hợp điểm tương tác trong `apps/web/src/features/progress/report-period/view.tsx`. Hiển thị một báo cáo PENDING_SUBMISSION cho kỳ mới; hiển thị riêng tình huống đã có cùng kỳ trên đề tài và cho người có quyền quay về dữ liệu nguồn.
- [ ] T007 [US1] Áp dụng kết luận RV-15 cho FR-003 trong `apps/backend/src/modules/progress/report-period/service.ts` và kiểm TC-03 ở `e2e/progress/report-period/boundary.spec.ts`. Áp khóa theo cặp đề tài và kỳ, cho hai đề tài khác nhau dùng cùng tên kỳ.

## Phase 4 · Hồi quy

- [ ] T008 Đối chiếu đủ bốn ca và chạy lại luồng tích hợp với F04, B04. Lưu bằng chứng theo mẫu `e2e/progress/report-period/review.md`. Đối chiếu thêm AC-02, AC-13 trong [F04](../../docs/features/F04-quan-ly-tien-do/spec.md) ở phần áp dụng cho lát này. Hai lần tạo cùng kỳ cùng đề tài trả về tối đa một dòng; cùng mã kỳ ở hai đề tài khác nhau có hai dòng.

## Phụ thuộc và cách giao

T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008. T003 và T004 dùng tệp riêng sau khi chốt giao tiếp. Giao lát US1 với dữ liệu mẫu trước, sau đó chạy lại bằng module thật. Dùng [RV-15](../review-decisions.md#rv-15) để chốt nhánh biên trước khi nghiệm thu.
