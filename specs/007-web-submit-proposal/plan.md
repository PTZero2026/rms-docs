---
story: US-07
feature: F01
review_id: RV-07
status: Draft
updated: 2026-11-18
---

# Kế hoạch · Nộp đề xuất và nhận mã theo dõi

18/11/2026 · US-07 · F01 / `proposal` · [Spec](spec.md)

## Summary

Chủ nhiệm nộp thuyết minh đủ trường, nhận mã duy nhất và thời điểm tiếp nhận để tra cứu sau kỳ. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Nhận khi thời điểm máy chủ tiếp nhận bằng hạn và kỳ còn mở, từ chối sau hạn.

## Technical Context

Một SPA trong `apps/web`, backend chia module, PostgreSQL và hợp đồng sinh type. Ngôn ngữ và phiên bản theo repo thực thi khi khởi tạo. [Kiến trúc đích](../../docs/architecture/overview.md). Kênh nghiệm thu chính: Web RMS theo quyền của người thực hiện. Dữ liệu trong lát: Định danh nháp, bản biểu mẫu và nội dung lần nộp. Đối chiếu trên bộ thử hai hồ sơ nháp, đồng hồ cố định trong hạn và sau hạn. Điều kiện tích hợp: F01, F02, P01, P02.

### Xử lý tại module F01

Kiểm cửa sổ thời gian, lĩnh vực và toàn bộ trường bắt buộc tại máy chủ. Cấp mã trong giao dịch chuyển bước. Nếu đã có mã sau lần bổ sung, tái sử dụng mã đó.

## Constitution Check

| Cổng | Trước thiết kế | Sau thiết kế |
|---|---|---|
| Quyền và phạm vi | Xác định tenant, vai trò và đối tượng nguồn | Kiểm cả truy cập trực tiếp và dữ liệu ngoài quyền trong quickstart |
| Vòng đời và audit | Chuyển trạng thái đề tài qua P01, lưu lịch sử và P02 cùng giao dịch. | Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. |
| Hợp đồng và định dạng | Nguồn triển khai tại `packages/api-contracts` | Đặc tả lời gọi trỏ về nguồn duy nhất. VND nguyên, UTC lưu trữ, dd/MM/yyyy và Asia/Ho_Chi_Minh khi hiển thị |
| Phạm vi và review | RV-07 là giả định có người phụ trách | [RV-07](../review-decisions.md#rv-07). Đối chiếu với đặc tả module trước khi nhận task. |

## Project Structure

**Phase 0.** [Research](research.md) ghi căn cứ và phương án đã xét.
**Phase 1.** [Mô hình dữ liệu](data-model.md), [giao tiếp](contracts/interaction.md) và [kịch bản kiểm tra](quickstart.md) xác định đầu vào cho tasks.

Trong repo code, module `apps/backend/src/modules/proposal/submit-proposal` chịu trách nhiệm kiểm quyền và hành vi. Điểm tương tác thuộc `apps/web/src/features/proposal/submit-proposal`. Hợp đồng tại `packages/api-contracts/proposal/submit-proposal.yaml`. Kiểm tích hợp tại `e2e/proposal/submit-proposal`. Các đường dẫn là vị trí đề xuất ở repo thực thi.

| Truy vết | Cách hiện thực | Ca kiểm |
|---|---|---|
| FR-001 / AC-01 | Định danh nháp, bản biểu mẫu và nội dung lần nộp → Mã đề tài, giờ tiếp nhận, trạng thái và quyền sửa | TC-01 |
| FR-002 / AC-02 | Kiểm nhánh nháp đủ trường, đã quá hạn trước khi trả kết quả | TC-02 |
| FR-003 / AC-03 | Nhận khi thời điểm máy chủ tiếp nhận bằng hạn và kỳ còn mở, từ chối sau hạn. | TC-03 |
