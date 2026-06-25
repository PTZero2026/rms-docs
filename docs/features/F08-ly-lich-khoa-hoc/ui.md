---
title: "Lý lịch khoa học — Giao diện (một web app, phân quyền)"
spec: "./spec.md"
owner: "PO/BA"
status: Review
version: 0.2
updated: 2026-06-25
---

# Lý lịch khoa học — Giao diện

> Một web app duy nhất; màn hình & hành động hiển thị **theo phân quyền (RBAC)** — xem
> [ADR-0009](../../architecture/decisions/0009-hop-nhat-mot-web-phan-quyen.md). Chỉ mô tả phần
> **đặc thù giao diện**. Luật nghiệp vụ → xem [`./spec.md`](./spec.md).

## 1. Vai trò sử dụng

| Vai trò | Mức dùng |
|---------|----------|
| **Chủ hồ sơ** — mọi người dùng đã đăng nhập (`USER` trở lên) | **Tự xem & sửa** hồ sơ của chính mình; xem & trích xuất lý lịch khoa học của mình. |
| **Chuyên viên QL KHCN** (`RESEARCH_MANAGEMENT_OFFICER`) | Xem hồ sơ & lý lịch người khác **trong phạm vi dữ liệu**; **sửa hộ**; trích xuất lý lịch. |
| **Quản trị hệ thống** (`SYSTEM_ADMIN`) | Như trên, phạm vi toàn hệ thống. |

> Định danh, vai trò/quyền, trạng thái tài khoản **không** thuộc màn hình này — xem
> [B03](../B03-quan-ly-nguoi-dung/ui.md). F08 chỉ quản **nội dung hồ sơ** + **khung nhìn lý lịch**.

## 2. Phân quyền (Permission matrix)

Quyền nguyên tử (`MODULE.ACTION`) ghi trong ngoặc; module của F08 là `PROFILE`.

| Hành động | Quyền | Chủ hồ sơ | Chuyên viên QL KHCN | Quản trị hệ thống |
|-----------|-------|:---------:|:-------------------:|:-----------------:|
| Xem hồ sơ **của mình** | `PROFILE.VIEW_OWN` | ✓ | ✓ | ✓ |
| Sửa hồ sơ **của mình** | `PROFILE.UPDATE_OWN` | ✓ | ✓ | ✓ |
| Xem hồ sơ **người khác** | `PROFILE.VIEW` | – | ✓ | ✓ |
| Sửa hộ hồ sơ **người khác** | `PROFILE.UPDATE` | – | ✓ | ✓ |
| Trích xuất lý lịch (CV) | `PROFILE.EXPORT_CV` | ✓ (của mình) | ✓ | ✓ |
| Xem nhật ký thay đổi hồ sơ | `AUDIT_LOG.VIEW` | – | ✓ | ✓ |

> Backend là lớp thực thi quyền duy nhất (BR-09). UI chỉ ẩn/hiện; gọi API ngoài phạm vi dữ liệu trả 403
> dù giao diện có ẩn nút (AC-12). `PROFILE.VIEW`/`PROFILE.UPDATE` luôn áp thêm **phạm vi dữ liệu** (VP-SCOPE).

## 3. Danh sách màn hình

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| FE-01 | Hồ sơ của tôi | Chủ hồ sơ tự xem & sửa: cơ bản, liên hệ, cơ quan, học hàm, học vị, quá trình công tác. |
| FE-02 | Lý lịch khoa học của tôi | Khung nhìn tổng hợp (read-only) + trích xuất theo mẫu. |
| BO-01 | Hồ sơ người dùng (tra cứu & sửa hộ) | Chuyên viên/Admin mở hồ sơ người khác trong phạm vi; sửa hộ. |
| BO-02 | Lý lịch khoa học người dùng | Xem lý lịch tổng hợp người khác + trích xuất. |

> Lối vào BO-01/BO-02 đi từ **Danh sách người dùng** của [B03 BO-01](../B03-quan-ly-nguoi-dung/ui.md) (tái dùng,
> không dựng danh sách trùng).

## 4. Mô tả màn hình & thao tác

### FE-01 — Hồ sơ của tôi
Bố cục theo **nhóm trường**; tập trường *hiển thị/bắt buộc* render theo cấu hình tenant (VP-PROFILE) — trường
`ẩn` không render, trường `bắt buộc` gắn dấu `*` và chặn lưu nếu trống (AC-03).

- **Thông tin cơ bản:** Họ tên* (`fullName`) · Giới tính (`gender`: Nam/Nữ/Khác) · Ngày sinh (`dateOfBirth`,
  date-picker **đầy đủ `dd/MM/yyyy`**).
