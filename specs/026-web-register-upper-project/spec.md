---
id: US-26
feature: F09
epic: E4
channel: web
wave: C
status: Draft
updated: 2026-11-18
---

# Theo dõi đầu mục nhiệm vụ cấp trên

**Đầu vào** · [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md), US-26, cỡ S. **Nguồn nghiệp vụ** · [F09](../../docs/features/F09-de-tai-cap-tren/spec.md) — AC-01, AC-02. Các AC dưới đây có phạm vi riêng của US-26.

## Clarifications

### Session 2026-11-18

- Q: Căn cứ phê duyệt phải có ở lúc lưu nháp hay lúc duyệt? → A: Cho lưu thông tin ban đầu theo trường bắt buộc, kiểm loại minh chứng theo cấp ở bước duyệt. [RV-26](../review-decisions.md#rv-26). Khuyến nghị dùng để lập kế hoạch, chờ Phòng KHCN phụ trách nhiệm vụ cấp trên xác nhận.

## User Scenarios & Testing

### User Story 1 — Theo dõi đầu mục nhiệm vụ cấp trên (P1)

Chuyên viên ghi đầu mục cấp Bộ gắn với đơn vị chủ trì và căn cứ phê duyệt để tổng hợp danh mục.

**Giá trị và phép thử độc lập.** Chuẩn bị tenant bật F09, một loại nhiệm vụ và quy tắc minh chứng. Thực hiện thao tác bằng đúng vai trò và kiểm đầu ra sau khi mở lại. Lát này thuộc đợt C.

- **AC-01** (US-26.1) — Given đủ dữ liệu. When lưu. Then tra lại đầu mục đúng cấp và đơn vị.
- **AC-02** (US-26.2) — Given thiếu tệp bắt buộc ở bước duyệt. When gửi duyệt và QLKH kiểm tại bước duyệt. Then chặn và chỉ rõ chứng cứ thiếu.

- **AC-03** (US-26.3, khuyến nghị) — Given Đầu mục cấp Bộ có tệp sai loại so với quy tắc DECISION. When chuyên viên duyệt. Then nêu đúng loại quyết định phải bổ sung.

### Edge Cases

Thiếu tệp bắt buộc ở bước duyệt → chặn và chỉ rõ chứng cứ thiếu.

## Requirements

### Functional Requirements

- **BR-01 / FR-001.** Khi đủ dữ liệu, người có quyền có thể lưu. Kết quả phải quan sát được: tra lại đầu mục đúng cấp và đơn vị (AC-01).
- **BR-02 / FR-002.** Với tình huống thiếu tệp bắt buộc ở bước duyệt, thao tác gửi duyệt và QLKH kiểm tại bước duyệt phải cho kết quả chặn và chỉ rõ chứng cứ thiếu (AC-02).

- **BR-03 / FR-003 (đề xuất).** Cho lưu thông tin ban đầu theo trường bắt buộc, kiểm loại minh chứng theo cấp ở bước duyệt. Kiểm bằng AC-03.

### Key Entities

Đầu vào nghiệp vụ: Cấp nhiệm vụ, cơ quan quản lý, đơn vị thực hiện và tệp căn cứ. Đầu ra cần đối chiếu: Đầu mục tra được theo cấp và thông tin chứng cứ cần bổ sung.

## Success Criteria

- **SC-001.** Hai tình huống gốc của US-26 đúng 2/2 khi chạy riêng bằng bộ dữ liệu trên.
- **SC-002.** Trong bộ thử hai tổ chức, 0 hồ sơ ngoài phạm vi xuất hiện trong kết quả hoặc được thay đổi bởi người của tổ chức kia.

## Assumptions

Bật module E4 riêng theo tenant và quy chế đã chọn. Phụ thuộc F09, B01. Phạm vi chỉ gồm kết quả của user story này. Có thể thương lượng nhãn cấp nhiệm vụ.
