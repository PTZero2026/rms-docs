---
title: "Đề tài cấp trên — Test plan"
spec: "./spec.md"
owner: "QA"
status: Review
updated: 2026-11-24
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

## Ca biên theo quyết định triển khai

| Ca | AC nguồn | Điều kiện | Thao tác | Kết quả |
|---|---|---|---|---|
| TC-08 · [US-26/TC-03](../../../specs/026-web-register-upper-project/quickstart.md) | AC-02 | Đầu mục cấp Bộ có tệp sai loại so với quy tắc DECISION | chuyên viên duyệt | nêu đúng loại quyết định phải bổ sung |

### Đối chứng phân bổ F09 theo vai trò

Kê khai chủ nhiệm và hai thành viên với tỷ lệ lần lượt 50%, 30% và 20%. Cấu hình định mức thử 20 giờ cho chủ nhiệm và 10 giờ cho thành viên cùng cấp. Sau duyệt, chạy công việc quy đổi hai lần rồi đối chiếu sổ của ba người với 10,00 / 3,00 / 2,00 giờ. Thu hồi quyết định và kiểm từng tổng về 0. Lưu bằng client cũ phải giữ danh sách thành viên đã khai. [Ca tích hợp PostgreSQL](../../../apps/backend/test/db/teaching.test.mjs)
