---
title: "Hoạt động khoa học & minh chứng — Giao diện (một web app, phân quyền)"
spec: "./spec.md"
owner: "<BA/Designer>"
status: Draft
updated: 2026-06-24
---

# Hoạt động khoa học & minh chứng — Giao diện

> Khung mẫu — hoàn thiện sau khi chốt spec. Một form cấu hình theo **loại hoạt động**
> (hội nghị/cộng đồng/SHTT). Luật nghiệp vụ → `./spec.md`.

## 1. Đối tượng & phân quyền
- **Giảng viên:** kê khai hoạt động + minh chứng. **Chuyên viên QLKH:** phê duyệt & cấp kinh phí.

| Hành động | Quyền | Chuyên viên | Giảng viên |
|---|---|:--:|:--:|
| Kê khai/sửa | `ACTIVITY.EDIT` | ✓ | ✓ (của mình) |
| Phê duyệt & cấp kinh phí | `ACTIVITY.APPROVE` | ✓ | – |

## 2. Danh sách màn hình
| Mã MH | Tên màn hình | Mục đích |
|---|---|---|
| MH-01 | Kê khai hoạt động (theo loại) | Form đổi theo loại; đính kèm minh chứng |
| MH-02 | Hàng đợi phê duyệt | QLKH duyệt/từ chối/bổ sung, ghi nhận kinh phí hỗ trợ |

## 3. Mô tả màn hình & thao tác
Form **động theo loại hoạt động**: hội nghị (tờ trình cử đi, thông tin phát biểu), phục vụ cộng đồng
(minh chứng tham gia), SHTT (văn bằng/đơn đăng ký). Trạng thái phê duyệt + khoản kinh phí hỗ trợ.

## 6. Liên kết AC
Map MH ↔ AC-01..04 trong `spec.md`.
