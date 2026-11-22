---
title: "Kiểm thử audit nghiệp vụ"
spec: "./spec.md"
owner: "QA nền tảng / SA"
status: Review
updated: 2026-11-21
---

# P02 · Audit nghiệp vụ

Dùng hai tenant có mã hồ sơ hiển thị giống nhau, một actor có quyền tra cứu và một người ngoài phạm vi. Chạy bằng runtime role thật, mở kết nối đọc độc lập sau khi transaction kết thúc để đối chiếu. [Tiêu chí nguồn](spec.md)

| Ca | AC | Thao tác trên fixture | Kết quả phải đối chiếu |
|---|---|---|---|
| TC-01 | AC-01 | Chuyển một đề tài sang bước mới, nạp lại bằng mã thao tác | Có đúng một AuditLog cho chuyển bước, đúng actor, tenant, đối tượng, thời điểm và trạng thái trước/sau |
| TC-02 | AC-02 | Với runtime role, thử cập nhật rồi xóa dòng audit trong hai giao dịch thử riêng | Cả hai bị từ chối. Đọc lại nội dung và số dòng khớp trước thử |
| TC-03 | AC-03 | Buộc lỗi sau ghi audit và trước commit | Trạng thái nguồn và số audit không đổi trên kết nối độc lập. Retry thành công cho một dòng duy nhất |
| TC-04 | AC-04 | Chạy tác vụ hệ thống và tác vụ AI có ủy quyền trên fixture được phép, đối chiếu với thao tác trực tiếp của người dùng | actorType khớp HUMAN/SYSTEM/AI_AGENT, onBehalfOf đúng người được đại diện khi có ủy quyền. Quyết định nghiệp vụ thuộc người có thẩm quyền |
| TC-05 | AC-05 | Mở danh sách và chi tiết cùng ID từ A, từ B và từ người thiếu quyền trong A | Chỉ actor A đủ quyền thấy bản ghi. Danh sách, tổng và chi tiết đều giữ phạm vi |
| TC-06 | AC-05 | Chuyên viên U chuyển bước khi còn ở khoa A, sau đó sang khoa B và mất quyền xem đề tài. Người V vẫn có quyền. U và V lần lượt mở cùng liên kết lịch sử đã lưu. | U không thấy tên đề tài hay nội dung nhật ký. V thấy người thực hiện là U, thuộc khoa A tại thời điểm chuyển bước. |

Đối chiếu [US-04](../../../specs/004-shared-audit-trail/quickstart.md) với lệnh nghiệp vụ nguồn. Log kỹ thuật phục vụ chẩn đoán được lưu riêng để dễ đếm chính xác audit của một hành động.