- **Thông tin liên hệ:** Email (`email`) — **chỉ đọc**, badge "Đồng bộ từ hệ thống xác thực" (BR-02, AC-02);
  Số điện thoại (`phoneNumber`) · Địa chỉ (`address`; tùy chọn chọn Tỉnh/Huyện/Xã từ `ADMINISTRATIVE_DIVISION`).
- **Thông tin cơ quan công tác:** Trường/Viện — **hiển thị ngầm = tenant hiện tại, không có ô nhập** (BR-03,
  AC-04); Phòng ban (`unitId`, chọn từ cây đơn vị) · Chức vụ (`positionId`, chọn từ danh mục `POSITION`).
- **Học hàm** (`kind=RANK`): bảng nhiều dòng — Loại (chọn từ `ACADEMIC_RANK`: GS/PGS) · Năm nhận. Thêm/xóa dòng.
- **Học vị** (`kind=DEGREE`): bảng nhiều dòng — Loại (chọn từ `ACADEMIC_DEGREE`: TS/ThS/CN) · Năm nhận.
  Hai bảng **tách biệt** (AC-05). Validate năm nhận ≤ năm hiện tại, ≥ năm sinh nếu có (AC-06).
- **Quá trình công tác:** bảng nhiều dòng — Tổ chức/Đơn vị · Chức vụ · Từ ngày · Đến ngày. "Đến" trống =
  badge **"Đang công tác"** (AC-07). Validate Từ ≤ Đến (AC-08).
- **Lưu:** kiểm trường bắt buộc + ràng buộc năm/khoảng thời gian phía người dùng; backend kiểm lại. Lưu thành
  công → ghi audit `UPDATE_PROFILE` (§5). Trạng thái rỗng/đang tải/lỗi hiển thị theo từng nhóm.

### FE-02 — Lý lịch khoa học của tôi
Read-only, gom **không trùng** (BR-07):
- **Hồ sơ tóm tắt** (từ FE-01).
- **Sản phẩm khoa học:** danh sách `ResearchOutput` **đã duyệt** (F07) — tên, loại, năm, thông tin công bố.
- **Tham gia đề tài:** vai trò trong `ResearchProject`/`ProjectMember` (chủ nhiệm/thành viên/thư ký).
- **Giờ giảng quy đổi:** tổng giờ từ P03 — **chỉ hiển thị nếu tenant bật P03**; tenant tắt thì ẩn cả mục (AC-10).
- **Nút "Trích xuất lý lịch":** chọn mẫu của tổ chức (VP-CV-TPL) → xuất tài liệu để in/ký; ghi audit
  `EXPORT_CV` (AC-13).

### BO-01 — Hồ sơ người dùng (tra cứu & sửa hộ)
- Mở từ chi tiết người dùng (B03). Hiển thị hồ sơ đầy đủ **chỉ khi** có `PROFILE.VIEW` + trong phạm vi dữ
  liệu; ngoài phạm vi → 403, không render (AC-12).
- Bố cục trường như FE-01; sửa hộ cần `PROFILE.UPDATE`. Lưu → audit `UPDATE_PROFILE` với `actorId ≠ targetUserId`
  (đánh dấu *sửa hộ*, AC-11).

### BO-02 — Lý lịch khoa học người dùng
- Như FE-02 nhưng cho người dùng khác (cần `PROFILE.VIEW` + phạm vi). Trích xuất cần `PROFILE.EXPORT_CV`.

## 5. Audit & nhật ký

Mọi hành động dưới đây ghi `AuditLog` (append-only) với `actorId`, `targetType`, `targetId`,
`oldValue`/`newValue`, `occurredAt`, `ipAddress` (BR-10):

| Hành động | `action` | `targetType` | Ghi chú |
|-----------|-----------|--------------|---------|
| Tự cập nhật hồ sơ | `UPDATE_PROFILE` | USER | `actorId = targetId` |
| Sửa hộ hồ sơ | `UPDATE_PROFILE` | USER | `actorId ≠ targetId` (sửa hộ) |
| Trích xuất lý lịch | `EXPORT_CV` | USER | kèm mã mẫu (VP-CV-TPL) |

Ai xem nhật ký: Chuyên viên QL KHCN & Quản trị hệ thống (`AUDIT_LOG.VIEW`) — qua [B03 BO-06](../B03-quan-ly-nguoi-dung/ui.md).

## 6. Liên kết AC

| Màn hình | AC liên quan (spec.md §6) |
|----------|---------------------------|
| FE-01 (Hồ sơ của tôi) | AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08 |
| FE-02 (Lý lịch của tôi) | AC-09, AC-10, AC-13 |
| BO-01 (Sửa hộ hồ sơ) | AC-03, AC-11, AC-12 |
| BO-02 (Lý lịch người dùng) | AC-09, AC-10, AC-12, AC-13 |
