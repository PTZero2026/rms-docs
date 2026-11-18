---
id: US-08
feature: F01
epic: E1
channel: web
wave: A
status: Draft
updated: 2026-11-18
---

# Trả hồ sơ cần bổ sung

**Đầu vào** · [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md), US-08, cỡ S. **Nguồn nghiệp vụ** · [F01](../../docs/features/F01-de-xuat-de-tai/spec.md) — AC-07, AC-08, AC-11. Các AC dưới đây có phạm vi riêng của US-08.

## Clarifications

### Session 2026-11-18

- Q: Có thể trả hồ sơ mà chỉ ghi khoảng trắng ở lý do? → A: Yêu cầu lý do có chữ nhìn thấy, hiển thị nguyên nội dung cho chủ nhiệm. [RV-08](../review-decisions.md#rv-08). Khuyến nghị dùng để lập kế hoạch, chờ Chuyên viên tiếp nhận và PO xác nhận.

## User Scenarios & Testing

### User Story 1 — Trả hồ sơ cần bổ sung (P1)

Chuyên viên ghi lý do để chủ nhiệm sửa và theo cùng một mã khi nộp lại.

**Giá trị và phép thử độc lập.** Chuẩn bị hồ sơ đã nộp có mã, hai kỳ còn hạn và đã đóng. Thực hiện thao tác bằng đúng vai trò và kiểm đầu ra sau khi mở lại. Lát này thuộc đợt A.

- **AC-01** (US-08.1) — Given còn hạn. When trả kèm lý do rồi chủ nhiệm nộp lại. Then chủ nhiệm thấy lý do, mã đề tài được giữ.
- **AC-02** (US-08.2) — Given đã hết hạn. When chuyên viên trả. Then chặn thao tác và giữ trạng thái.

- **AC-03** (US-08.3, khuyến nghị) — Given Hồ sơ còn hạn và lý do chỉ chứa khoảng trắng. When chuyên viên gửi trả. Then giữ Đã nộp, yêu cầu nhập lý do.

### Edge Cases

Đã hết hạn → chặn thao tác và giữ trạng thái.

## Requirements

### Functional Requirements

- **BR-01 / FR-001.** Khi còn hạn, người có quyền có thể trả kèm lý do rồi chủ nhiệm nộp lại. Kết quả phải quan sát được: chủ nhiệm thấy lý do, mã đề tài được giữ (AC-01).
- **BR-02 / FR-002.** Với tình huống đã hết hạn, thao tác chuyên viên trả phải cho kết quả chặn thao tác và giữ trạng thái (AC-02).

- **BR-03 / FR-003 (đề xuất).** Yêu cầu lý do có chữ nhìn thấy, hiển thị nguyên nội dung cho chủ nhiệm. Kiểm bằng AC-03.

### Key Entities

Đầu vào nghiệp vụ: Mã hồ sơ đã nộp, lý do trả, kỳ tiếp nhận. Đầu ra cần đối chiếu: Bản nháp mở lại và lý do gắn cùng mã cũ.

## Success Criteria

- **SC-001.** Hai tình huống gốc của US-08 đúng 2/2 khi chạy riêng bằng bộ dữ liệu trên.
- **SC-002.** Trong bộ thử hai tổ chức, 0 hồ sơ ngoài phạm vi xuất hiện trong kết quả hoặc được thay đổi bởi người của tổ chức kia.

## Assumptions

Phụ thuộc F01, F02, P01. Phạm vi chỉ gồm kết quả của user story này. Có thể thương lượng vị trí hiển thị lý do.
