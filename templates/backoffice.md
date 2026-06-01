---
title: "<Tên feature> — BackOffice (quản trị)"
spec: "./spec.md"
owner: "<BA>"
status: Draft
updated: 2026-06-01
---

# <Tên feature> — Mặt quản trị

> Chỉ mô tả phần **đặc thù quản trị**. Luật nghiệp vụ → xem `spec.md`.

## 1. Vai trò sử dụng

Vai trò quản trị nào dùng feature này.

## 2. Phân quyền (Permission matrix)

| Hành động | Vai trò A | Vai trò B | Vai trò C |
|-----------|:---------:|:---------:|:---------:|
| Xem       | ✓ | ✓ | ✓ |
| Tạo/sửa   | ✓ | ✓ | – |
| Duyệt     | ✓ | – | – |
| Xóa       | ✓ | – | – |

## 3. Danh sách màn hình

| Mã MH | Tên màn hình | Mục đích |
|-------|--------------|----------|
| BO-01 | ...          | ...      |

## 4. Mô tả màn hình & thao tác

Bộ lọc, bảng dữ liệu, hành động hàng loạt, quy trình duyệt nhiều cấp (nếu có).

## 5. Audit & nhật ký

Hành động nào cần ghi log, ai xem được.

## 6. Liên kết AC

Map màn hình ↔ AC trong `spec.md`.
