---
story: US-17
feature: F04
review_id: RV-17
status: Draft
updated: 2026-11-18
---

# Kế hoạch · Nộp báo cáo tiến độ

18/11/2026 · US-17 · F04 / `progress` · [Spec](spec.md)

## Summary

Chủ nhiệm đính báo cáo của kỳ và nộp để chuyên viên theo dõi được cả thời điểm nộp trễ. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Nhận hồ sơ, ghi giờ và nhãn trễ, chặn khi đề tài tạm dừng.

## Technical Context

Một SPA trong `apps/web`, backend chia module, PostgreSQL và hợp đồng sinh type. Ngôn ngữ và phiên bản theo repo thực thi khi khởi tạo. [Kiến trúc đích](../../docs/architecture/overview.md). Kênh nghiệm thu chính: Web RMS theo quyền của người thực hiện. Dữ liệu trong lát: Báo cáo chờ, nội dung và tệp, thời điểm nhận. Đối chiếu trên bộ thử kỳ chờ nộp của đề tài đang làm và đề tài tạm dừng. Điều kiện tích hợp: F04, B04.

### Xử lý tại module F04

So submittedAt với dueDate theo giờ nghiệp vụ. Quá hạn vẫn nhận và đánh dấu trễ; kiểm lại trạng thái đề tài ngay trước khi ghi.

## Constitution Check

| Cổng | Trước thiết kế | Sau thiết kế |
|---|---|---|
| Quyền và phạm vi | Xác định tenant, vai trò và đối tượng nguồn | Kiểm cả truy cập trực tiếp và dữ liệu ngoài quyền trong quickstart |
| Vòng đời và audit | Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ. | Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. |
| Hợp đồng và định dạng | Nguồn triển khai tại `packages/api-contracts` | Đặc tả lời gọi trỏ về nguồn duy nhất. VND nguyên, UTC lưu trữ, dd/MM/yyyy và Asia/Ho_Chi_Minh khi hiển thị |
| Phạm vi và review | RV-17 là giả định có người phụ trách | [RV-17](../review-decisions.md#rv-17). Đối chiếu với đặc tả module trước khi nhận task. |

## Project Structure

**Phase 0.** [Research](research.md) ghi căn cứ và phương án đã xét.
**Phase 1.** [Mô hình dữ liệu](data-model.md), [giao tiếp](contracts/interaction.md) và [kịch bản kiểm tra](quickstart.md) xác định đầu vào cho tasks.

Trong repo code, module `apps/backend/src/modules/progress/submit-progress` chịu trách nhiệm kiểm quyền và hành vi. Điểm tương tác thuộc `apps/web/src/features/progress/submit-progress`. Hợp đồng tại `packages/api-contracts/progress/submit-progress.yaml`. Kiểm tích hợp tại `e2e/progress/submit-progress`. Các đường dẫn là vị trí đề xuất ở repo thực thi.

| Truy vết | Cách hiện thực | Ca kiểm |
|---|---|---|
| FR-001 / AC-01 | Báo cáo chờ, nội dung và tệp, thời điểm nhận → Báo cáo SUBMITTED, dấu trễ và giờ nhận | TC-01 |
| FR-002 / AC-02 | Kiểm nhánh đề tài tạm dừng trước khi trả kết quả | TC-02 |
| FR-003 / AC-03 | Nhận hồ sơ, ghi giờ và nhãn trễ, chặn khi đề tài tạm dừng. | TC-03 |
