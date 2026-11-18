---
story: US-19
feature: F05
review_id: RV-19
status: Draft
updated: 2026-11-18
---

# Căn cứ và quyết định · US-19

**Vấn đề.** Khoản chi vượt mức thực hiện xử lý thế nào?

**Khuyến nghị hiện dùng.** Lưu khoản hợp lệ, hiển thị số vượt và số dư mới, để chuyên viên rà khi đóng.

**Lý do.** Trong trường hợp còn 2 triệu, khoản chi đúng 2 triệu đồng, người dùng cần thấy kết quả “số dư bằng 0 và không cảnh báo vượt”. Phương án khác: Chặn mọi khoản vượt số còn lại. Dùng TC-03 để phân biệt hai phương án. [RV-19](../review-decisions.md#rv-19)

**Tài liệu đối chiếu.** [F05](../../docs/features/F05-quan-ly-kinh-phi/spec.md) — AC-02, AC-04, AC-06. Các tiêu chí sau dẫn lại từ tài liệu nguồn để DEV/QA thấy cả điều kiện đi kèm. Phần được giao giới hạn trong [spec](spec.md).

- **AC-02 (Happy — chủ nhiệm tạo khoản chi + chứng từ)** — Given đề tài `IN_PROGRESS` của chủ nhiệm; When chủ nhiệm tạo một khoản chi với `amount` > 0, mô tả, ngày chi và đính kèm chứng từ; Then khoản chi được lưu, chứng từ gắn vào khoản chi, cập nhật tổng đã chi & còn lại, ghi audit (BR-04, BR-05).

- **AC-04 (Biên — vượt kinh phí thực hiện)** — Given tổng đã chi sắp vượt **kinh phí thực hiện** (= cấp − phí quản lý); When chủ nhiệm tạo khoản chi làm tổng chi vượt mức thực hiện; Then hệ thống **vẫn lưu** khoản chi và hiển thị **cảnh báo vượt kinh phí** (BR-03).

- **AC-06 (Negative — số tiền không hợp lệ)** — Given nhập `amount` ≤ 0 hoặc không phải số nguyên; When lưu khoản chi hoặc xác nhận cấp kinh phí; Then hệ thống báo lỗi validate, không lưu (BR-02).

**Nguồn làm việc.** [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md). [test-plan.md](../../docs/features/F05-quan-ly-kinh-phi/test-plan.md) · [ui.md](../../docs/features/F05-quan-ly-kinh-phi/ui.md)
