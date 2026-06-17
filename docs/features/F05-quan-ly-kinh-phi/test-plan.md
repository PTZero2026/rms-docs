---
title: "Quản lý kinh phí — Test plan"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
updated: 2026-06-17
---

# Quản lý kinh phí — Kế hoạch kiểm thử

> Mỗi test case bám vào một AC trong [spec.md](./spec.md). Không có AC tương ứng = thiếu yêu cầu, báo BA/PO.
> Bản đơn giản (giai đoạn này): xác nhận cấp kinh phí, tạo khoản chi + chứng từ, xem khoản chi, quyết toán.

## 1. Phạm vi kiểm thử

- Mặt: FE (Chủ nhiệm — xem kinh phí, tạo khoản chi + chứng từ), BO (Chuyên viên — xác nhận cấp, xem khoản
  chi, quyết toán), API (RBAC, data scoping).
- Dữ liệu mẫu: đề tài `IN_PROGRESS` có `ProjectAssignment.approvedBudget` = 200 triệu; một đề tài đã xác
  nhận cấp kinh phí với vài khoản chi (có/không chứng từ); một đề tài `PASSED` để quyết toán; một đề tài
  của chủ nhiệm khác để kiểm tra phạm vi dữ liệu.

## 2. Test cases

| ID | Liên kết AC | Tiền điều kiện | Bước thực hiện | Kết quả mong đợi | Loại |
|----|-------------|----------------|----------------|------------------|------|
| TC-01 | AC-01 | Đề tài `IN_PROGRESS`, `approvedBudget=200 triệu` | Chuyên viên xác nhận cấp kinh phí (≤ 200 triệu) | Ghi nhận kinh phí được cấp, thông báo chủ nhiệm, audit | Happy |
| TC-02 | AC-02 | Đề tài `IN_PROGRESS` của chủ nhiệm, đã cấp kinh phí | Chủ nhiệm tạo khoản chi `amount` > 0, mô tả, ngày + đính chứng từ | Lưu khoản chi, gắn chứng từ, cập nhật đã chi/còn lại, audit | Happy |
| TC-03 | AC-03 | Đề tài đã có các khoản chi | Chuyên viên mở danh sách kinh phí đề tài | Hiện tổng cấp – đã chi – còn lại và danh sách khoản chi + chứng từ | Happy |
| TC-04 | AC-04 | Tổng đã chi gần bằng kinh phí được cấp | Chủ nhiệm tạo khoản chi làm tổng chi vượt mức cấp | **Vẫn lưu** khoản chi, hiển thị cảnh báo vượt kinh phí | Biên |
| TC-05 | AC-05 | Đề tài `PASSED` | Chuyên viên quyết toán & đóng đề tài | `PASSED → COMPLETED`, khóa kinh phí, thông báo, audit | Happy |
| TC-06 | AC-06 | — | Nhập `amount` ≤ 0 / không nguyên (khoản chi hoặc cấp kinh phí) | Lỗi validate, không lưu | Biên/Lỗi |
| TC-07 | AC-07 | Người dùng là chủ nhiệm | Gọi xác nhận cấp kinh phí hoặc quyết toán/đóng đề tài | 403, không thực hiện | Negative |
| TC-08 | AC-08 | Chủ nhiệm A | Truy cập/sửa kinh phí đề tài không thuộc A | Từ chối/ẩn (403), chỉ thấy đề tài của mình | Negative |
| TC-09 | AC-09 | Đề tài `APPROVED` hoặc `COMPLETED` | Tạo/sửa khoản chi mới | Chặn (BR-01, BR-06) | Negative |
| TC-10 | AC-08 | Xác nhận cấp `> approvedBudget` | Chuyên viên nhập tổng cấp vượt `approvedBudget` | Chặn, báo vượt mức được phê duyệt (BR-08) | Biên/Lỗi |
| TC-11 | AC-05 | Đề tài đã `COMPLETED` | Cố sửa/xóa khoản chi hoặc đính chứng từ | Bị khóa, không thực hiện (BR-06) | Negative |

## 3. Trường hợp biên & negative

- Tạo khoản chi khi đề tài chưa xác nhận cấp kinh phí — xác định hành vi (cho ghi nhưng "còn lại" chưa xác
  định, hay yêu cầu cấp trước) theo chốt của PO.
- Xóa khoản chi đã đính chứng từ — kiểm tra chứng từ (`Attachment`) được dọn/đánh dấu xóa kèm theo, ghi audit.
- File chứng từ sai định dạng/quá lớn — báo lỗi rõ, không lưu khoản chi dở dang.
- Điều chỉnh tổng cấp sau khi đã chi vượt mức cấp mới — xác nhận hành vi (chặn/cảnh báo) theo chốt của PO.

## 4. Checklist hồi quy

- Vòng đời `ResearchProject`: chuyển `PASSED → COMPLETED` phối hợp đúng với F06 (không hai feature cùng đổi).
- Data scoping & RBAC kinh phí (chủ nhiệm chỉ đề tài mình; chuyên viên theo phạm vi được phân).
- Thông báo xác nhận cấp kinh phí & quyết toán (B04).
- Tổng hợp kinh phí ở báo cáo B02 khớp số liệu F05 (tổng cấp, tổng đã chi) tại thời điểm chạy.
