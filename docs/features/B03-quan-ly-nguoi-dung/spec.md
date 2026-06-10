---
title: "Quản lý người dùng"
id: "B03"
owner: "PO/BA"
status: Draft        # Draft | Review | Approved
version: 0.1
updated: 2026-06-01
---

# Quản lý người dùng

> Nguồn sự thật về **nghiệp vụ** của feature. Mọi luật, dữ liệu, tiêu chí nghiệm thu
> nằm ở đây. `ui.md` mô tả giao diện và trỏ ngược về file này.

## 1. Bối cảnh & mục tiêu

RMS phục vụ nhiều nhóm người dùng với quyền hạn khác nhau (chủ nhiệm, thành viên, chuyên viên
QL KHCN, thành viên hội đồng, quản trị hệ thống). Để mọi feature nghiệp vụ (F01–F08, B01–B04)
kiểm soát truy cập đúng và truy vết được "ai làm gì", hệ thống cần một nơi quản lý tập trung
**tài khoản người dùng**, **vai trò** và **quyền**. Đây là feature nền tảng (module `iam`):
xác thực dựa trên SSO nội bộ, còn phân quyền theo mô hình RBAC do RMS tự quản
(xem [ADR-0005](../../architecture/decisions/0005-sso-va-rbac.md)).

Người dùng feature này: chủ yếu **Quản trị hệ thống**; **Chuyên viên QL KHCN** chỉ được xem
(tra cứu danh sách người dùng/đơn vị để phối hợp công việc).

Kết quả mong đợi:

- Mọi người dùng RMS có đúng một tài khoản `User` định danh bằng email khớp SSO; tài khoản
  được tạo nội bộ hoặc tự sinh khi đăng nhập SSO lần đầu (just-in-time).
- Quản trị viên gán/gỡ vai trò và quyền cho người dùng mà không làm mất dữ liệu lịch sử họ đã tạo.
- Mọi thay đổi tài khoản, vai trò, quyền được ghi `AuditLog` để truy vết.

## 2. Phạm vi

- **Trong phạm vi:**
  - Quản lý tài khoản `User`: tạo nội bộ (`accountSource = INTERNAL`), tự sinh từ SSO
    (`accountSource = SSO`, just-in-time), sửa thông tin, khóa (`LOCKED`) / mở khóa, vô hiệu (`INACTIVE`).
  - Quản lý vai trò chuẩn `Role` (CRUD; vai trò hệ thống `isSystem = true` không cho xóa).
  - Quản lý quyền nguyên tử `Permission` dạng `MODULE.ACTION`.
  - Gán/gỡ `Permission` ↔ `Role` và `Role` ↔ `User` (một người có thể có nhiều vai trò).
  - Định nghĩa **phạm vi dữ liệu (data scoping)** theo vai trò ở mức nguyên tắc.
- **Ngoài phạm vi:**
  - Cơ chế đăng nhập/đăng xuất, cấp & làm mới token SSO — thuộc hạ tầng xác thực
    (xem `../../architecture/integrations.md` §2 và `overview.md` §4.1).
  - Quản lý mẫu/nội dung thông báo gửi tới người dùng — thuộc B04.
  - Lý lịch khoa học (khung nhìn tổng hợp trên `User`) — thuộc F08.
  - Quản lý cây đơn vị `Unit` (chỉ tham chiếu) — thuộc B01.
  - Xóa cứng tài khoản đã phát sinh dữ liệu nghiệp vụ.

## 3. Luồng nghiệp vụ chính

### 3.1 Tạo & cấp quyền tài khoản nội bộ

```mermaid
flowchart TD
    A[Quản trị mở màn hình Người dùng] --> B[Nhập fullName, email, donVi]
    B --> C{Email đã tồn tại?}
    C -->|Có| C1[Báo lỗi trùng email - dừng]
    C -->|Không| D[Tạo User accountSource=INTERNAL, status=ACTIVE]
    D --> E[Gán một hoặc nhiều Role]
    E --> F[Ghi AuditLog: CREATE_USER, ASSIGN_ROLE]
    F --> G[Tài khoản sẵn sàng đăng nhập]
```

### 3.2 Đăng nhập SSO lần đầu (just-in-time provisioning)

