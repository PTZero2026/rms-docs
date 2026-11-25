---
story: US-29
feature: F12
review_id: RV-29
status: Draft
updated: 2026-11-24
---

# Căn cứ và quyết định · US-29

**Vấn đề.** Dùng quy tắc chứng cứ của trường nào khi cùng loại hội nghị?

**Quyết định triển khai.** Lấy bộ minh chứng của tenant và loại hoạt động tại bước gửi, nêu từng mục thiếu.

**Lý do.** Trong trường hợp hai trường yêu cầu minh chứng khác nhau cho cùng một hội nghị, người dùng cần thấy kết quả “chỉ kiểm bộ minh chứng của A”. Phương án khác: Áp một bộ bắt buộc chung cho mọi trường. Dùng TC-03 để phân biệt hai phương án. [RV-29](../review-decisions.md#rv-29)

**Tài liệu đối chiếu.** [F12](../../docs/features/F12-hoat-dong-khoa-hoc/spec.md) — AC-01, AC-02. Các tiêu chí sau dẫn lại từ tài liệu nguồn để DEV/QA thấy cả điều kiện đi kèm. Phần được giao giới hạn trong [spec](spec.md).

- **AC-01** *(BR-01)* — Given danh mục có loại `CONFERENCE`/`COMMUNITY`/`IP`, When GV kê khai, Then chọn được loại và form minh chứng tương ứng.

- **AC-02** *(BR-02)* — Given thiếu minh chứng bắt buộc, When gửi duyệt, Then bị chặn.

**Nguồn làm việc.** [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md). [test-plan.md](../../docs/features/F12-hoat-dong-khoa-hoc/test-plan.md) · [ui.md](../../docs/features/F12-hoat-dong-khoa-hoc/ui.md)
