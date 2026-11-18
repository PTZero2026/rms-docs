---
story: US-22
feature: F06
review_id: RV-22
status: Draft
updated: 2026-11-18
---

# Hợp đồng hành vi · US-22

**Điểm gọi.** Web RMS theo quyền của người thực hiện. Module `acceptance` sở hữu thao tác “Đăng ký nghiệm thu khi đủ điều kiện”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/acceptance/request-acceptance.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Đề tài đang thực hiện, kết quả kỳ cuối, cam kết và hồ sơ cuối |
| Kết quả thành công | Danh mục thiếu hoặc hồ sơ PENDING_ACCEPTANCE và thông báo |
| Điều kiện từ chối / kết quả phụ | thiếu một sản phẩm cam kết → nêu mục thiếu và giữ IN_PROGRESS |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Trường hợp cần review | Cam kết một bài và một sáng chế, đã duyệt hai bài → đăng ký nghiệm thu → nêu thiếu sáng chế và giữ IN_PROGRESS |

Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Hiển thị danh mục thiếu hoặc hồ sơ PENDING_ACCEPTANCE và thông báo; hiển thị riêng tình huống thiếu một sản phẩm cam kết và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
