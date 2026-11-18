---
story: US-17
feature: F04
review_id: RV-17
status: Draft
updated: 2026-11-18
---

# Hợp đồng hành vi · US-17

**Điểm gọi.** Web RMS theo quyền của người thực hiện. Module `progress` sở hữu thao tác “Nộp báo cáo tiến độ”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/progress/submit-progress.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Báo cáo chờ, nội dung và tệp, thời điểm nhận |
| Kết quả thành công | Báo cáo SUBMITTED, dấu trễ và giờ nhận |
| Điều kiện từ chối / kết quả phụ | đề tài tạm dừng → chặn và giữ trạng thái kỳ |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Trường hợp cần review | Báo cáo đến đúng hạn trong khi đề tài đang thực hiện → chủ nhiệm nộp đủ tệp → ghi nhận đúng hạn và chuyển chờ duyệt |

Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Hiển thị báo cáo SUBMITTED, dấu trễ và giờ nhận; hiển thị riêng tình huống đề tài tạm dừng và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
