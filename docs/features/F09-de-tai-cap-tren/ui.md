---
title: "Đề tài cấp trên — Giao diện (một web app, phân quyền)"
spec: "./spec.md"
owner: "<BA/Designer>"
status: Draft
updated: 2026-06-24
---

# Đề tài cấp trên — Giao diện

> Khung mẫu — hoàn thiện sau khi chốt spec. Luật nghiệp vụ → `./spec.md`.

## 1. Đối tượng & phân quyền
- **Giảng viên/Chuyên viên:** kê khai đầu mục. **Chuyên viên QLKH:** xác nhận.

| Hành động | Quyền | Chuyên viên | Giảng viên |
|---|---|:--:|:--:|
| Kê khai/sửa | `UPPERPROJECT.EDIT` | ✓ | ✓ (của mình) |
| Xác nhận | `UPPERPROJECT.APPROVE` | ✓ | – |

## 2. Danh sách màn hình
| Mã MH | Tên màn hình | Mục đích |
|---|---|---|
| MH-01 | Danh sách & kê khai đề tài cấp trên | Quản lý đầu mục |
| MH-02 | Chi tiết & xác nhận | Xem minh chứng, xác nhận, ghi nhận kết quả |

## 6. Liên kết AC
Map MH ↔ AC-01..03 trong `spec.md`.
