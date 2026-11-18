---
id: US-20
feature: F07
epic: E3
channel: web
wave: B
status: Draft
updated: 2026-11-18
---

# Nộp sản phẩm khoa học kèm minh chứng

**Đầu vào** · [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md), US-20, cỡ S. **Nguồn nghiệp vụ** · [F07](../../docs/features/F07-san-pham-khoa-hoc/spec.md) — AC-01, AC-05, AC-07. Các AC dưới đây có phạm vi riêng của US-20.

## Clarifications

### Session 2026-11-18

- Q: Một tệp có trong thư viện nhưng người dùng vừa mất quyền có thể làm minh chứng không? → A: Kiểm lại quyền sử dụng tệp tại lúc gửi, yêu cầu thay tệp khi quyền hết hiệu lực. [RV-20](../review-decisions.md#rv-20). Khuyến nghị dùng để lập kế hoạch, chờ Chủ nhiệm và chuyên viên sản phẩm xác nhận.

## User Scenarios & Testing

### User Story 1 — Nộp sản phẩm khoa học kèm minh chứng (P1)

Chủ nhiệm khai một sản phẩm thuộc đề tài trong phạm vi để chuyên viên kiểm tra đầu ra cam kết.

**Giá trị và phép thử độc lập.** Chuẩn bị một đề tài đang làm, minh chứng và hai tài khoản. Thực hiện thao tác bằng đúng vai trò và kiểm đầu ra sau khi mở lại. Lát này thuộc đợt B.

- **AC-01** (US-20.1) — Given sản phẩm đủ minh chứng. When gửi. Then vào hàng chờ duyệt, giữ liên kết đề tài.
- **AC-02** (US-20.2) — Given thiếu minh chứng bắt buộc. When gửi. Then báo thiếu, bản kê khai chưa chuyển chờ duyệt.

- **AC-03** (US-20.3, khuyến nghị) — Given Tệp đính kèm đã bị thu quyền trước khi gửi. When nộp sản phẩm. Then báo minh chứng chưa hợp lệ, giữ nháp.

### Edge Cases

Thiếu minh chứng bắt buộc → báo thiếu, bản kê khai chưa chuyển chờ duyệt.

## Requirements

### Functional Requirements

- **BR-01 / FR-001.** Khi sản phẩm đủ minh chứng, người có quyền có thể gửi. Kết quả phải quan sát được: vào hàng chờ duyệt, giữ liên kết đề tài (AC-01).
- **BR-02 / FR-002.** Với tình huống thiếu minh chứng bắt buộc, thao tác gửi phải cho kết quả báo thiếu, bản kê khai chưa chuyển chờ duyệt (AC-02).

- **BR-03 / FR-003 (đề xuất).** Kiểm lại quyền sử dụng tệp tại lúc gửi, yêu cầu thay tệp khi quyền hết hiệu lực. Kiểm bằng AC-03.

### Key Entities

Đầu vào nghiệp vụ: Đề tài, loại sản phẩm, thông tin công bố, tác giả, minh chứng. Đầu ra cần đối chiếu: Sản phẩm chờ duyệt gắn đúng đề tài.

## Success Criteria

- **SC-001.** Hai tình huống gốc của US-20 đúng 2/2 khi chạy riêng bằng bộ dữ liệu trên.
- **SC-002.** Trong bộ thử hai tổ chức, 0 hồ sơ ngoài phạm vi xuất hiện trong kết quả hoặc được thay đổi bởi người của tổ chức kia.

## Assumptions

Phụ thuộc F07, B03. Phạm vi chỉ gồm kết quả của user story này. Có thể thương lượng bố cục thông tin bài báo.
