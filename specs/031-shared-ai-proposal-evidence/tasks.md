---
story: US-31
feature: F01
review_id: RV-31
status: Draft
updated: 2026-11-25
---

# Tasks · Đối chiếu mục bắt buộc trong một thuyết minh

US-31 · Đợt C · [Plan](plan.md) · [Spec](spec.md). Đường dẫn dưới đây thuộc repo code đích.

## Phase 1 · Chuẩn bị

- [x] T001 Dựng bộ dữ liệu một mẫu yêu cầu, hai đoạn đã gán nhãn, một hồ sơ ở tenant khác, thêm tài khoản ngoài tenant trong `e2e/proposal/ai-proposal-evidence/fixtures.ts`.

## Phase 2 · Nền tảng

- [x] T002 Định nghĩa thao tác đối chiếu mục bắt buộc trong một thuyết minh với đầu vào “Bản nháp, mẫu yêu cầu, tài liệu cho phép và người yêu cầu” và đầu ra “Trích đoạn có vị trí/phiên bản hoặc thông báo thiếu căn cứ” trong `packages/api-contracts/proposal/ai-proposal-evidence.yaml`; sinh type và kiểm phạm vi theo [hợp đồng](contracts/interaction.md).

## Phase 3 · US1 — Đối chiếu mục bắt buộc trong một thuyết minh

Mục tiêu độc lập: Chủ nhiệm yêu cầu trợ lý đọc một bản nháp được phép dùng và chỉ ra đoạn nào chứng minh một yêu cầu của mẫu. Dùng TC-01–04 của [quickstart](quickstart.md) để nghiệm thu.

- [x] T003 [P] [US1] Viết ca US-31.1 / US-31.2 và TC-04 trong `e2e/proposal/ai-proposal-evidence/acceptance.spec.ts`; so kết quả với [quickstart](quickstart.md).
- [x] T004 [P] [US1] Áp ràng buộc [data-model.md](data-model.md) `AiSuggestion.sources` khi đọc/ghi qua `apps/backend/src/modules/proposal/ai-proposal-evidence/data.ts`.
- [x] T005 [US1] Thực hiện FR-001/002 trong `apps/backend/src/modules/proposal/ai-proposal-evidence/service.ts`. Lọc tenant, quyền và quyền xử lý trước khi lấy văn bản. Lưu phiên bản nguồn, mô hình, mẫu lệnh và quyết định bác/dùng. Trả thiếu căn cứ khi không dẫn được đoạn phù hợp. Kiểm nhánh AC-02 theo [quickstart](quickstart.md).
- [x] T006 [US1] Tích hợp điểm tương tác trong `apps/web/src/features/proposal/ai-proposal-evidence/view.tsx`. Hiển thị trích đoạn có vị trí/phiên bản hoặc thông báo thiếu căn cứ; hiển thị riêng tình huống tài liệu ngoài quyền hoặc thiếu căn cứ và cho người có quyền quay về dữ liệu nguồn.
- [ ] T007 [US1] Áp dụng tiêu chí tạm chốt của RV-31 cho FR-003 trong `apps/backend/src/modules/proposal/ai-proposal-evidence/service.ts` và kiểm TC-03 ở `e2e/proposal/ai-proposal-evidence/boundary.spec.ts`. Hiện chưa đủ căn cứ hoặc từ chối truy xuất; giữ nguyên thuyết minh, cho rà thủ công. Trước pilot đo SC-003 theo quickstart trên 50 hồ sơ gán nhãn độc lập, tìm ≥90% mục thiếu, ≤10% cảnh báo sai, 0 lộ quyền và 0 dẫn chứng bịa.

## Phase 4 · Hồi quy

- [ ] T008 Đối chiếu đủ bốn ca và chạy lại luồng tích hợp với F01, B03, P02. Lưu bằng chứng theo mẫu `e2e/proposal/ai-proposal-evidence/review.md`. Đối chiếu F01/AC-12 trên fixture được phép và lưu bằng chứng cho PO/BA. Trên 50 hồ sơ gán nhãn độc lập, tính số mục thiếu tìm đúng/tổng mục thiếu và số báo sai/tổng cảnh báo. Mục tiêu ≥90%, ≤10%, không lộ chéo hoặc bịa dẫn chứng.

## Phụ thuộc và cách giao

T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008. T003 và T004 dùng tệp riêng sau khi chốt giao tiếp. Giao lát US1 với dữ liệu mẫu trước, sau đó chạy lại bằng module thật. Chỉ mở pilot AI sau khi chủ dữ liệu duyệt bằng chứng nguồn và quyền.

**Kiểm chứng cục bộ 25/11/2026.** Đã kiểm lưu nháp F01 khi mô hình gián đoạn, kiểm quyền nguồn khi tạo và mở lại, và kiểm việc ghép gợi ý với hồ sơ để chấm SC-003. Trên bộ tổng hợp, hoán đổi hai kết quả cùng phiên bản hoặc đếm một đề xuất qua hai mã ẩn danh đều bị phát hiện. T007 và T008 chờ bộ 50 hồ sơ có quyền sử dụng, nhãn độc lập và mô hình được trường duyệt. [Bằng chứng và cách chấm](../../e2e/proposal/ai-proposal-evidence/review.md)
