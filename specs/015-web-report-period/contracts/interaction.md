---
story: US-15
feature: F04
review_id: RV-15
status: Draft
updated: 2026-11-18
---

# Hợp đồng hành vi · US-15

**Điểm gọi.** Web RMS theo quyền của người thực hiện. Module `progress` sở hữu thao tác “Đặt hạn báo cáo theo kỳ”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/progress/report-period.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Đề tài đang làm, mã kỳ và hạn nộp |
| Kết quả thành công | Một báo cáo PENDING_SUBMISSION cho kỳ mới |
| Điều kiện từ chối / kết quả phụ | đã có cùng kỳ trên đề tài → từ chối bản trùng |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Trường hợp cần review | Hai đề tài đang thực hiện cùng chưa có kỳ 1 → tạo kỳ 1 cho từng đề tài → mỗi đề tài có một báo cáo chờ riêng |

Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Hiển thị một báo cáo PENDING_SUBMISSION cho kỳ mới; hiển thị riêng tình huống đã có cùng kỳ trên đề tài và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
