---
title: "Báo cáo kỳ — thiết kế"
spec: "./spec.md"
owner: "Kiến trúc sư / BE"
status: Review
updated: 2026-11-25
---

# Thiết kế lát báo cáo kỳ

| BR/AC | Cách hiện thực đề xuất | Kiểm chứng |
|---|---|---|
| BR-01 / AC-01 | Lọc kỳ, mã đã cấp. Lấy duy nhất theo định danh ResearchProject trước khi nhóm, tránh nhân dòng từ lịch sử nộp. | TC-01 |
| BR-02 / AC-03 | Tạo một bản chụp chứa định danh, mã từng đề tài, khoa, trạng thái và thời điểm. Tổng theo nhóm, chi tiết và CSV cùng đọc bản chụp này. ID bản chụp và thời điểm UTC xác định lần đối chiếu. | TC-03 |
| BR-03 / AC-02 | Áp phạm vi từ phiên ở đầu truy vấn và kiểm lại khi tải tệp. Hủy quyền đọc bản chụp nếu phạm vi đã thu hẹp. | TC-02 |

Module `report` chỉ đọc dữ liệu nghiệp vụ. Hợp đồng triển khai ở `packages/api-contracts` trong repo code. Thời hạn giữ bản xuất và định dạng tệp theo mẫu phòng KHCN duyệt. [Kế hoạch US-13](../../../specs/013-web-call-report/plan.md)

Khi mở lại, giao diện gửi ID bản chụp tới B02. Backend xác nhận người tạo, trường và quyền hiện tại với các đơn vị và đề tài trong bản chụp. Lựa chọn một khoa lấy từ ID đơn vị mà server đã lưu, kể cả lúc bản chụp có 0 dòng. Liên kết lưu nhóm đang xem và lựa chọn phạm vi. [Hợp đồng bản chụp](../../../packages/api-contracts/report/call-report.yaml) · [Dịch vụ xuất CSV](../../../apps/backend/src/modules/report/call-report/service.ts)
