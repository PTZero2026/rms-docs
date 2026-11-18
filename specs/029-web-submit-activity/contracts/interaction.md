---
story: US-29
feature: F12
review_id: RV-29
status: Draft
updated: 2026-11-18
---

# Hợp đồng hành vi · US-29

**Điểm gọi.** Web RMS theo quyền của người thực hiện. Module `activity` sở hữu thao tác “Kê khai một hoạt động khoa học”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/activity/submit-activity.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Loại hoạt động, tenant và bộ tệp minh chứng |
| Kết quả thành công | Hoạt động chờ duyệt hoặc danh sách minh chứng thiếu |
| Điều kiện từ chối / kết quả phụ | thiếu minh chứng bắt buộc của loại hoạt động → nêu loại tệp cần bổ sung |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Trường hợp cần review | Hai trường yêu cầu minh chứng khác nhau cho cùng một hội nghị → giảng viên trường A gửi → chỉ kiểm bộ minh chứng của A |

Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Hiển thị hoạt động chờ duyệt hoặc danh sách minh chứng thiếu; hiển thị riêng tình huống thiếu minh chứng bắt buộc của loại hoạt động và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
