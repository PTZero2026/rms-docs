---
title: "Quy đổi giờ giảng — Test plan"
spec: "./spec.md"
owner: "<TEST>"
status: Draft
updated: 2026-06-24
---

# Quy đổi giờ giảng — Kế hoạch kiểm thử

> Khung mẫu — mỗi test case bám một AC trong `spec.md`.

## 2. Test cases
| ID | Liên kết AC | Bước thực hiện | Kết quả mong đợi | Loại |
|---|---|---|---|---|
| TC-01 | AC-01 | Ghi nhận sự kiện loại X khi có công thức hiệu lực | Tính đúng số giờ | Happy |
| TC-02 | AC-03 | Xử lý lại cùng sự kiện | Không phát sinh giờ trùng | Biên |
| TC-03 | AC-04 | Điều chỉnh giờ giảng thủ công | Ghi `AuditLog` kèm lý do | Negative/Audit |

## 3. Trường hợp biên & negative
Công thức hết hiệu lực; sự kiện ở trạng thái chưa hợp lệ; phân bổ vai trò tổng tỉ lệ ≠ 100%.
