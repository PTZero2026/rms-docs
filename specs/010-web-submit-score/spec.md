---
id: US-10
feature: F03
epic: E1
channel: web
wave: A
status: Draft
updated: 2026-11-18
---

# Gửi phiếu chấm cá nhân

**Đầu vào** · [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md), US-10, cỡ M. **Nguồn nghiệp vụ** · [F03](../../docs/features/F03-xet-duyet-hoi-dong/spec.md) — AC-02, AC-06, AC-07. Các AC dưới đây có phạm vi riêng của US-10.

## Clarifications

### Session 2026-11-18

- Q: Nếu phát hiện xung đột sau khi người chấm mở nháp thì sao? → A: Kiểm lại phân công và quan hệ với đề tài ngay lúc gửi. [RV-10](../review-decisions.md#rv-10). Khuyến nghị dùng để lập kế hoạch, chờ Chủ tịch hội đồng và QA xác nhận.

## User Scenarios & Testing

### User Story 1 — Gửi phiếu chấm cá nhân (P1)

Thành viên hội đồng nhập điểm theo tiêu chí và nhận xét để phiếu hợp lệ được tính đúng trọng số.

**Giá trị và phép thử độc lập.** Chuẩn bị một thành viên được phân công và một thành viên có xung đột lợi ích. Thực hiện thao tác bằng đúng vai trò và kiểm đầu ra sau khi mở lại. Lát này thuộc đợt A.

- **AC-01** (US-10.1) — Given phiếu đủ điểm hợp lệ. When gửi. Then tính tổng theo trọng số, khóa phiếu đã nộp.
- **AC-02** (US-10.2) — Given người chấm là thành viên đề tài. When mở hoặc tạo phiếu cho đề tài. Then không thấy việc chấm và không tạo được phiếu.

- **AC-03** (US-10.3, khuyến nghị) — Given Người đã mở nháp vừa được bổ sung vào nhóm đề tài. When gửi phiếu đã điền. Then phiếu không được tính và người đó mất quyền chấm.

### Edge Cases

Người chấm là thành viên đề tài → không thấy việc chấm và không tạo được phiếu.

## Requirements

### Functional Requirements

- **BR-01 / FR-001.** Khi phiếu đủ điểm hợp lệ, người có quyền có thể gửi. Kết quả phải quan sát được: tính tổng theo trọng số, khóa phiếu đã nộp (AC-01).
- **BR-02 / FR-002.** Với tình huống người chấm là thành viên đề tài, thao tác mở hoặc tạo phiếu cho đề tài phải cho kết quả không thấy việc chấm và không tạo được phiếu (AC-02).

- **BR-03 / FR-003 (đề xuất).** Kiểm lại phân công và quan hệ với đề tài ngay lúc gửi. Kiểm bằng AC-03.

### Key Entities

Đầu vào nghiệp vụ: Đợt, thành viên, điểm và nhận xét theo tiêu chí. Đầu ra cần đối chiếu: Phiếu đã nộp, tổng trọng số và trạng thái khóa.

## Success Criteria

- **SC-001.** Hai tình huống gốc của US-10 đúng 2/2 khi chạy riêng bằng bộ dữ liệu trên.
- **SC-002.** Trong bộ thử hai tổ chức, 0 hồ sơ ngoài phạm vi xuất hiện trong kết quả hoặc được thay đổi bởi người của tổ chức kia.

## Assumptions

Phụ thuộc F03, B03. Phạm vi chỉ gồm kết quả của user story này. Có thể thương lượng cách báo tiêu chí thiếu điểm.
