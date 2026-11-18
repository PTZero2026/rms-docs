---
id: US-29
feature: F12
epic: E4
channel: web
wave: C
status: Draft
updated: 2026-11-18
---

# Kê khai một hoạt động khoa học

**Đầu vào** · [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md), US-29, cỡ S. **Nguồn nghiệp vụ** · [F12](../../docs/features/F12-hoat-dong-khoa-hoc/spec.md) — AC-01, AC-02. Các AC dưới đây có phạm vi riêng của US-29.

## Clarifications

### Session 2026-11-18

- Q: Dùng quy tắc chứng cứ của trường nào khi cùng loại hội nghị? → A: Lấy bộ minh chứng của tenant và loại hoạt động tại bước gửi, nêu từng mục thiếu. [RV-29](../review-decisions.md#rv-29). Khuyến nghị dùng để lập kế hoạch, chờ Phòng KHCN và đại diện giảng viên xác nhận.

## User Scenarios & Testing

### User Story 1 — Kê khai một hoạt động khoa học (P1)

Giảng viên khai một hoạt động hội nghị có minh chứng theo cấu hình của trường để đề nghị ghi nhận.

**Giá trị và phép thử độc lập.** Chuẩn bị tenant bật F12, một loại hoạt động và một quy tắc minh chứng. Thực hiện thao tác bằng đúng vai trò và kiểm đầu ra sau khi mở lại. Lát này thuộc đợt C.

- **AC-01** (US-29.1) — Given đủ dữ liệu và minh chứng yêu cầu. When gửi duyệt. Then hoạt động vào danh sách chờ xét.
- **AC-02** (US-29.2) — Given thiếu minh chứng bắt buộc của loại hoạt động. When gửi. Then nêu loại tệp cần bổ sung.

- **AC-03** (US-29.3, khuyến nghị) — Given Hai trường yêu cầu minh chứng khác nhau cho cùng một hội nghị. When giảng viên trường A gửi. Then chỉ kiểm bộ minh chứng của A.

### Edge Cases

Thiếu minh chứng bắt buộc của loại hoạt động → nêu loại tệp cần bổ sung.

## Requirements

### Functional Requirements

- **BR-01 / FR-001.** Khi đủ dữ liệu và minh chứng yêu cầu, người có quyền có thể gửi duyệt. Kết quả phải quan sát được: hoạt động vào danh sách chờ xét (AC-01).
- **BR-02 / FR-002.** Với tình huống thiếu minh chứng bắt buộc của loại hoạt động, thao tác gửi phải cho kết quả nêu loại tệp cần bổ sung (AC-02).

- **BR-03 / FR-003 (đề xuất).** Lấy bộ minh chứng của tenant và loại hoạt động tại bước gửi, nêu từng mục thiếu. Kiểm bằng AC-03.

### Key Entities

Đầu vào nghiệp vụ: Loại hoạt động, tenant và bộ tệp minh chứng. Đầu ra cần đối chiếu: Hoạt động chờ duyệt hoặc danh sách minh chứng thiếu.

## Success Criteria

- **SC-001.** Hai tình huống gốc của US-29 đúng 2/2 khi chạy riêng bằng bộ dữ liệu trên.
- **SC-002.** Trong bộ thử hai tổ chức, 0 hồ sơ ngoài phạm vi xuất hiện trong kết quả hoặc được thay đổi bởi người của tổ chức kia.

## Assumptions

Bật module E4 riêng theo tenant và quy chế đã chọn. Phụ thuộc F12, B01. Phạm vi chỉ gồm kết quả của user story này. Có thể thương lượng nhãn loại hội nghị.
