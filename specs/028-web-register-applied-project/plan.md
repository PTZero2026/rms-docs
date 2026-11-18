---
story: US-28
feature: F11
review_id: RV-28
status: Draft
updated: 2026-11-18
---

# Kế hoạch · Kê khai dự án phục vụ sản xuất

18/11/2026 · US-28 · F11 / `applied-project` · [Spec](spec.md)

## Summary

Người kê khai ghi đơn vị chủ trì, đối tác ngoài và tổng kinh phí VND để phòng khoa học xét dự án ứng dụng. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Yêu cầu đơn vị chủ trì khi lưu, kiểm ít nhất một đối tác ngoài tại lúc gửi duyệt.

## Technical Context

Một SPA trong `apps/web`, backend chia module, PostgreSQL và hợp đồng sinh type. Ngôn ngữ và phiên bản theo repo thực thi khi khởi tạo. [Kiến trúc đích](../../docs/architecture/overview.md). Kênh nghiệm thu chính: Web RMS theo quyền của người thực hiện. Dữ liệu trong lát: Đơn vị chủ trì, đối tác ngoài và tổng kinh phí. Đối chiếu trên bộ thử tenant bật F11, danh mục đơn vị và một đối tác. Bật module E4 riêng theo tenant và quy chế đã chọn. Điều kiện tích hợp: F11, B01.

### Xử lý tại module F11

Cho chọn hoặc nhập đối tác theo danh mục của trường. Lưu tổng VND tại đầu mục. Kiểm có viện khi lưu và có ít nhất một đối tác khi gửi duyệt.

## Constitution Check

| Cổng | Trước thiết kế | Sau thiết kế |
|---|---|---|
| Quyền và phạm vi | Xác định tenant, vai trò và đối tượng nguồn | Kiểm cả truy cập trực tiếp và dữ liệu ngoài quyền trong quickstart |
| Vòng đời và audit | Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ. | Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. |
| Hợp đồng và định dạng | Nguồn triển khai tại `packages/api-contracts` | Đặc tả lời gọi trỏ về nguồn duy nhất. VND nguyên, UTC lưu trữ, dd/MM/yyyy và Asia/Ho_Chi_Minh khi hiển thị |
| Phạm vi và review | RV-28 là giả định có người phụ trách | [RV-28](../review-decisions.md#rv-28). Bật module E4 riêng theo tenant và quy chế đã chọn.  |

## Project Structure

**Phase 0.** [Research](research.md) ghi căn cứ và phương án đã xét.
**Phase 1.** [Mô hình dữ liệu](data-model.md), [giao tiếp](contracts/interaction.md) và [kịch bản kiểm tra](quickstart.md) xác định đầu vào cho tasks.

Trong repo code, module `apps/backend/src/modules/applied-project/register-applied-project` chịu trách nhiệm kiểm quyền và hành vi. Điểm tương tác thuộc `apps/web/src/features/applied-project/register-applied-project`. Hợp đồng tại `packages/api-contracts/applied-project/register-applied-project.yaml`. Kiểm tích hợp tại `e2e/applied-project/register-applied-project`. Các đường dẫn là vị trí đề xuất ở repo thực thi.

| Truy vết | Cách hiện thực | Ca kiểm |
|---|---|---|
| FR-001 / AC-01 | Đơn vị chủ trì, đối tác ngoài và tổng kinh phí → Đầu mục dự án ứng dụng với kinh phí tổng | TC-01 |
| FR-002 / AC-02 | Kiểm nhánh thiếu đối tác ngoài trước khi trả kết quả | TC-02 |
| FR-003 / AC-03 | Yêu cầu đơn vị chủ trì khi lưu, kiểm ít nhất một đối tác ngoài tại lúc gửi duyệt. | TC-03 |
