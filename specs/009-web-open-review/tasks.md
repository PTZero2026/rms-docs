---
story: US-09
feature: F03
review_id: RV-09
status: Draft
updated: 2026-11-24
---

# Tasks · Mở đợt chấm cho một đề tài

US-09 · Đợt A · [Plan](plan.md) · [Spec](spec.md). Đường dẫn dưới đây thuộc repo code đích.

## Phase 1 · Chuẩn bị

- [x] T001 Dựng bộ dữ liệu kỳ đã đóng, hồ sơ đã nộp, hội đồng xét duyệt có thành viên, thêm tài khoản ngoài tenant trong `e2e/review/open-review/fixtures.ts`.

## Phase 2 · Nền tảng

- [x] T002 Định nghĩa thao tác mở đợt chấm cho một đề tài với đầu vào “Hồ sơ chốt, hội đồng, bộ tiêu chí và phân công” và đầu ra “Đợt thu phiếu và danh sách người được chấm” trong `packages/api-contracts/review/open-review.yaml`; sinh type và kiểm phạm vi theo [hợp đồng](contracts/interaction.md).

## Phase 3 · US1 — Mở đợt chấm cho một đề tài

Mục tiêu độc lập: Chuyên viên gắn đề tài đã chốt vào hội đồng và bộ tiêu chí để phát phiếu cho người được phân công. Dùng TC-01–04 của [quickstart](quickstart.md) để nghiệm thu.

- [x] T003 [P] [US1] Viết ca US-09.1 / US-09.2 và TC-04 trong `e2e/review/open-review/acceptance.spec.ts`; so kết quả với [quickstart](quickstart.md).
- [x] T004 [P] [US1] Áp ràng buộc [data-model.md](data-model.md) `EvaluationRound.type` khi đọc/ghi qua `apps/backend/src/modules/review/open-review/data.ts`.
- [x] T005 [US1] Thực hiện FR-001/002 trong `apps/backend/src/modules/review/open-review/service.ts`. Kiểm kỳ đã đóng, hồ sơ đã chốt và ít nhất một thành viên trước khi tạo đợt. Tạo đợt và chuyển UNDER_REVIEW như một đơn vị công việc. Kiểm nhánh AC-02 theo [quickstart](quickstart.md).
- [x] T006 [US1] Tích hợp điểm tương tác trong `apps/web/src/features/review/open-review/view.tsx`. Hiển thị đợt thu phiếu và danh sách người được chấm; hiển thị riêng tình huống thành viên chỉ có quyền chấm và cho người có quyền quay về dữ liệu nguồn.
- [x] T007 [US1] Áp dụng kết luận RV-09 cho FR-003 trong `apps/backend/src/modules/review/open-review/service.ts` và kiểm TC-03 ở `e2e/review/open-review/boundary.spec.ts`. Chỉ mở một đợt đang thu phiếu cho cùng hồ sơ và lần xét, trả thông tin đợt đã mở cho lần sau.

## Phase 4 · Hồi quy

- [x] T008 Đối chiếu đủ bốn ca và chạy lại luồng tích hợp với F02, F03, P01. Lưu bằng chứng theo mẫu `e2e/review/open-review/review.md`. Đối chiếu thêm AC-01, AC-09 trong [F03](../../docs/features/F03-xet-duyet-hoi-dong/spec.md) ở phần áp dụng cho lát này. Đếm đợt, danh sách phân công và lịch sử chuyển khi hai chuyên viên xác nhận cùng lúc.

## Phụ thuộc và cách giao

T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008. T003 và T004 dùng tệp riêng sau khi chốt giao tiếp. Giao lát US1 với dữ liệu mẫu trước, sau đó chạy lại bằng module thật. Dùng [RV-09](../review-decisions.md#rv-09) để đối chiếu nhánh biên khi nghiệm thu.
