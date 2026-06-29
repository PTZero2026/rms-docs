---
title: "Quy đổi giờ giảng — Giao diện (một web app, phân quyền)"
spec: "./spec.md"
owner: "<BA/Designer>"
status: Draft
updated: 2026-06-29
---

# Quy đổi giờ giảng — Giao diện

> Luật nghiệp vụ → `./spec.md`. P03 là nơi cấu hình công thức quy đổi; B01 chỉ cung cấp danh mục/kỳ lịch nền.

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
| MH-01 | Cấu hình công thức quy đổi | Định nghĩa công thức/định mức theo loại hoạt động, vai trò, loại kỳ và khoảng hiệu lực |
| MH-02 | Bảng giờ giảng theo giảng viên/kỳ | Tra cứu bản ghi giờ giảng theo năm học/năm tài khóa, nguồn phát sinh và giảng viên |
| MH-03 | Điều chỉnh/tính lại có lý do | Điều chỉnh thủ công hoặc chạy tính lại hồi tố, bắt buộc lý do và audit |

## 3. Mô tả màn hình & thao tác

### MH-01 Cấu hình công thức quy đổi

- **Trường chính:** loại hoạt động, phạm vi áp dụng/cấp loại, vai trò, `periodType`
  (`ACADEMIC_YEAR`/`FISCAL_YEAR`), `validFrom`, `validTo`, tham số tính giờ, quy tắc phân bổ.
- **Mặc định:** tenant mới dùng `ACADEMIC_YEAR`.
- **Kiểm tra khi lưu:** không cho khoảng hiệu lực chồng lấn trong cùng loại hoạt động + vai trò/phạm vi +
  `periodType`; mọi thay đổi ghi audit.

### MH-02 Bảng giờ giảng theo giảng viên/kỳ

- **Bộ lọc:** giảng viên, đơn vị, `recognitionPeriodType`, `recognitionPeriodCode`, nguồn phát sinh
  (`F07/F09/F10/F11/F12`), trạng thái bản ghi.
- **Hiển thị:** số giờ, vai trò, nguồn sự kiện, ngày nghiệp vụ nguồn (`sourceOccurredAt`), công thức đã áp dụng,
  kỳ ghi nhận, lịch sử điều chỉnh.
- **Giảng viên:** chỉ xem bản ghi của mình; quản trị/chuyên viên xem theo quyền.

### MH-03 Điều chỉnh/tính lại có lý do

- **Điều chỉnh thủ công:** nhập số giờ mới hoặc khoản điều chỉnh tăng/giảm, bắt buộc lý do.
- **Tính lại hồi tố:** chọn phạm vi nguồn/kỳ/công thức, xem trước chênh lệch, xác nhận tạo bản ghi điều chỉnh;
  không sửa đè bản ghi cũ.

## 6. Liên kết AC

| Màn hình | AC liên quan |
|---|---|
| MH-01 Cấu hình công thức quy đổi | AC-01, AC-02, AC-03, AC-07, AC-08 |
| MH-02 Bảng giờ giảng theo giảng viên/kỳ | AC-05, AC-09 |
| MH-03 Điều chỉnh/tính lại có lý do | AC-06, AC-08 |
