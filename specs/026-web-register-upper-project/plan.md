---
story: US-26
feature: F09
review_id: RV-26
status: Draft
updated: 2026-11-24
---

# Kế hoạch · Theo dõi đầu mục nhiệm vụ cấp trên

18/11/2026 · US-26 · F09 / `upper-project` · [Spec](spec.md)

## Summary

Chuyên viên ghi đầu mục cấp Bộ gắn với đơn vị chủ trì và căn cứ phê duyệt để tổng hợp danh mục. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Cho lưu thông tin ban đầu theo trường bắt buộc, kiểm loại minh chứng theo cấp ở bước duyệt.

## Technical Context

Một SPA trong `apps/web`, backend chia module, PostgreSQL và hợp đồng sinh type. Ngôn ngữ và phiên bản theo repo thực thi khi khởi tạo. [Kiến trúc đích](../../docs/architecture/overview.md). Kênh nghiệm thu chính: Web RMS theo quyền của người thực hiện. Dữ liệu trong lát: Cấp nhiệm vụ, cơ quan quản lý, đơn vị thực hiện và tệp căn cứ. Đối chiếu trên bộ thử tenant bật F09, một loại nhiệm vụ và quy tắc minh chứng. Bật module E4 riêng theo tenant và quy chế đã chọn. Điều kiện tích hợp: F09, B01.

### Xử lý tại module F09

Lưu đầu mục độc lập với kỳ đề tài nội bộ. Ở bước duyệt, đọc quy tắc minh chứng theo cấp trong tenant và yêu cầu đúng loại tệp.

## Constitution Check

| Cổng | Trước thiết kế | Sau thiết kế |
|---|---|---|
| Quyền và phạm vi | Xác định tenant, vai trò và đối tượng nguồn | Kiểm cả truy cập trực tiếp và dữ liệu ngoài quyền trong quickstart |
| Vòng đời và audit | Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ. | Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. |
| Hợp đồng và định dạng | Nguồn triển khai tại `packages/api-contracts` | Đặc tả lời gọi trỏ về nguồn duy nhất. VND nguyên, UTC lưu trữ, dd/MM/yyyy và Asia/Ho_Chi_Minh khi hiển thị |
| Phạm vi và review | RV-26 đã chốt cho triển khai ngày 24/11/2026 | [RV-26](../review-decisions.md#rv-26). Bật module E4 riêng theo tenant và quy chế đã chọn.  |

## Project Structure

**Phase 0.** [Research](research.md) ghi căn cứ và phương án đã xét.
**Phase 1.** [Mô hình dữ liệu](data-model.md), [giao tiếp](contracts/interaction.md) và [kịch bản kiểm tra](quickstart.md) xác định đầu vào cho tasks.

Trong repo code, module `apps/backend/src/modules/upper-project/register-upper-project` chịu trách nhiệm kiểm quyền và hành vi. Điểm tương tác thuộc `apps/web/src/features/upper-project/register-upper-project`. Hợp đồng tại `packages/api-contracts/upper-project/register-upper-project.yaml`. Kiểm tích hợp tại `e2e/upper-project/register-upper-project`. Các đường dẫn là vị trí đề xuất ở repo thực thi.

| Truy vết | Cách hiện thực | Ca kiểm |
|---|---|---|
| FR-001 / AC-01 | Cấp nhiệm vụ, cơ quan quản lý, đơn vị thực hiện và tệp căn cứ → Đầu mục tra được theo cấp và thông tin chứng cứ cần bổ sung | TC-01 |
| FR-002 / AC-02 | Kiểm nhánh thiếu tệp bắt buộc ở bước duyệt trước khi trả kết quả | TC-02 |
| FR-003 / AC-03 | Cho lưu thông tin ban đầu theo trường bắt buộc, kiểm loại minh chứng theo cấp ở bước duyệt. | TC-03 |
