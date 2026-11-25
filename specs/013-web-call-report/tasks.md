---
story: US-13
feature: B02
review_id: RV-13
status: Draft
updated: 2026-11-25
---

# Tasks · Đếm hồ sơ theo trạng thái của một kỳ

US-13 · Đợt A · [Plan](plan.md) · [Spec](spec.md). Đường dẫn dưới đây thuộc repo code đích.

## Phase 1 · Chuẩn bị

- [x] T001 Dựng bộ dữ liệu ba hồ sơ đã cấp mã thuộc hai đơn vị (một hồ sơ đã nộp lại, một hồ sơ bị trả về Nháp) và một nháp chưa cấp mã, thêm tài khoản ngoài tenant trong `e2e/report/call-report/fixtures.ts`.

## Phase 2 · Nền tảng

- [x] T002 Định nghĩa thao tác đếm hồ sơ theo trạng thái của một kỳ với đầu vào “Kỳ, phạm vi đơn vị, thời điểm trích xuất” và đầu ra “Số hồ sơ theo trạng thái, tổng cộng và danh sách đối chứng” trong `packages/api-contracts/report/call-report.yaml`; sinh type và kiểm phạm vi theo [hợp đồng](contracts/interaction.md).

## Phase 3 · US1 — Đếm hồ sơ theo trạng thái của một kỳ

Mục tiêu độc lập: Trưởng phòng lấy số đề tài theo trạng thái chuẩn của một kỳ tại thời điểm trích xuất, để đối chiếu danh sách hội đồng. Dùng TC-01–04 của [quickstart](quickstart.md) để nghiệm thu.

- [x] T003 [P] [US1] Viết ca US-13.1 / US-13.2 và TC-04 trong `e2e/report/call-report/acceptance.spec.ts`; so kết quả với [quickstart](quickstart.md).
- [x] T004 [P] [US1] Áp ràng buộc [data-model.md](data-model.md) `ResearchProject.id` khi đọc/ghi qua `apps/backend/src/modules/report/call-report/data.ts`.
- [x] T005 [US1] Thực hiện FR-001/002 trong `apps/backend/src/modules/report/call-report/service.ts`. Áp kỳ và quyền trước khi nhóm. Cố định tập ID và trạng thái của bản chụp để chi tiết và tệp khớp số tổng. Kiểm lại quyền tải, nếu thu hẹp thì dựng lại theo quyền mới. Kiểm nhánh AC-02 theo [quickstart](quickstart.md).
- [x] T006 [US1] Tích hợp điểm tương tác trong `apps/web/src/features/report/call-report/view.tsx`. Hiển thị số hồ sơ theo trạng thái, tổng cộng và danh sách đối chứng; hiển thị riêng tình huống chỉ có quyền một đơn vị và cho người có quyền quay về dữ liệu nguồn.
- [x] T007 [US1] Áp dụng kết luận RV-13 cho FR-003 trong `apps/backend/src/modules/report/call-report/service.ts` và kiểm TC-03 ở `e2e/report/call-report/boundary.spec.ts`. Trong kỳ và phạm vi được xem, mỗi hồ sơ đã cấp mã được tính một lần, kể cả khi nộp lại hoặc đang ở Nháp sau khi bị trả. Loại nháp chưa từng nộp, chưa có mã. Tổng, chi tiết và tệp xuất cùng dùng trạng thái tại thời điểm tạo bản chụp.

## Phase 4 · Hồi quy

- [ ] T008 Đối chiếu đủ bốn ca và chạy lại luồng tích hợp với B02, P01, B03. Lưu bằng chứng theo mẫu `e2e/report/call-report/review.md`. Khi chạy pilot, lưu danh sách đối chứng có chữ ký của trưởng phòng KHCN. Sau khi tạo bản chụp, chuyển trạng thái một hồ sơ rồi đối chiếu tệp với danh sách cũ; tạo bản chụp mới phải thấy thay đổi.

## Phụ thuộc và cách giao

T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008. T003 và T004 dùng tệp riêng sau khi chốt giao tiếp. Giao lát US1 với dữ liệu mẫu trước, sau đó chạy lại bằng module thật. Dùng [RV-13](../review-decisions.md#rv-13) làm căn cứ nghiệm thu ca nộp lại và bản chụp báo cáo.

**Kiểm chứng cục bộ 25/11/2026.** T008 đã chạy đủ TC-01–04. Màn hình và CSV cùng mã bản chụp, số lượng theo nhóm và thời điểm. Quay lại từ hồ sơ nguồn đọc đúng nhóm trước khi nộp lại. Khi thu quyền khoa, hai tab cùng bị chặn mở hoặc xuất bản cũ. Đang chờ sổ tiếp nhận cùng mốc và chữ ký trưởng phòng khi pilot. [Biên bản, ảnh và CSV mẫu](../../e2e/report/call-report/review.md)
