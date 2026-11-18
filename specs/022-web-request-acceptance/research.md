---
story: US-22
feature: F06
review_id: RV-22
status: Draft
updated: 2026-11-18
---

# Căn cứ và quyết định · US-22

**Vấn đề.** Cùng đủ số lượng tổng nhưng thiếu một loại sản phẩm thì có được nghiệm thu?

**Khuyến nghị hiện dùng.** Kiểm từng loại cam kết tại lúc nộp cùng kết quả kỳ cuối.

**Lý do.** Trong trường hợp cam kết một bài và một sáng chế, đã duyệt hai bài, người dùng cần thấy kết quả “nêu thiếu sáng chế và giữ IN_PROGRESS”. Phương án khác: Cho bù thừa loại này sang loại khác theo tổng đầu ra. Dùng TC-03 để phân biệt hai phương án. [RV-22](../review-decisions.md#rv-22)

**Tài liệu đối chiếu.** [F06](../../docs/features/F06-nghiem-thu/spec.md) — AC-01, AC-07. Các tiêu chí sau dẫn lại từ tài liệu nguồn để DEV/QA thấy cả điều kiện đi kèm. Phần được giao giới hạn trong [spec](spec.md).

- **AC-01 (Happy — đăng ký nghiệm thu)** — Given đề tài `IN_PROGRESS` có kỳ báo cáo cuối `PASSED` và đủ sản phẩm cam kết `APPROVED`; When chủ nhiệm đăng ký nghiệm thu và nộp hồ sơ cuối; Then `ResearchProject` chuyển `PENDING_ACCEPTANCE`, chuyên viên nhận thông báo, ghi audit.

- **AC-07 (Negative — chưa đủ điều kiện nghiệm thu)** — Given đề tài `IN_PROGRESS` chưa có kỳ cuối `PASSED` hoặc thiếu sản phẩm cam kết; When chủ nhiệm đăng ký nghiệm thu; Then chặn, nêu điều kiện thiếu, giữ `IN_PROGRESS` (BR-01).

**Nguồn làm việc.** [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md). [test-plan.md](../../docs/features/F06-nghiem-thu/test-plan.md) · [ui.md](../../docs/features/F06-nghiem-thu/ui.md)
