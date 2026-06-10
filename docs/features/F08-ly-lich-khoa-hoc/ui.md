---
title: "Lý lịch khoa học — Giao diện (một web app, phân quyền)"
spec: "./spec.md"
owner: "<BA/Designer>"
status: Draft
updated: 2026-06-09
---

# Lý lịch khoa học — Giao diện

> Một web app duy nhất; màn hình & hành động hiển thị **theo phân quyền (RBAC)** — xem
> [ADR-0009](../../architecture/decisions/0009-hop-nhat-mot-web-phan-quyen.md). Chỉ mô tả phần
> **đặc thù giao diện**. Luật nghiệp vụ → xem `./spec.md`.

## 1. Đối tượng & phân quyền

Ai thao tác màn hình này, vào từ đâu; và vai trò quản trị nào dùng feature này.

Đăng nhập qua SSO. Cùng một web app — mỗi vai trò thấy đúng tập màn hình/hành động theo quyền; backend
là lớp bảo vệ thật.

### Ma trận phân quyền (Permission matrix)

UI chỉ ẩn/hiện theo quyền.

| Hành động | Vai trò A | Vai trò B | Vai trò C |
|-----------|:---------:|:---------:|:---------:|
| Xem       | ✓ | ✓ | ✓ |
| Tạo/sửa   | ✓ | ✓ | – |
| Duyệt     | ✓ | – | – |
| Xóa       | ✓ | – | – |

## 2. Danh sách màn hình

Phân theo nhóm quyền; tất cả nằm trong cùng một web app.

### 2.1 Nhóm người dùng cuối

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| FE-01 | ...          | ...      |

### 2.2 Nhóm quản trị

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| BO-01 | ...          | ...      |

## 3. Mô tả màn hình & thao tác

Bố cục, thành phần, trạng thái (rỗng/đang tải/lỗi), validate phía người dùng.
Bộ lọc, bảng dữ liệu, hành động hàng loạt, quy trình duyệt nhiều cấp (nếu có).
Wireframe/ảnh đặt trong `assets/`, link Figma nếu có.

## 4. Thông báo & trạng thái

Thông báo thành công/lỗi hiển thị cho người dùng.

## 5. Audit & nhật ký

Hành động nào cần ghi log, ai xem được.

## 6. Liên kết AC

Map màn hình ↔ AC trong `spec.md` để đảm bảo không sót.
