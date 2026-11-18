---
story: US-19
feature: F05
review_id: RV-19
status: Draft
updated: 2026-11-18
---

# Hợp đồng hành vi · US-19

**Điểm gọi.** Web RMS theo quyền của người thực hiện. Module `budget` sở hữu thao tác “Ghi khoản chi kèm chứng từ”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/budget/record-expense.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Đề tài, số VND nguyên, ngày chi, mô tả và tệp nếu có |
| Kết quả thành công | Khoản chi, số dư và cảnh báo vượt |
| Điều kiện từ chối / kết quả phụ | số tiền bằng 0 → báo lỗi, số dư giữ nguyên |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Trường hợp cần review | Còn 2 triệu, khoản chi đúng 2 triệu đồng → chủ nhiệm lưu → số dư bằng 0 và không cảnh báo vượt |

Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Hiển thị khoản chi, số dư và cảnh báo vượt; hiển thị riêng tình huống số tiền bằng 0 và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
