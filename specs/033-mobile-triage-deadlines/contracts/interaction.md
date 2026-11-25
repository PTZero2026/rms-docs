---
id: US-33
feature: B06
epic: E0
channel: mobile
review_id: RV-38
status: Draft
updated: 2026-11-22
---

# Giao tiếp của home

Đọc danh sách việc, thứ tự hạn và đích nguồn sau khi áp cấu hình HOME theo vai trò. Máy chủ lấy tenant và người dùng từ phiên. Danh sách rỗng trả tập rỗng, thu hồi quyền kiểm lại tại đích.

**Dữ liệu và điều kiện biên.** Mỗi mục có khóa việc, tiêu đề, loại việc, ngày hạn tùy chọn, module và khóa đích. Hai kỳ báo cáo khác khóa việc nhưng có thể cùng khóa đề tài. Lọc theo ngày trên việc và điều hướng theo khóa đích.

**Đầu ra quan sát được.** Xác định và mở kỳ 2 từ B06 qua tối đa hai lần chạm.

Khi có backend, dùng hợp đồng của module `home` tại `packages/api-contracts` và sinh kiểu cho client. Bản v0 thực hành giao tiếp này trên dữ liệu mẫu. [Ca đối chứng](../quickstart.md).
