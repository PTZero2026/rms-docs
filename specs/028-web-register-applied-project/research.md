---
story: US-28
feature: F11
review_id: RV-28
status: Draft
updated: 2026-11-18
---

# Căn cứ và quyết định · US-28

**Vấn đề.** Cần đối tác ở lần lưu nháp hay ở lúc gửi duyệt?

**Khuyến nghị hiện dùng.** Yêu cầu đơn vị chủ trì khi lưu, kiểm ít nhất một đối tác ngoài tại lúc gửi duyệt.

**Lý do.** Trong trường hợp đã có viện chủ trì, đối tác và 50 triệu VND, người dùng cần thấy kết quả “đầu mục giữ 50 triệu, sổ chi đề tài F05 giữ nguyên”. Phương án khác: Chặn lưu nháp cho tới khi đã chọn đối tác. Dùng TC-03 để phân biệt hai phương án. [RV-28](../review-decisions.md#rv-28)

**Tài liệu đối chiếu.** [F11](../../docs/features/F11-du-an-phuc-vu-san-xuat/spec.md) — AC-01, AC-02, AC-03. Các tiêu chí sau dẫn lại từ tài liệu nguồn để DEV/QA thấy cả điều kiện đi kèm. Phần được giao giới hạn trong [spec](spec.md).

- **AC-01** *(BR-01)* — Given kê khai dự án, When lưu mà thiếu đơn vị/viện chủ trì, Then hệ thống chặn và yêu cầu chọn đơn vị/viện.

- **AC-02** *(BR-02)* — Given dự án phục vụ sản xuất, When gửi duyệt mà chưa có đối tác ngoài, Then hệ thống chặn và nêu rõ cần bổ sung đối tác/công ty liên kết.

- **AC-03** *(BR-03)* — Given nhập kinh phí dự án, When lưu, Then hệ thống lưu kinh phí tổng bằng VND ở mức đầu mục, không yêu cầu nhập dòng dự toán/giải ngân và không tạo tham chiếu sang F05.

**Nguồn làm việc.** [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md). [design.md](../../docs/features/F11-du-an-phuc-vu-san-xuat/design.md) · [test-plan.md](../../docs/features/F11-du-an-phuc-vu-san-xuat/test-plan.md) · [ui.md](../../docs/features/F11-du-an-phuc-vu-san-xuat/ui.md)
