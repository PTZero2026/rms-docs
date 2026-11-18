---
story: US-21
feature: F07
review_id: RV-21
status: Draft
updated: 2026-11-18
---

# Hợp đồng hành vi · US-21

**Điểm gọi.** Dịch vụ dùng chung và điểm gọi của module sở hữu. Module `product` sở hữu thao tác “Duyệt sản phẩm để tính vào cam kết”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/product/approve-output.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Sản phẩm chờ duyệt, chứng cứ và cam kết theo loại |
| Kết quả thành công | Người duyệt, giờ duyệt, số đầu ra được tính |
| Điều kiện từ chối / kết quả phụ | chủ nhiệm chỉ có quyền kê khai → bị từ chối, tổng đạt giữ nguyên |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Trường hợp cần review | Cùng một đầu ra vừa duyệt, cam kết còn thiếu một sản phẩm cùng loại → gửi lại lệnh duyệt → chỉ một đầu ra được tính, mục cam kết vẫn thiếu một |

Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Hiển thị người duyệt, giờ duyệt, số đầu ra được tính; hiển thị riêng tình huống chủ nhiệm chỉ có quyền kê khai và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
