---
id: US-05
feature: F02
epic: E1
channel: web
wave: A
status: Draft
updated: 2026-11-18
---

# Mở một kỳ nhận đề xuất

**Đầu vào** · [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md), US-05, cỡ M. **Nguồn nghiệp vụ** · [F02](../../docs/features/F02-dot-keu-goi/spec.md) — AC-01, AC-02, AC-05. Các AC dưới đây có phạm vi riêng của US-05.

## Clarifications

### Session 2026-11-18

- Q: Nếu danh mục hết hiệu lực giữa lúc soạn và mở kỳ thì sao? → A: Kiểm lại danh mục và bộ tiêu chí tại thời điểm mở, chỉ rõ mục phải thay. [RV-05](../review-decisions.md#rv-05). Khuyến nghị dùng để lập kế hoạch, chờ Phòng KHCN và BA xác nhận.

## User Scenarios & Testing

### User Story 1 — Mở một kỳ nhận đề xuất (P1)

Chuyên viên thiết lập mã kỳ, thời gian, bộ tiêu chí và mở đợt để giảng viên biết nơi nộp đúng hạn.

**Giá trị và phép thử độc lập.** Chuẩn bị một kỳ nháp, danh mục còn hiệu lực. Thực hiện thao tác bằng đúng vai trò và kiểm đầu ra sau khi mở lại. Lát này thuộc đợt A.

- **AC-01** (US-05.1) — Given kỳ đủ cấu hình. When mở. Then kỳ nhận đề xuất hiển thị dưới trạng thái OPEN.
- **AC-02** (US-05.2) — Given ngày kết thúc trước ngày bắt đầu. When lưu kỳ. Then báo lỗi và không tạo kỳ sai.

- **AC-03** (US-05.3, khuyến nghị) — Given Một lĩnh vực bắt buộc vừa ngừng hiệu lực trong bản nháp. When chuyên viên mở kỳ. Then kỳ vẫn nháp và hiển thị mục cần thay.

### Edge Cases

Ngày kết thúc trước ngày bắt đầu → báo lỗi và không tạo kỳ sai.

## Requirements

### Functional Requirements

- **BR-01 / FR-001.** Khi kỳ đủ cấu hình, người có quyền có thể mở. Kết quả phải quan sát được: kỳ nhận đề xuất hiển thị dưới trạng thái OPEN (AC-01).
- **BR-02 / FR-002.** Với tình huống ngày kết thúc trước ngày bắt đầu, thao tác lưu kỳ phải cho kết quả báo lỗi và không tạo kỳ sai (AC-02).

- **BR-03 / FR-003 (đề xuất).** Kiểm lại danh mục và bộ tiêu chí tại thời điểm mở, chỉ rõ mục phải thay. Kiểm bằng AC-03.

### Key Entities

Đầu vào nghiệp vụ: Mã kỳ, cửa sổ thời gian, danh mục, bộ tiêu chí. Đầu ra cần đối chiếu: Kỳ OPEN hiển thị ở danh sách tiếp nhận.

## Success Criteria

- **SC-001.** Hai tình huống gốc của US-05 đúng 2/2 khi chạy riêng bằng bộ dữ liệu trên.
- **SC-002.** Trong bộ thử hai tổ chức, 0 hồ sơ ngoài phạm vi xuất hiện trong kết quả hoặc được thay đổi bởi người của tổ chức kia.

## Assumptions

Phụ thuộc B01, B03. Phạm vi chỉ gồm kết quả của user story này. Có thể thương lượng cách trình bày hướng dẫn của kỳ.
