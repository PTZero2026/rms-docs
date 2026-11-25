---
id: US-35
feature: F02
epic: E1
channel: mobile
review_id: RV-40
status: Draft
updated: 2026-11-22
---

# Thiết kế và truy vết

| Phạm vi | Hiện thực | Kiểm chứng |
|---|---|---|
| BR-01 / FR-001 | Truy vấn các kỳ trong phạm vi phiên, lọc theo thời gian hiệu lực rồi theo từ khóa. Mở chi tiết bằng id, kiểm quyền tại nguồn và kiểm lại điều kiện tiếp nhận trước khi lập đề xuất. | AC-01, AC-04 |
| BR-02 / FR-002 | Tìm theo tên hoặc mã trong tập đang chọn. Mỗi kết quả có mã và hạn dạng dd/MM/yyyy. | AC-02, AC-03 |
| BR-03 / FR-003 | Chạm kết quả mở đúng điều kiện, biểu mẫu tại F02. Danh sách toàn bộ giữ nguyên phạm vi của từng vai trò. | AC-02, AC-04 |

**Điểm tích hợp** — `apps/web/src/features/intake/CallScreen.tsx` và `apps/web/src/features/intake/model.ts`. Bố cục hẹp tới 600 CSS px. Khi xoay màn hình, giữ route hiện hành và điều hướng trong cùng phiên.

[Giao diện](ui.md) · [Ca đối chứng](test-plan.md) · [Hợp đồng](contracts/interaction.md).
