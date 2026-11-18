---
id: US-07
feature: F01
epic: E1
channel: web
wave: A
status: Draft
updated: 2026-11-18
---

# Nộp đề xuất và nhận mã theo dõi

**Đầu vào** · [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md), US-07, cỡ M. **Nguồn nghiệp vụ** · [F01](../../docs/features/F01-de-xuat-de-tai/spec.md) — AC-02, AC-03, AC-04. Các AC dưới đây có phạm vi riêng của US-07.

## Clarifications

### Session 2026-11-18

- Q: Xử lý hồ sơ đến đúng thời điểm kết thúc kỳ thế nào? → A: Nhận khi thời điểm máy chủ tiếp nhận bằng hạn và kỳ còn mở, từ chối sau hạn. [RV-07](../review-decisions.md#rv-07). Khuyến nghị dùng để lập kế hoạch, chờ Chuyên viên quản lý kỳ và PO xác nhận.

## User Scenarios & Testing

### User Story 1 — Nộp đề xuất và nhận mã theo dõi (P1)

Chủ nhiệm nộp thuyết minh đủ trường, nhận mã duy nhất và thời điểm tiếp nhận để tra cứu sau kỳ.

**Giá trị và phép thử độc lập.** Chuẩn bị hai hồ sơ nháp, đồng hồ cố định trong hạn và sau hạn. Thực hiện thao tác bằng đúng vai trò và kiểm đầu ra sau khi mở lại. Lát này thuộc đợt A.

- **AC-01** (US-07.1) — Given nháp đủ trường, còn hạn. When nộp. Then chuyển Đã nộp, cấp mã, ghi giờ, khóa sửa.
- **AC-02** (US-07.2) — Given nháp đủ trường, đã quá hạn. When nộp. Then giữ Nháp và báo hết hạn.

- **AC-03** (US-07.3, khuyến nghị) — Given Nháp hợp lệ, đồng hồ máy chủ đúng hạn và kỳ còn mở. When chủ nhiệm gửi hai lần. Then chỉ có một mã và một lần chuyển Đã nộp.

### Edge Cases

Nháp đủ trường, đã quá hạn → giữ Nháp và báo hết hạn.

## Requirements

### Functional Requirements

- **BR-01 / FR-001.** Khi nháp đủ trường, còn hạn, người có quyền có thể nộp. Kết quả phải quan sát được: chuyển Đã nộp, cấp mã, ghi giờ, khóa sửa (AC-01).
- **BR-02 / FR-002.** Với tình huống nháp đủ trường, đã quá hạn, thao tác nộp phải cho kết quả giữ Nháp và báo hết hạn (AC-02).

- **BR-03 / FR-003 (đề xuất).** Nhận khi thời điểm máy chủ tiếp nhận bằng hạn và kỳ còn mở, từ chối sau hạn. Kiểm bằng AC-03.

### Key Entities

Đầu vào nghiệp vụ: Định danh nháp, bản biểu mẫu và nội dung lần nộp. Đầu ra cần đối chiếu: Mã đề tài, giờ tiếp nhận, trạng thái và quyền sửa.

## Success Criteria

- **SC-001.** Hai tình huống gốc của US-07 đúng 2/2 khi chạy riêng bằng bộ dữ liệu trên.
- **SC-002.** Trong bộ thử hai tổ chức, 0 hồ sơ ngoài phạm vi xuất hiện trong kết quả hoặc được thay đổi bởi người của tổ chức kia.

## Assumptions

Phụ thuộc F01, F02, P01, P02. Phạm vi chỉ gồm kết quả của user story này. Có thể thương lượng cách trình bày xác nhận nộp.
