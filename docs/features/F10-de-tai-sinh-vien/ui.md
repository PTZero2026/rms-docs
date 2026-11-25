---
title: "Đề tài sinh viên — Giao diện (một web app, phân quyền)"
spec: "./spec.md"
owner: "<BA/Designer>"
status: Draft
updated: 2026-11-25
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

**MH-04 và AC-06.** Khoa mở đăng ký **Đã nộp**. Nút **Phê duyệt triển khai** áp dụng mốc đã chọn khi nộp. Khoa có thể nhập lý do rồi chọn **Trả đăng ký bổ sung**. Sau khi duyệt, hồ sơ ở mốc **Đã phê duyệt** có nút **Bắt đầu thực hiện**. [Hướng dẫn theo vai trò](../../guides/nguoi-dung/dang-ky-sinh-vien.md)

**MH-06 và MH-07.** Mục **Kết quả cuối** hiển thị số lượt, tóm tắt, tệp theo loại và xác nhận của giảng viên. Khoa ghi nhận kết quả, cho làm lại có hạn hoặc đóng đề tài đạt. Thông báo sau khi đóng cho biết đã gửi yêu cầu P03 hay P03 đang tắt. [Hướng dẫn và ảnh từng vai](../../guides/nguoi-dung/dang-ky-sinh-vien.md#nộp-kết-quả-và-nghiệm-thu)

**MH-05 và AC-07.** Khoa mở **Điều chỉnh hồ sơ đã duyệt**, chọn nhóm và GVHD từ danh bạ, ghi lý do rồi gửi. Người nhận lời mời thấy mục tiêu, sản phẩm dự kiến và lý do điều chỉnh trước khi phản hồi. [Hướng dẫn đổi người hướng dẫn](../../guides/nguoi-dung/dang-ky-sinh-vien.md#điều-chỉnh-sau-phê-duyệt)

**MH-05/MH-06.** Khi đang thực hiện, trưởng nhóm và GVHD có mục **Tiến độ thực hiện** để cập nhật nội dung. Cả nhóm và khoa đọc được người ghi và thời điểm. Khu vực **Kết quả cuối** hiển thị hạn do đợt quy định. Khi lưu tiến độ, nội dung tóm tắt kết quả đang soạn vẫn còn trên biểu mẫu.

**MH-01.** Quản trị trường mở **Cấu hình hệ thống**, sửa danh sách `F10.CALLS`, kiểm qua **Xem trước** rồi lưu. Quy tắc ngày, quy mô nhóm, bộ minh chứng và cờ bắt buộc được dùng chung giữa B01 và F10. [Hướng dẫn kèm mẫu](../../guides/nguoi-dung/cau-hinh-theo-truong.md#mở-đợt-đề-tài-sinh-viên)
