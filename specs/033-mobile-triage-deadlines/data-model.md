---
id: US-33
feature: B06
epic: E0
channel: mobile
review_id: RV-38
status: Draft
updated: 2026-11-24
---

# Mô hình đọc của US-33

Mỗi mục có khóa việc, tiêu đề, loại việc, ngày hạn tùy chọn, module và khóa đích. Hai kỳ báo cáo khác khóa việc nhưng có thể cùng khóa đề tài. Lọc theo ngày trên việc và điều hướng theo khóa đích.

Đọc danh sách việc, thứ tự hạn và đích nguồn sau khi áp cấu hình HOME theo vai trò. Máy chủ lấy tenant và người dùng từ phiên. Danh sách rỗng trả tập rỗng, thu hồi quyền kiểm lại tại đích.

Phân vùng theo tenant của phiên. So sánh thời điểm theo giờ Việt Nam và lưu timestamp UTC. [Mô hình RMS](../../docs/architecture/data-model.md) · [B06](../../docs/features/B06-trang-chu/spec.md).

WorkItem.dueDate là ngày hạn tùy chọn. WorkItem.id định danh việc, WorkItem.targetId định danh hồ sơ nguồn.
