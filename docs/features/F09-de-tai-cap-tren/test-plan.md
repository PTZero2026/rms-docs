---
title: "Đề tài cấp trên — Test plan"
spec: "./spec.md"
owner: "<TEST>"
status: Draft
updated: 2026-06-26
---

# Đề tài cấp trên — Kế hoạch kiểm thử

> Khung mẫu — mỗi test case bám một AC trong `spec.md`.

## 2. Test cases
| ID | Liên kết AC | Bước thực hiện | Kết quả mong đợi | Loại |
|---|---|---|---|---|
| TC-01 | AC-01 | Kê khai đề tài cấp Bộ | Ghi nhận dạng đầu mục, không yêu cầu hội đồng/nghiệm thu nội bộ | Happy |
| TC-02 | AC-02 | Cấp Bộ yêu cầu minh chứng `DECISION` (cấu hình); QLKH duyệt khi thiếu loại đó | Bị chặn, nêu rõ loại minh chứng còn thiếu | Negative |
| TC-02b | AC-02 | Đổi cấu hình `requiredEvidence` của cấp (thêm/bớt loại), không deploy | Quy tắc duyệt áp dụng theo cấu hình mới | Happy |
| TC-03 | AC-03 | GV gửi duyệt → QLKH Trả lại kèm lý do | Đầu mục về Nháp, GV sửa & gửi lại được | Happy |
| TC-04 | AC-04 | QLKH duyệt/trả lại đầu mục | Thay đổi trạng thái ghi AuditLog | Happy |
| TC-05 | AC-05 | Đầu mục Đã duyệt | Phát sinh giờ giảng qua P03 theo cấp & vai trò | Happy |
| TC-06 | AC-05 | Xử lý lại cùng sự kiện đã duyệt | Không phát sinh giờ trùng (idempotent) | Negative |
| TC-07 | AC-06 | Thu hồi/trả lại đầu mục đã duyệt | Giờ giảng được điều chỉnh tương ứng, ghi AuditLog | Happy |
