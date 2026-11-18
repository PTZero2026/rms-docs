---
story: US-03
feature: P01
review_id: RV-03
status: Draft
updated: 2026-11-18
---

# Căn cứ và quyết định · US-03

**Vấn đề.** Áp dụng quy chế mới cho hồ sơ nào?

**Khuyến nghị hiện dùng.** Chọn phiên bản đang hiệu lực khi tạo hồ sơ, giữ phiên bản của hồ sơ đã tồn tại.

**Lý do.** Trong trường hợp hồ sơ cũ còn một bước đang chờ khi v2 đã kích hoạt, người dùng cần thấy kết quả “bước kế tiếp lấy từ v1”. Phương án khác: Di trú cả đoàn hồ sơ sau một đợt chuyển đổi có phê duyệt riêng. Dùng TC-03 để phân biệt hai phương án. [RV-03](../review-decisions.md#rv-03)

**Tài liệu đối chiếu.** [P01](../../docs/features/P01-workflow-engine/spec.md) — AC-03, AC-05. Các tiêu chí sau dẫn lại từ tài liệu nguồn để DEV/QA thấy cả điều kiện đi kèm. Phần được giao giới hạn trong [spec](spec.md).

- **AC-03** (BR-04) — Given đề tài đang chạy trên template v1, When admin sửa graph thành v2, Then đề tài đó **vẫn** theo v1 tới khi kết thúc.

- **AC-05** (BR-06) — Given graph thiếu `statusSemantic` ở một bước hoặc có transition mồ côi, When kích hoạt template, Then bị từ chối kèm thông báo lỗi rõ.

**Nguồn làm việc.** [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md).
