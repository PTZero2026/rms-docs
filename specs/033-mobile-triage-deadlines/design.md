---
id: US-33
feature: B06
epic: E0
channel: mobile
review_id: RV-38
status: Draft
updated: 2026-11-22
---

# Thiết kế và truy vết

| Phạm vi | Hiện thực | Kiểm chứng |
|---|---|---|
| BR-01 / FR-001 | Đọc danh sách việc, thứ tự hạn và đích nguồn sau khi áp cấu hình HOME theo vai trò. Máy chủ lấy tenant và người dùng từ phiên. Danh sách rỗng trả tập rỗng, thu hồi quyền kiểm lại tại đích. | AC-01, AC-04 |
| BR-02 / FR-002 | Hạn trước ngày nghiệp vụ là quá hạn. Việc thiếu hạn hoặc đến hạn hôm nay vẫn xuất hiện ở Tất cả. | AC-01, AC-02 |
| BR-03 / FR-003 | Mở việc đi tới hồ sơ ở module sở hữu. Đọc tổng quan và lọc giữ nguyên dữ liệu và audit. | AC-03 |

**Điểm tích hợp** — `apps/web/src/demo/Home.tsx` và `apps/web/src/demo/views.ts`. Bố cục hẹp tới 600 CSS px. Khi xoay màn hình, giữ route hiện hành và điều hướng trong cùng phiên.

[Giao diện](ui.md) · [Ca đối chứng](test-plan.md) · [Hợp đồng](contracts/interaction.md).
