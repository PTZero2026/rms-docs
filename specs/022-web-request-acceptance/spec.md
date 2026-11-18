---
id: US-22
feature: F06
epic: E2
channel: web
wave: B
status: Draft
updated: 2026-11-18
---

# Đăng ký nghiệm thu khi đủ điều kiện

**Đầu vào** · [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md), US-22, cỡ M. **Nguồn nghiệp vụ** · [F06](../../docs/features/F06-nghiem-thu/spec.md) — AC-01, AC-07. Các AC dưới đây có phạm vi riêng của US-22.

## Clarifications

### Session 2026-11-18

- Q: Cùng đủ số lượng tổng nhưng thiếu một loại sản phẩm thì có được nghiệm thu? → A: Kiểm từng loại cam kết tại lúc nộp cùng kết quả kỳ cuối. [RV-22](../review-decisions.md#rv-22). Khuyến nghị dùng để lập kế hoạch, chờ Chuyên viên nghiệm thu và chủ nhiệm xác nhận.

## User Scenarios & Testing

### User Story 1 — Đăng ký nghiệm thu khi đủ điều kiện (P1)

Chủ nhiệm nộp hồ sơ cuối khi kỳ cuối đã đạt và đủ sản phẩm cam kết để phòng khoa học tiếp nhận nghiệm thu.

**Giá trị và phép thử độc lập.** Chuẩn bị đề tài đang thực hiện, dữ liệu kỳ cuối và sản phẩm đã duyệt. Thực hiện thao tác bằng đúng vai trò và kiểm đầu ra sau khi mở lại. Lát này thuộc đợt B.

- **AC-01** (US-22.1) — Given kỳ cuối đạt, đủ sản phẩm. When nộp hồ sơ cuối. Then chuyển PENDING_ACCEPTANCE, chuyên viên nhận thông báo.
- **AC-02** (US-22.2) — Given thiếu một sản phẩm cam kết. When đăng ký. Then nêu mục thiếu và giữ IN_PROGRESS.

- **AC-03** (US-22.3, khuyến nghị) — Given Cam kết một bài và một sáng chế, đã duyệt hai bài. When đăng ký nghiệm thu. Then nêu thiếu sáng chế và giữ IN_PROGRESS.

### Edge Cases

Thiếu một sản phẩm cam kết → nêu mục thiếu và giữ IN_PROGRESS.

## Requirements

### Functional Requirements

- **BR-01 / FR-001.** Khi kỳ cuối đạt, đủ sản phẩm, người có quyền có thể nộp hồ sơ cuối. Kết quả phải quan sát được: chuyển PENDING_ACCEPTANCE, chuyên viên nhận thông báo (AC-01).
- **BR-02 / FR-002.** Với tình huống thiếu một sản phẩm cam kết, thao tác đăng ký phải cho kết quả nêu mục thiếu và giữ IN_PROGRESS (AC-02).

- **BR-03 / FR-003 (đề xuất).** Kiểm từng loại cam kết tại lúc nộp cùng kết quả kỳ cuối. Kiểm bằng AC-03.

### Key Entities

Đầu vào nghiệp vụ: Đề tài đang thực hiện, kết quả kỳ cuối, cam kết và hồ sơ cuối. Đầu ra cần đối chiếu: Danh mục thiếu hoặc hồ sơ PENDING_ACCEPTANCE và thông báo.

## Success Criteria

- **SC-001.** Hai tình huống gốc của US-22 đúng 2/2 khi chạy riêng bằng bộ dữ liệu trên.
- **SC-002.** Trong bộ thử hai tổ chức, 0 hồ sơ ngoài phạm vi xuất hiện trong kết quả hoặc được thay đổi bởi người của tổ chức kia.

## Assumptions

Phụ thuộc F04, F07, F06. Phạm vi chỉ gồm kết quả của user story này. Có thể thương lượng vị trí bảng kiểm điều kiện.
