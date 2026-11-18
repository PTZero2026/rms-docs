---
id: US-28
feature: F11
epic: E4
channel: web
wave: C
status: Draft
updated: 2026-11-18
---

# Kê khai dự án phục vụ sản xuất

**Đầu vào** · [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md), US-28, cỡ S. **Nguồn nghiệp vụ** · [F11](../../docs/features/F11-du-an-phuc-vu-san-xuat/spec.md) — AC-01, AC-02, AC-03. Các AC dưới đây có phạm vi riêng của US-28.

## Clarifications

### Session 2026-11-18

- Q: Cần đối tác ở lần lưu nháp hay ở lúc gửi duyệt? → A: Yêu cầu đơn vị chủ trì khi lưu, kiểm ít nhất một đối tác ngoài tại lúc gửi duyệt. [RV-28](../review-decisions.md#rv-28). Khuyến nghị dùng để lập kế hoạch, chờ Đại diện viện chủ trì và chuyên viên KHCN xác nhận.

## User Scenarios & Testing

### User Story 1 — Kê khai dự án phục vụ sản xuất (P1)

Người kê khai ghi đơn vị chủ trì, đối tác ngoài và tổng kinh phí VND để phòng khoa học xét dự án ứng dụng.

**Giá trị và phép thử độc lập.** Chuẩn bị tenant bật F11, danh mục đơn vị và một đối tác. Thực hiện thao tác bằng đúng vai trò và kiểm đầu ra sau khi mở lại. Lát này thuộc đợt C.

- **AC-01** (US-28.1) — Given đủ trường và đối tác. When lưu kê khai. Then tra lại đúng đơn vị và tổng kinh phí.
- **AC-02** (US-28.2) — Given thiếu đối tác ngoài. When gửi duyệt. Then chặn và yêu cầu bổ sung.

- **AC-03** (US-28.3, khuyến nghị) — Given Đã có viện chủ trì, đối tác và 50 triệu VND. When lưu dự án. Then đầu mục giữ 50 triệu, sổ chi đề tài F05 giữ nguyên.

### Edge Cases

Thiếu đối tác ngoài → chặn và yêu cầu bổ sung.

## Requirements

### Functional Requirements

- **BR-01 / FR-001.** Khi đủ trường và đối tác, người có quyền có thể lưu kê khai. Kết quả phải quan sát được: tra lại đúng đơn vị và tổng kinh phí (AC-01).
- **BR-02 / FR-002.** Với tình huống thiếu đối tác ngoài, thao tác gửi duyệt phải cho kết quả chặn và yêu cầu bổ sung (AC-02).

- **BR-03 / FR-003 (đề xuất).** Yêu cầu đơn vị chủ trì khi lưu, kiểm ít nhất một đối tác ngoài tại lúc gửi duyệt. Kiểm bằng AC-03.

### Key Entities

Đầu vào nghiệp vụ: Đơn vị chủ trì, đối tác ngoài và tổng kinh phí. Đầu ra cần đối chiếu: Đầu mục dự án ứng dụng với kinh phí tổng.

## Success Criteria

- **SC-001.** Hai tình huống gốc của US-28 đúng 2/2 khi chạy riêng bằng bộ dữ liệu trên.
- **SC-002.** Trong bộ thử hai tổ chức, 0 hồ sơ ngoài phạm vi xuất hiện trong kết quả hoặc được thay đổi bởi người của tổ chức kia.

## Assumptions

Bật module E4 riêng theo tenant và quy chế đã chọn. Phụ thuộc F11, B01. Phạm vi chỉ gồm kết quả của user story này. Có thể thương lượng cách chọn đối tác trong mẫu.
