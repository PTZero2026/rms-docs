---
story: US-03
feature: P01
review_id: RV-03
status: Draft
updated: 2026-11-21
---

# Hợp đồng hành vi · US-03

**Điểm gọi.** Dịch vụ dùng chung và điểm gọi của module sở hữu. Module `workflow` sở hữu thao tác “Giữ quy trình của hồ sơ đang chạy”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/workflow/workflow-version.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Mẫu quy trình, phiên bản và các bước có trạng thái chuẩn |
| Kết quả thành công | Phiên bản khả dụng cho hồ sơ mới hoặc danh sách bước lỗi |
| Điều kiện từ chối / kết quả phụ | mẫu có bước thiếu trạng thái chuẩn → từ chối và nêu bước cần sửa |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Phiên bản dùng khi chuyển bước (RV-03) | Mỗi hồ sơ dùng phiên bản quy trình có hiệu lực lúc tạo cho đến khi hoàn tất. Khi v2 có hiệu lực, hồ sơ đang chờ duyệt theo v1 tiếp tục chuyển bước theo v1. Hồ sơ tạo từ thời điểm đó dùng v2. |

Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Hiển thị phiên bản khả dụng cho hồ sơ mới hoặc danh sách bước lỗi; hiển thị riêng tình huống mẫu có bước thiếu trạng thái chuẩn và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
