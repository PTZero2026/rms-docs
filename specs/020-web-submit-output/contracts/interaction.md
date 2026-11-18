---
story: US-20
feature: F07
review_id: RV-20
status: Draft
updated: 2026-11-18
---

# Hợp đồng hành vi · US-20

**Điểm gọi.** Web RMS theo quyền của người thực hiện. Module `product` sở hữu thao tác “Nộp sản phẩm khoa học kèm minh chứng”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/product/submit-output.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Đề tài, loại sản phẩm, thông tin công bố, tác giả, minh chứng |
| Kết quả thành công | Sản phẩm chờ duyệt gắn đúng đề tài |
| Điều kiện từ chối / kết quả phụ | thiếu minh chứng bắt buộc → báo thiếu, bản kê khai chưa chuyển chờ duyệt |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Trường hợp cần review | Tệp đính kèm đã bị thu quyền trước khi gửi → nộp sản phẩm → báo minh chứng chưa hợp lệ, giữ nháp |

Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Hiển thị sản phẩm chờ duyệt gắn đúng đề tài; hiển thị riêng tình huống thiếu minh chứng bắt buộc và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
