---
id: US-32
feature: F07
epic: E3
channel: web
wave: C
status: Draft
updated: 2026-11-18
---

# Lập thẻ đọc cho một tài liệu có DOI

**Đầu vào** · [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md), US-32, cỡ M. **Nguồn nghiệp vụ** · [F07](../../docs/features/F07-san-pham-khoa-hoc/spec.md) — Đề xuất mới, chờ PO/BA xác lập AC nghiệp vụ. Các AC dưới đây có phạm vi riêng của US-32.

## Clarifications

### Session 2026-11-18

- Q: DOI hợp lệ nhưng chỉ có metadata thì được điền phần nào? → A: Chỉ điền thông tin thư mục, đánh dấu phần phương pháp và kết quả thiếu nguồn; người dùng kiểm trước khi dùng. [RV-32](../review-decisions.md#rv-32). Khuyến nghị dùng để lập kế hoạch, chờ Nhà nghiên cứu, thư viện và chủ dữ liệu xác nhận.

## User Scenarios & Testing

### User Story 1 — Lập thẻ đọc cho một tài liệu có DOI (P1)

Nhà nghiên cứu tạo bản nháp thẻ đọc có trích dẫn để chuẩn bị tổng quan và tự quyết định có dùng hay không.

**Giá trị và phép thử độc lập.** Chuẩn bị một DOI đã xác minh, một bản toàn văn được phép dùng và một trường hợp chỉ có metadata. Thực hiện thao tác bằng đúng vai trò và kiểm đầu ra sau khi mở lại. Lát này thuộc đợt C.

- **AC-01** (US-32.1) — Given bài có đoạn phương pháp. When lập thẻ. Then trường phương pháp có dẫn trang hoặc đoạn để người đọc kiểm lại.
- **AC-02** (US-32.2) — Given chỉ có metadata. When lập thẻ. Then chỉ điền thư mục, đánh dấu thiếu căn cứ cho nội dung bài.

- **AC-03** (US-32.3, khuyến nghị) — Given Tài liệu có DOI nhưng quyền dùng toàn văn đã hết. When lập lại thẻ đọc. Then chỉ còn dữ liệu thư mục được phép, phần nội dung chờ bổ sung nguồn.

### Edge Cases

Chỉ có metadata → chỉ điền thư mục, đánh dấu thiếu căn cứ cho nội dung bài.

## Requirements

### Functional Requirements

- **BR-01 / FR-001.** Khi bài có đoạn phương pháp, người có quyền có thể lập thẻ. Kết quả phải quan sát được: trường phương pháp có dẫn trang hoặc đoạn để người đọc kiểm lại (AC-01).
- **BR-02 / FR-002.** Với tình huống chỉ có metadata, thao tác lập thẻ phải cho kết quả chỉ điền thư mục, đánh dấu thiếu căn cứ cho nội dung bài (AC-02).

- **BR-03 / FR-003 (đề xuất).** Chỉ điền thông tin thư mục, đánh dấu phần phương pháp và kết quả thiếu nguồn; người dùng kiểm trước khi dùng. Kiểm bằng AC-03.

### Key Entities

Đầu vào nghiệp vụ: DOI, metadata xác minh, toàn văn có quyền sử dụng nếu có. Đầu ra cần đối chiếu: Thẻ đọc nháp, nguồn từng trường và các mục thiếu căn cứ.

## Success Criteria

- **SC-001.** Hai tình huống gốc của US-32 đúng 2/2 khi chạy riêng bằng bộ dữ liệu trên.
- **SC-002.** Trong bộ thử hai tổ chức, 0 hồ sơ ngoài phạm vi xuất hiện trong kết quả hoặc được thay đổi bởi người của tổ chức kia.

## Assumptions

Chỉ bật trợ lý cho tenant và nguồn đã được phép. Phụ thuộc F07, B03, P02. Phạm vi chỉ gồm kết quả của user story này. Có thể thương lượng trường ghi chú của thẻ đọc.
