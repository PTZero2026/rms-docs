---
id: US-34
feature: B04
epic: E0
channel: mobile
review_id: RV-39
status: Draft
updated: 2026-11-24
---

# Mô hình đọc của US-34

IN_APP có id, recipientId, tenant, nội dung, thời gian, liên kết nguồn và trạng thái. SUBMITTED trong spec tương ứng UNREAD trong fixture. READ là trạng thái cuối của thao tác đọc. Bộ lọc thuộc URL danh sách.

Lấy hộp thư trong phạm vi người nhận. Ghi READ có điều kiện theo tenant, người nhận và id, lặp lại cho cùng kết quả. Truy cập id ngoài phạm vi trả lỗi chung. Quyền mở hồ sơ đích kiểm độc lập.

Phân vùng theo tenant của phiên. So sánh thời điểm theo giờ Việt Nam và lưu timestamp UTC. [Mô hình RMS](../../docs/architecture/data-model.md) · [B04](../../docs/features/B04-thong-bao/spec.md).

Notification.recipientId và Notification.tenantId xác định chủ tin. Notification.status của IN_APP chuyển từ SUBMITTED sang READ khi chính người nhận mở tin.
