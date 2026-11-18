---
story: US-23
feature: F06
review_id: RV-23
status: Draft
updated: 2026-11-18
---

# Tasks · Ghi kết luận nghiệm thu đạt

US-23 · Đợt B · [Plan](plan.md) · [Spec](spec.md). Đường dẫn dưới đây thuộc repo code đích.

## Phase 1 · Chuẩn bị

- [ ] T001 Dựng bộ dữ liệu đợt nghiệm thu có phiếu đã gửi và ngưỡng đã cấu hình, thêm tài khoản ngoài tenant trong `e2e/acceptance/acceptance-result/fixtures.ts`.

## Phase 2 · Nền tảng

- [ ] T002 Định nghĩa thao tác ghi kết luận nghiệm thu đạt với đầu vào “Đợt nghiệm thu, phiếu hợp lệ và ngưỡng” và đầu ra “Kết luận PASSED và bàn giao F05” trong `packages/api-contracts/acceptance/acceptance-result.yaml`; sinh type và kiểm phạm vi theo [hợp đồng](contracts/interaction.md).

## Phase 3 · US1 — Ghi kết luận nghiệm thu đạt

Mục tiêu độc lập: Chuyên viên ghi kết luận đạt theo bộ phiếu nghiệm thu để bàn giao sang bước quyết toán. Dùng TC-01–04 của [quickstart](quickstart.md) để nghiệm thu.

- [ ] T003 [P] [US1] Viết ca US-23.1 / US-23.2 và TC-04 trong `e2e/acceptance/acceptance-result/acceptance.spec.ts`; so kết quả với [quickstart](quickstart.md).
- [ ] T004 [P] [US1] Áp ràng buộc [data-model.md](data-model.md) `EvaluationRound.type` khi đọc/ghi qua `apps/backend/src/modules/acceptance/acceptance-result/data.ts`.
- [ ] T005 [US1] Thực hiện FR-001/002 trong `apps/backend/src/modules/acceptance/acceptance-result/service.ts`. So số phiếu với ngưỡng trước khi tính điểm kết luận. Công bố PASSED qua P01. Quyết toán là hành động kế tiếp của chuyên viên ở F05. Kiểm nhánh AC-02 theo [quickstart](quickstart.md).
- [ ] T006 [US1] Tích hợp điểm tương tác trong `apps/web/src/features/acceptance/acceptance-result/view.tsx`. Hiển thị kết luận PASSED và bàn giao F05; hiển thị riêng tình huống thiếu một phiếu bắt buộc và cho người có quyền quay về dữ liệu nguồn.
- [ ] T007 [US1] Áp dụng kết luận RV-23 cho FR-003 trong `apps/backend/src/modules/acceptance/acceptance-result/service.ts` và kiểm TC-03 ở `e2e/acceptance/acceptance-result/boundary.spec.ts`. Chỉ tính phiếu đã gửi của đợt nghiệm thu đang kết luận.

## Phase 4 · Hồi quy

- [ ] T008 Đối chiếu đủ bốn ca và chạy lại luồng tích hợp với F06, F03, P01. Lưu bằng chứng theo mẫu `e2e/acceptance/acceptance-result/review.md`. Đối chiếu thêm AC-04, AC-06 trong [F06](../../docs/features/F06-nghiem-thu/spec.md) ở phần áp dụng cho lát này. Dùng phiếu của đợt xét đầu vào làm dòng nhiễu; xác minh không được tính bù cho một phiếu nghiệm thu còn thiếu.

## Phụ thuộc và cách giao

T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008. T003 và T004 dùng tệp riêng sau khi chốt giao tiếp. Giao lát US1 với dữ liệu mẫu trước, sau đó chạy lại bằng module thật. Dùng [RV-23](../review-decisions.md#rv-23) để chốt nhánh biên trước khi nghiệm thu.
