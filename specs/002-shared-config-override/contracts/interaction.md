---
story: US-02
feature: B01
review_id: RV-02
status: Draft
updated: 2026-11-18
---

# Hợp đồng hành vi · US-02

**Điểm gọi.** Dịch vụ dùng chung và điểm gọi của module sở hữu. Module `catalog` sở hữu thao tác “Ghi đè một cấu hình của trường”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/catalog/config-override.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Khóa cấu hình, nội dung mới, trường đang quản trị |
| Kết quả thành công | Giá trị đọc hiệu lực tại A và giá trị chung tại B |
| Điều kiện từ chối / kết quả phụ | tenant B chỉ có giá trị chung → nhận đúng giá trị chung |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Trường hợp cần review | A và B đã đọc khóa dùng chung trước khi A ghi đè → đọc lại tại hai trường → A dùng bản riêng, B vẫn dùng bản chung |

Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Hiển thị giá trị đọc hiệu lực tại A và giá trị chung tại B; hiển thị riêng tình huống tenant B chỉ có giá trị chung và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
