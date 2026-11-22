---
title: "Kiểm thử B03 theo mô hình tài khoản v0.4"
owner: "QA nghiệp vụ / PO"
spec: "./spec.md"
status: Review
updated: 2026-11-21
---

# B03 · Quản lý người dùng

Dùng hai realm A/B. Ở A seed hai admin hoạt động, một staff, một user và một đề tài đang tham chiếu người tạo. B có cùng email hiển thị với A và admin riêng. Chạy với token thật từ Keycloak thử và kiểm quyền ở API. Bản này theo 11 AC còn hiệu lực trong [spec v0.4](spec.md). Bộ ca lịch sử của mô hình nhiều vai trò ở [bản tháng 6](ref/test-plan-2026-06-11.md).

| Ca | AC | Điều kiện và thao tác | Kết quả mong đợi |
|---|---|---|---|
| TC-01 | AC-01 | Admin A tạo người dùng có email mới và userType staff | Chỉ tenant A có tài khoản mới, isActive=true, userType=staff. Có ADMIN_CREATE_USER và danh tính liên kết |
| TC-02 | AC-02 | Email mới qua OTP, gọi /auth/me lần đầu rồi gọi lại | Lần đầu trả isNew=true, userType=user, isActive=true, isProfileComplete=false và log tự tạo. Cùng issuer/sub chỉ có một user |
| TC-03 | AC-03 | A đã có a@bv.vn. Admin A tạo A@bv.vn, sau đó kiểm user cùng email ở realm B | A nhận 409 và số tài khoản A giữ nguyên. Danh tính B độc lập |
| TC-04 | AC-04 | Admin A tự khóa trong khi còn admin thứ hai | 400 và thông báo không thể tự khóa mình. Admin vẫn hoạt động |
| TC-05 | AC-07 | U có đề tài đang tham chiếu. Admin ngừng hoạt động U | U có isActive=false, deletedAt được ghi, đề tài và liên kết tác giả còn nguyên |
| TC-06 | AC-08 | U bị khóa nhưng giữ phiên còn hạn. Thử riêng tải lại và bấm Lưu hồ sơ đang mở, mỗi lần là yêu cầu đầu tiên sau khi khóa. Thử thêm với U vừa nhập đúng OTP | Mỗi yêu cầu trả 403 và ghi log từ chối. Người có quyền tra cứu thấy nội dung đã lưu và các bản ghi lịch sử trước khi khóa |
| TC-07 | AC-09 | User chỉ có meetings.view gọi POST /admin/users | 403 ở backend, số user và log tạo thành công giữ nguyên |
| TC-08 | AC-11 | Admin đổi user thành staff, user gọi lại API | Quyền hiệu lực là 11 quyền staff theo spec. ADMIN_CHANGE_USER_ROLE ghi giá trị trước và sau |
| TC-09 | AC-12 | Admin khóa rồi mở khóa U đang active, thử quyền sau từng bước | Khóa trả 200, isActive=false, có ACCOUNT_LOCKED. Mở khóa trả isActive=true, có ACCOUNT_UNLOCKED |
| TC-10 | AC-13 | User nộp hồ sơ nâng cấp hợp lệ, admin duyệt | Request PENDING trước duyệt. Sau duyệt request APPROVED, userType=author, đúng 3 quyền và có log |
| TC-11 | AC-14 | Ở tầng service, cho chủ thể quản trị được ủy quyền thử khóa, đổi role và ngừng hoạt động admin cuối của A. Khôi phục fixture giữa các lượt | Mỗi lần nhận 409 vì phải còn admin hoạt động. Số admin A vẫn là 1. Admin B không được thao tác A |
| TC-12 | AC-14 | Khi A còn hai admin, gửi đồng thời hai thao tác hợp lệ có thể làm mất cả hai quyền admin | Sau commit A vẫn còn ít nhất một admin hoạt động. Lệnh làm mất admin cuối bị chặn |

Chạy bộ thử OTP hết hạn, replay, giới hạn thử ở realm trong N03. Đối chiếu tên sự kiện ActivityLog của B03 với bản ghi append-only P02 trong cùng thay đổi nghiệp vụ. PO/SA chốt ánh xạ quyền và action trước khi ký IAM. [Phiếu SA-02](../../architecture/rms-v0-sa-review.md) · [Lát khóa tài khoản](../../../specs/001-shared-lock-account/quickstart.md)
