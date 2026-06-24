---
title: "Dự án phục vụ sản xuất — Giao diện (một web app, phân quyền)"
spec: "./spec.md"
owner: "<BA/Designer>"
status: Draft
updated: 2026-06-24
---

# Dự án phục vụ sản xuất — Giao diện

> Khung mẫu — hoàn thiện sau khi chốt spec. Luật nghiệp vụ → `./spec.md`.

## 1. Đối tượng & phân quyền
- **Viện/Chuyên viên:** kê khai dự án & đối tác. **Chuyên viên QLKH:** xác nhận.

| Hành động | Quyền | Chuyên viên | Thành viên viện |
|---|---|:--:|:--:|
| Kê khai/sửa | `APPLIEDPROJECT.EDIT` | ✓ | ✓ |
| Xác nhận | `APPLIEDPROJECT.APPROVE` | ✓ | – |

## 2. Danh sách màn hình
| Mã MH | Tên màn hình | Mục đích |
|---|---|---|
| MH-01 | Danh sách & kê khai dự án | Tên, viện, đối tác ngoài, thành viên, kinh phí |
| MH-02 | Chi tiết & ghi nhận kết quả | Minh chứng, xác nhận, giờ giảng |

## 6. Liên kết AC
Map MH ↔ AC-01..03 trong `spec.md`.
