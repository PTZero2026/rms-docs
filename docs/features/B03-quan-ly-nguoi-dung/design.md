---
title: "Quản lý người dùng — Thiết kế kỹ thuật"
spec: "./spec.md"
owner: "BE DEV"
status: Draft        # Draft | Review | Approved
updated: 2026-06-11
---

# Quản lý người dùng — Thiết kế kỹ thuật

> **Cách HIỆN THỰC** các luật & tiêu chí ở [`spec.md`](./spec.md). DEV sở hữu và maintain file này.
> PO/BA chỉ cần soát **§1 Bảng truy vết** để chắc mọi `BR-xx`/`AC-xx` đều có lời giải kỹ thuật.
> DRY: không chép lại schema — trỏ tới [`../../architecture/data-model.md §4.1`](../../architecture/data-model.md).
>
> Nền tảng: **Keycloak = xác thực (authN)** · **RMS = phân quyền (authZ)**
> ([ADR-0008](../../architecture/decisions/0008-keycloak-idp-dang-nhap-email-otp.md),
> [ADR-0005](../../architecture/decisions/0005-sso-va-rbac.md)).

## 0. Ánh xạ nghiệp vụ ↔ kỹ thuật

**Trạng thái tài khoản** (`User.status`):

| Nhãn nghiệp vụ (spec.md) | Enum kỹ thuật |
|--------------------------|---------------|
| Đang hoạt động           | `ACTIVE`      |
| Tạm khóa                 | `LOCKED`      |
| Ngừng hoạt động          | `INACTIVE`    |

**Nguồn tạo tài khoản** (`User.accountSource`): admin tạo = `ADMIN` · tự tạo = `AUTO`.

**Vai trò chuẩn** (`Role.code`, `isSystem = true`):

| Vai trò (spec.md) | `Role.code` | Mặt dùng |
|-------------------|-------------|----------|
| Người dùng cơ bản (vai trò thấp nhất) | `USER` | FE |
| Chủ nhiệm đề tài | `PRINCIPAL_INVESTIGATOR` | FE |
| Thành viên đề tài | `PROJECT_MEMBER` | FE |
| Chuyên viên QL KHCN | `RESEARCH_MANAGEMENT_OFFICER` | BO |
| Thành viên hội đồng | `COMMITTEE_MEMBER` | BO |
| Quản trị hệ thống | `SYSTEM_ADMIN` | BO |

## 1. Bảng truy vết (nghiệp vụ → hiện thực)

| Luật / AC | Hiện thực kỹ thuật | Tham chiếu |
|-----------|--------------------|------------|
| BR-01 | `User` khóa 1-1 theo `keycloakId` (= `sub` của Keycloak); `email` `UNIQUE`, so sánh `lower()`. | data-model §4.1, ADR-0008 |
| BR-02 | So sánh `target.id == session.userId` → chặn `LOCK`/`INACTIVE` chính mình. | §3 |
| BR-03 | `Role.isSystem = true` → chặn `DELETE`, chặn đổi `code`; chỉ cho sửa `description` + `Role_Permission`. | §2 |
| BR-04 | FK `createdBy`/`principalInvestigatorId`/`actorId`… `ON DELETE RESTRICT`; thay xóa bằng `status = INACTIVE`. | §2, data-model §5 |
| BR-05 | Tập quyền hiệu lực = `UNION` quyền của các `Role` qua `User_Role`; lọc `User.status = ACTIVE`. | §2, §3 |
| BR-06 | Gỡ `User_Role` chỉ xóa dòng nối; không đụng bản ghi nghiệp vụ; ghi `AuditLog(REMOVE_ROLE)`. | §2 |
| BR-07 | `Permission.code` dạng `MODULE.ACTION`, `UNIQUE`. | §2 |
| BR-08 | Mọi API qua guard kiểm permission + data scoping ở backend; FE chỉ ẩn/hiện. | §3, ADR-0005 |
| BR-09 | `email`/`keycloakId` chỉ đồng bộ từ Keycloak; BO không cho sửa `email`. | §3, ADR-0008 |
| BR-10 | Auto-provision: tạo `User(status=ACTIVE)` + `User_Role(USER)`; không cờ bật/tắt. | §3 |
| BR-11 | Tham số OTP ở `SystemSetting` (B01); throttling theo email/IP ở tầng Keycloak/gateway. | §2, §4 |
| AC-01 | `POST /users` → `accountSource=ADMIN`, `status=ACTIVE`; `AuditLog(CREATE_USER)`. | §3, §4 |
| AC-02 | Đăng nhập OTP lần đầu → auto-provision (BR-10); `AuditLog(AUTO_PROVISION_USER)`. | §3 |
| AC-03 | Vi phạm `UNIQUE(lower(email))` → lỗi nghiệp vụ trùng email. | §2 |
| AC-04 | Guard BR-02. | §3 |
| AC-05 | Guard BR-03. | §2 |
| AC-06/12 | Gán `User_Role`; tập quyền = union (BR-05); `AuditLog(ASSIGN_ROLE)`. | §3 |
| AC-07 | `DELETE User_Role` đơn lẻ; bản ghi nghiệp vụ giữ nguyên `createdBy`/`principalInvestigatorId`. | §2 |
| AC-08 | FK `RESTRICT` chặn hard-delete → chỉ `INACTIVE`. | §2 |
| AC-09 | Tài khoản verify OTP OK nhưng `status ≠ ACTIVE` → authZ từ chối; `AuditLog(DENY_LOGIN)`. | §3 |
| AC-10 | Guard permission ở backend trả 403 dù FE ẩn nút. | §3 |
| AC-11 | Quá `iam.otp_max_attempts` → throttle theo email/IP, không phát JWT. | §4 |