```mermaid
flowchart TD
    A[Người dùng đăng nhập qua SSO] --> B[Backend nhận claim email]
    B --> C{Có User khớp email?}
    C -->|Có & ACTIVE| H[Cho vào theo vai trò hiện có]
    C -->|Có & LOCKED/INACTIVE| L[Từ chối truy cập - ghi nhật ký]
    C -->|Không| D{Chính sách JIT bật?}
    D -->|Không| E[Từ chối - yêu cầu admin tạo trước]
    D -->|Có| F[Tạo User accountSource=SSO, ACTIVE, chưa có vai trò nghiệp vụ]
    F --> G[Ghi AuditLog: CREATE_USER_JIT]
    G --> H
```

### 3.3 Khóa / mở khóa / vô hiệu tài khoản

```mermaid
stateDiagram-v2
    [*] --> ACTIVE : Tạo / JIT
    ACTIVE --> LOCKED : Khóa tạm (vi phạm, nghỉ phép)
    LOCKED --> ACTIVE : Mở khóa
    ACTIVE --> INACTIVE : Vô hiệu (nghỉ việc, chuyển công tác)
    LOCKED --> INACTIVE : Vô hiệu
    INACTIVE --> ACTIVE : Kích hoạt lại (admin)
    note right of INACTIVE
        Không xóa cứng nếu đã phát sinh dữ liệu.
        Tài khoản INACTIVE/LOCKED không đăng nhập được.
    end note
```

### 3.4 Gán/gỡ vai trò & cấu hình quyền cho vai trò

```mermaid
flowchart LR
    Q[Permission MODULE.ACTION] -->|Role_Permission| V[Role]
    V -->|User_Role| N[User]
    N --> S[Backend tổng hợp tập quyền hiệu lực]
    S --> P[Kiểm tra quyền ở mọi API + data scoping]
```

Quản trị chọn một `Role`, tick các `Permission` thuộc vai trò đó; chọn một `User`, gán/gỡ các
`Role`. Backend tổng hợp **tập quyền hiệu lực** = hợp của quyền từ mọi vai trò đang gán cho
người dùng (chỉ tính tài khoản `ACTIVE`).

## 4. Business rules

| ID | Quy tắc | Mô tả | Ghi chú |
|----|---------|-------|---------|
| BR-01 | Email là định danh duy nhất khớp SSO | `User.email` là `unique`, không phân biệt hoa/thường; dùng để ánh xạ claim `email` từ SSO. Không cho tạo/sửa trùng email đã tồn tại. | Khóa ghép SSO ↔ RMS, xem ADR-0005 |
| BR-02 | Không tự khóa/vô hiệu chính mình | Quản trị viên đang đăng nhập không được khóa (`LOCKED`) hay vô hiệu (`INACTIVE`) chính tài khoản của mình, tránh tự khóa hệ thống. | So sánh theo `id` phiên đăng nhập |
| BR-03 | Vai trò hệ thống không xóa | `Role` có `isSystem = true` (5 vai trò chuẩn) không được xóa và không đổi `code`; chỉ được sửa `description` và tập quyền. | Tránh hỏng phân quyền nền |
| BR-04 | Không xóa cứng tài khoản đã phát sinh dữ liệu | Tài khoản đã là `createdBy`/`principalInvestigatorId`/`actorId`… của bất kỳ bản ghi nào chỉ được chuyển `INACTIVE`, không xóa cứng, để giữ toàn vẹn tham chiếu lịch sử. | Phù hợp `ON DELETE RESTRICT` (data-model §5) |
| BR-05 | Một người nhiều vai trò; quyền là hợp | Một `User` có thể được gán nhiều `Role`; tập quyền hiệu lực là **hợp** các quyền của các vai trò đó. Chỉ tài khoản `ACTIVE` mới có quyền hiệu lực. | `User_Role` nhiều-nhiều |
| BR-06 | Gỡ vai trò không xóa dữ liệu lịch sử | Khi gỡ một `Role` khỏi người dùng, các bản ghi người đó đã tạo/tham gia trước đó **không** bị xóa hay đổi tác giả; chỉ ngừng cấp quyền từ thời điểm gỡ. | Audit ghi `REMOVE_ROLE` |
| BR-07 | Quyền theo định dạng `MODULE.ACTION` | `Permission.code` phải đúng dạng `MODULE.ACTION` (vd `RESEARCH_PROJECT.APPROVE`, `USER.LOCK`), unique. Không cho tạo quyền trùng mã. | Chuẩn hóa kiểm tra quyền backend |
| BR-08 | Backend là lớp thực thi quyền duy nhất | Mọi API kiểm tra quyền tại backend; BO chỉ ẩn/hiện theo quyền, không thay backend quyết định. Phạm vi dữ liệu (data scoping) áp dụng cùng tầng. | ADR-0005 §Hệ quả |
| BR-09 | Tài khoản SSO không sửa email tại RMS | Với `accountSource = SSO`, `email` là dữ liệu được đồng bộ từ SSO, không cho sửa tại BO; chỉ tài khoản `INTERNAL` mới sửa được email. | Tránh lệch ánh xạ danh tính |

