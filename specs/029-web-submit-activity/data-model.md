---
story: US-29
feature: F12
review_id: RV-29
status: Draft
updated: 2026-11-18
---

# Mô hình dữ liệu · US-29

| Trường trọng tâm | Ràng buộc của lát | Nguồn |
|---|---|---|
| `Activity.activityType` | Loại hoạt động chọn theo tenant và quyết định bộ minh chứng áp dụng. | [F12](../../docs/features/F12-hoat-dong-khoa-hoc/spec.md) |

Hoạt động gắn giảng viên, loại hội nghị và tệp minh chứng; quy tắc loại tệp thuộc tenant và bước gửi.

Đối tượng nguồn và liên kết nghiệp vụ: Loại hoạt động, tenant và bộ tệp minh chứng. Khung nhìn hoặc kết quả ghi: Hoạt động chờ duyệt hoặc danh sách minh chứng thiếu. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi.

**Biên trạng thái.** Khi gửi duyệt với dữ liệu hợp lệ: hoạt động vào danh sách chờ xét. Nhánh thiếu minh chứng bắt buộc của loại hoạt động: nêu loại tệp cần bổ sung. Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ. Tên thực thể kỹ thuật trong bảng là đề xuất cho khái niệm ở §5 của spec nguồn.

Các bảng dùng chung theo [mô hình đích](../../docs/architecture/data-model.md). [RV-29](../review-decisions.md#rv-29) điều chỉnh phép kiểm liên quan đến `Activity.activityType`.
