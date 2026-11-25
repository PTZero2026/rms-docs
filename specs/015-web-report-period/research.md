---
story: US-15
feature: F04
review_id: RV-15
status: Draft
updated: 2026-11-24
---

# Căn cứ và quyết định · US-15

**Vấn đề.** Hai đề tài có được dùng cùng mã kỳ không?

**Quyết định triển khai.** Áp khóa theo cặp đề tài và kỳ, cho hai đề tài khác nhau dùng cùng tên kỳ.

**Lý do.** Trong trường hợp hai đề tài đang thực hiện cùng chưa có kỳ 1, người dùng cần thấy kết quả “mỗi đề tài có một báo cáo chờ riêng”. Phương án khác: Đặt mã kỳ duy nhất toàn trường. Dùng TC-03 để phân biệt hai phương án. [RV-15](../review-decisions.md#rv-15)

**Tài liệu đối chiếu.** [F04](../../docs/features/F04-quan-ly-tien-do/spec.md) — AC-02, AC-13. Các tiêu chí sau dẫn lại từ tài liệu nguồn để DEV/QA thấy cả điều kiện đi kèm. Phần được giao giới hạn trong [spec](spec.md).

- **AC-02 (Happy — lập lịch kỳ báo cáo)** — Given đề tài `IN_PROGRESS`; When chuyên viên tạo các kỳ báo cáo với `period` và `dueDate`; Then hệ thống tạo các `ProgressReport` trạng thái `PENDING_SUBMISSION`, mỗi đề tài mỗi `period` chỉ một bản ghi (BR-07).

- **AC-13 (Negative — lập kỳ sai trạng thái / trùng kỳ)** — Given đề tài không ở `IN_PROGRESS` (vd `APPROVED` hoặc `SUSPENDED`), hoặc đã có báo cáo cùng `period`; When chuyên viên lập kỳ báo cáo; Then hệ thống chặn (BR-02, BR-07).

**Nguồn làm việc.** [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md). [test-plan.md](../../docs/features/F04-quan-ly-tien-do/test-plan.md) · [ui.md](../../docs/features/F04-quan-ly-tien-do/ui.md)
