---
story: US-12
feature: B06
review_id: RV-12
status: Draft
updated: 2026-11-18
---

# Hợp đồng hành vi · US-12

**Điểm gọi.** Web responsive, màn hình 360 px và 390 px. Module `home` sở hữu thao tác “Mở việc cần xử lý trên điện thoại”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/home/open-work-item.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Phiên người dùng, danh sách việc, liên kết của thẻ ở màn hình hẹp |
| Kết quả thành công | Chuyển tới đúng hồ sơ nguồn, giữ nguyên dữ liệu |
| Điều kiện từ chối / kết quả phụ | người ngoài phạm vi → tiêu đề và số liệu hồ sơ kia đều không xuất hiện |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Trường hợp cần review | Điện thoại rộng 360 px đã hiện thẻ rồi tài khoản bị thu quyền → chạm thẻ cũ → không lộ hồ sơ và có đường về trang chủ |

Truy vấn trong phạm vi hiện tại. Đọc hoặc mở liên kết giữ nguyên trạng thái hồ sơ. Hiển thị chuyển tới đúng hồ sơ nguồn, giữ nguyên dữ liệu; hiển thị riêng tình huống người ngoài phạm vi và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
