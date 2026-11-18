---
story: US-02
feature: B01
review_id: RV-02
status: Draft
updated: 2026-11-18
---

# Kế hoạch · Ghi đè một cấu hình của trường

18/11/2026 · US-02 · B01 / `catalog` · [Spec](spec.md)

## Summary

Quản trị tenant điều chỉnh một giá trị dùng cho kỳ xét của trường, các trường khác tiếp tục dùng giá trị chung. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Làm mất hiệu lực mục trong bộ nhớ đệm của trường vừa sửa trước lần đọc kế tiếp.

## Technical Context

Một SPA trong `apps/web`, backend chia module, PostgreSQL và hợp đồng sinh type. Ngôn ngữ và phiên bản theo repo thực thi khi khởi tạo. [Kiến trúc đích](../../docs/architecture/overview.md). Kênh nghiệm thu chính: Dịch vụ dùng chung và điểm gọi của module sở hữu. Dữ liệu trong lát: Khóa cấu hình, nội dung mới, trường đang quản trị. Đối chiếu trên bộ thử hai tenant dùng cùng một khóa cấu hình. Điều kiện tích hợp: B01, B03.

### Xử lý tại module B01

Xác định tenant từ phiên quản trị. Ghi override riêng, xóa mục cache đúng phạm vi, rồi thử đọc cùng key ở A và B. Xử lý giá trị lớn bằng cơ chế của B01.

## Constitution Check

| Cổng | Trước thiết kế | Sau thiết kế |
|---|---|---|
| Quyền và phạm vi | Xác định tenant, vai trò và đối tượng nguồn | Kiểm cả truy cập trực tiếp và dữ liệu ngoài quyền trong quickstart |
| Vòng đời và audit | Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ. | Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. |
| Hợp đồng và định dạng | Nguồn triển khai tại `packages/api-contracts` | Đặc tả lời gọi trỏ về nguồn duy nhất. VND nguyên, UTC lưu trữ, dd/MM/yyyy và Asia/Ho_Chi_Minh khi hiển thị |
| Phạm vi và review | RV-02 là giả định có người phụ trách | [RV-02](../review-decisions.md#rv-02). Đối chiếu với đặc tả module trước khi nhận task. |

## Project Structure

**Phase 0.** [Research](research.md) ghi căn cứ và phương án đã xét.
**Phase 1.** [Mô hình dữ liệu](data-model.md), [giao tiếp](contracts/interaction.md) và [kịch bản kiểm tra](quickstart.md) xác định đầu vào cho tasks.

Trong repo code, module `apps/backend/src/modules/catalog/config-override` chịu trách nhiệm kiểm quyền và hành vi. Điểm tương tác thuộc `apps/web/src/features/catalog/config-override`. Hợp đồng tại `packages/api-contracts/catalog/config-override.yaml`. Kiểm tích hợp tại `e2e/catalog/config-override`. Các đường dẫn là vị trí đề xuất ở repo thực thi.

| Truy vết | Cách hiện thực | Ca kiểm |
|---|---|---|
| FR-001 / AC-01 | Khóa cấu hình, nội dung mới, trường đang quản trị → Giá trị đọc hiệu lực tại A và giá trị chung tại B | TC-01 |
| FR-002 / AC-02 | Kiểm nhánh tenant B chỉ có giá trị chung trước khi trả kết quả | TC-02 |
| FR-003 / AC-03 | Làm mất hiệu lực mục trong bộ nhớ đệm của trường vừa sửa trước lần đọc kế tiếp. | TC-03 |
