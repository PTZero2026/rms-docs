---
title: "Quản lý người dùng — Giao diện (một web app, phân quyền)"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
version: 0.2
updated: 2026-06-11
---

# Quản lý người dùng — Giao diện

> Một web app duy nhất; màn hình & hành động hiển thị **theo phân quyền (RBAC)** — xem
> [ADR-0009](../../architecture/decisions/0009-hop-nhat-mot-web-phan-quyen.md). Chỉ mô tả phần
> **đặc thù giao diện**. Luật nghiệp vụ → xem `./spec.md`.

## 1. Vai trò sử dụng

| Vai trò | Mức dùng |
|---------|----------|
| **Quản trị hệ thống** (`SYSTEM_ADMIN`) | Toàn quyền: quản lý tài khoản, vai trò, quyền, gán/gỡ. |
| **Chuyên viên QL KHCN** (`RESEARCH_MANAGEMENT_OFFICER`) | Chỉ **xem** danh sách & chi tiết người dùng/đơn vị để phối hợp; không sửa, không gán quyền. |

Các vai trò khác (chủ nhiệm, thành viên đề tài) và thành viên hội đồng **không** truy cập feature này.

## 2. Phân quyền (Permission matrix)

Cột là vai trò liên quan thực tế. Quyền nguyên tử (`MODULE.ACTION`) ghi trong ngoặc để khớp `spec.md` §5.

| Hành động | Quyền | Quản trị hệ thống | Chuyên viên QL KHCN |
|-----------|-------|:-----------------:|:-------------------:|
| Xem danh sách & chi tiết người dùng | `USER.VIEW` | ✓ | ✓ |
| Tạo tài khoản (admin) | `USER.CREATE` | ✓ | – |
| Sửa thông tin tài khoản | `USER.UPDATE` | ✓ | – |
| Khóa / mở khóa tài khoản | `USER.LOCK` | ✓ | – |
| Vô hiệu / kích hoạt lại tài khoản | `USER.DISABLE` | ✓ | – |
| Gán / gỡ vai trò cho người dùng | `USER.ASSIGN_ROLE` | ✓ | – |
| Xem danh sách vai trò & quyền | `ROLE.VIEW` | ✓ | ✓ |
| Tạo / sửa vai trò | `ROLE.MANAGE` | ✓ | – |
| Xóa vai trò (không phải hệ thống) | `ROLE.DELETE` | ✓ | – |
| Cấu hình quyền cho vai trò | `ROLE.ASSIGN_PERMISSION` | ✓ | – |
| Quản lý danh mục quyền nguyên tử | `PERMISSION.MANAGE` | ✓ | – |
| Xem nhật ký người dùng/quyền | `AUDIT_LOG.VIEW` | ✓ | ✓ |

> Backend là lớp thực thi quyền duy nhất (BR-08). Web app/UI chỉ ẩn/hiện theo quyền; gọi API thiếu quyền trả 403.

## 3. Danh sách màn hình

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| BO-01 | Danh sách người dùng | Tra cứu, lọc, phân trang danh sách `User`; vào chi tiết. |
| BO-02 | Tạo / sửa người dùng | Admin tạo tài khoản, sửa thông tin; xem cả tài khoản tự sinh (auto-provision). |
| BO-03 | Chi tiết người dùng & vai trò | Xem hồ sơ, khóa/mở/vô hiệu, gán/gỡ vai trò. |
| BO-04 | Danh sách & cấu hình vai trò | CRUD `Role`; cấu hình tập `Permission` cho mỗi vai trò. |
| BO-05 | Danh mục quyền | Quản lý `Permission` nguyên tử (`MODULE.ACTION`). |
| BO-06 | Nhật ký người dùng & phân quyền | Tra cứu `AuditLog` liên quan tài khoản/vai trò/quyền. |

## 4. Mô tả màn hình & thao tác

### BO-01 — Danh sách người dùng
- **Bộ lọc:** từ khóa (họ tên / email / mã), đơn vị (`unitId`), vai trò, `accountSource` (AUTO / ADMIN),
  `status` (ACTIVE / LOCKED / INACTIVE).
- **Bảng:** Họ tên · Email · Đơn vị · Vai trò (chip nhiều) · Nguồn · Trạng thái (badge màu) · Hành động.
- **Phân trang server-side** (NFR < 2s). Hành động hàng: Xem chi tiết. Nút: "Tạo người dùng" (cần `USER.CREATE`).

### BO-02 — Tạo / sửa người dùng
- **Trường:** `fullName`*, `email`*, `userCode`, `phoneNumber`, `unitId`*, `academicTitle`.
- Tạo mới: `accountSource = ADMIN`, `status = ACTIVE`; admin nhập email → tạo user Keycloak tương ứng. Kiểm tra trùng email/`keycloakId` (không phân biệt hoa/thường, BR-01) trước khi lưu.
- Sau khi tạo, `email` do Keycloak quản → **chỉ đọc** tại RMS (BR-09); tài khoản tự sinh (`AUTO`) luôn chỉ đọc email. Cảnh báo "Email đồng bộ từ Keycloak".
- Lưu thành công → ghi `AuditLog` `CREATE_USER` hoặc `UPDATE_USER`.

