---
title: "Đề tài sinh viên — Giao diện (một web app, phân quyền)"
spec: "./spec.md"
owner: "<BA/Designer>"
status: Draft
updated: 2026-06-29
---

# Đề tài sinh viên — Giao diện

> Khung giao diện mức nghiệp vụ cho workflow mặc định trong `./spec.md`; chi tiết layout sẽ bổ sung khi
> `design.md`/wireframe chín.

## 1. Đối tượng & phân quyền
- **Sinh viên:** tạo đăng ký, quản lý nhóm, nộp kết quả.
- **GV hướng dẫn:** xác nhận/từ chối hướng dẫn, theo dõi, xác nhận hồ sơ kết quả.
- **Chuyên viên QLKH/Khoa:** quản lý đợt, sơ duyệt, nghiệm thu/ghi nhận, đóng đề tài.

| Hành động | Quyền | Chuyên viên | GV hướng dẫn | Sinh viên |
|---|---|:--:|:--:|:--:|
| Quản lý đợt | `STUDENTPROJECT.CALL_MANAGE` | ✓ | – | – |
| Đăng ký/sửa nháp | `STUDENTPROJECT.EDIT` | ✓ | ✓ | ✓ |
| Xác nhận hướng dẫn | `STUDENTPROJECT.MENTOR_CONFIRM` | – | ✓ | – |
| Sơ duyệt/phê duyệt | `STUDENTPROJECT.APPROVE` | ✓ | – | – |
| Nộp kết quả | `STUDENTPROJECT.RESULT_SUBMIT` | ✓ | ✓ | ✓ |
| Nghiệm thu/ghi nhận | `STUDENTPROJECT.APPROVE` | ✓ | – | – |
| Đóng đề tài/quy đổi | `STUDENTPROJECT.CLOSE` | ✓ | – | – |

## 2. Danh sách màn hình
| Mã MH | Tên màn hình | Mục đích |
|---|---|---|
| MH-01 | Quản lý đợt đề tài SV | Mở/đóng đợt, thời hạn, giới hạn nhóm, yêu cầu minh chứng |
| MH-02 | Đăng ký đề tài SV | Chọn SV từ đồng bộ, nhập đề tài, chọn/GVHD đề xuất |
| MH-03 | Xác nhận hướng dẫn | GVHD đồng ý, từ chối hoặc yêu cầu sửa |
| MH-04 | Sơ duyệt & phê duyệt | Khoa/bộ môn kiểm tra hồ sơ và cho triển khai |
| MH-05 | Theo dõi thực hiện | Trạng thái, checkpoint tùy cấu hình, thay đổi có lý do |
| MH-06 | Nộp kết quả cuối | Báo cáo, sản phẩm/minh chứng, xác nhận GVHD |
| MH-07 | Nghiệm thu & đóng đề tài | Kết luận đạt/không đạt, đóng đề tài, theo dõi yêu cầu P03 |

## 6. Liên kết AC
| Màn hình | AC liên quan |
|---|---|
| MH-01 | AC-01, AC-03, AC-08 |
| MH-02 | AC-02, AC-03, AC-04 |
| MH-03 | AC-04, AC-05 |
| MH-04 | AC-06, AC-12, AC-13 |
| MH-05 | AC-07, AC-12 |
| MH-06 | AC-08, AC-09 |
| MH-07 | AC-10, AC-11, AC-12 |
