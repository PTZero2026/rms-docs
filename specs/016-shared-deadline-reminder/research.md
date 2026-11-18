---
story: US-16
feature: B04
review_id: RV-16
status: Draft
updated: 2026-11-18
---

# Căn cứ và quyết định · US-16

**Vấn đề.** Chạy lại sau lỗi gửi email có tạo thông báo nghiệp vụ thứ hai?

**Khuyến nghị hiện dùng.** Dùng một khóa theo tenant, đề tài, kỳ, người nhận và mốc; thử lại việc giao trên cùng thông báo.

**Lý do.** Trong trường hợp thông báo trong ứng dụng đã có nhưng kênh email lỗi, người dùng cần thấy kết quả “vẫn một thông báo và theo dõi được lần gửi lại”. Phương án khác: Tạo thông báo mới cho mỗi lần thử gửi. Dùng TC-03 để phân biệt hai phương án. [RV-16](../review-decisions.md#rv-16)

**Tài liệu đối chiếu.** [B04](../../docs/features/B04-thong-bao/spec.md) — AC-07. Các tiêu chí sau dẫn lại từ tài liệu nguồn để DEV/QA thấy cả điều kiện đi kèm. Phần được giao giới hạn trong [spec](spec.md).

- **AC-07** — Given job nhắc hạn chạy và một báo cáo tiến độ còn `N` ngày tới hạn đúng ngưỡng cấu hình ở B01, When job xử lý, Then phát `PROGRESS_REPORT_DUE_SOON` cho chủ nhiệm; When job chạy lại cùng mốc, Then **không** tạo thông báo trùng cho cùng (đề tài × kỳ × mốc) (BR-07).

**Nguồn làm việc.** [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md). [test-plan.md](../../docs/features/B04-thong-bao/test-plan.md) · [ui.md](../../docs/features/B04-thong-bao/ui.md)
