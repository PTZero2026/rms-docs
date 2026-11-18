---
story: US-25
feature: F08
review_id: RV-25
status: Draft
updated: 2026-11-18
---

# Căn cứ và quyết định · US-25

**Vấn đề.** Nếu mẫu của tenant thay sau lần xuất thì dùng mẫu nào?

**Khuyến nghị hiện dùng.** Mỗi lần xuất mới dùng mẫu có hiệu lực và ghi nhận phiên bản đã sử dụng.

**Lý do.** Trong trường hợp một sản phẩm gắn qua hai vai trò và một sản phẩm đang chờ duyệt, người dùng cần thấy kết quả “chỉ có một dòng cho sản phẩm đã duyệt”. Phương án khác: Dùng mẫu cố định gắn vào cá nhân suốt vòng đời. Dùng TC-03 để phân biệt hai phương án. [RV-25](../review-decisions.md#rv-25)

**Tài liệu đối chiếu.** [F08](../../docs/features/F08-ly-lich-khoa-hoc/spec.md) — AC-09, AC-12, AC-13. Các tiêu chí sau dẫn lại từ tài liệu nguồn để DEV/QA thấy cả điều kiện đi kèm. Phần được giao giới hạn trong [spec](spec.md).

- **AC-09** (happy — lý lịch tổng hợp không trùng) — Given U là chủ nhiệm 2 đề tài và có 3 sản phẩm khoa học **đã duyệt**, When mở lý lịch khoa học của U, Then phần khoa học hiển thị đúng 2 vai trò đề tài và 3 sản phẩm, **lấy trực tiếp** từ dữ liệu hệ thống, không có ô nhập tay (BR-07).

- **AC-12** (quyền — ngoài phạm vi) — Given người dùng K **không** có quyền xem hồ sơ người khác, When K cố mở hồ sơ của U, Then hệ thống **từ chối ở máy chủ** dù giao diện có ẩn nút (BR-09).

- **AC-13** (happy — trích xuất theo mẫu) — Given tenant T có mẫu lý lịch riêng, When người dùng trích xuất lý lịch của U, Then hệ thống đổ dữ liệu lý lịch vào **mẫu của T** và xuất bản tài liệu để in/ký, đồng thời ghi nhật ký *trích xuất lý lịch* (BR-08, BR-10).

**Nguồn làm việc.** [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md). [design.md](../../docs/features/F08-ly-lich-khoa-hoc/design.md) · [test-plan.md](../../docs/features/F08-ly-lich-khoa-hoc/test-plan.md) · [ui.md](../../docs/features/F08-ly-lich-khoa-hoc/ui.md)