### BO-03 — Chi tiết người dùng & vai trò
- **Hồ sơ:** thông tin cơ bản + `accountSource`, `status`.
- **Hành động trạng thái:** Khóa / Mở khóa (`USER.LOCK`), Vô hiệu / Kích hoạt lại (`USER.DISABLE`)
  theo state machine spec §3.3. Nút Khóa/Vô hiệu **bị vô hiệu hóa** nếu là tài khoản đang đăng nhập (BR-02).
  Không hiển thị nút "Xóa cứng" nếu tài khoản đã phát sinh dữ liệu (BR-04) — thay bằng "Vô hiệu".
- **Vai trò:** danh sách vai trò đang gán; thêm/gỡ vai trò (multi-select, BR-05/BR-06) — đây là luồng **nâng/hạ
  quyền** (spec §3.5): tài khoản tự sinh (`AUTO`) mặc định chỉ có `USER`, admin nâng bằng cách gán vai trò nghiệp
  vụ. Gỡ vai trò hiện cảnh báo "Gỡ vai trò không xóa dữ liệu người dùng đã tạo".
- Mỗi thao tác ghi audit tương ứng (xem §5).

### BO-04 — Danh sách & cấu hình vai trò
- Bảng `Role`: Mã · Tên · Mô tả · Hệ thống (`isSystem`) · Số người gán.
- Vai trò có `isSystem = true`: ẩn/disable nút Xóa và khóa trường `code` (BR-03); chỉ sửa `description` + tập quyền.
- **Cấu hình quyền:** panel tick các `Permission` (nhóm theo `MODULE`) thuộc vai trò → cập nhật `Role_Permission`.
  Lưu → audit `CONFIGURE_ROLE_PERMISSIONS`.

### BO-05 — Danh mục quyền
- CRUD `Permission`; validate `code` đúng dạng `MODULE.ACTION`, unique (BR-07). Cảnh báo khi gỡ quyền đang được vai trò dùng.

### BO-06 — Nhật ký người dùng & phân quyền
- Tra cứu `AuditLog` lọc theo người thực hiện, `targetType` (USER / ROLE / PERMISSION), khoảng thời gian.
- Hiển thị `oldValue` → `newValue`, `ipAddress`, `occurredAt`. **Chỉ đọc** (append-only). Cả hai vai trò xem được (`AUDIT_LOG.VIEW`).

## 5. Audit & nhật ký

Mọi hành động dưới đây ghi `AuditLog` (append-only, không sửa/xóa) với `actorId`, `targetType`,
`targetId`, `oldValue`/`newValue`, `occurredAt`, `ipAddress`:

| Hành động | `action` | `targetType` |
|-----------|-----------|----------------|
| Admin tạo tài khoản | `CREATE_USER` | USER |
| Auto-provision (đăng nhập email-OTP lần đầu) | `AUTO_PROVISION_USER` | USER |
| Sửa thông tin tài khoản | `UPDATE_USER` | USER |
| Khóa / mở khóa | `LOCK_USER` / `UNLOCK_USER` | USER |
| Vô hiệu / kích hoạt lại | `DISABLE_USER` / `ENABLE_USER` | USER |
| Gán / gỡ vai trò | `ASSIGN_ROLE` / `REMOVE_ROLE` | USER |
| Tạo / sửa / xóa vai trò | `CREATE_ROLE` / `UPDATE_ROLE` / `DELETE_ROLE` | ROLE |
| Cấu hình quyền cho vai trò | `CONFIGURE_ROLE_PERMISSIONS` | ROLE |
| Tạo / sửa / xóa quyền | `CREATE_PERMISSION` / `UPDATE_PERMISSION` / `DELETE_PERMISSION` | PERMISSION |
| Từ chối đăng nhập (tài khoản LOCKED/INACTIVE) | `DENY_LOGIN` | USER |

Ai xem được: Quản trị hệ thống và Chuyên viên QL KHCN (quyền `AUDIT_LOG.VIEW`), qua BO-06.

## 6. Liên kết AC

| Màn hình | AC liên quan (spec.md §6) |
|----------|---------------------------|
| BO-02 (Tạo/sửa) | AC-01, AC-03 (trùng email & email chỉ đọc) |
| Luồng đăng nhập email-OTP / auto-provision (§3.2, không có MH BO) | AC-02, AC-09, AC-11 |
| BO-03 (Chi tiết & vai trò, nâng/hạ quyền §3.5) | AC-04, AC-06, AC-07, AC-08, AC-10, AC-12 |
| BO-04 (Vai trò) | AC-05, AC-06 |
| BO-05 (Quyền) | AC-05 (nền), BR-07 |
| BO-06 (Nhật ký) | AC-01, AC-02, AC-06, AC-07, AC-09 (truy vết audit) |
