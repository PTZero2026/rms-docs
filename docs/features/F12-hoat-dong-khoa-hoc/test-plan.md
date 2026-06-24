---
title: "Hoạt động khoa học & minh chứng — Test plan"
spec: "./spec.md"
owner: "<TEST>"
status: Draft
updated: 2026-06-24
---

# Hoạt động khoa học & minh chứng — Kế hoạch kiểm thử

> Khung mẫu — mỗi test case bám một AC trong `spec.md`.

## 2. Test cases
| ID | Liên kết AC | Bước thực hiện | Kết quả mong đợi | Loại |
|---|---|---|---|---|
| TC-01 | AC-01 | Kê khai với loại CONFERENCE/COMMUNITY/IP | Form minh chứng tương ứng từng loại | Happy |
| TC-02 | AC-02 | Gửi duyệt khi thiếu minh chứng bắt buộc | Bị chặn | Negative |
| TC-03 | AC-03 | Hoạt động bị từ chối | Không phát sinh kinh phí & giờ giảng | Negative |
| TC-04 | AC-04 | Hoạt động được duyệt | Ghi nhận kinh phí hỗ trợ + sinh giờ giảng qua P03 | Happy |

## 3. Trường hợp biên & negative
Loại hoạt động không có trong danh mục; minh chứng sai định dạng; duyệt khi sai quyền.
