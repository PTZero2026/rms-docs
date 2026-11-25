---
story: US-21
feature: F07
review_id: RV-21
status: Draft
updated: 2026-11-24
---

# Kế hoạch · Duyệt sản phẩm để tính vào cam kết

18/11/2026 · US-21 · F07 / `product` · [Spec](spec.md)

## Summary

Chuyên viên duyệt một sản phẩm hợp lệ để hệ thống phản ánh đúng số sản phẩm đạt theo loại. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Tổng hợp theo định danh sản phẩm đã duyệt, độc lập số lần gửi lệnh.

## Technical Context

Một SPA trong `apps/web`, backend chia module, PostgreSQL và hợp đồng sinh type. Ngôn ngữ và phiên bản theo repo thực thi khi khởi tạo. [Kiến trúc đích](../../docs/architecture/overview.md). Kênh nghiệm thu chính: Dịch vụ dùng chung và điểm gọi của module sở hữu. Dữ liệu trong lát: Sản phẩm chờ duyệt, chứng cứ và cam kết theo loại. Đối chiếu trên bộ thử một sản phẩm đang chờ và cam kết cùng loại. Điều kiện tích hợp: F07, F04, F06.

### Xử lý tại module F07

Từ chối người chỉ có quyền kê khai. Khi duyệt, khóa trường chính và đếm theo ID, cho F04/F06 đọc cùng số đạt.

## Constitution Check

| Cổng | Trước thiết kế | Sau thiết kế |
|---|---|---|
| Quyền và phạm vi | Xác định tenant, vai trò và đối tượng nguồn | Kiểm cả truy cập trực tiếp và dữ liệu ngoài quyền trong quickstart |
| Vòng đời và audit | Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ. | Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. |
| Hợp đồng và định dạng | Nguồn triển khai tại `packages/api-contracts` | Đặc tả lời gọi trỏ về nguồn duy nhất. VND nguyên, UTC lưu trữ, dd/MM/yyyy và Asia/Ho_Chi_Minh khi hiển thị |
| Phạm vi và review | RV-21 đã chốt cho triển khai ngày 24/11/2026 | [RV-21](../review-decisions.md#rv-21). Đối chiếu với đặc tả module trước khi nhận task. |

## Project Structure

**Phase 0.** [Research](research.md) ghi căn cứ và phương án đã xét.
**Phase 1.** [Mô hình dữ liệu](data-model.md), [giao tiếp](contracts/interaction.md) và [kịch bản kiểm tra](quickstart.md) xác định đầu vào cho tasks.

Trong repo code, module `apps/backend/src/modules/product/approve-output` chịu trách nhiệm kiểm quyền và hành vi. Điểm tương tác thuộc `apps/web/src/features/product/approve-output`. Hợp đồng tại `packages/api-contracts/product/approve-output.yaml`. Kiểm tích hợp tại `e2e/product/approve-output`. Các đường dẫn là vị trí đề xuất ở repo thực thi.

| Truy vết | Cách hiện thực | Ca kiểm |
|---|---|---|
| FR-001 / AC-01 | Sản phẩm chờ duyệt, chứng cứ và cam kết theo loại → Người duyệt, giờ duyệt, số đầu ra được tính | TC-01 |
| FR-002 / AC-02 | Kiểm nhánh chủ nhiệm chỉ có quyền kê khai trước khi trả kết quả | TC-02 |
| FR-003 / AC-03 | Tổng hợp theo định danh sản phẩm đã duyệt, độc lập số lần gửi lệnh. | TC-03 |
