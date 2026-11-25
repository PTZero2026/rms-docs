---
id: US-34
feature: B04
epic: E0
channel: mobile
review_id: RV-39
status: Draft
updated: 2026-11-22
---

# Thiết kế và truy vết

| Phạm vi | Hiện thực | Kiểm chứng |
|---|---|---|
| BR-01 / FR-001 | Lấy hộp thư trong phạm vi người nhận. Ghi READ có điều kiện theo tenant, người nhận và id, lặp lại cho cùng kết quả. Truy cập id ngoài phạm vi trả lỗi chung. Quyền mở hồ sơ đích kiểm độc lập. | AC-01, AC-04 |
| BR-02 / FR-002 | Mở một tin chưa đọc chuyển riêng tin đó sang đã đọc. Mở lại cùng tin giữ nguyên kết quả. | AC-01, AC-03 |
| BR-03 / FR-003 | Trở lại danh sách đã lọc giữ lựa chọn Chưa đọc. Khi hết tin hiển thị trạng thái rỗng và lối xem Tất cả. | AC-02, AC-03 |

**Điểm tích hợp** — `apps/web/src/features/platform/Notifications.tsx` và `apps/web/src/demo/repository.ts`. Bố cục hẹp tới 600 CSS px. Khi xoay màn hình, giữ route hiện hành và điều hướng trong cùng phiên.

[Giao diện](ui.md) · [Ca đối chứng](test-plan.md) · [Hợp đồng](contracts/interaction.md).
