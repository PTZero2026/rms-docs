---
id: US-04
feature: P02
epic: E0
channel: shared
wave: A
status: Draft
updated: 2026-11-18
---

# Tra căn cứ chuyển bước

**Đầu vào** · [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md), US-04, cỡ S. **Nguồn nghiệp vụ** · [P02](../../docs/features/P02-audit/spec.md) — AC-01, AC-02, AC-05. Các AC dưới đây có phạm vi riêng của US-04.

## Clarifications

### Session 2026-11-18

- Q: Nếu chuyên viên đổi khoa sau khi chuyển bước, ai xem được lịch sử? → A: Kiểm quyền trên đề tài ở lúc đọc, giữ nguyên tác nhân và đơn vị của sự kiện gốc. [RV-04](../review-decisions.md#rv-04). Khuyến nghị dùng để lập kế hoạch, chờ Chủ dữ liệu và QA phân quyền xác nhận.

## User Scenarios & Testing

### User Story 1 — Tra căn cứ chuyển bước (P1)

Chuyên viên có quyền mở lịch sử một đề tài để xác định ai chuyển bước và vào thời điểm nào.

**Giá trị và phép thử độc lập.** Chuẩn bị một chuyển bước thành công và hai người khác phạm vi. Thực hiện thao tác bằng đúng vai trò và kiểm đầu ra sau khi mở lại. Lát này thuộc đợt A.

- **AC-01** (US-04.1) — Given đề tài thuộc phạm vi. When mở sự kiện. Then thấy đúng người, thời gian, đối tượng và hành động.
- **AC-02** (US-04.2) — Given người ngoài phạm vi. When mở trực tiếp lịch sử. Then không nhận nội dung của đề tài.

- **AC-03** (US-04.3, khuyến nghị) — Given Chuyên viên vừa mất quyền đề tài nhưng còn liên kết cũ. When mở nhật ký. Then không lộ nội dung hoặc tên hồ sơ.

### Edge Cases

Người ngoài phạm vi → không nhận nội dung của đề tài.

## Requirements

### Functional Requirements

- **BR-01 / FR-001.** Khi đề tài thuộc phạm vi, người có quyền có thể mở sự kiện. Kết quả phải quan sát được: thấy đúng người, thời gian, đối tượng và hành động (AC-01).
- **BR-02 / FR-002.** Với tình huống người ngoài phạm vi, thao tác mở trực tiếp lịch sử phải cho kết quả không nhận nội dung của đề tài (AC-02).

- **BR-03 / FR-003 (đề xuất).** Kiểm quyền trên đề tài ở lúc đọc, giữ nguyên tác nhân và đơn vị của sự kiện gốc. Kiểm bằng AC-03.

### Key Entities

Đầu vào nghiệp vụ: Định danh đề tài và khoảng thời gian cần tra. Đầu ra cần đối chiếu: Danh sách sự kiện trong quyền, tác nhân, thời điểm, hành động.

## Success Criteria

- **SC-001.** Hai tình huống gốc của US-04 đúng 2/2 khi chạy riêng bằng bộ dữ liệu trên.
- **SC-002.** Trong bộ thử hai tổ chức, 0 hồ sơ ngoài phạm vi xuất hiện trong kết quả hoặc được thay đổi bởi người của tổ chức kia.

## Assumptions

Phụ thuộc P02, B03. Phạm vi chỉ gồm kết quả của user story này. Có thể thương lượng thứ tự hiển thị các sự kiện.
