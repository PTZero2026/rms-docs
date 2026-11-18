---
story: US-29
feature: F12
review_id: RV-29
status: Draft
updated: 2026-11-18
---

# Kế hoạch · Kê khai một hoạt động khoa học

18/11/2026 · US-29 · F12 / `activity` · [Spec](spec.md)

## Summary

Giảng viên khai một hoạt động hội nghị có minh chứng theo cấu hình của trường để đề nghị ghi nhận. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Lấy bộ minh chứng của tenant và loại hoạt động tại bước gửi, nêu từng mục thiếu.

## Technical Context

Một SPA trong `apps/web`, backend chia module, PostgreSQL và hợp đồng sinh type. Ngôn ngữ và phiên bản theo repo thực thi khi khởi tạo. [Kiến trúc đích](../../docs/architecture/overview.md). Kênh nghiệm thu chính: Web RMS theo quyền của người thực hiện. Dữ liệu trong lát: Loại hoạt động, tenant và bộ tệp minh chứng. Đối chiếu trên bộ thử tenant bật F12, một loại hoạt động và một quy tắc minh chứng. Bật module E4 riêng theo tenant và quy chế đã chọn. Điều kiện tích hợp: F12, B01.

### Xử lý tại module F12

Lấy quy tắc theo tổ chức và loại, kiểm danh sách tệp tại lần gửi. Khi đủ thì vào hàng chờ. Giờ giảng phát sinh ở mốc duyệt riêng.

## Constitution Check

| Cổng | Trước thiết kế | Sau thiết kế |
|---|---|---|
| Quyền và phạm vi | Xác định tenant, vai trò và đối tượng nguồn | Kiểm cả truy cập trực tiếp và dữ liệu ngoài quyền trong quickstart |
| Vòng đời và audit | Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ. | Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. |
| Hợp đồng và định dạng | Nguồn triển khai tại `packages/api-contracts` | Đặc tả lời gọi trỏ về nguồn duy nhất. VND nguyên, UTC lưu trữ, dd/MM/yyyy và Asia/Ho_Chi_Minh khi hiển thị |
| Phạm vi và review | RV-29 là giả định có người phụ trách | [RV-29](../review-decisions.md#rv-29). Bật module E4 riêng theo tenant và quy chế đã chọn.  |

## Project Structure

**Phase 0.** [Research](research.md) ghi căn cứ và phương án đã xét.
**Phase 1.** [Mô hình dữ liệu](data-model.md), [giao tiếp](contracts/interaction.md) và [kịch bản kiểm tra](quickstart.md) xác định đầu vào cho tasks.

Trong repo code, module `apps/backend/src/modules/activity/submit-activity` chịu trách nhiệm kiểm quyền và hành vi. Điểm tương tác thuộc `apps/web/src/features/activity/submit-activity`. Hợp đồng tại `packages/api-contracts/activity/submit-activity.yaml`. Kiểm tích hợp tại `e2e/activity/submit-activity`. Các đường dẫn là vị trí đề xuất ở repo thực thi.

| Truy vết | Cách hiện thực | Ca kiểm |
|---|---|---|
| FR-001 / AC-01 | Loại hoạt động, tenant và bộ tệp minh chứng → Hoạt động chờ duyệt hoặc danh sách minh chứng thiếu | TC-01 |
| FR-002 / AC-02 | Kiểm nhánh thiếu minh chứng bắt buộc của loại hoạt động trước khi trả kết quả | TC-02 |
| FR-003 / AC-03 | Lấy bộ minh chứng của tenant và loại hoạt động tại bước gửi, nêu từng mục thiếu. | TC-03 |
