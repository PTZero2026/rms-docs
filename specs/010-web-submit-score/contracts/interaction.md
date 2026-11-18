---
story: US-10
feature: F03
review_id: RV-10
status: Draft
updated: 2026-11-18
---

# Hợp đồng hành vi · US-10

**Điểm gọi.** Web RMS theo quyền của người thực hiện. Module `review` sở hữu thao tác “Gửi phiếu chấm cá nhân”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/review/submit-score.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Đợt, thành viên, điểm và nhận xét theo tiêu chí |
| Kết quả thành công | Phiếu đã nộp, tổng trọng số và trạng thái khóa |
| Điều kiện từ chối / kết quả phụ | người chấm là thành viên đề tài → không thấy việc chấm và không tạo được phiếu |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Trường hợp cần review | Người đã mở nháp vừa được bổ sung vào nhóm đề tài → gửi phiếu đã điền → phiếu không được tính và người đó mất quyền chấm |

Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Hiển thị phiếu đã nộp, tổng trọng số và trạng thái khóa; hiển thị riêng tình huống người chấm là thành viên đề tài và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
