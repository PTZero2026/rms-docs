---
id: US-35
feature: F02
epic: E1
channel: mobile
review_id: RV-40
status: Draft
updated: 2026-11-22
---

# Kế hoạch kiểm thử

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | Có kỳ đang nhận, kỳ đã đóng và bản nháp | Mở F02 trên điện thoại | Nhóm đang nhận chỉ hiển thị kỳ đang trong cửa sổ nhận. |
| TC-02 / AC-02 | Kỳ KG-2027-01 kết thúc 30/11/2026 | Tìm kg-2027-01 rồi mở thẻ | Thẻ hiện hạn 30/11/2026. Chi tiết hiện mã kỳ, biểu mẫu và hành động F01 phù hợp quyền. |
| TC-03 / AC-03 | Từ khóa không khớp | Tìm rồi xóa từ khóa | Có thông điệp rỗng và danh sách được phục hồi. |
| TC-04 / AC-04 | Một chuyên viên được quản lý kỳ nháp, một chủ nhiệm chỉ tra kỳ mở | Mỗi người chọn Tất cả | Kỳ nháp chỉ xuất hiện cho chuyên viên có quyền. Kỳ OPEN tương lai hoặc hết hạn bị loại khỏi Đang nhận. |

Thiết lập dữ liệu theo [quickstart](quickstart.md). Kiểm thử giao diện chạy trong [bộ v0-mobile](../../e2e/v0/mobile.spec.ts), các ca xác thực trên máy chủ thuộc T003.
