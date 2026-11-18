---
story: US-16
feature: B04
review_id: RV-16
status: Draft
updated: 2026-11-18
---

# Hợp đồng hành vi · US-16

**Điểm gọi.** Dịch vụ dùng chung và điểm gọi của module sở hữu. Module `notification` sở hữu thao tác “Nhắc hạn đúng một lần theo mốc”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/notification/deadline-reminder.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Đồng hồ nghiệp vụ, mốc nhắc, kỳ báo cáo, người nhận |
| Kết quả thành công | Một thông báo PROGRESS_REPORT_DUE_SOON theo khóa |
| Điều kiện từ chối / kết quả phụ | cùng đề tài, kỳ và mốc → không tạo thêm thông báo |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Trường hợp cần review | Thông báo trong ứng dụng đã có nhưng kênh email lỗi → tác vụ chạy lại cùng mốc → vẫn một thông báo và theo dõi được lần gửi lại |

Dùng khóa sự kiện để nhận lại an toàn, chỉ xác nhận xử lý sau khi lưu kết quả. Theo dõi đầu ra từ điểm đọc của hộp thông báo B04. [Spec và nguồn](../spec.md).
