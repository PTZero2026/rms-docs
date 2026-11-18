---
story: US-30
feature: P03
review_id: RV-30
status: Draft
updated: 2026-11-18
---

# Kế hoạch · Ghi giờ giảng từ một sự kiện hợp lệ

18/11/2026 · US-30 · P03 / `teaching-hour` · [Spec](spec.md)

## Summary

Chuyên viên đối chiếu giờ của một giảng viên với hoạt động nguồn và công thức có hiệu lực của trường. Dùng khóa sự kiện để nhận lại an toàn, chỉ xác nhận xử lý sau khi lưu kết quả. Dùng ngày sự kiện gốc, khóa nguồn và phân bổ theo công thức của kỳ; sửa sai bằng điều chỉnh có lý do.

## Technical Context

Một SPA trong `apps/web`, backend chia module, PostgreSQL và hợp đồng sinh type. Ngôn ngữ và phiên bản theo repo thực thi khi khởi tạo. [Kiến trúc đích](../../docs/architecture/overview.md). Kênh nghiệm thu chính: Dịch vụ dùng chung và điểm gọi của module sở hữu. Dữ liệu trong lát: Sự kiện hợp lệ, ngày nguồn, công thức hiệu lực và phân bổ. Đối chiếu trên bộ thử tenant bật P03, một sự kiện đã duyệt, một công thức do trường xác nhận. Bật module E4 riêng theo tenant và quy chế đã chọn. Điều kiện tích hợp: P03, F08, B01.

### Xử lý tại module P03

Chọn đúng một công thức có hiệu lực theo sourceOccurredAt. Chốt khóa nguồn khi tạo dòng phân bổ; xử lý lại không nhân giờ. Bù sai lệch bằng dòng điều chỉnh có lý do.

## Constitution Check

| Cổng | Trước thiết kế | Sau thiết kế |
|---|---|---|
| Quyền và phạm vi | Xác định tenant, vai trò và đối tượng nguồn | Kiểm cả truy cập trực tiếp và dữ liệu ngoài quyền trong quickstart |
| Vòng đời và audit | Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ. | Dùng khóa sự kiện để nhận lại an toàn, chỉ xác nhận xử lý sau khi lưu kết quả. |
| Hợp đồng và định dạng | Nguồn triển khai tại `packages/api-contracts` | Đặc tả lời gọi trỏ về nguồn duy nhất. VND nguyên, UTC lưu trữ, dd/MM/yyyy và Asia/Ho_Chi_Minh khi hiển thị |
| Phạm vi và review | RV-30 là giả định có người phụ trách | [RV-30](../review-decisions.md#rv-30). Bật module E4 riêng theo tenant và quy chế đã chọn.  |

## Project Structure

**Phase 0.** [Research](research.md) ghi căn cứ và phương án đã xét.
**Phase 1.** [Mô hình dữ liệu](data-model.md), [giao tiếp](contracts/interaction.md) và [kịch bản kiểm tra](quickstart.md) xác định đầu vào cho tasks.

Trong repo code, module `apps/backend/src/modules/teaching-hour/teaching-hours` chịu trách nhiệm kiểm quyền và hành vi. Tác vụ nền dùng bộ tiếp nhận sự kiện của module. Hợp đồng tại `packages/api-contracts/teaching-hour/teaching-hours.yaml`. Kiểm tích hợp tại `e2e/teaching-hour/teaching-hours`. Các đường dẫn là vị trí đề xuất ở repo thực thi.

| Truy vết | Cách hiện thực | Ca kiểm |
|---|---|---|
| FR-001 / AC-01 | Sự kiện hợp lệ, ngày nguồn, công thức hiệu lực và phân bổ → Dòng giờ theo giảng viên/kỳ và căn cứ tính | TC-01 |
| FR-002 / AC-02 | Kiểm nhánh cùng sự kiện trước khi trả kết quả | TC-02 |
| FR-003 / AC-03 | Dùng ngày sự kiện gốc, khóa nguồn và phân bổ theo công thức của kỳ; sửa sai bằng điều chỉnh có lý do. | TC-03 |
