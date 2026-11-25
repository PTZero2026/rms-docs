---
story: US-27
feature: F10
review_id: RV-27
status: Draft
updated: 2026-11-24
---

# Kế hoạch · Xác nhận người hướng dẫn đề tài sinh viên

18/11/2026 · US-27 · F10 / `student-project` · [Spec](spec.md)

## Summary

Sinh viên xin xác nhận của giảng viên hướng dẫn để đủ điều kiện nộp đăng ký của nhóm. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Gắn xác nhận với đúng đăng ký, kiểm khi sinh viên nộp chính thức.

## Technical Context

Một SPA trong `apps/web`, backend chia module, PostgreSQL và hợp đồng sinh type. Ngôn ngữ và phiên bản theo repo thực thi khi khởi tạo. [Kiến trúc đích](../../docs/architecture/overview.md). Kênh nghiệm thu chính: Web RMS theo quyền của người thực hiện. Dữ liệu trong lát: Đăng ký của nhóm, đợt, người hướng dẫn và xác nhận tương ứng. Đối chiếu trên bộ thử đợt bật F10, nhóm hợp lệ và một giảng viên. Bật module E4 riêng theo tenant và quy chế đã chọn. Điều kiện tích hợp: F10, B03.

### Xử lý tại module F10

Kiểm đợt và các điều kiện khác như dữ liệu tiền đề. Đối chiếu xác nhận theo mã hồ sơ trước khi nhận lần nộp chính thức.

## Constitution Check

| Cổng | Trước thiết kế | Sau thiết kế |
|---|---|---|
| Quyền và phạm vi | Xác định tenant, vai trò và đối tượng nguồn | Kiểm cả truy cập trực tiếp và dữ liệu ngoài quyền trong quickstart |
| Vòng đời và audit | Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ. | Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. |
| Hợp đồng và định dạng | Nguồn triển khai tại `packages/api-contracts` | Đặc tả lời gọi trỏ về nguồn duy nhất. VND nguyên, UTC lưu trữ, dd/MM/yyyy và Asia/Ho_Chi_Minh khi hiển thị |
| Phạm vi và review | RV-27 đã chốt cho triển khai ngày 24/11/2026 | [RV-27](../review-decisions.md#rv-27). Bật module E4 riêng theo tenant và quy chế đã chọn.  |

## Project Structure

**Phase 0.** [Research](research.md) ghi căn cứ và phương án đã xét.
**Phase 1.** [Mô hình dữ liệu](data-model.md), [giao tiếp](contracts/interaction.md) và [kịch bản kiểm tra](quickstart.md) xác định đầu vào cho tasks.

Trong repo code, module `apps/backend/src/modules/student-project/confirm-mentor` chịu trách nhiệm kiểm quyền và hành vi. Điểm tương tác thuộc `apps/web/src/features/student-project/confirm-mentor`. Hợp đồng tại `packages/api-contracts/student-project/confirm-mentor.yaml`. Kiểm tích hợp tại `e2e/student-project/confirm-mentor`. Các đường dẫn là vị trí đề xuất ở repo thực thi.

| Truy vết | Cách hiện thực | Ca kiểm |
|---|---|---|
| FR-001 / AC-01 | Đăng ký của nhóm, đợt, người hướng dẫn và xác nhận tương ứng → Trạng thái đủ/thiếu xác nhận cho đúng đăng ký | TC-01 |
| FR-002 / AC-02 | Kiểm nhánh chưa ai xác nhận trước khi trả kết quả | TC-02 |
| FR-003 / AC-03 | Gắn xác nhận với đúng đăng ký, kiểm khi sinh viên nộp chính thức. | TC-03 |
