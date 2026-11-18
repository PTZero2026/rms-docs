---
story: US-16
feature: B04
review_id: RV-16
status: Draft
updated: 2026-11-18
---

# Kế hoạch · Nhắc hạn đúng một lần theo mốc

18/11/2026 · US-16 · B04 / `notification` · [Spec](spec.md)

## Summary

Chủ nhiệm nhận nhắc khi đến mốc cấu hình để kịp chuẩn bị báo cáo, dù tác vụ gửi được chạy lại. Dùng khóa sự kiện để nhận lại an toàn, chỉ xác nhận xử lý sau khi lưu kết quả. Dùng một khóa theo tenant, đề tài, kỳ, người nhận và mốc; thử lại việc giao trên cùng thông báo.

## Technical Context

Một SPA trong `apps/web`, backend chia module, PostgreSQL và hợp đồng sinh type. Ngôn ngữ và phiên bản theo repo thực thi khi khởi tạo. [Kiến trúc đích](../../docs/architecture/overview.md). Kênh nghiệm thu chính: Dịch vụ dùng chung và điểm gọi của module sở hữu. Dữ liệu trong lát: Đồng hồ nghiệp vụ, mốc nhắc, kỳ báo cáo, người nhận. Đối chiếu trên bộ thử một kỳ báo cáo đến mốc nhắc, đồng hồ giả lập. Điều kiện tích hợp: B04, F04, B01.

### Xử lý tại module B04

Chọn các kỳ chờ nộp chạm mốc N. Giữ khóa chống trùng bền qua chạy lại. Theo dõi lỗi email độc lập với thông báo trong ứng dụng.

## Constitution Check

| Cổng | Trước thiết kế | Sau thiết kế |
|---|---|---|
| Quyền và phạm vi | Xác định tenant, vai trò và đối tượng nguồn | Kiểm cả truy cập trực tiếp và dữ liệu ngoài quyền trong quickstart |
| Vòng đời và audit | Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ. | Dùng khóa sự kiện để nhận lại an toàn, chỉ xác nhận xử lý sau khi lưu kết quả. |
| Hợp đồng và định dạng | Nguồn triển khai tại `packages/api-contracts` | Đặc tả lời gọi trỏ về nguồn duy nhất. VND nguyên, UTC lưu trữ, dd/MM/yyyy và Asia/Ho_Chi_Minh khi hiển thị |
| Phạm vi và review | RV-16 là giả định có người phụ trách | [RV-16](../review-decisions.md#rv-16). Đối chiếu với đặc tả module trước khi nhận task. |

## Project Structure

**Phase 0.** [Research](research.md) ghi căn cứ và phương án đã xét.
**Phase 1.** [Mô hình dữ liệu](data-model.md), [giao tiếp](contracts/interaction.md) và [kịch bản kiểm tra](quickstart.md) xác định đầu vào cho tasks.

Trong repo code, module `apps/backend/src/modules/notification/deadline-reminder` chịu trách nhiệm kiểm quyền và hành vi. Tác vụ nền dùng bộ tiếp nhận sự kiện của module. Hợp đồng tại `packages/api-contracts/notification/deadline-reminder.yaml`. Kiểm tích hợp tại `e2e/notification/deadline-reminder`. Các đường dẫn là vị trí đề xuất ở repo thực thi.

| Truy vết | Cách hiện thực | Ca kiểm |
|---|---|---|
| FR-001 / AC-01 | Đồng hồ nghiệp vụ, mốc nhắc, kỳ báo cáo, người nhận → Một thông báo PROGRESS_REPORT_DUE_SOON theo khóa | TC-01 |
| FR-002 / AC-02 | Kiểm nhánh cùng đề tài, kỳ và mốc trước khi trả kết quả | TC-02 |
| FR-003 / AC-03 | Dùng một khóa theo tenant, đề tài, kỳ, người nhận và mốc; thử lại việc giao trên cùng thông báo. | TC-03 |
