---
story: US-27
feature: F10
review_id: RV-27
status: Draft
updated: 2026-11-18
---

# Hợp đồng hành vi · US-27

**Điểm gọi.** Web RMS theo quyền của người thực hiện. Module `student-project` sở hữu thao tác “Xác nhận người hướng dẫn đề tài sinh viên”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/student-project/confirm-mentor.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Đăng ký của nhóm, đợt, người hướng dẫn và xác nhận tương ứng |
| Kết quả thành công | Trạng thái đủ/thiếu xác nhận cho đúng đăng ký |
| Điều kiện từ chối / kết quả phụ | chưa ai xác nhận → chỉ rõ thiếu xác nhận và giữ bản đăng ký |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Trường hợp cần review | Giảng viên đã xác nhận cho hồ sơ A, sinh viên gửi hồ sơ B → nộp B → yêu cầu xác nhận riêng cho B |

Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Hiển thị trạng thái đủ/thiếu xác nhận cho đúng đăng ký; hiển thị riêng tình huống chưa ai xác nhận và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
