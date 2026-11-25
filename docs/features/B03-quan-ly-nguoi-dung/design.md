---
title: "Thiết kế IAM"
owner: "SA / BE"
status: Review
updated: 2026-11-24
---

# Quản lý tài khoản và quyền

| Luật và tiêu chí | Cách hiện thực trong iam |
|---|---|
| BR-01, BR-09, BR-10, BR-11 · AC-01, AC-02, AC-03 | Xác minh issuer, audience và subject. Upsert trong tenant theo issuer + sub, email đã chuẩn hóa duy nhất trong tenant. Lần đầu gán user, OTP và thay email thuộc IdP. Đồng bộ hồ sơ tại đăng nhập. |
| BR-02, BR-04, BR-12 · AC-04, AC-07, AC-14 | Khóa dòng điều phối của tenant trước kiểm admin cuối và cập nhật, kể cả khi hai admin thao tác đồng thời. Ngừng tài khoản đặt isActive=false và deletedAt. Giữ liên kết lịch sử. |
| BR-05, BR-07, BR-08 · AC-08, AC-09, AC-11, AC-12 | Mỗi request kiểm isActive, deletedAt, một userType và phạm vi đối tượng. Đọc ROLE_PERMISSIONS theo B03 §5. Thay vai trò, khóa và mở khóa ghi P02 cùng giao dịch. Tên sự kiện ActivityLog ở B03 là action của bản ghi audit. |
| BR-13 · AC-13 | Khóa yêu cầu nâng cấp đang PENDING và user trong cùng giao dịch. Admin duyệt thì ghi APPROVED và đổi userType thành author. Từ chối cần lý do, giữ userType hiện tại. |

## Tài khoản và phân công

Một user có một trong bốn userType của RMS. Chức trách chủ nhiệm, thành viên hội đồng và phụ trách khoa là quan hệ với hồ sơ, hội đồng hoặc đơn vị. Module sở hữu kiểm cả quyền chức năng và quan hệ hiện hành. Tại B01, admin đang hoạt động được ghi trong tenant của mình. Ghi shared cần cấp quyền vận hành riêng ở IAM theo SA-02.

Tài khoản đang hoạt động có isActive=true và deletedAt rỗng. Tạm khóa có isActive=false và deletedAt rỗng. Ngừng hoạt động có deletedAt và isActive=false. Lệnh lặp trả trạng thái cuối, mỗi lần thực sự chuyển trạng thái ghi một audit. Quyền custom trong v0 chỉ được ghi nhận vào nhật ký.

BE định nghĩa operation và lỗi của các luồng §3 trong packages/api-contracts/iam, FE sinh client từ cùng nguồn. Dùng hai realm và một token còn hạn sau khi khóa để kiểm yêu cầu nghiệp vụ kế tiếp.

[Đặc tả B03](spec.md) · [Ca kiểm](test-plan.md) · [Thiết kế trước v0.4](ref/design.md)
