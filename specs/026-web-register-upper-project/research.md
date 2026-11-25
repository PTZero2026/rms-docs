---
story: US-26
feature: F09
review_id: RV-26
status: Draft
updated: 2026-11-24
---

# Căn cứ và quyết định · US-26

**Vấn đề.** Căn cứ phê duyệt phải có ở lúc lưu nháp hay lúc duyệt?

**Quyết định triển khai.** Cho lưu thông tin ban đầu theo trường bắt buộc, kiểm loại minh chứng theo cấp ở bước duyệt.

**Lý do.** Trong trường hợp đầu mục cấp Bộ có tệp sai loại so với quy tắc DECISION, người dùng cần thấy kết quả “nêu đúng loại quyết định phải bổ sung”. Phương án khác: Yêu cầu mọi minh chứng ngay lần lưu nháp. Dùng TC-03 để phân biệt hai phương án. [RV-26](../review-decisions.md#rv-26)

**Tài liệu đối chiếu.** [F09](../../docs/features/F09-de-tai-cap-tren/spec.md) — AC-01, AC-02. Các tiêu chí sau dẫn lại từ tài liệu nguồn để DEV/QA thấy cả điều kiện đi kèm. Phần được giao giới hạn trong [spec](spec.md).

- **AC-01** *(BR-01)* — Given chuyên viên kê khai đề tài cấp Bộ, When lưu, Then đề tài được ghi nhận dạng **đầu mục** (không yêu cầu bước hội đồng/nghiệm thu nội bộ).

- **AC-02** *(BR-02)* — Given quy tắc minh chứng của cấp đề tài (vd cấp Bộ, giai đoạn duyệt kê khai) yêu cầu loại `DECISION`, When QLKH duyệt mà thiếu minh chứng loại đó, Then hệ thống **chặn** và nêu rõ loại còn thiếu.

**Nguồn làm việc.** [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md). [design.md](../../docs/features/F09-de-tai-cap-tren/design.md) · [test-plan.md](../../docs/features/F09-de-tai-cap-tren/test-plan.md) · [ui.md](../../docs/features/F09-de-tai-cap-tren/ui.md)
