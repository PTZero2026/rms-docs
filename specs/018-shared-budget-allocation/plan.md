---
story: US-18
feature: F05
review_id: RV-18
status: Draft
updated: 2026-11-24
---

# Kế hoạch · Xác nhận kinh phí được cấp

18/11/2026 · US-18 · F05 / `budget` · [Spec](spec.md)

## Summary

Chuyên viên ghi tổng cấp, phí quản lý và phần được dùng cho nghiên cứu để chủ nhiệm theo dõi số khả dụng. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Dùng mức trần trước khi tính phần được dùng, lưu giá trị đã áp dụng để tra lại.

## Technical Context

Một SPA trong `apps/web`, backend chia module, PostgreSQL và hợp đồng sinh type. Ngôn ngữ và phiên bản theo repo thực thi khi khởi tạo. [Kiến trúc đích](../../docs/architecture/overview.md). Kênh nghiệm thu chính: Dịch vụ dùng chung và điểm gọi của module sở hữu. Dữ liệu trong lát: Quyết định giao hiệu lực, tổng cấp, tỷ lệ và trần phí. Đối chiếu trên bộ thử quyết định giao hiệu lực, hạn mức và tỷ lệ hợp lệ. Điều kiện tích hợp: F04, F05, B01.

### Xử lý tại module F05

Tính phí theo F05 BR-10: làm tròn xuống đến đồng rồi lấy mức thấp hơn với trần nếu có. Áp override trong khoảng cho phép, ghi người đổi. Tổng cấp không vượt mức duyệt.

## Constitution Check

| Cổng | Trước thiết kế | Sau thiết kế |
|---|---|---|
| Quyền và phạm vi | Xác định tenant, vai trò và đối tượng nguồn | Kiểm cả truy cập trực tiếp và dữ liệu ngoài quyền trong quickstart |
| Vòng đời và audit | Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ. | Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. |
| Hợp đồng và định dạng | Nguồn triển khai tại `packages/api-contracts` | Đặc tả lời gọi trỏ về nguồn duy nhất. VND nguyên, UTC lưu trữ, dd/MM/yyyy và Asia/Ho_Chi_Minh khi hiển thị |
| Phạm vi và review | RV-18 đã chốt cho triển khai ngày 24/11/2026 | [RV-18](../review-decisions.md#rv-18). Đối chiếu với đặc tả module trước khi nhận task. |

## Project Structure

**Phase 0.** [Research](research.md) ghi căn cứ và phương án đã xét.
**Phase 1.** [Mô hình dữ liệu](data-model.md), [giao tiếp](contracts/interaction.md) và [kịch bản kiểm tra](quickstart.md) xác định đầu vào cho tasks.

Trong repo code, module `apps/backend/src/modules/budget/budget-allocation` chịu trách nhiệm kiểm quyền và hành vi. Điểm tương tác thuộc `apps/web/src/features/budget/budget-allocation`. Hợp đồng tại `packages/api-contracts/budget/budget-allocation.yaml`. Kiểm tích hợp tại `e2e/budget/budget-allocation`. Các đường dẫn là vị trí đề xuất ở repo thực thi.

| Truy vết | Cách hiện thực | Ca kiểm |
|---|---|---|
| FR-001 / AC-01 | Quyết định giao hiệu lực, tổng cấp, tỷ lệ và trần phí → Tổng cấp, phần phí và kinh phí thực hiện bằng VND | TC-01 |
| FR-002 / AC-02 | Kiểm nhánh chủ nhiệm trước khi trả kết quả | TC-02 |
| FR-003 / AC-03 | Dùng mức trần trước khi tính phần được dùng, lưu giá trị đã áp dụng để tra lại. | TC-03 |
