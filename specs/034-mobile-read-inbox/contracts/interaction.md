---
id: US-34
feature: B04
epic: E0
channel: mobile
review_id: RV-39
status: Draft
updated: 2026-11-22
---

# Giao tiếp của notification

Lấy hộp thư trong phạm vi người nhận. Ghi READ có điều kiện theo tenant, người nhận và id, lặp lại cho cùng kết quả. Truy cập id ngoài phạm vi trả lỗi chung. Quyền mở hồ sơ đích kiểm độc lập.

**Dữ liệu và điều kiện biên.** IN_APP có id, recipientId, tenant, nội dung, thời gian, liên kết nguồn và trạng thái. SUBMITTED trong spec tương ứng UNREAD trong fixture. READ là trạng thái cuối của thao tác đọc. Bộ lọc thuộc URL danh sách.

**Đầu ra quan sát được.** Từ danh sách chưa đọc có hai tin, mở một tin rồi quay lại thấy đúng một tin chưa đọc.

Khi có backend, dùng hợp đồng của module `notification` tại `packages/api-contracts` và sinh kiểu cho client. Bản v0 thực hành giao tiếp này trên dữ liệu mẫu. [Ca đối chứng](../quickstart.md).
