---
story: US-23
feature: F06
review_id: RV-23
status: Draft
updated: 2026-11-18
---

# Hợp đồng hành vi · US-23

**Điểm gọi.** Dịch vụ dùng chung và điểm gọi của module sở hữu. Module `acceptance` sở hữu thao tác “Ghi kết luận nghiệm thu đạt”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/acceptance/acceptance-result.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Đợt nghiệm thu, phiếu hợp lệ và ngưỡng |
| Kết quả thành công | Kết luận PASSED và bàn giao F05 |
| Điều kiện từ chối / kết quả phụ | thiếu một phiếu bắt buộc → chặn và báo số phiếu thiếu |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Trường hợp cần review | Đợt nghiệm thu thiếu một phiếu, đề tài có một phiếu xét duyệt đầu vào → chốt kết luận → vẫn thiếu một phiếu, chưa chuyển PASSED |

Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Hiển thị kết luận PASSED và bàn giao F05; hiển thị riêng tình huống thiếu một phiếu bắt buộc và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
