---
story: US-07
feature: F01
review_id: RV-07
status: Draft
updated: 2026-11-18
---

# Căn cứ và quyết định · US-07

**Vấn đề.** Xử lý hồ sơ đến đúng thời điểm kết thúc kỳ thế nào?

**Khuyến nghị hiện dùng.** Nhận khi thời điểm máy chủ tiếp nhận bằng hạn và kỳ còn mở, từ chối sau hạn.

**Lý do.** Trong trường hợp nháp hợp lệ, đồng hồ máy chủ đúng hạn và kỳ còn mở, người dùng cần thấy kết quả “chỉ có một mã và một lần chuyển Đã nộp”. Phương án khác: Loại cả thời điểm bằng hạn. Dùng TC-03 để phân biệt hai phương án. [RV-07](../review-decisions.md#rv-07)

**Tài liệu đối chiếu.** [F01](../../docs/features/F01-de-xuat-de-tai/spec.md) — AC-02, AC-03, AC-04. Các tiêu chí sau dẫn lại từ tài liệu nguồn để DEV/QA thấy cả điều kiện đi kèm. Phần được giao giới hạn trong [spec](spec.md).

- **AC-02** (happy — nộp hợp lệ) — Given một hồ sơ **Nháp** đủ trường bắt buộc trong kỳ đang mở còn hạn, When chủ nhiệm nộp, Then hồ sơ chuyển **Đã nộp**, sinh **mã đề tài** duy nhất, ghi **thời điểm nộp**, khóa sửa hồ sơ và lưu nhật ký.

- **AC-03** (biên — quá hạn nộp) — Given một hồ sơ **Nháp** và thời điểm hiện tại đã sau hạn nhận của kỳ (hoặc kỳ đã đóng), When chủ nhiệm nộp, Then hệ thống chặn, giữ **Nháp** và báo lỗi "Đã hết hạn nộp của kỳ" (BR-01).

- **AC-04** (lỗi — thiếu trường bắt buộc) — Given một hồ sơ **Nháp** thiếu ≥1 trường bắt buộc của biểu mẫu hoặc của đề tài, When chủ nhiệm nộp, Then hệ thống chặn, giữ **Nháp** và liệt kê các trường còn thiếu (BR-02).

**Nguồn làm việc.** [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md). [design.md](../../docs/features/F01-de-xuat-de-tai/design.md) · [test-plan.md](../../docs/features/F01-de-xuat-de-tai/test-plan.md) · [ui.md](../../docs/features/F01-de-xuat-de-tai/ui.md)

**Biên ngày.** F02 lưu ngày kết thúc. Khi đơn vị chỉ cấu hình ngày, khuyến nghị cho nộp hết ngày đó theo Asia/Ho_Chi_Minh: giây cuối ngày còn hợp lệ, 00:00 ngày kế tiếp đã hết hạn. Nếu cấu hình được thời điểm cụ thể, dùng thời điểm máy chủ tiếp nhận để kiểm biên bằng hạn. [F02](../../docs/features/F02-dot-keu-goi/spec.md).
