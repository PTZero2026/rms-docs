---
title: "Đề tài sinh viên — Giao diện (một web app, phân quyền)"
spec: "./spec.md"
owner: "<BA/Designer>"
status: Draft
updated: 2026-06-24
---

# Đề tài sinh viên — Giao diện

> Khung mẫu — phụ thuộc chốt phạm vi vòng đời (spec §7). Luật nghiệp vụ → `./spec.md`.

## 1. Đối tượng & phân quyền
- **Sinh viên/GV hướng dẫn:** đăng ký/theo dõi. **Chuyên viên QLKH:** quản lý đợt & nghiệm thu.

| Hành động | Quyền | Chuyên viên | GV hướng dẫn | Sinh viên |
|---|---|:--:|:--:|:--:|
| Đăng ký/sửa | `STUDENTPROJECT.EDIT` | ✓ | ✓ | ✓ |
| Nghiệm thu/ghi nhận | `STUDENTPROJECT.APPROVE` | ✓ | – | – |

## 2. Danh sách màn hình
| Mã MH | Tên màn hình | Mục đích |
|---|---|---|
| MH-01 | Đăng ký đề tài SV | Chọn SV (từ đồng bộ) + GV hướng dẫn |
| MH-02 | Theo dõi & ghi nhận kết quả | Trạng thái, nghiệm thu, giờ giảng GV |

## 6. Liên kết AC
Map MH ↔ AC-01..03 trong `spec.md`.
