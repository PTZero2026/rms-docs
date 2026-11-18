---
story: US-04
feature: P02
review_id: RV-04
status: Draft
updated: 2026-11-18
---

# Hợp đồng hành vi · US-04

**Điểm gọi.** Dịch vụ dùng chung và điểm gọi của module sở hữu. Module `audit` sở hữu thao tác “Tra căn cứ chuyển bước”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/audit/audit-trail.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Định danh đề tài và khoảng thời gian cần tra |
| Kết quả thành công | Danh sách sự kiện trong quyền, tác nhân, thời điểm, hành động |
| Điều kiện từ chối / kết quả phụ | người ngoài phạm vi → không nhận nội dung của đề tài |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Trường hợp cần review | Chuyên viên vừa mất quyền đề tài nhưng còn liên kết cũ → mở nhật ký → không lộ nội dung hoặc tên hồ sơ |

Truy vấn trong phạm vi hiện tại. Đọc hoặc mở liên kết giữ nguyên trạng thái hồ sơ. Hiển thị danh sách sự kiện trong quyền, tác nhân, thời điểm, hành động; hiển thị riêng tình huống người ngoài phạm vi và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
