---
story: US-17
feature: F04
review_id: RV-17
status: Draft
updated: 2026-11-18
---

# Căn cứ và quyết định · US-17

**Vấn đề.** Có chặn báo cáo quá hạn nếu đề tài vẫn đang thực hiện?

**Khuyến nghị hiện dùng.** Nhận hồ sơ, ghi giờ và nhãn trễ, chặn khi đề tài tạm dừng.

**Lý do.** Trong trường hợp báo cáo đến đúng hạn trong khi đề tài đang thực hiện, người dùng cần thấy kết quả “ghi nhận đúng hạn và chuyển chờ duyệt”. Phương án khác: Đóng biểu mẫu ngay khi hết hạn. Dùng TC-03 để phân biệt hai phương án. [RV-17](../review-decisions.md#rv-17)

**Tài liệu đối chiếu.** [F04](../../docs/features/F04-quan-ly-tien-do/spec.md) — AC-03, AC-08, AC-09. Các tiêu chí sau dẫn lại từ tài liệu nguồn để DEV/QA thấy cả điều kiện đi kèm. Phần được giao giới hạn trong [spec](spec.md).

- **AC-03 (Happy — nộp báo cáo)** — Given kỳ báo cáo `PENDING_SUBMISSION` của đề tài đang `IN_PROGRESS`; When chủ nhiệm nhập `content`, đính kèm tài liệu và nộp; Then `ProgressReport` chuyển `SUBMITTED`, ghi `submittedAt`, chuyên viên nhận thông báo có báo cáo chờ duyệt.

- **AC-08 (Biên — nộp trễ hạn)** — Given kỳ báo cáo `PENDING_SUBMISSION` đã quá `dueDate`; When chủ nhiệm nộp; Then hệ thống vẫn nhận (`SUBMITTED`) nhưng đánh dấu báo cáo **trễ hạn** (BR-09).

- **AC-09 (Negative — nộp khi tạm dừng)** — Given đề tài đang `SUSPENDED`; When chủ nhiệm cố nộp/nộp lại báo cáo; Then hệ thống chặn, báo "đề tài đang tạm dừng" (BR-04).

**Nguồn làm việc.** [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md). [test-plan.md](../../docs/features/F04-quan-ly-tien-do/test-plan.md) · [ui.md](../../docs/features/F04-quan-ly-tien-do/ui.md)
