---
id: US-34
feature: B04
epic: E0
channel: mobile
review_id: RV-39
status: Draft
updated: 2026-11-22
---

# Kế hoạch kiểm thử

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | Mai có hai tin chưa đọc | Chọn Chưa đọc và mở tin thứ nhất | Chi tiết hiển thị nội dung và còn một tin chưa đọc. |
| TC-02 / AC-02 | Đang xem chi tiết từ bộ lọc Chưa đọc | Dùng nút Back của trình duyệt, rồi tải lại | Bộ lọc vẫn được chọn và danh sách chỉ còn tin thứ hai. |
| TC-03 / AC-03 | Chỉ còn một tin trong bộ lọc | Mở tin cuối và quay lại | Gặp trạng thái rỗng, có thể chuyển Tất cả và mở lại tin đã đọc mà số đếm giữ ở 0. |
| TC-04 / AC-04 | Đăng nhập người khác, biết mã tin của Mai | Đi thẳng tới mã tin | Hiện trạng thái ngoài phạm vi, nội dung và trạng thái của tin của Mai được bảo toàn. |

Thiết lập dữ liệu theo [quickstart](quickstart.md). Kiểm thử giao diện chạy trong [bộ v0-mobile](../../e2e/v0/mobile.spec.ts), các ca xác thực trên máy chủ thuộc T003.
