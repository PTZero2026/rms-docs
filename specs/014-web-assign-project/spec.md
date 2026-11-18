---
id: US-14
feature: F04
epic: E2
channel: web
wave: B
status: Draft
updated: 2026-11-18
---

# Giao thực hiện đề tài đã duyệt

**Đầu vào** · [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md), US-14, cỡ M. **Nguồn nghiệp vụ** · [F04](../../docs/features/F04-quan-ly-tien-do/spec.md) — AC-01, AC-14. Các AC dưới đây có phạm vi riêng của US-14.

## Clarifications

### Session 2026-11-18

- Q: Chuyên viên có thể giao khi mới có số quyết định nhưng chưa có bản đính kèm? → A: Yêu cầu tệp căn cứ đọc được theo phạm vi đề tài trước khi xác nhận giao. [RV-14](../review-decisions.md#rv-14). Khuyến nghị dùng để lập kế hoạch, chờ Trưởng phòng KHCN và chuyên viên hợp đồng xác nhận.

## User Scenarios & Testing

### User Story 1 — Giao thực hiện đề tài đã duyệt (P1)

Chuyên viên xác nhận căn cứ giao để từ một quyết định phê duyệt tạo hồ sơ thực hiện có chủ nhiệm và kinh phí duyệt.

**Giá trị và phép thử độc lập.** Chuẩn bị đề tài APPROVED và mẫu hồ sơ giao. Thực hiện thao tác bằng đúng vai trò và kiểm đầu ra sau khi mở lại. Lát này thuộc đợt B.

- **AC-01** (US-14.1) — Given đủ căn cứ. When xác nhận giao. Then hồ sơ giao có hiệu lực, đề tài IN_PROGRESS.
- **AC-02** (US-14.2) — Given thiếu căn cứ bắt buộc. When xác nhận. Then chỉ ra mục thiếu, đề tài còn APPROVED.

- **AC-03** (US-14.3, khuyến nghị) — Given Thiếu tệp căn cứ dù đã nhập số quyết định. When xác nhận giao. Then nêu mục tệp thiếu, giữ APPROVED.

### Edge Cases

Thiếu căn cứ bắt buộc → chỉ ra mục thiếu, đề tài còn APPROVED.

## Requirements

### Functional Requirements

- **BR-01 / FR-001.** Khi đủ căn cứ, người có quyền có thể xác nhận giao. Kết quả phải quan sát được: hồ sơ giao có hiệu lực, đề tài IN_PROGRESS (AC-01).
- **BR-02 / FR-002.** Với tình huống thiếu căn cứ bắt buộc, thao tác xác nhận phải cho kết quả chỉ ra mục thiếu, đề tài còn APPROVED (AC-02).

- **BR-03 / FR-003 (đề xuất).** Yêu cầu tệp căn cứ đọc được theo phạm vi đề tài trước khi xác nhận giao. Kiểm bằng AC-03.

### Key Entities

Đầu vào nghiệp vụ: Quyết định/hợp đồng, ngân sách, kỳ thực hiện, tệp căn cứ. Đầu ra cần đối chiếu: Hồ sơ giao EFFECTIVE và đề tài IN_PROGRESS.

## Success Criteria

- **SC-001.** Hai tình huống gốc của US-14 đúng 2/2 khi chạy riêng bằng bộ dữ liệu trên.
- **SC-002.** Trong bộ thử hai tổ chức, 0 hồ sơ ngoài phạm vi xuất hiện trong kết quả hoặc được thay đổi bởi người của tổ chức kia.

## Assumptions

Phụ thuộc F03, F04, P01. Phạm vi chỉ gồm kết quả của user story này. Có thể thương lượng cách hiện bảng tóm tắt quyết định.
