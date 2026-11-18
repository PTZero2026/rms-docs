---
story: US-07
feature: F01
review_id: RV-07
status: Draft
updated: 2026-11-18
---

# Hợp đồng hành vi · US-07

**Điểm gọi.** Web RMS theo quyền của người thực hiện. Module `proposal` sở hữu thao tác “Nộp đề xuất và nhận mã theo dõi”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/proposal/submit-proposal.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Định danh nháp, bản biểu mẫu và nội dung lần nộp |
| Kết quả thành công | Mã đề tài, giờ tiếp nhận, trạng thái và quyền sửa |
| Điều kiện từ chối / kết quả phụ | nháp đủ trường, đã quá hạn → giữ Nháp và báo hết hạn |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Trường hợp cần review | Nháp hợp lệ, đồng hồ máy chủ đúng hạn và kỳ còn mở → chủ nhiệm gửi hai lần → chỉ có một mã và một lần chuyển Đã nộp |

Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Hiển thị mã đề tài, giờ tiếp nhận, trạng thái và quyền sửa; hiển thị riêng tình huống nháp đủ trường, đã quá hạn và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
