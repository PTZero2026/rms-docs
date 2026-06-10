---
title: "Báo cáo & thống kê — Giao diện (một web app, phân quyền)"
spec: "./spec.md"
owner: "<BA>"
status: Draft
updated: 2026-06-09
---

# Báo cáo & thống kê — Giao diện

> Một web app duy nhất; màn hình & hành động hiển thị **theo phân quyền (RBAC)** — xem
> [ADR-0009](../../architecture/decisions/0009-hop-nhat-mot-web-phan-quyen.md). Chỉ mô tả phần
> **đặc thù giao diện**. Luật nghiệp vụ → xem `./spec.md`.

## 1. Vai trò sử dụng

Vai trò nào (theo quyền trong cùng web app) dùng feature này.

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
