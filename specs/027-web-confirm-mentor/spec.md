---
id: US-27
feature: F10
epic: E4
channel: web
wave: C
status: Draft
updated: 2026-11-24
---

# Xác nhận người hướng dẫn đề tài sinh viên

**Đầu vào** · [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md), US-27, cỡ S. **Nguồn nghiệp vụ** · [F10](../../docs/features/F10-de-tai-sinh-vien/spec.md) — AC-04. Các AC dưới đây có phạm vi riêng của US-27.

## Clarifications

### Session 2026-11-18

- Q: Xác nhận hướng dẫn của một hồ sơ có dùng cho hồ sơ khác cùng sinh viên không? → A: Gắn xác nhận với đúng đăng ký, kiểm khi sinh viên nộp chính thức. [RV-27](../review-decisions.md#rv-27). BA/PO chốt cho triển khai ngày 24/11/2026.

## User Scenarios & Testing

### User Story 1 — Xác nhận người hướng dẫn đề tài sinh viên (P1)

Sinh viên xin xác nhận của giảng viên hướng dẫn để đủ điều kiện nộp đăng ký của nhóm.

**Giá trị và phép thử độc lập.** Chuẩn bị đợt bật F10, nhóm hợp lệ và một giảng viên. Thực hiện thao tác bằng đúng vai trò và kiểm đầu ra sau khi mở lại. Lát này thuộc đợt C.

- **AC-01** (US-27.1) — Given nhóm đủ điều kiện còn lại, giảng viên đã xác nhận. When nộp. Then qua điều kiện người hướng dẫn.
- **AC-02** (US-27.2) — Given chưa ai xác nhận. When nộp. Then chỉ rõ thiếu xác nhận và giữ bản đăng ký.

- **AC-03** (US-27.3) — Given Giảng viên đã xác nhận cho hồ sơ A, sinh viên gửi hồ sơ B. When nộp B. Then yêu cầu xác nhận riêng cho B.

### Edge Cases

Chưa ai xác nhận → chỉ rõ thiếu xác nhận và giữ bản đăng ký.

## Requirements

### Functional Requirements

- **BR-01 / FR-001.** Khi nhóm đủ điều kiện còn lại, giảng viên đã xác nhận, người có quyền có thể nộp. Kết quả phải quan sát được: qua điều kiện người hướng dẫn (AC-01).
- **BR-02 / FR-002.** Với tình huống chưa ai xác nhận, thao tác nộp phải cho kết quả chỉ rõ thiếu xác nhận và giữ bản đăng ký (AC-02).

- **BR-03 / FR-003.** Gắn xác nhận với đúng đăng ký, kiểm khi sinh viên nộp chính thức. Kiểm bằng AC-03.

### Key Entities

Đầu vào nghiệp vụ: Đăng ký của nhóm, đợt, người hướng dẫn và xác nhận tương ứng. Đầu ra cần đối chiếu: Trạng thái đủ/thiếu xác nhận cho đúng đăng ký.

## Success Criteria

- **SC-001.** Hai tình huống gốc của US-27 đúng 2/2 khi chạy riêng bằng bộ dữ liệu trên.
- **SC-002.** Trong bộ thử hai tổ chức, 0 hồ sơ ngoài phạm vi xuất hiện trong kết quả hoặc được thay đổi bởi người của tổ chức kia.

## Assumptions

Bật module E4 riêng theo tenant và quy chế đã chọn. Phụ thuộc F10, B03. Phạm vi chỉ gồm kết quả của user story này. Có thể thương lượng nội dung lời mời.
