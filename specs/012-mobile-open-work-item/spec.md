---
id: US-12
feature: B06
epic: E0
channel: mobile
wave: A
status: Draft
updated: 2026-11-18
---

# Mở việc cần xử lý trên điện thoại

**Đầu vào** · [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md), US-12, cỡ S. **Nguồn nghiệp vụ** · [B06](../../docs/features/B06-trang-chu/spec.md) — AC-03, AC-04, AC-05. Các AC dưới đây có phạm vi riêng của US-12.

## Clarifications

### Session 2026-11-18

- Q: Nếu mất quyền sau khi đã thấy thẻ trên điện thoại thì sao? → A: Kiểm quyền khi mở liên kết, hướng người dùng về danh sách đã làm mới. [RV-12](../review-decisions.md#rv-12). Khuyến nghị dùng để lập kế hoạch, chờ Chủ nhiệm, UX và chủ dữ liệu xác nhận.

## User Scenarios & Testing

### User Story 1 — Mở việc cần xử lý trên điện thoại (P1)

Chủ nhiệm dùng web trên điện thoại để tìm hồ sơ bị trả và mở đúng nơi sửa. Trang chủ chỉ đọc.

**Giá trị và phép thử độc lập.** Chuẩn bị một hồ sơ cần bổ sung, tài khoản đúng và sai phạm vi. Thực hiện thao tác bằng đúng vai trò và kiểm đầu ra sau khi mở lại. Lát này thuộc đợt A.

- **AC-01** (US-12.1) — Given người có việc, màn hình 360 px. When chạm thẻ. Then mở đúng hồ sơ nguồn, trạng thái giữ nguyên.
- **AC-02** (US-12.2) — Given người ngoài phạm vi. When tải trang chủ. Then tiêu đề và số liệu hồ sơ kia đều không xuất hiện.

- **AC-03** (US-12.3, khuyến nghị) — Given Điện thoại rộng 360 px đã hiện thẻ rồi tài khoản bị thu quyền. When chạm thẻ cũ. Then không lộ hồ sơ và có đường về trang chủ.

### Edge Cases

Người ngoài phạm vi → tiêu đề và số liệu hồ sơ kia đều không xuất hiện.

## Requirements

### Functional Requirements

- **BR-01 / FR-001.** Khi người có việc, màn hình 360 px, người có quyền có thể chạm thẻ. Kết quả phải quan sát được: mở đúng hồ sơ nguồn, trạng thái giữ nguyên (AC-01).
- **BR-02 / FR-002.** Với tình huống người ngoài phạm vi, thao tác tải trang chủ phải cho kết quả tiêu đề và số liệu hồ sơ kia đều không xuất hiện (AC-02).

- **BR-03 / FR-003 (đề xuất).** Kiểm quyền khi mở liên kết, hướng người dùng về danh sách đã làm mới. Kiểm bằng AC-03.

### Key Entities

Đầu vào nghiệp vụ: Phiên người dùng, danh sách việc, liên kết của thẻ ở màn hình hẹp. Đầu ra cần đối chiếu: Chuyển tới đúng hồ sơ nguồn, giữ nguyên dữ liệu.

## Success Criteria

- **SC-001.** Hai tình huống gốc của US-12 đúng 2/2 khi chạy riêng bằng bộ dữ liệu trên.
- **SC-002.** Trong bộ thử hai tổ chức, 0 hồ sơ ngoài phạm vi xuất hiện trong kết quả hoặc được thay đổi bởi người của tổ chức kia.

## Assumptions

Phụ thuộc B06, F01, B03. Phạm vi chỉ gồm kết quả của user story này. Có thể thương lượng thứ tự các thẻ ở màn hình hẹp.
