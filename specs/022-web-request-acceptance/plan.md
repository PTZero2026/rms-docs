---
story: US-22
feature: F06
review_id: RV-22
status: Draft
updated: 2026-11-24
---

# Kế hoạch · Đăng ký nghiệm thu khi đủ điều kiện

18/11/2026 · US-22 · F06 / `acceptance` · [Spec](spec.md)

## Summary

Chủ nhiệm nộp hồ sơ cuối khi kỳ cuối đã đạt và đủ sản phẩm cam kết để phòng khoa học tiếp nhận nghiệm thu. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Kiểm từng loại cam kết tại lúc nộp cùng kết quả kỳ cuối.

## Technical Context

Một SPA trong `apps/web`, backend chia module, PostgreSQL và hợp đồng sinh type. Ngôn ngữ và phiên bản theo repo thực thi khi khởi tạo. [Kiến trúc đích](../../docs/architecture/overview.md). Kênh nghiệm thu chính: Web RMS theo quyền của người thực hiện. Dữ liệu trong lát: Đề tài đang thực hiện, kết quả kỳ cuối, cam kết và hồ sơ cuối. Đối chiếu trên bộ thử đề tài đang thực hiện, dữ liệu kỳ cuối và sản phẩm đã duyệt. Điều kiện tích hợp: F04, F07, F06.

### Xử lý tại module F06

Đọc lại điều kiện lúc đăng ký. Chỉ khi kỳ cuối đạt và từng loại đủ mới chuyển PENDING_ACCEPTANCE, ghi audit và báo chuyên viên.

## Constitution Check

| Cổng | Trước thiết kế | Sau thiết kế |
|---|---|---|
| Quyền và phạm vi | Xác định tenant, vai trò và đối tượng nguồn | Kiểm cả truy cập trực tiếp và dữ liệu ngoài quyền trong quickstart |
| Vòng đời và audit | Chuyển trạng thái đề tài qua P01, lưu lịch sử và P02 cùng giao dịch. | Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. |
| Hợp đồng và định dạng | Nguồn triển khai tại `packages/api-contracts` | Đặc tả lời gọi trỏ về nguồn duy nhất. VND nguyên, UTC lưu trữ, dd/MM/yyyy và Asia/Ho_Chi_Minh khi hiển thị |
| Phạm vi và review | RV-22 đã chốt cho triển khai ngày 24/11/2026 | [RV-22](../review-decisions.md#rv-22). Đối chiếu với đặc tả module trước khi nhận task. |

## Project Structure

**Phase 0.** [Research](research.md) ghi căn cứ và phương án đã xét.
**Phase 1.** [Mô hình dữ liệu](data-model.md), [giao tiếp](contracts/interaction.md) và [kịch bản kiểm tra](quickstart.md) xác định đầu vào cho tasks.

Trong repo code, module `apps/backend/src/modules/acceptance/request-acceptance` chịu trách nhiệm kiểm quyền và hành vi. Điểm tương tác thuộc `apps/web/src/features/acceptance/request-acceptance`. Hợp đồng tại `packages/api-contracts/acceptance/request-acceptance.yaml`. Kiểm tích hợp tại `e2e/acceptance/request-acceptance`. Các đường dẫn là vị trí đề xuất ở repo thực thi.

| Truy vết | Cách hiện thực | Ca kiểm |
|---|---|---|
| FR-001 / AC-01 | Đề tài đang thực hiện, kết quả kỳ cuối, cam kết và hồ sơ cuối → Danh mục thiếu hoặc hồ sơ PENDING_ACCEPTANCE và thông báo | TC-01 |
| FR-002 / AC-02 | Kiểm nhánh thiếu một sản phẩm cam kết trước khi trả kết quả | TC-02 |
| FR-003 / AC-03 | Kiểm từng loại cam kết tại lúc nộp cùng kết quả kỳ cuối. | TC-03 |