## 5. Dữ liệu

Tham chiếu `../../architecture/data-model.md` §4.1 (Người dùng & phân quyền). B03 **không** định nghĩa
lại thực thể; chỉ liệt kê thực thể/trường dùng và ràng buộc đặc thù.

| Thực thể | Trường dùng | Ghi chú B03 |
|----------|-------------|-------------|
| `User` | `id`, `userCode`, `fullName`, `email`, `phoneNumber`, `unitId`, `academicTitle`, `accountSource` (`SSO`\|`INTERNAL`), `status` (`ACTIVE`\|`LOCKED`\|`INACTIVE`) | `email` unique không phân biệt hoa/thường (BR-01); `status` theo state machine §3.3 |
| `Role` | `id`, `code` (unique), `name`, `description`, `isSystem` (bool) | 5 vai trò chuẩn có `isSystem = true` (xem §Vai trò chuẩn) |
| `Permission` | `id`, `code` (unique, `MODULE.ACTION`), `description` | Quyền nguyên tử (BR-07) |
| `User_Role` | (`userId`, `roleId`) unique | Bảng nối nhiều-nhiều (BR-05) |
| `Role_Permission` | (`roleId`, `permissionId`) unique | Bảng nối nhiều-nhiều |
| `Unit` | `id`, `name` (tham chiếu) | Quản lý ở B01; B03 chỉ gán `unitId` |
| `AuditLog` | `actorId`, `action`, `targetType`, `targetId`, `oldValue`, `newValue`, `occurredAt`, `ipAddress` | Ghi mọi thay đổi tài khoản/vai trò/quyền (§Audit ở ui.md) |

### Vai trò chuẩn (khớp `personas.md`)

| `code` | `name` | `isSystem` | Mặt dùng chính |
|------|-------|:-----------:|----------------|
| `PRINCIPAL_INVESTIGATOR` | Chủ nhiệm đề tài | ✓ | FE |
| `PROJECT_MEMBER` | Thành viên đề tài | ✓ | FE |
| `RESEARCH_MANAGEMENT_OFFICER` | Chuyên viên QL KHCN | ✓ | BO |
| `COMMITTEE_MEMBER` | Thành viên hội đồng | ✓ | BO |
| `SYSTEM_ADMIN` | Quản trị hệ thống | ✓ | BO |

> **Đề xuất bổ sung** (chưa có trong data-model, cần thêm trong cùng PR khi triển khai):
> cờ chính sách JIT provisioning nên đặt ở `SystemSetting` (B01) với khóa
> `iam.jit_provisioning_enabled` (kiểu bool) thay vì hardcode — dùng cho luồng §3.2.

## 6. Acceptance criteria

- **AC-01** (Happy — tạo nội bộ) — *Given* quản trị viên đã đăng nhập với quyền `USER.CREATE`,
  *When* tạo `User` với email chưa tồn tại và gán vai trò `RESEARCH_MANAGEMENT_OFFICER`,
  *Then* tài khoản được tạo với `accountSource = INTERNAL`, `status = ACTIVE`, có vai trò đã gán,
  và `AuditLog` ghi `CREATE_USER` + `ASSIGN_ROLE`.
- **AC-02** (Happy — JIT từ SSO) — *Given* chính sách JIT bật và email đăng nhập SSO chưa có tài khoản,
  *When* người dùng đăng nhập SSO lần đầu, *Then* hệ thống tạo `User` với `accountSource = SSO`,
  `status = ACTIVE`, chưa có vai trò nghiệp vụ, và ghi `AuditLog` `CREATE_USER_JIT`.
- **AC-03** (Biên — trùng email) — *Given* đã có `User` với email `a@benhvien.vn`,
  *When* quản trị tạo/sửa một tài khoản khác dùng email `A@benhvien.vn` (khác hoa/thường),
  *Then* hệ thống từ chối với lỗi trùng email và không tạo/sửa bản ghi (BR-01).
