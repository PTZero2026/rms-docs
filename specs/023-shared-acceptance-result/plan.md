---
story: US-23
feature: F06
review_id: RV-23
status: Draft
updated: 2026-11-24
---

# Kế hoạch · Ghi kết luận nghiệm thu đạt

18/11/2026 · US-23 · F06 / `acceptance` · [Spec](spec.md)

## Summary

Chuyên viên ghi kết luận đạt theo bộ phiếu nghiệm thu để bàn giao sang bước quyết toán. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Chỉ tính phiếu đã gửi của đợt nghiệm thu đang kết luận.

## Technical Context

Một SPA trong `apps/web`, backend chia module, PostgreSQL và hợp đồng sinh type. Ngôn ngữ và phiên bản theo repo thực thi khi khởi tạo. [Kiến trúc đích](../../docs/architecture/overview.md). Kênh nghiệm thu chính: Dịch vụ dùng chung và điểm gọi của module sở hữu. Dữ liệu trong lát: Đợt nghiệm thu, phiếu hợp lệ và ngưỡng. Đối chiếu trên bộ thử đợt nghiệm thu có phiếu đã gửi và ngưỡng đã cấu hình. Điều kiện tích hợp: F06, F03, P01.

### Xử lý tại module F06

So số phiếu với ngưỡng trước khi tính điểm kết luận. Công bố PASSED qua P01. Quyết toán là hành động kế tiếp của chuyên viên ở F05.

## Constitution Check

| Cổng | Trước thiết kế | Sau thiết kế |
|---|---|---|
| Quyền và phạm vi | Xác định tenant, vai trò và đối tượng nguồn | Kiểm cả truy cập trực tiếp và dữ liệu ngoài quyền trong quickstart |
| Vòng đời và audit | Chuyển trạng thái đề tài qua P01, lưu lịch sử và P02 cùng giao dịch. | Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. |
| Hợp đồng và định dạng | Nguồn triển khai tại `packages/api-contracts` | Đặc tả lời gọi trỏ về nguồn duy nhất. VND nguyên, UTC lưu trữ, dd/MM/yyyy và Asia/Ho_Chi_Minh khi hiển thị |
| Phạm vi và review | RV-23 đã chốt cho triển khai ngày 24/11/2026 | [RV-23](../review-decisions.md#rv-23). Đối chiếu với đặc tả module trước khi nhận task. |

## Project Structure

**Phase 0.** [Research](research.md) ghi căn cứ và phương án đã xét.
**Phase 1.** [Mô hình dữ liệu](data-model.md), [giao tiếp](contracts/interaction.md) và [kịch bản kiểm tra](quickstart.md) xác định đầu vào cho tasks.

Trong repo code, module `apps/backend/src/modules/acceptance/acceptance-result` chịu trách nhiệm kiểm quyền và hành vi. Điểm tương tác thuộc `apps/web/src/features/acceptance/acceptance-result`. Hợp đồng tại `packages/api-contracts/acceptance/acceptance-result.yaml`. Kiểm tích hợp tại `e2e/acceptance/acceptance-result`. Các đường dẫn là vị trí đề xuất ở repo thực thi.

| Truy vết | Cách hiện thực | Ca kiểm |
|---|---|---|
| FR-001 / AC-01 | Đợt nghiệm thu, phiếu hợp lệ và ngưỡng → Kết luận PASSED và bàn giao F05 | TC-01 |
| FR-002 / AC-02 | Kiểm nhánh thiếu một phiếu bắt buộc trước khi trả kết quả | TC-02 |
| FR-003 / AC-03 | Chỉ tính phiếu đã gửi của đợt nghiệm thu đang kết luận. | TC-03 |
