---
story: US-01
feature: B03
review_id: RV-01
status: Draft
updated: 2026-11-18
---

# Kế hoạch · Khóa tài khoản của người rời đơn vị

18/11/2026 · US-01 · B03 / `iam` · [Spec](spec.md)

## Summary

Quản trị viên khóa một tài khoản khi người dùng rời đơn vị để ngừng truy cập nghiệp vụ. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Kiểm trạng thái tại yêu cầu nghiệp vụ kế tiếp, kể cả phiên đã mở.

## Technical Context

Một SPA trong `apps/web`, backend chia module, PostgreSQL và hợp đồng sinh type. Ngôn ngữ và phiên bản theo repo thực thi khi khởi tạo. [Kiến trúc đích](../../docs/architecture/overview.md). Kênh nghiệm thu chính: Dịch vụ dùng chung và điểm gọi của module sở hữu. Dữ liệu trong lát: Tài khoản đích và xác nhận khóa. Đối chiếu trên bộ thử một tài khoản hoạt động, hai vai trò. Điều kiện tích hợp: B03, P02.

### Xử lý tại module B03

Dùng thao tác khóa của B03. Kiểm cả tài khoản vừa khóa và phiên đang giữ token. Trả trạng thái sau cùng cho thao tác lặp, tránh hai sự kiện ACCOUNT_LOCKED cho một lần đổi.

## Constitution Check

| Cổng | Trước thiết kế | Sau thiết kế |
|---|---|---|
| Quyền và phạm vi | Xác định tenant, vai trò và đối tượng nguồn | Kiểm cả truy cập trực tiếp và dữ liệu ngoài quyền trong quickstart |
| Vòng đời và audit | Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ. | Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. |
| Hợp đồng và định dạng | Nguồn triển khai tại `packages/api-contracts` | Đặc tả lời gọi trỏ về nguồn duy nhất. VND nguyên, UTC lưu trữ, dd/MM/yyyy và Asia/Ho_Chi_Minh khi hiển thị |
| Phạm vi và review | RV-01 là giả định có người phụ trách | [RV-01](../review-decisions.md#rv-01). Đối chiếu với đặc tả module trước khi nhận task. |

## Project Structure

**Phase 0.** [Research](research.md) ghi căn cứ và phương án đã xét.
**Phase 1.** [Mô hình dữ liệu](data-model.md), [giao tiếp](contracts/interaction.md) và [kịch bản kiểm tra](quickstart.md) xác định đầu vào cho tasks.

Trong repo code, module `apps/backend/src/modules/iam/lock-account` chịu trách nhiệm kiểm quyền và hành vi. Điểm tương tác thuộc `apps/web/src/features/iam/lock-account`. Hợp đồng tại `packages/api-contracts/iam/lock-account.yaml`. Kiểm tích hợp tại `e2e/iam/lock-account`. Các đường dẫn là vị trí đề xuất ở repo thực thi.

| Truy vết | Cách hiện thực | Ca kiểm |
|---|---|---|
| FR-001 / AC-01 | Tài khoản đích và xác nhận khóa → Trạng thái truy cập và sự kiện ACCOUNT_LOCKED | TC-01 |
| FR-002 / AC-02 | Kiểm nhánh người chỉ có quyền xem trước khi trả kết quả | TC-02 |
| FR-003 / AC-03 | Kiểm trạng thái tại yêu cầu nghiệp vụ kế tiếp, kể cả phiên đã mở. | TC-03 |