- **AC-04** (Lỗi/quyền — tự khóa) — *Given* quản trị viên X đang đăng nhập,
  *When* X cố khóa hoặc vô hiệu chính tài khoản của X, *Then* hệ thống từ chối với thông báo
  "Không thể khóa/vô hiệu tài khoản đang đăng nhập" và giữ nguyên `status` (BR-02).
- **AC-05** (Lỗi — xóa vai trò hệ thống) — *Given* vai trò `SYSTEM_ADMIN` có `isSystem = true`,
  *When* quản trị cố xóa vai trò này, *Then* hệ thống từ chối với lỗi "Không xóa được vai trò hệ thống"
  và vai trò vẫn tồn tại (BR-03).
- **AC-06** (Happy — gán nhiều vai trò, quyền là hợp) — *Given* người dùng U đang `ACTIVE`,
  *When* quản trị gán cho U cả `PRINCIPAL_INVESTIGATOR` và `COMMITTEE_MEMBER`,
  *Then* tập quyền hiệu lực của U là hợp các quyền của hai vai trò, và `AuditLog` ghi `ASSIGN_ROLE` (BR-05).
- **AC-07** (Biên — gỡ vai trò giữ dữ liệu) — *Given* người dùng U từng tạo các đề tài và có vai trò
  `PRINCIPAL_INVESTIGATOR`, *When* quản trị gỡ vai trò `PRINCIPAL_INVESTIGATOR` khỏi U,
  *Then* các đề tài do U tạo vẫn tồn tại với `principalInvestigatorId`/`createdBy = U` không đổi, U mất quyền từ vai trò đó,
  và audit ghi `REMOVE_ROLE` (BR-06).
- **AC-08** (Lỗi — không xóa cứng tài khoản có dữ liệu) — *Given* tài khoản U đã là chủ nhiệm của ≥1 đề tài,
  *When* quản trị cố xóa cứng U, *Then* hệ thống từ chối xóa cứng và chỉ cho chuyển `INACTIVE` (BR-04).
- **AC-09** (Lỗi/quyền — đăng nhập tài khoản bị khóa) — *Given* tài khoản U có `status = LOCKED`,
  *When* U đăng nhập qua SSO, *Then* hệ thống từ chối truy cập và ghi `AuditLog` `DENY_LOGIN`.
- **AC-10** (Lỗi — quyền không đủ ở BO) — *Given* người dùng có vai trò `RESEARCH_MANAGEMENT_OFFICER` (chỉ xem),
  *When* gọi API tạo/sửa người dùng, *Then* backend trả 403 dù BO có ẩn nút, vì backend là lớp thực thi quyền (BR-08).

## 7. Phụ thuộc & rủi ro

**Phụ thuộc:**

- SSO nội bộ (OIDC/SAML) — `../../architecture/integrations.md` §2; quyết định nền — [ADR-0005](../../architecture/decisions/0005-sso-va-rbac.md).
- `Unit` (B01) cho trường `unitId`; `SystemSetting` (B01) cho cờ JIT (đề xuất bổ sung §5).
- `AuditLog` & module `audit` cho ghi nhật ký.
- Mọi feature F01–F08, B01–B04 phụ thuộc B03 cho danh tính và kiểm tra quyền.

**Rủi ro & điểm cần làm rõ:**

| Rủi ro | Ảnh hưởng | Giảm thiểu |
|--------|-----------|------------|
| Phân quyền sai gây lộ/lệch dữ liệu | Cao | Backend thực thi quyền duy nhất (BR-08); review ma trận quyền; data scoping |
| SSO sự cố không đăng nhập được | Cao | Tài khoản `INTERNAL` dự phòng (integrations §2), có audit riêng |
| JIT tạo tài khoản rác (email lạ vẫn vào được SSO) | Trung bình | Cờ JIT có thể tắt; tài khoản JIT chưa có vai trò nghiệp vụ cho tới khi admin gán |
| Email SSO đổi (đổi tên đăng nhập) làm lệch ánh xạ | Trung bình | Cần quy trình hợp nhất tài khoản — *điểm cần làm rõ với đội SSO* |
| Quản trị tự khóa toàn bộ admin | Cao | BR-02 chặn tự khóa; *đề xuất* cảnh báo khi còn ≤1 tài khoản `SYSTEM_ADMIN` đang `ACTIVE` |
