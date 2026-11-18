---
story: US-04
feature: P02
review_id: RV-04
status: Draft
updated: 2026-11-18
---

# Căn cứ và quyết định · US-04

**Vấn đề.** Nếu chuyên viên đổi khoa sau khi chuyển bước, ai xem được lịch sử?

**Khuyến nghị hiện dùng.** Kiểm quyền trên đề tài ở lúc đọc, giữ nguyên tác nhân và đơn vị của sự kiện gốc.

**Lý do.** Trong trường hợp chuyên viên vừa mất quyền đề tài nhưng còn liên kết cũ, người dùng cần thấy kết quả “không lộ nội dung hoặc tên hồ sơ”. Phương án khác: Cấp quyền theo đơn vị của người đã tạo sự kiện. Dùng TC-03 để phân biệt hai phương án. [RV-04](../review-decisions.md#rv-04)

**Tài liệu đối chiếu.** [P02](../../docs/features/P02-audit/spec.md) — AC-01, AC-02, AC-05. Các tiêu chí sau dẫn lại từ tài liệu nguồn để DEV/QA thấy cả điều kiện đi kèm. Phần được giao giới hạn trong [spec](spec.md).

- **AC-01** (BR-01) — Given một thao tác đổi trạng thái nghiệp vụ (vd duyệt đề xuất), When hoàn tất, Then có một bản ghi `AuditLog` tương ứng.

- **AC-02** (BR-02) — Given một bản ghi `AuditLog`, When cố sửa hoặc xoá, Then bị từ chối.

- **AC-05** (BR-06) — Given người dùng không đủ quyền hoặc khác tenant, When xem nhật ký, Then không thấy bản ghi ngoài phạm vi được phép.

**Nguồn làm việc.** [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md).
