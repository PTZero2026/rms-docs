---
story: US-08
feature: F01
review_id: RV-08
status: Draft
updated: 2026-11-24
---

# Kế hoạch · Trả hồ sơ cần bổ sung

18/11/2026 · US-08 · F01 / `proposal` · [Spec](spec.md)

## Summary

Chuyên viên ghi lý do để chủ nhiệm sửa và theo cùng một mã khi nộp lại. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Yêu cầu lý do có chữ nhìn thấy, hiển thị nguyên nội dung cho chủ nhiệm.

## Technical Context

Một SPA trong `apps/web`, backend chia module, PostgreSQL và hợp đồng sinh type. Ngôn ngữ và phiên bản theo repo thực thi khi khởi tạo. [Kiến trúc đích](../../docs/architecture/overview.md). Kênh nghiệm thu chính: Web RMS theo quyền của người thực hiện. Dữ liệu trong lát: Mã hồ sơ đã nộp, lý do trả, kỳ tiếp nhận. Đối chiếu trên bộ thử hồ sơ đã nộp có mã, hai kỳ còn hạn và đã đóng. Điều kiện tích hợp: F01, F02, P01.

### Xử lý tại module F01

Kiểm hồ sơ đã nộp, hạn kỳ và lý do sau khi loại khoảng trắng. P01 thực hiện chuyển về nháp. Chỉ chủ nhiệm có quyền sửa lại sau khi thành công.

## Constitution Check

| Cổng | Trước thiết kế | Sau thiết kế |
|---|---|---|
| Quyền và phạm vi | Xác định tenant, vai trò và đối tượng nguồn | Kiểm cả truy cập trực tiếp và dữ liệu ngoài quyền trong quickstart |
| Vòng đời và audit | Chuyển trạng thái đề tài qua P01, lưu lịch sử và P02 cùng giao dịch. | Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. |
| Hợp đồng và định dạng | Nguồn triển khai tại `packages/api-contracts` | Đặc tả lời gọi trỏ về nguồn duy nhất. VND nguyên, UTC lưu trữ, dd/MM/yyyy và Asia/Ho_Chi_Minh khi hiển thị |
| Phạm vi và review | RV-08 đã chốt cho triển khai ngày 24/11/2026 | [RV-08](../review-decisions.md#rv-08). Đối chiếu với đặc tả module trước khi nhận task. |

## Project Structure

**Phase 0.** [Research](research.md) ghi căn cứ và phương án đã xét.
**Phase 1.** [Mô hình dữ liệu](data-model.md), [giao tiếp](contracts/interaction.md) và [kịch bản kiểm tra](quickstart.md) xác định đầu vào cho tasks.

Trong repo code, module `apps/backend/src/modules/proposal/return-proposal` chịu trách nhiệm kiểm quyền và hành vi. Điểm tương tác thuộc `apps/web/src/features/proposal/return-proposal`. Hợp đồng tại `packages/api-contracts/proposal/return-proposal.yaml`. Kiểm tích hợp tại `e2e/proposal/return-proposal`. Các đường dẫn là vị trí đề xuất ở repo thực thi.

| Truy vết | Cách hiện thực | Ca kiểm |
|---|---|---|
| FR-001 / AC-01 | Mã hồ sơ đã nộp, lý do trả, kỳ tiếp nhận → Bản nháp mở lại và lý do gắn cùng mã cũ | TC-01 |
| FR-002 / AC-02 | Kiểm nhánh đã hết hạn trước khi trả kết quả | TC-02 |
| FR-003 / AC-03 | Yêu cầu lý do có chữ nhìn thấy, hiển thị nguyên nội dung cho chủ nhiệm. | TC-03 |
