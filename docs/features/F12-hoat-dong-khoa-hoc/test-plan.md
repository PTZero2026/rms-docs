---
title: "Hoạt động khoa học & minh chứng — Test plan"
spec: "./spec.md"
owner: "QA"
status: Review
updated: 2026-11-25
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

## Ca biên theo quyết định triển khai

| Ca | AC nguồn | Điều kiện | Thao tác | Kết quả |
|---|---|---|---|---|
| TC-05 · [US-29/TC-03](../../../specs/029-web-submit-activity/quickstart.md) | AC-02 | Hai trường yêu cầu minh chứng khác nhau cho cùng một hội nghị | giảng viên trường A gửi | chỉ kiểm bộ minh chứng của A |

**Đối chứng TC-03 và TC-04.** PostgreSQL kiểm quyền của người kê khai, chuyên viên và người ngoài phạm vi. Thử số âm, số lẻ, quá giới hạn, hai quyết định đồng thời, duyệt khi không cấp tiền, thu hồi và từ chối có lý do. Đọc bản ghi và audit sau mỗi quyết định. Trên trình duyệt, đối chiếu tổng hỗ trợ 2.500.000 ₫ ở đầu mục và 6,00 giờ trên lý lịch giảng viên trước khi thu hồi, sau đó kiểm lý do từ chối trên phiên giảng viên. [Kiểm tại DB](../../../apps/backend/test/db/activity-support.test.mjs) · [Kịch bản trình duyệt](../../../e2e/teaching-hour/teaching-hours/acceptance.ts)
