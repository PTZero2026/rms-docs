---
id: US-34
feature: B04
epic: E0
channel: mobile
review_id: RV-39
status: Draft
updated: 2026-11-24
---

# Nghiên cứu cho US-34

B04 v0 lọc bằng một select và trạng thái cục bộ của trang. Khi mở chi tiết rồi quay lại, bộ lọc mất. AC-06 yêu cầu mở tin là đủ để chuyển trạng thái. [Nguồn nghiệp vụ](../../docs/features/B04-thong-bao/spec.md) · [Màn hình hiện hành](../../apps/web/src/features/platform/Notifications.tsx).

**Phương án đã cân nhắc.** Đọc tất cả giúp dọn hộp thư nhưng mất dấu từng tin. Lọc và mở riêng từng tin cho phép đọc gián đoạn.

**Quyết định triển khai.** B04 AC-06 đặt mốc khi mở tin. Lưu lựa chọn Chưa đọc trong URL danh sách để quay lại và tải lại cùng bộ lọc. [Quyết định RV-39](../../docs/product/mobile-invest.md).

**Cách kiểm lại với người dùng.** Từ danh sách chưa đọc có hai tin, mở một tin rồi quay lại thấy đúng một tin chưa đọc. Ghi lần chạm, mã hồ sơ hoặc tin cuối cùng và lỗi chọn nhầm trong buổi thử pilot.
