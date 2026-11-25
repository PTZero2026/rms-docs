---
story: US-19
feature: F05
review_id: RV-19
status: Draft
updated: 2026-11-24
---

# Kế hoạch · Ghi khoản chi kèm chứng từ

18/11/2026 · US-19 · F05 / `budget` · [Spec](spec.md)

## Summary

Chủ nhiệm ghi khoản chi VND với ngày và minh chứng. Hệ thống tính số còn lại và cảnh báo khi vượt kinh phí thực hiện. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Lưu khoản hợp lệ, hiển thị số vượt và số dư mới, để chuyên viên rà khi đóng.

## Technical Context

Một SPA trong `apps/web`, backend chia module, PostgreSQL và hợp đồng sinh type. Ngôn ngữ và phiên bản theo repo thực thi khi khởi tạo. [Kiến trúc đích](../../docs/architecture/overview.md). Kênh nghiệm thu chính: Web RMS theo quyền của người thực hiện. Dữ liệu trong lát: Đề tài, số VND nguyên, ngày chi, mô tả và tệp nếu có. Đối chiếu trên bộ thử đề tài đang thực hiện, còn 2 triệu đồng. Điều kiện tích hợp: F05, B03.

### Xử lý tại module F05

Chỉ cho chủ nhiệm ghi vào đề tài đang thực hiện của mình. Tính lại số dư sau lưu; chứng từ theo quyền của đề tài. Vượt ngân sách phát cảnh báo.

## Constitution Check

| Cổng | Trước thiết kế | Sau thiết kế |
|---|---|---|
| Quyền và phạm vi | Xác định tenant, vai trò và đối tượng nguồn | Kiểm cả truy cập trực tiếp và dữ liệu ngoài quyền trong quickstart |
| Vòng đời và audit | Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ. | Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. |
| Hợp đồng và định dạng | Nguồn triển khai tại `packages/api-contracts` | Đặc tả lời gọi trỏ về nguồn duy nhất. VND nguyên, UTC lưu trữ, dd/MM/yyyy và Asia/Ho_Chi_Minh khi hiển thị |
| Phạm vi và review | RV-19 đã chốt cho triển khai ngày 24/11/2026 | [RV-19](../review-decisions.md#rv-19). Đối chiếu với đặc tả module trước khi nhận task. |

## Project Structure

**Phase 0.** [Research](research.md) ghi căn cứ và phương án đã xét.
**Phase 1.** [Mô hình dữ liệu](data-model.md), [giao tiếp](contracts/interaction.md) và [kịch bản kiểm tra](quickstart.md) xác định đầu vào cho tasks.

Trong repo code, module `apps/backend/src/modules/budget/record-expense` chịu trách nhiệm kiểm quyền và hành vi. Điểm tương tác thuộc `apps/web/src/features/budget/record-expense`. Hợp đồng tại `packages/api-contracts/budget/record-expense.yaml`. Kiểm tích hợp tại `e2e/budget/record-expense`. Các đường dẫn là vị trí đề xuất ở repo thực thi.

| Truy vết | Cách hiện thực | Ca kiểm |
|---|---|---|
| FR-001 / AC-01 | Đề tài, số VND nguyên, ngày chi, mô tả và tệp nếu có → Khoản chi, số dư và cảnh báo vượt | TC-01 |
| FR-002 / AC-02 | Kiểm nhánh số tiền bằng 0 trước khi trả kết quả | TC-02 |
| FR-003 / AC-03 | Lưu khoản hợp lệ, hiển thị số vượt và số dư mới, để chuyên viên rà khi đóng. | TC-03 |
