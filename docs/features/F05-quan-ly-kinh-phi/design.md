---
title: "Thiết kế F05 · budget"
owner: "SA / BE"
status: Review
updated: 2026-11-24
---

# Quản lý kinh phí · thiết kế triển khai

| Business rules | Tiêu chí | Cách hiện thực |
|---|---|---|
| BR-08, BR-09, BR-10 | AC-01, AC-10, AC-11, AC-12 | Khi xác nhận cấp, khóa assignment và khoản cấp, kiểm quyền, tính phí theo tỷ lệ/trần hoặc override hợp lệ, lưu snapshot cấu hình, phí và phần thực hiện bằng VND nguyên. |
| BR-01, BR-02, BR-03, BR-04, BR-05 | AC-02, AC-03, AC-04, AC-06, AC-07, AC-08, AC-09 | Kiểm đề tài đang thực hiện và đúng scope trước ghi chi. Kiểm số tiền dương và quyền từng chứng từ, cập nhật tổng trong giao dịch. Trả số dư thực kể cả âm và cảnh báo khi vượt. |
| BR-06, BR-07, BR-09 | AC-05, AC-07, AC-09 | F05 khóa sổ từ PASSED. Đọc lại chế độ đối soát trong cùng giao dịch, yêu cầu xác nhận thủ công hoặc mọi khoản MATCHED. Gọi P01, khóa ghi và lưu audit, trả mã khoản còn vướng theo RV-24. |

Module `budget` kiểm tenant và phạm vi ở máy chủ. Hợp đồng API thuộc `packages/api-contracts/budget/`. N01 tạo workspace, T002 của từng lát định nghĩa operation và sinh type. [Đặc tả](spec.md) · [Ca kiểm](test-plan.md)

Các phiếu giao việc gồm [US-18](../../../specs/018-shared-budget-allocation/tasks.md), [US-19](../../../specs/019-web-record-expense/tasks.md), [US-24](../../../specs/024-shared-close-project/tasks.md).
