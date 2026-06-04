---
title: "Quản lý kinh phí — Test plan"
spec: "./spec.md"
owner: "PO/BA"
status: Draft
updated: 2026-06-01
---

# Quản lý kinh phí — Kế hoạch kiểm thử

> Mỗi test case bám vào một AC trong [spec.md](./spec.md). Không có AC tương ứng = thiếu yêu cầu, báo BA/PO.

## 1. Phạm vi kiểm thử

- Mặt: FE (Chủ nhiệm — xem/giải trình), BO (Chuyên viên — dự toán/giao dịch/đối soát/quyết toán), API
  (RBAC, data scoping), tích hợp tài chính (API + nhập file).
- Dữ liệu mẫu: đề tài `IN_PROGRESS` có dự toán 3 khoản mục; tập giao dịch khớp & lệch; đề tài `PASSED`
  còn 1 giao dịch `MISMATCHED`.

## 2. Test cases

| ID | Liên kết AC | Tiền điều kiện | Bước thực hiện | Kết quả mong đợi | Loại |
|----|-------------|----------------|----------------|------------------|------|
| TC-01 | AC-01 | Đề tài `IN_PROGRESS` | Lập dự toán khoản mục, số nguyên VND > 0 | Lưu dự toán, hiển thị tổng, audit | Happy |
| TC-02 | AC-02 | Đã có dự toán khoản mục X | Ghi chi khoản mục X không vượt dự toán | Giao dịch `UNRECONCILED`, cập nhật thực chi | Happy |
| TC-03 | AC-03 | Có giao dịch `UNRECONCILED` có mã khớp | Chạy đối soát API | Khớp → `MATCHED`, lệch → `MISMATCHED`, thông báo, audit | Happy |
| TC-04 | AC-04 | API tài chính không sẵn sàng | Nhập file CSV/Excel đối soát | Gán trạng thái như API, nghiệp vụ không khóa | Happy |
| TC-05 | AC-05 | Có giao dịch `MISMATCHED` | Điều chỉnh/đánh dấu giải quyết kèm lý do | Giao dịch `MATCHED`, lưu lý do, audit | Happy |
| TC-06 | AC-06 | Đề tài `PASSED`, không còn `MISMATCHED` | Quyết toán & đóng đề tài | `PASSED → COMPLETED`, thông báo, audit | Happy |
| TC-07 | AC-07 | Đề tài `PASSED` còn ≥1 `MISMATCHED` | Cố quyết toán/đóng | Chặn, liệt kê `MISMATCHED`, giữ `PASSED` | Negative |
| TC-08 | AC-08 | — | Nhập `amount` ≤ 0 / không nguyên | Lỗi validate, không lưu | Biên/Lỗi |
| TC-09 | AC-09 | `BUDGET.OVER_BUDGET_MODE=BLOCK` | Ghi chi làm vượt dự toán | Chặn | Biên |
| TC-10 | AC-09 | `BUDGET.OVER_BUDGET_MODE=WARN` | Ghi chi làm vượt dự toán | Ghi kèm cảnh báo vượt | Biên |
| TC-11 | AC-10 | Người dùng là chủ nhiệm | Gọi đối soát / đổi trạng thái / sửa dự toán | 403, không thực hiện | Negative |
| TC-12 | AC-11 | Chủ nhiệm A | Truy cập kinh phí đề tài không thuộc A | Từ chối/ẩn | Negative |
| TC-13 | AC-12 | Đề tài `APPROVED` hoặc `COMPLETED` | Ghi giao dịch chi mới | Chặn (BR-01) | Negative |
| TC-14 | AC-13 | `financeTransactionCode` đã gán giao dịch khác | Đối soát/gán mã đó cho giao dịch 2 | Từ chối khớp trùng | Biên/Lỗi |

## 3. Trường hợp biên & negative

- Đối soát khi số tiền lệch nhỏ (làm tròn) — xác nhận quy tắc "khớp tuyệt đối" hiện hành.
- Nhập file đối soát có dòng sai định dạng/thiếu cột — báo lỗi dòng, không hỏng cả mẻ.
- Sửa giao dịch đã `MATCHED` → tự về `UNRECONCILED` (BR-10); sửa giao dịch của đề tài `COMPLETED` → bị khóa.
- Đối soát chạy đồng thời lúc đang sửa giao dịch (race) — không tạo trạng thái sai.

## 4. Checklist hồi quy

- Vòng đời `ResearchProject`: chuyển `PASSED → COMPLETED` phối hợp đúng với F06 (không hai feature cùng đổi).
- Data scoping & RBAC kinh phí.
- Thông báo chênh lệch & quyết toán (B04).
- Tổng hợp kinh phí ở báo cáo B02 khớp số liệu F05 tại thời điểm chạy.
