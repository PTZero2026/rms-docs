---
story: US-28
feature: F11
review_id: RV-28
status: Draft
updated: 2026-11-18
---

# Hợp đồng hành vi · US-28

**Điểm gọi.** Web RMS theo quyền của người thực hiện. Module `applied-project` sở hữu thao tác “Kê khai dự án phục vụ sản xuất”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/applied-project/register-applied-project.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Đơn vị chủ trì, đối tác ngoài và tổng kinh phí |
| Kết quả thành công | Đầu mục dự án ứng dụng với kinh phí tổng |
| Điều kiện từ chối / kết quả phụ | thiếu đối tác ngoài → chặn và yêu cầu bổ sung |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Trường hợp cần review | Đã có viện chủ trì, đối tác và 50 triệu VND → lưu dự án → đầu mục giữ 50 triệu, sổ chi đề tài F05 giữ nguyên |

Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Hiển thị đầu mục dự án ứng dụng với kinh phí tổng; hiển thị riêng tình huống thiếu đối tác ngoài và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
