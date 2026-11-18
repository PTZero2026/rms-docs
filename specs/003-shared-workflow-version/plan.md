---
story: US-03
feature: P01
review_id: RV-03
status: Draft
updated: 2026-11-18
---

# Kế hoạch · Giữ quy trình của hồ sơ đang chạy

18/11/2026 · US-03 · P01 / `workflow` · [Spec](spec.md)

## Summary

Người quản lý quy trình phát hành một phiên bản cho hồ sơ mới để quy chế mới có ngày áp dụng rõ ràng. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Chọn phiên bản đang hiệu lực khi tạo hồ sơ, giữ phiên bản của hồ sơ đã tồn tại.

## Technical Context

Một SPA trong `apps/web`, backend chia module, PostgreSQL và hợp đồng sinh type. Ngôn ngữ và phiên bản theo repo thực thi khi khởi tạo. [Kiến trúc đích](../../docs/architecture/overview.md). Kênh nghiệm thu chính: Dịch vụ dùng chung và điểm gọi của module sở hữu. Dữ liệu trong lát: Mẫu quy trình, phiên bản và các bước có trạng thái chuẩn. Đối chiếu trên bộ thử một hồ sơ ghim phiên bản 1 và một mẫu phiên bản 2. Điều kiện tích hợp: B01, P01.

### Xử lý tại module P01

Kiểm trạng thái chuẩn ở từng bước và hai đầu mỗi transition trước khi kích hoạt. Gán template đang hiệu lực khi tạo instance, giữ graph cũ cho instance cũ.

## Constitution Check

| Cổng | Trước thiết kế | Sau thiết kế |
|---|---|---|
| Quyền và phạm vi | Xác định tenant, vai trò và đối tượng nguồn | Kiểm cả truy cập trực tiếp và dữ liệu ngoài quyền trong quickstart |
| Vòng đời và audit | Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ. | Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. |
| Hợp đồng và định dạng | Nguồn triển khai tại `packages/api-contracts` | Đặc tả lời gọi trỏ về nguồn duy nhất. VND nguyên, UTC lưu trữ, dd/MM/yyyy và Asia/Ho_Chi_Minh khi hiển thị |
| Phạm vi và review | RV-03 là giả định có người phụ trách | [RV-03](../review-decisions.md#rv-03). Đối chiếu với đặc tả module trước khi nhận task. |

## Project Structure

**Phase 0.** [Research](research.md) ghi căn cứ và phương án đã xét.
**Phase 1.** [Mô hình dữ liệu](data-model.md), [giao tiếp](contracts/interaction.md) và [kịch bản kiểm tra](quickstart.md) xác định đầu vào cho tasks.

Trong repo code, module `apps/backend/src/modules/workflow/workflow-version` chịu trách nhiệm kiểm quyền và hành vi. Điểm tương tác thuộc `apps/web/src/features/workflow/workflow-version`. Hợp đồng tại `packages/api-contracts/workflow/workflow-version.yaml`. Kiểm tích hợp tại `e2e/workflow/workflow-version`. Các đường dẫn là vị trí đề xuất ở repo thực thi.

| Truy vết | Cách hiện thực | Ca kiểm |
|---|---|---|
| FR-001 / AC-01 | Mẫu quy trình, phiên bản và các bước có trạng thái chuẩn → Phiên bản khả dụng cho hồ sơ mới hoặc danh sách bước lỗi | TC-01 |
| FR-002 / AC-02 | Kiểm nhánh mẫu có bước thiếu trạng thái chuẩn trước khi trả kết quả | TC-02 |
| FR-003 / AC-03 | Chọn phiên bản đang hiệu lực khi tạo hồ sơ, giữ phiên bản của hồ sơ đã tồn tại. | TC-03 |
