---
id: US-33
feature: B06
epic: E0
channel: mobile
review_id: RV-38
status: Draft
updated: 2026-11-22
---

# Kế hoạch kiểm thử

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | Hai báo cáo có hạn 18/11 và 28/11 | Chọn Quá hạn ngày 21/11 | Danh sách có kỳ 2 và loại kỳ 3, số đếm khớp. |
| TC-02 / AC-02 | Có việc hạn hôm nay và việc chưa có hạn | So Quá hạn với Tất cả | Cả hai chỉ có trong Tất cả. Khi nhóm quá hạn rỗng có cách trở lại toàn bộ việc. |
| TC-03 / AC-03 | Chủ nhiệm nhìn thấy kỳ 2 của chính mình | Mở thẻ rồi quay lại B06 | F04 mở đúng đề tài. Dữ liệu và audit giữ nguyên. |
| TC-04 / AC-04 | Đổi người hoặc tenant, hoặc cấu hình bỏ widget việc | Mở lại tổng quan | Danh sách và số đếm theo phiên mới. Widget bị tắt thì cả thẻ và tổng tương ứng đều ẩn. |

Thiết lập dữ liệu theo [quickstart](quickstart.md). Kiểm thử giao diện chạy trong [bộ v0-mobile](../../e2e/v0/mobile.spec.ts), các ca xác thực trên máy chủ thuộc T003.
