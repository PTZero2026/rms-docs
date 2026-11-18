---
story: US-03
feature: P01
review_id: RV-03
status: Draft
updated: 2026-11-18
---

# Hợp đồng hành vi · US-03

**Điểm gọi.** Dịch vụ dùng chung và điểm gọi của module sở hữu. Module `workflow` sở hữu thao tác “Giữ quy trình của hồ sơ đang chạy”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/workflow/workflow-version.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Mẫu quy trình, phiên bản và các bước có trạng thái chuẩn |
| Kết quả thành công | Phiên bản khả dụng cho hồ sơ mới hoặc danh sách bước lỗi |
| Điều kiện từ chối / kết quả phụ | mẫu có bước thiếu trạng thái chuẩn → từ chối và nêu bước cần sửa |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Trường hợp cần review | Hồ sơ cũ còn một bước đang chờ khi v2 đã kích hoạt → người xử lý hoàn tất bước → bước kế tiếp lấy từ v1 |

Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Hiển thị phiên bản khả dụng cho hồ sơ mới hoặc danh sách bước lỗi; hiển thị riêng tình huống mẫu có bước thiếu trạng thái chuẩn và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
