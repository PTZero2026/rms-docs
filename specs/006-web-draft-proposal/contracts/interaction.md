---
story: US-06
feature: F01
review_id: RV-06
status: Draft
updated: 2026-11-18
---

# Hợp đồng hành vi · US-06

**Điểm gọi.** Web RMS theo quyền của người thực hiện. Module `proposal` sở hữu thao tác “Lưu nháp thuyết minh”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/proposal/draft-proposal.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Kỳ mở, chủ nhiệm, phần thuyết minh đã soạn |
| Kết quả thành công | Định danh nháp và nội dung đã lưu |
| Điều kiện từ chối / kết quả phụ | nhà nghiên cứu khác ngoài phạm vi → bị từ chối |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Trường hợp cần review | Chủ nhiệm đã chọn kỳ và nhập tên nhưng thiếu phần phương pháp → lưu rồi mở lại nháp → thấy phần đã nhập và có thể tiếp tục sửa |

Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Hiển thị định danh nháp và nội dung đã lưu; hiển thị riêng tình huống nhà nghiên cứu khác ngoài phạm vi và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
