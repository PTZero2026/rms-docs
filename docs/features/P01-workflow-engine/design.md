---
title: "Thiết kế P01 · workflow"
owner: "SA / BE"
status: Review
updated: 2026-11-24
---

# Workflow engine (vòng đời ResearchProject) · thiết kế triển khai

| Business rules | Tiêu chí | Cách hiện thực |
|---|---|---|
| BR-01, BR-02, BR-03, BR-06, BR-09 | AC-01, AC-02, AC-05, AC-08 | Kernel cho ResearchProject chọn cạnh từ graph đã duyệt, tra guard/effect từ catalog miền. Validate một bước đầu, đích reachable, cạnh và semantic trước khi kích hoạt. Guard thất bại giữ nguyên trạng thái và outbox. |
| BR-04, BR-05, BR-08 | AC-03, AC-04, AC-07 | Ghim version lúc tạo. Đọc quyền RMS, scope đối tượng và lý do theo cạnh ở cùng lần xử lý. Kích hoạt phiên bản mới chỉ thay con trỏ dùng khi tạo hồ sơ. |
| BR-07 | AC-06 | Compare-and-swap phiên bản đề tài, cập nhật bước, append history/audit và outbox trong một transaction. Chỉ worker sau commit được phát thông báo. |

Module `workflow` kiểm tenant và phạm vi ở máy chủ. Hợp đồng API thuộc `packages/api-contracts/workflow/`. N01 tạo workspace, T002 của từng lát định nghĩa operation và sinh type. [Đặc tả](spec.md) · [Ca kiểm](test-plan.md)

Các phiếu giao việc gồm [US-03](../../../specs/003-shared-workflow-version/tasks.md).