## 2. Mô hình dữ liệu

Tham chiếu [`data-model.md §4.1`](../../architecture/data-model.md) (Người dùng & phân quyền). B03 **không**
định nghĩa lại thực thể; chỉ liệt kê trường dùng và ràng buộc đặc thù.

| Thực thể | Trường dùng | Ghi chú B03 |
|----------|-------------|-------------|
| `User` | `id`, `keycloakId` (= `sub`, `UNIQUE`), `userCode`, `fullName`, `email` (`UNIQUE`, case-insensitive), `phoneNumber`, `unitId`, `academicTitle`, `accountSource` (`AUTO`\|`ADMIN`), `status` (`ACTIVE`\|`LOCKED`\|`INACTIVE`) | Khóa theo `keycloakId` (BR-01); `accountSource` chỉ ghi **nguồn tạo**, không còn lối đăng nhập mật khẩu; `status` theo `spec.md §3.3` |
| `Role` | `id`, `code` (`UNIQUE`), `name`, `description`, `isSystem` (bool) | 6 vai trò chuẩn `isSystem = true` (§0) |
| `Permission` | `id`, `code` (`UNIQUE`, `MODULE.ACTION`), `description` | Quyền nguyên tử (BR-07) |
| `User_Role` | (`userId`, `roleId`) `UNIQUE` | Bảng nối nhiều–nhiều (BR-05) |
| `Role_Permission` | (`roleId`, `permissionId`) `UNIQUE` | Bảng nối nhiều–nhiều |
| `Unit` | `id`, `name` (tham chiếu) | Quản ở B01; B03 chỉ gán `unitId` |
| `AuditLog` | `actorId`, `action`, `targetType`, `targetId`, `oldValue`, `newValue`, `occurredAt`, `ipAddress` | Ghi mọi thay đổi tài khoản/vai trò/quyền |

**Cần bổ sung vào data-model** (cùng PR khi triển khai):
- `User.keycloakId` (`UNIQUE`); vai trò hệ thống `USER`.
- Tham số OTP ở `SystemSetting` (B01): `iam.otp_ttl_seconds`, `iam.otp_max_attempts`, `iam.otp_throttle_window`.
- Bỏ cờ `iam.jit_provisioning_enabled` — ADR-0008 auto-provision **luôn bật**.

## 3. Ràng buộc & bất biến kỹ thuật

- **authN/authZ tách bạch:** Keycloak phát JWT (`sub`, `email`) sau khi verify email-OTP; RMS **không** tự
  xác thực mật khẩu. Mọi tài khoản đều Keycloak-backed.
- **Auto-provision (BR-10):** khi JWT hợp lệ mà chưa có `User` khớp `keycloakId` → tạo `User(status=ACTIVE,
  accountSource=AUTO)` + `User_Role(USER)`, ghi `AuditLog(AUTO_PROVISION_USER)`. Luôn bật.
- **Tập quyền hiệu lực (BR-05):** tính ở backend = union các `Permission` của các `Role` đang gán cho
  `User`, chỉ khi `User.status = ACTIVE`. Cache theo phiên, vô hiệu khi gán/gỡ vai trò.
- **Guard quyền (BR-08):** mọi endpoint qua middleware kiểm `Permission` + **data scoping** (lọc theo
  đơn vị/phạm vi vai trò). FE ẩn/hiện theo quyền nhưng không thay backend quyết định → AC-10.
- **authZ chặn đăng nhập tài khoản không ACTIVE (AC-09):** verify OTP thành công vẫn bị từ chối nếu
  `status ∈ {LOCKED, INACTIVE}`; ghi `AuditLog(DENY_LOGIN)`.
- **Email bất biến phía RMS (BR-09):** chỉ đồng bộ từ Keycloak; không expose API sửa `email`.

## 4. API / hợp đồng (nếu có)

Đề xuất endpoint (chốt khi định nghĩa `packages/api-contracts`):

| Thao tác | Gợi ý endpoint | Quyền |
|----------|----------------|-------|
| Tạo tài khoản | `POST /users` | `USER.CREATE` |
| Sửa thông tin | `PATCH /users/{id}` | `USER.EDIT` |
| Khóa/mở khóa/ngừng | `POST /users/{id}:lock` / `:unlock` / `:deactivate` | `USER.LOCK` |
| Gán/gỡ vai trò | `PUT /users/{id}/roles` | `USER.ASSIGN_ROLE` |
| CRUD vai trò | `…/roles` | `ROLE.*` |
| Gán quyền cho vai trò | `PUT /roles/{id}/permissions` | `ROLE.EDIT` |

Tham số OTP (`SystemSetting`): `iam.otp_ttl_seconds`, `iam.otp_max_attempts`, `iam.otp_throttle_window` —
throttling enforce ở tầng Keycloak/gateway (BR-11).

## 5. Điểm kỹ thuật cần chốt

- **Đồng bộ Keycloak → RMS:** webhook hay đồng bộ khi đăng nhập? (ảnh hưởng độ trễ cập nhật email/đơn vị).
- **Cache tập quyền:** TTL & cơ chế vô hiệu khi đổi `Role_Permission` đang được nhiều phiên dùng.
- **Throttling user-enumeration:** thông điệp lỗi đồng nhất (không tiết lộ email có tồn tại hay không).
- **Allowlist tên miền email** cho auto-provision (gắn với điểm nghiệp vụ cần chốt ở `spec.md §7`).
