---
story: US-30
feature: P03
review_id: RV-30
status: Draft
updated: 2026-11-21
---

# Căn cứ và quyết định · US-30

**Vấn đề.** Xử lý sự kiện cũ được gửi lại sau khi đổi định mức thế nào?

**Quyết định ngày 21/11/2026.** Dùng định mức có hiệu lực vào ngày nghiệp vụ của hoạt động nguồn. Khi nhận lại cùng sự kiện đã ghi, giữ nguyên số giờ, kỳ và phân bổ ban đầu. Người có quyền sửa sai bằng bản ghi điều chỉnh có lý do và ghi nhật ký.

**Lý do.** Trong trường hợp sự kiện tháng trước được gửi lại sau ngày công thức mới có hiệu lực, người dùng cần thấy kết quả “giữ số giờ theo công thức cũ, không có dòng trùng”. Phương án khác: Tính lại bằng hệ số hiện hành mỗi lần đồng bộ. Dùng TC-03 để phân biệt hai phương án. [RV-30](../review-decisions.md#rv-30)

**Tài liệu đối chiếu.** [P03](../../docs/features/P03-quy-doi-gio-giang/spec.md) — AC-01, AC-05, AC-06, AC-08. Các tiêu chí sau dẫn lại từ tài liệu nguồn để DEV/QA thấy cả điều kiện đi kèm. Phần được giao giới hạn trong [spec](spec.md).

- **AC-01** *(BR-01,03)* — Given có công thức đang hiệu lực cho loại hoạt động X, When một sự kiện loại X được ghi nhận hợp lệ, Then hệ thống tính đúng số giờ theo công thức hiệu lực tại `sourceOccurredAt`.

- **AC-05** *(BR-06,08)* — Given một sự kiện đã được quy đổi, When nhận lại sau khi đổi định mức, Then giữ số giờ, kỳ, phiên bản công thức và phân bổ từng người.

- **AC-06, AC-08** — Người có quyền sửa sai bằng bản ghi điều chỉnh, ghi lý do và nhật ký.

**Nguồn làm việc.** [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md). [design.md](../../docs/features/P03-quy-doi-gio-giang/design.md) · [test-plan.md](../../docs/features/P03-quy-doi-gio-giang/test-plan.md) · [ui.md](../../docs/features/P03-quy-doi-gio-giang/ui.md)
