---
title: "Thiết kế P02 · audit"
owner: "SA / BE"
status: Review
updated: 2026-11-24
---

# Audit (nhật ký hành động nghiệp vụ) · thiết kế triển khai

| Business rules | Tiêu chí | Cách hiện thực |
|---|---|---|
| BR-01, BR-02, BR-03, BR-05 | AC-01, AC-02, AC-03 | Port ghi audit nhận transaction của lệnh nguồn. Runtime được insert/select theo policy, migration dùng role riêng. Khi lỗi ghi, rollback cả nghiệp vụ. Log kỹ thuật và event giao việc có vòng đời riêng. |
| BR-04, BR-06, BR-07 | AC-04, AC-05 | Ghi tenant, action, entity, actorType/id, onBehalfOf, đơn vị actor lúc thao tác, trước/sau và thời điểm UTC. Truy vấn theo scope hiện tại trên hồ sơ nguồn, kể cả khi tra bằng link cũ. |

Module `audit` kiểm tenant và phạm vi ở máy chủ. Hợp đồng API thuộc `packages/api-contracts/audit/`. N01 tạo workspace, T002 của từng lát định nghĩa operation và sinh type. [Đặc tả](spec.md) · [Ca kiểm](test-plan.md)

Các phiếu giao việc gồm [US-04](../../../specs/004-shared-audit-trail/tasks.md).
