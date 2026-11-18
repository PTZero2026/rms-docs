---
story: US-01
feature: B03
review_id: RV-01
status: Draft
updated: 2026-11-18
---

# Căn cứ và quyết định · US-01

**Vấn đề.** Có chờ hết phiên khi nhân sự rời trường?

**Khuyến nghị hiện dùng.** Kiểm trạng thái tại yêu cầu nghiệp vụ kế tiếp, kể cả phiên đã mở.

**Lý do.** Trong trường hợp người vừa bị khóa còn một phiên mở, người dùng cần thấy kết quả “bị từ chối, dữ liệu lịch sử còn nguyên”. Phương án khác: Chờ phiên tự hết hạn để giảm lượt kiểm tra. Dùng TC-03 để phân biệt hai phương án. [RV-01](../review-decisions.md#rv-01)

**Tài liệu đối chiếu.** [B03](../../docs/features/B03-quan-ly-nguoi-dung/spec.md) — AC-09, AC-12. Các tiêu chí sau dẫn lại từ tài liệu nguồn để DEV/QA thấy cả điều kiện đi kèm. Phần được giao giới hạn trong [spec](spec.md).

- **AC-09** (lỗi — quyền không đủ) — Given user `userType=user` (chỉ có `meetings.view`), When gọi `POST /admin/users`, Then RolesGuard trả 403 dù giao diện có ẩn nút (BR-08).

- **AC-12** (happy — lock/unlock) — Given user U `isActive=true`, When admin `POST /admin/users/{U.id}/lock`, Then 200 + U có `isActive=false`, ghi `ACCOUNT_LOCKED`. When admin `POST /.../unlock`, Then U trở lại `isActive=true` và ghi `ACCOUNT_UNLOCKED`.

**Nguồn làm việc.** [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md). [design.md](../../docs/features/B03-quan-ly-nguoi-dung/design.md) · [test-plan.md](../../docs/features/B03-quan-ly-nguoi-dung/test-plan.md) · [ui.md](../../docs/features/B03-quan-ly-nguoi-dung/ui.md)
