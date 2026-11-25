---
story: US-06
feature: F01
review_id: RV-06
status: Draft
updated: 2026-11-24
---

# Căn cứ và quyết định · US-06

**Vấn đề.** Giảng viên cần điền tới đâu để lưu lần đầu?

**Quyết định triển khai.** Cho lưu bản nháp thiếu trường bắt buộc của lần nộp khi đã xác định kỳ và chủ nhiệm.

**Lý do.** Trong trường hợp chủ nhiệm đã chọn kỳ và nhập tên nhưng thiếu phần phương pháp, người dùng cần thấy kết quả “thấy phần đã nhập và có thể tiếp tục sửa”. Phương án khác: Yêu cầu đủ biểu mẫu từ lần lưu đầu. Dùng TC-03 để phân biệt hai phương án. [RV-06](../review-decisions.md#rv-06)

**Tài liệu đối chiếu.** [F01](../../docs/features/F01-de-xuat-de-tai/spec.md) — AC-01, AC-06. Các tiêu chí sau dẫn lại từ tài liệu nguồn để DEV/QA thấy cả điều kiện đi kèm. Phần được giao giới hạn trong [spec](spec.md).

- **AC-01** (happy — tạo & lưu nháp) — Given chủ nhiệm đăng nhập và một kỳ nhận đề xuất đang mở, When tạo đề xuất mới và lưu nháp, Then hệ thống tạo hồ sơ ở trạng thái **Nháp** với người tạo là **chủ nhiệm** và một thành viên vai trò chủ nhiệm, **chưa** sinh mã đề tài.

- **AC-06** (sai quyền — không phải chủ nhiệm) — Given một người dùng không phải chủ nhiệm và không có quyền của chuyên viên, When cố mở/sửa/nộp đề xuất của người khác, Then bị từ chối và không thấy đề xuất ngoài phạm vi của mình.

**Nguồn làm việc.** [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md). [design.md](../../docs/features/F01-de-xuat-de-tai/design.md) · [test-plan.md](../../docs/features/F01-de-xuat-de-tai/test-plan.md) · [ui.md](../../docs/features/F01-de-xuat-de-tai/ui.md)
