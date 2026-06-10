---
title: "<Tên feature> — Giao diện (một web app, phân quyền)"
spec: "./spec.md"
owner: "<BA/Designer>"
status: Draft
updated: 2026-06-09
---

# <Tên feature> — Giao diện

> Một web app duy nhất; màn hình & hành động hiển thị **theo phân quyền (RBAC)** — xem
> [ADR-0009](../../architecture/decisions/0009-hop-nhat-mot-web-phan-quyen.md). Chỉ mô tả phần
> **đặc thù giao diện**. Luật nghiệp vụ → xem `./spec.md`.

## 1. Đối tượng & phân quyền

Ai thao tác feature này, vào từ đâu. Liệt kê mọi vai trò (người dùng cuối + quản trị) trong cùng app.

### Ma trận phân quyền (Permission matrix)

Quyền nguyên tử dạng `MODULE.ACTION` (data-model §4.1). UI chỉ ẩn/hiện theo quyền (overview §4.1).

| Hành động | Quyền | Vai trò A | Vai trò B | Vai trò C |
|-----------|-------|:---------:|:---------:|:---------:|
| Xem       | `MODULE.VIEW` | ✓ | ✓ | ✓ |
| Tạo/sửa   | `MODULE.EDIT` | ✓ | ✓ | – |
| Duyệt     | `MODULE.APPROVE` | ✓ | – | – |
| Xóa       | `MODULE.DELETE` | ✓ | – | – |

## 2. Danh sách màn hình

Phân theo nhóm quyền; tất cả nằm trong cùng một web app.

### 2.1 Nhóm người dùng cuối

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| MH-01 | ...          | ...      |

### 2.2 Nhóm quản trị

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| MH-11 | ...          | ...      |

## 3. Mô tả màn hình & thao tác

Bố cục, thành phần, trạng thái (rỗng/đang tải/lỗi), validate phía người dùng; bộ lọc, bảng dữ liệu,
hành động hàng loạt, quy trình duyệt nhiều cấp (nếu có). Wireframe/ảnh đặt trong `assets/`, link Figma nếu có.

## 4. Thông báo & trạng thái

Thông báo thành công/lỗi hiển thị cho người dùng.

## 5. Audit & nhật ký

Hành động nào cần ghi `AuditLog`, ai xem được (theo phạm vi dữ liệu).

## 6. Liên kết AC

Map màn hình ↔ AC trong `spec.md` để đảm bảo không sót.
