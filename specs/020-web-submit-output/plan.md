---
story: US-20
feature: F07
review_id: RV-20
status: Draft
updated: 2026-11-18
---

# Kế hoạch · Nộp sản phẩm khoa học kèm minh chứng

18/11/2026 · US-20 · F07 / `product` · [Spec](spec.md)

## Summary

Chủ nhiệm khai một sản phẩm thuộc đề tài trong phạm vi để chuyên viên kiểm tra đầu ra cam kết. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Kiểm lại quyền sử dụng tệp tại lúc gửi, yêu cầu thay tệp khi quyền hết hiệu lực.

## Technical Context

Một SPA trong `apps/web`, backend chia module, PostgreSQL và hợp đồng sinh type. Ngôn ngữ và phiên bản theo repo thực thi khi khởi tạo. [Kiến trúc đích](../../docs/architecture/overview.md). Kênh nghiệm thu chính: Web RMS theo quyền của người thực hiện. Dữ liệu trong lát: Đề tài, loại sản phẩm, thông tin công bố, tác giả, minh chứng. Đối chiếu trên bộ thử một đề tài đang làm, minh chứng và hai tài khoản. Điều kiện tích hợp: F07, B03.

### Xử lý tại module F07

Kiểm loại/tệp bắt buộc cùng quyền liên kết đề tài ngay lúc gửi. Chỉ đưa vào hàng chờ duyệt sau khi các điều kiện này đạt.

## Constitution Check

| Cổng | Trước thiết kế | Sau thiết kế |
|---|---|---|
| Quyền và phạm vi | Xác định tenant, vai trò và đối tượng nguồn | Kiểm cả truy cập trực tiếp và dữ liệu ngoài quyền trong quickstart |
| Vòng đời và audit | Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ. | Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. |
| Hợp đồng và định dạng | Nguồn triển khai tại `packages/api-contracts` | Đặc tả lời gọi trỏ về nguồn duy nhất. VND nguyên, UTC lưu trữ, dd/MM/yyyy và Asia/Ho_Chi_Minh khi hiển thị |
| Phạm vi và review | RV-20 là giả định có người phụ trách | [RV-20](../review-decisions.md#rv-20). Đối chiếu với đặc tả module trước khi nhận task. |

## Project Structure

**Phase 0.** [Research](research.md) ghi căn cứ và phương án đã xét.
**Phase 1.** [Mô hình dữ liệu](data-model.md), [giao tiếp](contracts/interaction.md) và [kịch bản kiểm tra](quickstart.md) xác định đầu vào cho tasks.

Trong repo code, module `apps/backend/src/modules/product/submit-output` chịu trách nhiệm kiểm quyền và hành vi. Điểm tương tác thuộc `apps/web/src/features/product/submit-output`. Hợp đồng tại `packages/api-contracts/product/submit-output.yaml`. Kiểm tích hợp tại `e2e/product/submit-output`. Các đường dẫn là vị trí đề xuất ở repo thực thi.

| Truy vết | Cách hiện thực | Ca kiểm |
|---|---|---|
| FR-001 / AC-01 | Đề tài, loại sản phẩm, thông tin công bố, tác giả, minh chứng → Sản phẩm chờ duyệt gắn đúng đề tài | TC-01 |
| FR-002 / AC-02 | Kiểm nhánh thiếu minh chứng bắt buộc trước khi trả kết quả | TC-02 |
| FR-003 / AC-03 | Kiểm lại quyền sử dụng tệp tại lúc gửi, yêu cầu thay tệp khi quyền hết hiệu lực. | TC-03 |
