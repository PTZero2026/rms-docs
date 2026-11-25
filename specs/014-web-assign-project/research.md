---
story: US-14
feature: F04
review_id: RV-14
status: Draft
updated: 2026-11-24
---

# Căn cứ và quyết định · US-14

**Vấn đề.** Chuyên viên có thể giao khi mới có số quyết định nhưng chưa có bản đính kèm?

**Quyết định triển khai.** Yêu cầu tệp căn cứ đọc được theo phạm vi đề tài trước khi xác nhận giao.

**Lý do.** Trong trường hợp thiếu tệp căn cứ dù đã nhập số quyết định, người dùng cần thấy kết quả “nêu mục tệp thiếu, giữ APPROVED”. Phương án khác: Cho giao trước rồi yêu cầu đính tệp bổ sung sau. Dùng TC-03 để phân biệt hai phương án. [RV-14](../review-decisions.md#rv-14)

**Tài liệu đối chiếu.** [F04](../../docs/features/F04-quan-ly-tien-do/spec.md) — AC-01, AC-14. Các tiêu chí sau dẫn lại từ tài liệu nguồn để DEV/QA thấy cả điều kiện đi kèm. Phần được giao giới hạn trong [spec](spec.md).

- **AC-01 (Happy — giao đề tài)** — Given một đề tài ở trạng thái `APPROVED`; When chuyên viên lập hồ sơ `ProjectAssignment` đủ căn cứ và xác nhận giao đề tài; Then `ProjectAssignment` chuyển `EFFECTIVE`, `ResearchProject` chuyển `IN_PROGRESS`, chủ nhiệm nhận thông báo, có audit.

- **AC-14 (Negative — giao đề tài thiếu căn cứ)** — Given đề tài `APPROVED`; When chuyên viên xác nhận giao đề tài nhưng thiếu số hợp đồng/quyết định, ngày hiệu lực, khoảng thời gian, `approvedBudget` hoặc file căn cứ; Then hệ thống chặn, giữ `ResearchProject=APPROVED`, nêu rõ trường còn thiếu (BR-13).

**Nguồn làm việc.** [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md). [test-plan.md](../../docs/features/F04-quan-ly-tien-do/test-plan.md) · [ui.md](../../docs/features/F04-quan-ly-tien-do/ui.md)
