---
story: US-04
feature: P02
review_id: RV-04
status: Draft
updated: 2026-11-18
---

# Kế hoạch · Tra căn cứ chuyển bước

18/11/2026 · US-04 · P02 / `audit` · [Spec](spec.md)

## Summary

Chuyên viên có quyền mở lịch sử một đề tài để xác định ai chuyển bước và vào thời điểm nào. Truy vấn trong phạm vi hiện tại. Đọc hoặc mở liên kết giữ nguyên trạng thái hồ sơ. Kiểm quyền trên đề tài ở lúc đọc, giữ nguyên tác nhân và đơn vị của sự kiện gốc.

## Technical Context

Một SPA trong `apps/web`, backend chia module, PostgreSQL và hợp đồng sinh type. Ngôn ngữ và phiên bản theo repo thực thi khi khởi tạo. [Kiến trúc đích](../../docs/architecture/overview.md). Kênh nghiệm thu chính: Dịch vụ dùng chung và điểm gọi của module sở hữu. Dữ liệu trong lát: Định danh đề tài và khoảng thời gian cần tra. Đối chiếu trên bộ thử một chuyển bước thành công và hai người khác phạm vi. Điều kiện tích hợp: P02, B03.

### Xử lý tại module P02

Tra theo tenant, loại và ID đối tượng. Lọc quyền trước phân trang. Dùng người và thời điểm lưu tại sự kiện để tái hiện chuyển bước.

## Constitution Check

| Cổng | Trước thiết kế | Sau thiết kế |
|---|---|---|
| Quyền và phạm vi | Xác định tenant, vai trò và đối tượng nguồn | Kiểm cả truy cập trực tiếp và dữ liệu ngoài quyền trong quickstart |
| Vòng đời và audit | Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Lát đọc này không phát lệnh chuyển. | Truy vấn trong phạm vi hiện tại. Đọc hoặc mở liên kết giữ nguyên trạng thái hồ sơ. |
| Hợp đồng và định dạng | Nguồn triển khai tại `packages/api-contracts` | Đặc tả lời gọi trỏ về nguồn duy nhất. VND nguyên, UTC lưu trữ, dd/MM/yyyy và Asia/Ho_Chi_Minh khi hiển thị |
| Phạm vi và review | RV-04 là giả định có người phụ trách | [RV-04](../review-decisions.md#rv-04). Đối chiếu với đặc tả module trước khi nhận task. |

## Project Structure

**Phase 0.** [Research](research.md) ghi căn cứ và phương án đã xét.
**Phase 1.** [Mô hình dữ liệu](data-model.md), [giao tiếp](contracts/interaction.md) và [kịch bản kiểm tra](quickstart.md) xác định đầu vào cho tasks.

Trong repo code, module `apps/backend/src/modules/audit/audit-trail` chịu trách nhiệm kiểm quyền và hành vi. Điểm tương tác thuộc `apps/web/src/features/audit/audit-trail`. Hợp đồng tại `packages/api-contracts/audit/audit-trail.yaml`. Kiểm tích hợp tại `e2e/audit/audit-trail`. Các đường dẫn là vị trí đề xuất ở repo thực thi.

| Truy vết | Cách hiện thực | Ca kiểm |
|---|---|---|
| FR-001 / AC-01 | Định danh đề tài và khoảng thời gian cần tra → Danh sách sự kiện trong quyền, tác nhân, thời điểm, hành động | TC-01 |
| FR-002 / AC-02 | Kiểm nhánh người ngoài phạm vi trước khi trả kết quả | TC-02 |
| FR-003 / AC-03 | Kiểm quyền trên đề tài ở lúc đọc, giữ nguyên tác nhân và đơn vị của sự kiện gốc. | TC-03 |
