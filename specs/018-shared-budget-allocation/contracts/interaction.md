---
story: US-18
feature: F05
review_id: RV-18
status: Draft
updated: 2026-11-18
---

# Hợp đồng hành vi · US-18

**Điểm gọi.** Dịch vụ dùng chung và điểm gọi của module sở hữu. Module `budget` sở hữu thao tác “Xác nhận kinh phí được cấp”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/budget/budget-allocation.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Quyết định giao hiệu lực, tổng cấp, tỷ lệ và trần phí |
| Kết quả thành công | Tổng cấp, phần phí và kinh phí thực hiện bằng VND |
| Điều kiện từ chối / kết quả phụ | chủ nhiệm → bị chặn ở máy chủ |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Trường hợp cần review | Cấp 300 triệu, tỷ lệ 5%, trần 10 triệu, không điều chỉnh riêng → xác nhận → phí 10 triệu và phần thực hiện 290 triệu |

Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Hiển thị tổng cấp, phần phí và kinh phí thực hiện bằng VND; hiển thị riêng tình huống chủ nhiệm và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
