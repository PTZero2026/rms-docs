---
title: "Thiết kế F04 · progress"
owner: "SA / BE"
status: Review
updated: 2026-11-24
---

# Quản lý tiến độ · thiết kế triển khai

| Business rules | Tiêu chí | Cách hiện thực |
|---|---|---|
| BR-01, BR-13, BR-14, BR-15 | AC-01, AC-14, AC-15 | Khóa đề tài APPROVED, kiểm file căn cứ còn quyền, ngày và approvedBudget, tạo duy nhất một assignment hiệu lực. Chụp cam kết theo loại trước khi gọi P01. |
| BR-02, BR-06, BR-07, BR-08, BR-09 | AC-02, AC-06, AC-08, AC-13 | Unique tenant/đề tài/kỳ. Ngày đến hạn dùng cho cả B04 và B06. Tạm dừng/tiếp tục qua P01 có lý do, giữ lịch ban đầu. Tính nhãn trễ tại thời điểm nộp hoặc tra cứu. |
| BR-03, BR-04, BR-05, BR-11, BR-12 | AC-03, AC-04, AC-05, AC-09, AC-10, AC-11 | Kiểm chủ nhiệm và IN_PROGRESS khi gửi. Chuyên viên duyệt hoặc yêu cầu sửa có nhận xét. Khóa báo cáo đạt, mở lại có lý do và audit. |
| BR-10 | AC-07, AC-12 | Dùng cùng phép kiểm kỳ cuối PASSED và đối chiếu từng loại cam kết từ F07 với F06. Đăng ký một lần qua P01, báo thiếu đúng loại/kỳ. |

Module `progress` kiểm tenant và phạm vi ở máy chủ. Hợp đồng API thuộc `packages/api-contracts/progress/`. N01 tạo workspace, T002 của từng lát định nghĩa operation và sinh type. [Đặc tả](spec.md) · [Ca kiểm](test-plan.md)

Các phiếu giao việc gồm [US-14](../../../specs/014-web-assign-project/tasks.md), [US-15](../../../specs/015-web-report-period/tasks.md), [US-17](../../../specs/017-web-submit-progress/tasks.md).
