---
id: US-06
feature: F01
epic: E1
channel: web
wave: A
status: Draft
updated: 2026-11-24
---

# Lưu nháp thuyết minh

**Đầu vào** · [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md), US-06, cỡ S. **Nguồn nghiệp vụ** · [F01](../../docs/features/F01-de-xuat-de-tai/spec.md) — AC-01, AC-06. Các AC dưới đây có phạm vi riêng của US-06.

## Clarifications

### Session 2026-11-18

- Q: Giảng viên cần điền tới đâu để lưu lần đầu? → A: Cho lưu bản nháp thiếu trường bắt buộc của lần nộp khi đã xác định kỳ và chủ nhiệm. [RV-06](../review-decisions.md#rv-06). BA/PO chốt cho triển khai ngày 24/11/2026.

## User Scenarios & Testing

### User Story 1 — Lưu nháp thuyết minh (P1)

Chủ nhiệm lưu đề xuất của mình trong kỳ đang mở để hoàn thiện qua nhiều lần trước khi xin xét.

**Giá trị và phép thử độc lập.** Chuẩn bị kỳ mở, hai nhà nghiên cứu độc lập. Thực hiện thao tác bằng đúng vai trò và kiểm đầu ra sau khi mở lại. Lát này thuộc đợt A.

- **AC-01** (US-06.1) — Given chủ nhiệm trong kỳ mở. When lưu lần đầu. Then có bản Nháp của chủ nhiệm, chưa cấp mã đề tài.
- **AC-02** (US-06.2) — Given nhà nghiên cứu khác ngoài phạm vi. When mở nháp bằng đường dẫn. Then bị từ chối.

- **AC-03** (US-06.3) — Given Chủ nhiệm đã chọn kỳ và nhập tên nhưng thiếu phần phương pháp. When lưu rồi mở lại nháp. Then thấy phần đã nhập và có thể tiếp tục sửa.

### Edge Cases

Nhà nghiên cứu khác ngoài phạm vi → bị từ chối.

## Requirements

### Functional Requirements

- **BR-01 / FR-001.** Khi chủ nhiệm trong kỳ mở, người có quyền có thể lưu lần đầu. Kết quả phải quan sát được: có bản Nháp của chủ nhiệm, chưa cấp mã đề tài (AC-01).
- **BR-02 / FR-002.** Với tình huống nhà nghiên cứu khác ngoài phạm vi, thao tác mở nháp bằng đường dẫn phải cho kết quả bị từ chối (AC-02).

- **BR-03 / FR-003.** Cho lưu bản nháp thiếu trường bắt buộc của lần nộp khi đã xác định kỳ và chủ nhiệm. Kiểm bằng AC-03.

### Key Entities

Đầu vào nghiệp vụ: Kỳ mở, chủ nhiệm, phần thuyết minh đã soạn. Đầu ra cần đối chiếu: Định danh nháp và nội dung đã lưu.

## Success Criteria

- **SC-001.** Hai tình huống gốc của US-06 đúng 2/2 khi chạy riêng bằng bộ dữ liệu trên.
- **SC-002.** Trong bộ thử hai tổ chức, 0 hồ sơ ngoài phạm vi xuất hiện trong kết quả hoặc được thay đổi bởi người của tổ chức kia.

## Assumptions

Phụ thuộc F02, B03. Phạm vi chỉ gồm kết quả của user story này. Có thể thương lượng thứ tự các nhóm trường trên biểu mẫu.
