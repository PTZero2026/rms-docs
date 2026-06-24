---
title: "Quy đổi giờ giảng — Giao diện (một web app, phân quyền)"
spec: "./spec.md"
owner: "<BA/Designer>"
status: Draft
updated: 2026-06-24
---

# Quy đổi giờ giảng — Giao diện

> Khung mẫu — hoàn thiện sau khi chốt công thức quy đổi (spec §7). Luật nghiệp vụ → `./spec.md`.

## 1. Đối tượng & phân quyền
- **Quản trị NCKH (BO):** cấu hình công thức quy đổi, xem/điều chỉnh bản ghi giờ giảng.
- **Giảng viên:** xem giờ giảng của mình (qua lý lịch F08).

| Hành động | Quyền | Quản trị | Chuyên viên | Giảng viên |
|---|---|:--:|:--:|:--:|
| Cấu hình công thức | `TEACHINGHOUR.CONFIG` | ✓ | – | – |
| Xem bản ghi | `TEACHINGHOUR.VIEW` | ✓ | ✓ | ✓ (của mình) |
| Điều chỉnh | `TEACHINGHOUR.EDIT` | ✓ | ✓ | – |

## 2. Danh sách màn hình
| Mã MH | Tên màn hình | Mục đích |
|---|---|---|
| MH-01 | Cấu hình công thức quy đổi | Định nghĩa công thức/định mức theo loại hoạt động & kỳ hiệu lực |
| MH-02 | Bảng giờ giảng theo giảng viên/kỳ | Tra cứu & điều chỉnh bản ghi giờ giảng |

## 3. Mô tả màn hình & thao tác
*(Chờ chốt spec — bố cục cấu hình công thức, danh sách bản ghi, điều chỉnh có lý do.)*

## 6. Liên kết AC
Map MH ↔ AC-01..05 trong `spec.md` (bổ sung khi spec chín).
