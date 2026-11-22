---
story: US-03
feature: P01
review_id: RV-03
status: Draft
updated: 2026-11-21
---

# Căn cứ và quyết định · US-03

**Vấn đề.** Áp dụng quy chế mới cho hồ sơ nào?

**Quyết định ngày 21/11/2026.** Mỗi hồ sơ dùng phiên bản quy trình có hiệu lực lúc tạo cho đến khi hoàn tất. Khi v2 có hiệu lực, hồ sơ đang chờ duyệt theo v1 tiếp tục chuyển bước theo v1. Hồ sơ tạo từ thời điểm đó dùng v2.

**Lý do.** Trong trường hợp hồ sơ cũ còn một bước đang chờ khi v2 đã kích hoạt, người dùng cần thấy kết quả “bước kế tiếp lấy từ v1”. Phương án khác: Di trú cả đoàn hồ sơ sau một đợt chuyển đổi có phê duyệt riêng. Dùng TC-03 để phân biệt hai phương án. [RV-03](../review-decisions.md#rv-03)

**Tài liệu đối chiếu.** [P01](../../docs/features/P01-workflow-engine/spec.md) — AC-03, AC-05. Các tiêu chí sau dẫn lại từ tài liệu nguồn để DEV/QA thấy cả điều kiện đi kèm. Phần được giao giới hạn trong [spec](spec.md).

- **AC-03** (BR-04) — Given hồ sơ X đang chờ duyệt theo v1, When v2 có hiệu lực và hồ sơ Y được tạo, Then X chuyển bước theo v1 đến khi hoàn tất, còn Y theo v2 từ lúc tạo.

- **AC-05** (BR-06) — Given graph thiếu `statusSemantic` ở một bước hoặc có transition mồ côi, When kích hoạt template, Then bị từ chối kèm thông báo lỗi rõ.

**Nguồn làm việc.** [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md).
