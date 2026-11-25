---
id: US-33
feature: B06
epic: E0
channel: mobile
review_id: RV-38
status: Draft
updated: 2026-11-24
---

# Nghiên cứu cho US-33

US-12 đã bao phủ mở hồ sơ. CSS v0 lại ẩn nhãn Quá hạn dưới 600 px. Chủ nhiệm phải so ngày thủ công khi hai báo cáo cùng xuất hiện. [Nguồn nghiệp vụ](../../docs/features/B06-trang-chu/spec.md) · [Màn hình hiện hành](../../apps/web/src/demo/Home.tsx).

**Phương án đã cân nhắc.** Lịch tháng cần thêm thao tác tìm đúng ngày. Danh sách theo hạn tận dụng thứ tự hiện có và chấp nhận việc chưa có ngày.

**Quyết định triển khai.** Dùng ngày nghiệp vụ Asia/Ho_Chi_Minh. Hai trường hợp thuộc Tất cả. Nhãn bộ lọc là Quá hạn và Tất cả. [Quyết định RV-38](../../docs/product/mobile-invest.md).

**Cách kiểm lại với người dùng.** Xác định và mở kỳ 2 từ B06 qua tối đa hai lần chạm. Ghi lần chạm, mã hồ sơ hoặc tin cuối cùng và lỗi chọn nhầm trong buổi thử pilot.
