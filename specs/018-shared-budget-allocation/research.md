---
story: US-18
feature: F05
review_id: RV-18
status: Draft
updated: 2026-11-24
---

# Căn cứ và quyết định · US-18

**Vấn đề.** Khi tỷ lệ cho kết quả cao hơn trần, lấy số nào?

**Quyết định triển khai.** Dùng mức trần trước khi tính phần được dùng, lưu giá trị đã áp dụng để tra lại.

**Lý do.** Trong trường hợp cấp 300 triệu, tỷ lệ 5%, trần 10 triệu, không điều chỉnh riêng, người dùng cần thấy kết quả “phí 10 triệu và phần thực hiện 290 triệu”. Phương án khác: Tính lại mọi hồ sơ cũ khi thay tỷ lệ của trường. Dùng TC-03 để phân biệt hai phương án. [RV-18](../review-decisions.md#rv-18)

**Tài liệu đối chiếu.** [F05](../../docs/features/F05-quan-ly-kinh-phi/spec.md) — AC-01, AC-07. Các tiêu chí sau dẫn lại từ tài liệu nguồn để DEV/QA thấy cả điều kiện đi kèm. Phần được giao giới hạn trong [spec](spec.md).

- **AC-01 (Happy — xác nhận cấp kinh phí + tách phí quản lý)** — Given một đề tài `IN_PROGRESS` đã có `ProjectAssignment.EFFECTIVE` với `approvedBudget` > 0 và cấu hình `managementFeeRate`; When chuyên viên xác nhận cấp kinh phí cho đề tài; Then hệ thống ghi nhận tổng kinh phí được cấp (≤ `approvedBudget`), tính `managementFeeAmount = min(floor(amount × rate), cap)` và kinh phí thực hiện = `amount − managementFeeAmount`, thông báo cho chủ nhiệm (B04) và ghi audit (BR-08, BR-10).

- **AC-07 (Negative — chủ nhiệm không được xác nhận cấp/quyết toán)** — Given người dùng là **Chủ nhiệm đề tài**; When gọi hành động xác nhận cấp kinh phí hoặc quyết toán/đóng đề tài; Then hệ thống trả 403, không thực hiện (BR-04).

**Nguồn làm việc.** [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md). [test-plan.md](../../docs/features/F05-quan-ly-kinh-phi/test-plan.md) · [ui.md](../../docs/features/F05-quan-ly-kinh-phi/ui.md)
