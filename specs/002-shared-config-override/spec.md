---
id: US-02
feature: B01
epic: E0
channel: shared
wave: A
status: Draft
updated: 2026-11-18
---

# Ghi đè một cấu hình của trường

**Đầu vào** · [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md), US-02, cỡ S. **Nguồn nghiệp vụ** · [B01](../../docs/features/B01-danh-muc-cau-hinh/spec.md) — AC-02, AC-05, AC-07. Các AC dưới đây có phạm vi riêng của US-02.

## Clarifications

### Session 2026-11-18

- Q: Làm sao tránh hiển thị cấu hình cũ sau khi lưu? → A: Làm mất hiệu lực mục trong bộ nhớ đệm của trường vừa sửa trước lần đọc kế tiếp. [RV-02](../review-decisions.md#rv-02). Khuyến nghị dùng để lập kế hoạch, chờ Quản trị tenant và kiến trúc sư xác nhận.

## User Scenarios & Testing

### User Story 1 — Ghi đè một cấu hình của trường (P1)

Quản trị tenant điều chỉnh một giá trị dùng cho kỳ xét của trường, các trường khác tiếp tục dùng giá trị chung.

**Giá trị và phép thử độc lập.** Chuẩn bị hai tenant dùng cùng một khóa cấu hình. Thực hiện thao tác bằng đúng vai trò và kiểm đầu ra sau khi mở lại. Lát này thuộc đợt A.

- **AC-01** (US-02.1) — Given tenant A có quyền. When lưu giá trị riêng. Then đọc tại A nhận giá trị mới.
- **AC-02** (US-02.2) — Given tenant B chỉ có giá trị chung. When đọc cùng khóa. Then nhận đúng giá trị chung.

- **AC-03** (US-02.3, khuyến nghị) — Given A và B đã đọc khóa dùng chung trước khi A ghi đè. When đọc lại tại hai trường. Then A dùng bản riêng, B vẫn dùng bản chung.

### Edge Cases

Tenant B chỉ có giá trị chung → nhận đúng giá trị chung.

## Requirements

### Functional Requirements

- **BR-01 / FR-001.** Khi tenant A có quyền, người có quyền có thể lưu giá trị riêng. Kết quả phải quan sát được: đọc tại A nhận giá trị mới (AC-01).
- **BR-02 / FR-002.** Với tình huống tenant B chỉ có giá trị chung, thao tác đọc cùng khóa phải cho kết quả nhận đúng giá trị chung (AC-02).

- **BR-03 / FR-003 (đề xuất).** Làm mất hiệu lực mục trong bộ nhớ đệm của trường vừa sửa trước lần đọc kế tiếp. Kiểm bằng AC-03.

### Key Entities

Đầu vào nghiệp vụ: Khóa cấu hình, nội dung mới, trường đang quản trị. Đầu ra cần đối chiếu: Giá trị đọc hiệu lực tại A và giá trị chung tại B.

## Success Criteria

- **SC-001.** Hai tình huống gốc của US-02 đúng 2/2 khi chạy riêng bằng bộ dữ liệu trên.
- **SC-002.** Trong bộ thử hai tổ chức, 0 hồ sơ ngoài phạm vi xuất hiện trong kết quả hoặc được thay đổi bởi người của tổ chức kia.

## Assumptions

Phụ thuộc B01, B03. Phạm vi chỉ gồm kết quả của user story này. Có thể thương lượng cách hiện nguồn giá trị mặc định.
