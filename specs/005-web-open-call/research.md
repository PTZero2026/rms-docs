---
story: US-05
feature: F02
review_id: RV-05
status: Draft
updated: 2026-11-18
---

# Căn cứ và quyết định · US-05

**Vấn đề.** Nếu danh mục hết hiệu lực giữa lúc soạn và mở kỳ thì sao?

**Khuyến nghị hiện dùng.** Kiểm lại danh mục và bộ tiêu chí tại thời điểm mở, chỉ rõ mục phải thay.

**Lý do.** Trong trường hợp một lĩnh vực bắt buộc vừa ngừng hiệu lực trong bản nháp, người dùng cần thấy kết quả “kỳ vẫn nháp và hiển thị mục cần thay”. Phương án khác: Giữ cấu hình hợp lệ ở thời điểm lưu nháp. Dùng TC-03 để phân biệt hai phương án. [RV-05](../review-decisions.md#rv-05)

**Tài liệu đối chiếu.** [F02](../../docs/features/F02-dot-keu-goi/spec.md) — AC-01, AC-02, AC-05. Các tiêu chí sau dẫn lại từ tài liệu nguồn để DEV/QA thấy cả điều kiện đi kèm. Phần được giao giới hạn trong [spec](spec.md).

- **AC-01** (happy, tạo) — Given chuyên viên QL KHCN đã đăng nhập BO, When tạo kỳ mới với `code`, `name`, `startDate`–`endDate` nhận đề xuất hợp lệ (BR-01), Then kỳ được lưu ở trạng thái `DRAFT` và xuất hiện trong danh sách kỳ của BO.

- **AC-02** (happy, mở) — Given kỳ `DRAFT` đã cấu hình đủ trường bắt buộc (BR-03) với danh mục B01 còn hiệu lực (BR-04), When chuyên viên bấm "Mở kỳ", Then kỳ chuyển `OPEN`, ghi `AuditLog`, và nhà khoa học thấy kỳ trong danh sách FE (BR-08).

- **AC-05** (lỗi, validate) — Given chuyên viên tạo/sửa kỳ với `endDate` < `startDate` hoặc `code` đã tồn tại, When bấm Lưu, Then hệ thống từ chối, không lưu, và hiển thị lỗi tương ứng (BR-01 / BR-02).

**Nguồn làm việc.** [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md). [test-plan.md](../../docs/features/F02-dot-keu-goi/test-plan.md) · [ui.md](../../docs/features/F02-dot-keu-goi/ui.md)
