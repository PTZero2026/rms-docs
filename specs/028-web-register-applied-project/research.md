---
story: US-28
feature: F11
review_id: RV-28
status: Draft
updated: 2026-11-21
---

# Căn cứ và quyết định · US-28

**Vấn đề.** Cần đối tác ở lần lưu nháp hay ở lúc gửi duyệt?

**Quyết định ngày 21/11/2026.** Phải có đơn vị chủ trì khi lưu nháp. Hồ sơ đủ các trường bắt buộc khác được lưu và mở lại dù chưa có đối tác ngoài. Khi gửi duyệt, nếu thiếu đối tác thì giữ Nháp và yêu cầu bổ sung. Khi đã có ít nhất một đối tác ngoài và đủ các điều kiện khác, chuyển sang Chờ duyệt.

**Lý do.** Viện cần lưu thông tin khi còn đang xác định đối tác và bổ sung đối tác trước khi chuyển hồ sơ cho phòng KHCN. Phương án khác: Chặn lưu nháp cho tới khi đã chọn đối tác. Dùng TC-03 để phân biệt hai phương án. [RV-28](../review-decisions.md#rv-28)

**Tài liệu đối chiếu.** [F11](../../docs/features/F11-du-an-phuc-vu-san-xuat/spec.md) — AC-01, AC-02, AC-03. Các tiêu chí sau dẫn lại từ tài liệu nguồn để DEV/QA thấy cả điều kiện đi kèm. Phần được giao giới hạn trong [spec](spec.md).

- **AC-01** *(BR-01)* — Given kê khai dự án, When lưu mà thiếu đơn vị/viện chủ trì, Then hệ thống chặn và yêu cầu chọn đơn vị/viện.

- **AC-02** *(BR-02)* — Hồ sơ có đơn vị chủ trì và đủ các trường khác được lưu nháp khi chưa có đối tác. Gửi lần đầu giữ Nháp và yêu cầu bổ sung. Thêm đối tác ngoài rồi gửi lại chuyển cùng hồ sơ sang Chờ duyệt.

- **AC-03** *(BR-03)* — Given nhập kinh phí dự án, When lưu, Then hệ thống lưu kinh phí tổng bằng VND ở mức đầu mục, không yêu cầu nhập dòng dự toán/giải ngân và không tạo tham chiếu sang F05.

**Nguồn làm việc.** [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md). [design.md](../../docs/features/F11-du-an-phuc-vu-san-xuat/design.md) · [test-plan.md](../../docs/features/F11-du-an-phuc-vu-san-xuat/test-plan.md) · [ui.md](../../docs/features/F11-du-an-phuc-vu-san-xuat/ui.md)
