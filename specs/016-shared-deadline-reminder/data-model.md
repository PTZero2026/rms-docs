---
story: US-16
feature: B04
review_id: RV-16
status: Draft
updated: 2026-11-18
---

# Mô hình dữ liệu · US-16

| Trường trọng tâm | Ràng buộc của lát | Nguồn |
|---|---|---|
| `Notification.recipientId` | Đúng chủ nhiệm của kỳ đủ điều kiện tại thời điểm phát nhắc. | [B04](../../docs/features/B04-thong-bao/spec.md) |

B04 tham chiếu ProgressReport, chủ nhiệm và mốc trước hạn do B01 cấu hình. Thông báo logic tách khỏi các lần thử giao qua kênh ngoài.

Đối tượng nguồn và liên kết nghiệp vụ: Đồng hồ nghiệp vụ, mốc nhắc, kỳ báo cáo, người nhận. Khung nhìn hoặc kết quả ghi: Một thông báo PROGRESS_REPORT_DUE_SOON theo khóa. Dùng khóa sự kiện để nhận lại an toàn, chỉ xác nhận xử lý sau khi lưu kết quả.

**Biên trạng thái.** Khi chạy nhắc với dữ liệu hợp lệ: có thông báo cho đúng chủ nhiệm. Nhánh cùng đề tài, kỳ và mốc: không tạo thêm thông báo. Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ.

Các bảng dùng chung theo [mô hình đích](../../docs/architecture/data-model.md). [RV-16](../review-decisions.md#rv-16) điều chỉnh phép kiểm liên quan đến `Notification.recipientId`.
