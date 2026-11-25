---
title: "Thiết kế B01 · catalog"
owner: "SA / BE"
status: Review
updated: 2026-11-25
---

# Danh mục & cấu hình (sys-config-service) · thiết kế triển khai

| Business rules | Tiêu chí | Cách hiện thực |
|---|---|---|
| BR-01, BR-02, BR-03, BR-11, BR-12 | AC-01, AC-02, AC-03, AC-04, AC-07, AC-13 | B01 xác minh issuer và audience, hỏi IAM trước cả đọc cache. Tenant admin ghi trong tenant hiện hành. Quyền vận hành shared chỉ ghi scope chung. Khóa duy nhất gồm scope và key lowercase, kể cả scope NULL. |
| BR-04, BR-10 | AC-02, AC-05, AC-06, AC-12 | Mỗi lần đọc phân giải bản riêng rồi shared trong DB. Namespace Redis theo tenant đang đọc hoặc quyền vận hành shared. Chỉ dùng bytes có cùng revision với bản hiệu lực. Xóa override đưa tenant về shared. Khi Redis lỗi đọc DB. [Đối chiếu hai tiến trình B01](../../../e2e/catalog/config-override/replicas.ts) |
| BR-05, BR-06, BR-07, BR-08, BR-09 | AC-08, AC-09, AC-10, AC-11 | Kiểm key, content, giới hạn 20 MiB và schema key đã đăng ký trước khi ghi. Tôn trọng MIME khai báo, dò MIME/encoding khi thiếu. Dry-run chỉ trả metadata. Chỉ cache JSON/text tối đa 1 MiB. Metadata audit ghi nguyên tử trong DB của B01. |

Module `catalog` kiểm tenant và phạm vi ở máy chủ. Hợp đồng API thuộc `packages/api-contracts/catalog/`. N01 tạo workspace, T002 của từng lát định nghĩa operation và sinh type. Adapter catalog gọi sys-config-service cho blob. Danh mục quan hệ cần FK thuộc DB nghiệp vụ. [Đặc tả](spec.md) · [Ca kiểm](test-plan.md)

Các phiếu giao việc gồm [US-02](../../../specs/002-shared-config-override/tasks.md).
