---
id: US-18
feature: F05
epic: E2
channel: shared
wave: B
status: Draft
updated: 2026-11-24
---

# Xác nhận kinh phí được cấp

**Đầu vào** · [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md), US-18, cỡ M. **Nguồn nghiệp vụ** · [F05](../../docs/features/F05-quan-ly-kinh-phi/spec.md) — AC-01, AC-07. Các AC dưới đây có phạm vi riêng của US-18.

## Clarifications

### Session 2026-11-18

- Q: Khi tỷ lệ cho kết quả cao hơn trần, lấy số nào? → A: Dùng mức trần trước khi tính phần được dùng, lưu giá trị đã áp dụng để tra lại. [RV-18](../review-decisions.md#rv-18). BA/PO chốt cho triển khai ngày 24/11/2026.

## User Scenarios & Testing

### User Story 1 — Xác nhận kinh phí được cấp (P1)

Chuyên viên ghi tổng cấp, phí quản lý và phần được dùng cho nghiên cứu để chủ nhiệm theo dõi số khả dụng.

**Giá trị và phép thử độc lập.** Chuẩn bị quyết định giao hiệu lực, hạn mức và tỷ lệ hợp lệ. Thực hiện thao tác bằng đúng vai trò và kiểm đầu ra sau khi mở lại. Lát này thuộc đợt B.

- **AC-01** (US-18.1) — Given cấp 100 triệu, tỷ lệ 5%, trần 10 triệu. When xác nhận. Then phí 5 triệu, kinh phí thực hiện 95 triệu đồng.
- **AC-02** (US-18.2) — Given chủ nhiệm. When xác nhận cấp. Then bị chặn ở máy chủ.

- **AC-03** (US-18.3) — Given Cấp 300 triệu, tỷ lệ 5%, trần 10 triệu, không điều chỉnh riêng. When xác nhận. Then phí 10 triệu và phần thực hiện 290 triệu.

### Edge Cases

Chủ nhiệm → bị chặn ở máy chủ.

## Requirements

### Functional Requirements

- **BR-01 / FR-001.** Khi cấp 100 triệu, tỷ lệ 5%, trần 10 triệu, người có quyền có thể xác nhận. Kết quả phải quan sát được: phí 5 triệu, kinh phí thực hiện 95 triệu đồng (AC-01).
- **BR-02 / FR-002.** Với tình huống chủ nhiệm, thao tác xác nhận cấp phải cho kết quả bị chặn ở máy chủ (AC-02).

- **BR-03 / FR-003.** Dùng mức trần trước khi tính phần được dùng, lưu giá trị đã áp dụng để tra lại. Kiểm bằng AC-03.

### Key Entities

Đầu vào nghiệp vụ: Quyết định giao hiệu lực, tổng cấp, tỷ lệ và trần phí. Đầu ra cần đối chiếu: Tổng cấp, phần phí và kinh phí thực hiện bằng VND.

## Success Criteria

- **SC-001.** Hai tình huống gốc của US-18 đúng 2/2 khi chạy riêng bằng bộ dữ liệu trên.
- **SC-002.** Trong bộ thử hai tổ chức, 0 hồ sơ ngoài phạm vi xuất hiện trong kết quả hoặc được thay đổi bởi người của tổ chức kia.

## Assumptions

Phụ thuộc F04, F05, B01. Phạm vi chỉ gồm kết quả của user story này. Có thể thương lượng cách trình bày phép tính phí.
