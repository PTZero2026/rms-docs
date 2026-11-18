---
story: US-14
feature: F04
review_id: RV-14
status: Draft
updated: 2026-11-18
---

# Kế hoạch · Giao thực hiện đề tài đã duyệt

18/11/2026 · US-14 · F04 / `progress` · [Spec](spec.md)

## Summary

Chuyên viên xác nhận căn cứ giao để từ một quyết định phê duyệt tạo hồ sơ thực hiện có chủ nhiệm và kinh phí duyệt. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Yêu cầu tệp căn cứ đọc được theo phạm vi đề tài trước khi xác nhận giao.

## Technical Context

Một SPA trong `apps/web`, backend chia module, PostgreSQL và hợp đồng sinh type. Ngôn ngữ và phiên bản theo repo thực thi khi khởi tạo. [Kiến trúc đích](../../docs/architecture/overview.md). Kênh nghiệm thu chính: Web RMS theo quyền của người thực hiện. Dữ liệu trong lát: Quyết định/hợp đồng, ngân sách, kỳ thực hiện, tệp căn cứ. Đối chiếu trên bộ thử đề tài APPROVED và mẫu hồ sơ giao. Điều kiện tích hợp: F03, F04, P01.

### Xử lý tại module F04

Chỉ chuyên viên có quyền mới xác nhận. Đánh dấu hồ sơ giao EFFECTIVE cùng lần chuyển IN_PROGRESS, giữ bản tham chiếu cho F05.

## Constitution Check

| Cổng | Trước thiết kế | Sau thiết kế |
|---|---|---|
| Quyền và phạm vi | Xác định tenant, vai trò và đối tượng nguồn | Kiểm cả truy cập trực tiếp và dữ liệu ngoài quyền trong quickstart |
| Vòng đời và audit | Chuyển trạng thái đề tài qua P01, lưu lịch sử và P02 cùng giao dịch. | Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. |
| Hợp đồng và định dạng | Nguồn triển khai tại `packages/api-contracts` | Đặc tả lời gọi trỏ về nguồn duy nhất. VND nguyên, UTC lưu trữ, dd/MM/yyyy và Asia/Ho_Chi_Minh khi hiển thị |
| Phạm vi và review | RV-14 là giả định có người phụ trách | [RV-14](../review-decisions.md#rv-14). Đối chiếu với đặc tả module trước khi nhận task. |

## Project Structure

**Phase 0.** [Research](research.md) ghi căn cứ và phương án đã xét.
**Phase 1.** [Mô hình dữ liệu](data-model.md), [giao tiếp](contracts/interaction.md) và [kịch bản kiểm tra](quickstart.md) xác định đầu vào cho tasks.

Trong repo code, module `apps/backend/src/modules/progress/assign-project` chịu trách nhiệm kiểm quyền và hành vi. Điểm tương tác thuộc `apps/web/src/features/progress/assign-project`. Hợp đồng tại `packages/api-contracts/progress/assign-project.yaml`. Kiểm tích hợp tại `e2e/progress/assign-project`. Các đường dẫn là vị trí đề xuất ở repo thực thi.

| Truy vết | Cách hiện thực | Ca kiểm |
|---|---|---|
| FR-001 / AC-01 | Quyết định/hợp đồng, ngân sách, kỳ thực hiện, tệp căn cứ → Hồ sơ giao EFFECTIVE và đề tài IN_PROGRESS | TC-01 |
| FR-002 / AC-02 | Kiểm nhánh thiếu căn cứ bắt buộc trước khi trả kết quả | TC-02 |
| FR-003 / AC-03 | Yêu cầu tệp căn cứ đọc được theo phạm vi đề tài trước khi xác nhận giao. | TC-03 |
