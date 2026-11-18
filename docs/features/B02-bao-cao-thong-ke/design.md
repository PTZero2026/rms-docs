---
title: "Báo cáo kỳ — thiết kế"
spec: "./spec.md"
owner: "Kiến trúc sư / BE"
status: Review
updated: 2026-11-18
---

# Thiết kế lát báo cáo kỳ

| BR/AC | Cách hiện thực đề xuất | Kiểm chứng |
|---|---|---|
| BR-01 / AC-01 | Lọc kỳ, mã đã cấp. Lấy duy nhất theo định danh ResearchProject trước khi nhóm, tránh nhân dòng từ lịch sử nộp. | TC-01 |
| BR-02 / AC-03 | Chụp tập ID, trạng thái chuẩn và thời điểm trong cùng lần đọc nhất quán. Kết xuất chi tiết từ tập đã chụp. | TC-03 |
| BR-03 / AC-02 | Áp phạm vi từ phiên ở đầu truy vấn và kiểm lại khi tải tệp. Hủy quyền đọc bản chụp nếu phạm vi đã thu hẹp. | TC-02 |

Module `report` chỉ đọc dữ liệu nghiệp vụ. Hợp đồng triển khai ở `packages/api-contracts` trong repo code. Thời hạn giữ bản xuất và định dạng tệp theo mẫu phòng KHCN duyệt. [Kế hoạch US-13](../../../specs/013-web-call-report/plan.md)
