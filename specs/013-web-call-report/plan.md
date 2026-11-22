---
story: US-13
feature: B02
review_id: RV-13
status: Draft
updated: 2026-11-21
---

# Kế hoạch · Đếm hồ sơ theo trạng thái của một kỳ

18/11/2026 · US-13 · B02 / `report` · [Spec](spec.md)

## Summary

Trưởng phòng lấy số đề tài theo trạng thái chuẩn của một kỳ tại thời điểm trích xuất, để đối chiếu danh sách hội đồng. Truy vấn trong phạm vi hiện tại. Đọc hoặc mở liên kết giữ nguyên trạng thái hồ sơ. Trong kỳ và phạm vi được xem, mỗi hồ sơ đã cấp mã được tính một lần, kể cả khi nộp lại hoặc đang ở Nháp sau khi bị trả. Loại nháp chưa từng nộp, chưa có mã. Tổng, chi tiết và tệp xuất cùng dùng trạng thái tại thời điểm tạo bản chụp.

## Technical Context

Một SPA trong `apps/web`, backend chia module, PostgreSQL và hợp đồng sinh type. Ngôn ngữ và phiên bản theo repo thực thi khi khởi tạo. [Kiến trúc đích](../../docs/architecture/overview.md). Kênh nghiệm thu chính: Web RMS theo quyền của người thực hiện. Dữ liệu trong lát: Kỳ, phạm vi đơn vị, thời điểm trích xuất. Đối chiếu trên bộ thử một kỳ gồm 3 mã hợp lệ, 2 đơn vị, một mã đã nộp lại. Điều kiện tích hợp: B02, P01, B03.

### Xử lý tại module B02

Áp kỳ và quyền trước khi nhóm. Cố định tập ID và trạng thái của bản chụp để chi tiết và tệp khớp số tổng. Kiểm lại quyền tải, nếu thu hẹp thì dựng lại theo quyền mới.

## Constitution Check

| Cổng | Trước thiết kế | Sau thiết kế |
|---|---|---|
| Quyền và phạm vi | Xác định tenant, vai trò và đối tượng nguồn | Kiểm cả truy cập trực tiếp và dữ liệu ngoài quyền trong quickstart |
| Vòng đời và audit | Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Lát đọc này không phát lệnh chuyển. | Truy vấn trong phạm vi hiện tại. Đọc hoặc mở liên kết giữ nguyên trạng thái hồ sơ. |
| Hợp đồng và định dạng | Nguồn triển khai tại `packages/api-contracts` | Đặc tả lời gọi trỏ về nguồn duy nhất. VND nguyên, UTC lưu trữ, dd/MM/yyyy và Asia/Ho_Chi_Minh khi hiển thị |
| Phạm vi và review | RV-13 đã chấp thuận ngày 21/11/2026 | [RV-13](../review-decisions.md#rv-13). Đối chiếu với đặc tả module trước khi nhận task. |

## Project Structure

**Phase 0.** [Research](research.md) ghi căn cứ và phương án đã xét.
**Phase 1.** [Mô hình dữ liệu](data-model.md), [giao tiếp](contracts/interaction.md) và [kịch bản kiểm tra](quickstart.md) xác định đầu vào cho tasks.

Trong repo code, module `apps/backend/src/modules/report/call-report` chịu trách nhiệm kiểm quyền và hành vi. Điểm tương tác thuộc `apps/web/src/features/report/call-report`. Hợp đồng tại `packages/api-contracts/report/call-report.yaml`. Kiểm tích hợp tại `e2e/report/call-report`. Các đường dẫn là vị trí đề xuất ở repo thực thi.

| Truy vết | Cách hiện thực | Ca kiểm |
|---|---|---|
| FR-001 / AC-01 | Kỳ, phạm vi đơn vị, thời điểm trích xuất → Số hồ sơ theo trạng thái, tổng cộng và danh sách đối chứng | TC-01 |
| FR-002 / AC-02 | Kiểm nhánh chỉ có quyền một đơn vị trước khi trả kết quả | TC-02 |
| FR-003 / AC-03 | Trong kỳ và phạm vi được xem, mỗi hồ sơ đã cấp mã được tính một lần, kể cả khi nộp lại hoặc đang ở Nháp sau khi bị trả. Loại nháp chưa từng nộp, chưa có mã. Tổng, chi tiết và tệp xuất cùng dùng trạng thái tại thời điểm tạo bản chụp. | TC-03 |
