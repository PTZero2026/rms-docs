---
story: US-07
feature: F01
review_id: RV-07
status: Draft
updated: 2026-11-18
---

# Mô hình dữ liệu · US-07

| Trường trọng tâm | Ràng buộc của lát | Nguồn |
|---|---|---|
| `ResearchProject.projectCode` | Mã duy nhất, cấp khi nộp lần đầu và giữ nguyên qua bổ sung. | [F01](../../docs/features/F01-de-xuat-de-tai/spec.md) |

ResearchProject tham chiếu kỳ mở, bộ trường bắt buộc và mẫu của kỳ. projectCode là duy nhất, submittedAt phản ánh lần nộp.

Đối tượng nguồn và liên kết nghiệp vụ: Định danh nháp, bản biểu mẫu và nội dung lần nộp. Khung nhìn hoặc kết quả ghi: Mã đề tài, giờ tiếp nhận, trạng thái và quyền sửa. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi.

**Biên trạng thái.** Khi nộp với dữ liệu hợp lệ: chuyển Đã nộp, cấp mã, ghi giờ, khóa sửa. Nhánh nháp đủ trường, đã quá hạn: giữ Nháp và báo hết hạn. Chuyển trạng thái đề tài qua P01, lưu lịch sử và P02 cùng giao dịch.

Các bảng dùng chung theo [mô hình đích](../../docs/architecture/data-model.md). [RV-07](../review-decisions.md#rv-07) điều chỉnh phép kiểm liên quan đến `ResearchProject.projectCode`.
