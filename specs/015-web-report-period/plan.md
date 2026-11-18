---
story: US-15
feature: F04
review_id: RV-15
status: Draft
updated: 2026-11-18
---

# Kế hoạch · Đặt hạn báo cáo theo kỳ

18/11/2026 · US-15 · F04 / `progress` · [Spec](spec.md)

## Summary

Chuyên viên lập một kỳ báo cáo có hạn nộp để chủ nhiệm biết thời điểm phải nộp tiến độ. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Áp khóa theo cặp đề tài và kỳ, cho hai đề tài khác nhau dùng cùng tên kỳ.

## Technical Context

Một SPA trong `apps/web`, backend chia module, PostgreSQL và hợp đồng sinh type. Ngôn ngữ và phiên bản theo repo thực thi khi khởi tạo. [Kiến trúc đích](../../docs/architecture/overview.md). Kênh nghiệm thu chính: Web RMS theo quyền của người thực hiện. Dữ liệu trong lát: Đề tài đang làm, mã kỳ và hạn nộp. Đối chiếu trên bộ thử một đề tài đang thực hiện và một mã kỳ. Điều kiện tích hợp: F04, B04.

### Xử lý tại module F04

Chống trùng ngay ở thao tác tạo để hai yêu cầu đồng thời chỉ tạo một kỳ. Trạng thái ban đầu PENDING_SUBMISSION cung cấp đầu vào cho B04.

## Constitution Check

| Cổng | Trước thiết kế | Sau thiết kế |
|---|---|---|
| Quyền và phạm vi | Xác định tenant, vai trò và đối tượng nguồn | Kiểm cả truy cập trực tiếp và dữ liệu ngoài quyền trong quickstart |
| Vòng đời và audit | Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ. | Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. |
| Hợp đồng và định dạng | Nguồn triển khai tại `packages/api-contracts` | Đặc tả lời gọi trỏ về nguồn duy nhất. VND nguyên, UTC lưu trữ, dd/MM/yyyy và Asia/Ho_Chi_Minh khi hiển thị |
| Phạm vi và review | RV-15 là giả định có người phụ trách | [RV-15](../review-decisions.md#rv-15). Đối chiếu với đặc tả module trước khi nhận task. |

## Project Structure

**Phase 0.** [Research](research.md) ghi căn cứ và phương án đã xét.
**Phase 1.** [Mô hình dữ liệu](data-model.md), [giao tiếp](contracts/interaction.md) và [kịch bản kiểm tra](quickstart.md) xác định đầu vào cho tasks.

Trong repo code, module `apps/backend/src/modules/progress/report-period` chịu trách nhiệm kiểm quyền và hành vi. Điểm tương tác thuộc `apps/web/src/features/progress/report-period`. Hợp đồng tại `packages/api-contracts/progress/report-period.yaml`. Kiểm tích hợp tại `e2e/progress/report-period`. Các đường dẫn là vị trí đề xuất ở repo thực thi.

| Truy vết | Cách hiện thực | Ca kiểm |
|---|---|---|
| FR-001 / AC-01 | Đề tài đang làm, mã kỳ và hạn nộp → Một báo cáo PENDING_SUBMISSION cho kỳ mới | TC-01 |
| FR-002 / AC-02 | Kiểm nhánh đã có cùng kỳ trên đề tài trước khi trả kết quả | TC-02 |
| FR-003 / AC-03 | Áp khóa theo cặp đề tài và kỳ, cho hai đề tài khác nhau dùng cùng tên kỳ. | TC-03 |
