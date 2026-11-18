---
story: US-25
feature: F08
review_id: RV-25
status: Draft
updated: 2026-11-18
---

# Hợp đồng hành vi · US-25

**Điểm gọi.** Web RMS theo quyền của người thực hiện. Module `profile` sở hữu thao tác “Xuất lý lịch nghiên cứu của cá nhân”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/profile/export-profile.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Cá nhân, mẫu tenant, sản phẩm duyệt và vai trò |
| Kết quả thành công | Bản lý lịch theo mẫu, từng đầu ra chỉ xuất hiện một lần |
| Điều kiện từ chối / kết quả phụ | người dùng ngoài phạm vi → từ chối |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Trường hợp cần review | Một sản phẩm gắn qua hai vai trò và một sản phẩm đang chờ duyệt → xuất lý lịch → chỉ có một dòng cho sản phẩm đã duyệt |

Truy vấn trong phạm vi hiện tại. Đọc hoặc mở liên kết giữ nguyên trạng thái hồ sơ. Hiển thị bản lý lịch theo mẫu, từng đầu ra chỉ xuất hiện một lần; hiển thị riêng tình huống người dùng ngoài phạm vi và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
