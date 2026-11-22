---
story: US-25
feature: F08
review_id: RV-25
status: Draft
updated: 2026-11-21
---

# Căn cứ và quyết định · US-25

**Vấn đề.** Nếu mẫu của tenant thay sau lần xuất thì dùng mẫu nào?

**Quyết định ngày 21/11/2026.** Mỗi lần xuất dùng phiên bản mẫu của trường đang có hiệu lực tại thời điểm xuất. Nhật ký `EXPORT_CV` của lần đó ghi mã mẫu và phiên bản thực tế đã dùng.

**Lý do.** Trường có thể thay phiên bản mẫu giữa hai lần xuất cùng lý lịch. Người dùng cần bản in theo mẫu có hiệu lực mỗi lần, và phòng tổ chức cần tra được mẫu thực tế đã dùng. Phương án khác: Dùng mẫu cố định gắn vào cá nhân suốt vòng đời. Dùng TC-03 để phân biệt hai phương án. [RV-25](../review-decisions.md#rv-25)

**Tài liệu đối chiếu.** [F08](../../docs/features/F08-ly-lich-khoa-hoc/spec.md) — AC-09, AC-12, AC-13. Các tiêu chí sau dẫn lại từ tài liệu nguồn để DEV/QA thấy cả điều kiện đi kèm. Phần được giao giới hạn trong [spec](spec.md).

- **AC-09** (happy — lý lịch tổng hợp không trùng) — Given U là chủ nhiệm 2 đề tài và có 3 sản phẩm khoa học **đã duyệt**, When mở lý lịch khoa học của U, Then phần khoa học hiển thị đúng 2 vai trò đề tài và 3 sản phẩm, **lấy trực tiếp** từ dữ liệu hệ thống, không có ô nhập tay (BR-07).

- **AC-12** (quyền — ngoài phạm vi) — Given người dùng K **không** có quyền xem hồ sơ người khác, When K cố mở hồ sơ của U, Then hệ thống **từ chối ở máy chủ** dù giao diện có ẩn nút (BR-09).

- **AC-13** (happy — trích xuất theo mẫu) — Given tenant T có mẫu lý lịch riêng, When người dùng trích xuất lý lịch của U, Then hệ thống đổ dữ liệu lý lịch vào **mẫu của T** và xuất bản tài liệu để in/ký, đồng thời ghi mã và phiên bản mẫu thực tế vào `EXPORT_CV` (BR-08, BR-10).

**Nguồn làm việc.** [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md). [design.md](../../docs/features/F08-ly-lich-khoa-hoc/design.md) · [test-plan.md](../../docs/features/F08-ly-lich-khoa-hoc/test-plan.md) · [ui.md](../../docs/features/F08-ly-lich-khoa-hoc/ui.md)
