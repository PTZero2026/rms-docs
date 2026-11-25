---
title: "Màn hình quản lý tài khoản"
owner: "BA / Design"
status: Review
updated: 2026-11-24
---

# Quản lý người dùng

| Điểm vào | Hành vi và kết quả cần quan sát | Tiêu chí |
|---|---|---|
| BO-01 · Danh sách | Admin tìm theo người, đơn vị và trạng thái trong tenant. Chuyên viên chỉ tra trong phạm vi được giao. Từ chi tiết mở lý lịch F08 theo quyền. | AC-01, AC-07, AC-09 |
| BO-02 · Hồ sơ tài khoản | Admin chọn một userType khi tạo. Email trùng trong tenant báo ngay tại trường. Khi quay lại từ OTP lần đầu, người mới hoàn thiện hồ sơ và thấy vai trò user. | AC-01, AC-02, AC-03 |
| BO-03 · Chi tiết và quyền | Hiển thị một vai trò hiện hành, trạng thái và danh mục quyền chỉ đọc. Admin đổi vai trò hoặc xác nhận khóa/mở/ngừng. Hiển thị lý do khi tự khóa hoặc khi còn một admin. Phiên vừa bị khóa gặp từ chối tại lần đọc/lưu kế tiếp. | AC-04, AC-07, AC-08, AC-11, AC-12, AC-14 |
| Yêu cầu thành author | Người dùng cung cấp chuyên môn và minh chứng. Admin xem yêu cầu chờ, duyệt hoặc ghi lý do từ chối. Mở lại thấy trạng thái yêu cầu và vai trò hiện tại. | AC-13 |
| BO-06 · Nhật ký | Admin được phép tra actor, đối tượng, thời điểm và thay đổi vai trò/trạng thái. Yêu cầu quyền bổ sung ghi nhật ký, tập quyền hiệu lực vẫn theo userType. | AC-08, AC-09, AC-11, AC-12 |

BO-04 và BO-05 của bản thiết kế trước được thay bằng bảng quyền chỉ đọc trong BO-03. Backend kiểm quyền kể cả khi người dùng mở thẳng đường dẫn.

[Đặc tả](spec.md) · [Ca kiểm](test-plan.md) · [UI trước v0.4](ref/ui.md)
