---
id: US-35
feature: F02
epic: E1
channel: mobile
review_id: RV-40
status: Draft
updated: 2026-11-24
---

# Nghiên cứu cho US-35

Danh sách F02 trên v0 dùng bảng bốn cột. Chủ nhiệm cần đọc cùng lúc mã kỳ và hạn, còn chi tiết đã có điều kiện và biểu mẫu. [Nguồn nghiệp vụ](../../docs/features/F02-dot-keu-goi/spec.md) · [Màn hình hiện hành](../../apps/web/src/features/intake/CallScreen.tsx).

**Phương án đã cân nhắc.** Thu gọn cột mã sẽ làm mất cách tra từ công văn. Gộp mã và hạn vào một thẻ giúp nhìn được hai thông tin khi nhập mã.

**Quyết định triển khai.** Dùng cả ngày bắt đầu và hạn cuối như F01. Cho phép chuyển Tất cả để chuyên viên tìm lại các kỳ trong phạm vi. Mặc định chọn Đang nhận khi vào từ điện thoại. [Quyết định RV-40](../../docs/product/mobile-invest.md).

**Cách kiểm lại với người dùng.** Tìm một kỳ theo mã và đọc đúng hạn trên màn hình 320 px mà không cuộn ngang. Ghi lần chạm, mã hồ sơ hoặc tin cuối cùng và lỗi chọn nhầm trong buổi thử pilot.
