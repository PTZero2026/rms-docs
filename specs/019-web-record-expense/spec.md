---
id: US-19
feature: F05
epic: E2
channel: web
wave: B
status: Draft
updated: 2026-11-24
---

# Ghi khoản chi kèm chứng từ

**Đầu vào** · [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md), US-19, cỡ S. **Nguồn nghiệp vụ** · [F05](../../docs/features/F05-quan-ly-kinh-phi/spec.md) — AC-02, AC-04, AC-06. Các AC dưới đây có phạm vi riêng của US-19.

## Clarifications

### Session 2026-11-18

- Q: Khoản chi vượt mức thực hiện xử lý thế nào? → A: Lưu khoản hợp lệ, hiển thị số vượt và số dư mới, để chuyên viên rà khi đóng. [RV-19](../review-decisions.md#rv-19). BA/PO chốt cho triển khai ngày 24/11/2026.

## User Scenarios & Testing

### User Story 1 — Ghi khoản chi kèm chứng từ (P1)

Chủ nhiệm ghi khoản chi VND với ngày và minh chứng. Hệ thống tính số còn lại và cảnh báo khi vượt kinh phí thực hiện.

**Giá trị và phép thử độc lập.** Chuẩn bị đề tài đang thực hiện, còn 2 triệu đồng. Thực hiện thao tác bằng đúng vai trò và kiểm đầu ra sau khi mở lại. Lát này thuộc đợt B.

- **AC-01** (US-19.1) — Given chủ nhiệm chi 3 triệu. When lưu khoản chi. Then vẫn lưu và cảnh báo vượt 1 triệu đồng.
- **AC-02** (US-19.2) — Given số tiền bằng 0. When lưu. Then báo lỗi, số dư giữ nguyên.

- **AC-03** (US-19.3) — Given Còn 2 triệu, khoản chi đúng 2 triệu đồng. When chủ nhiệm lưu. Then số dư bằng 0 và không cảnh báo vượt.

### Edge Cases

Số tiền bằng 0 → báo lỗi, số dư giữ nguyên.

## Requirements

### Functional Requirements

- **BR-01 / FR-001.** Khi chủ nhiệm chi 3 triệu, người có quyền có thể lưu khoản chi. Kết quả phải quan sát được: vẫn lưu và cảnh báo vượt 1 triệu đồng (AC-01).
- **BR-02 / FR-002.** Với tình huống số tiền bằng 0, thao tác lưu phải cho kết quả báo lỗi, số dư giữ nguyên (AC-02).

- **BR-03 / FR-003.** Lưu khoản hợp lệ, hiển thị số vượt và số dư mới, để chuyên viên rà khi đóng. Kiểm bằng AC-03.

### Key Entities

Đầu vào nghiệp vụ: Đề tài, số VND nguyên, ngày chi, mô tả và tệp nếu có. Đầu ra cần đối chiếu: Khoản chi, số dư và cảnh báo vượt.

## Success Criteria

- **SC-001.** Hai tình huống gốc của US-19 đúng 2/2 khi chạy riêng bằng bộ dữ liệu trên.
- **SC-002.** Trong bộ thử hai tổ chức, 0 hồ sơ ngoài phạm vi xuất hiện trong kết quả hoặc được thay đổi bởi người của tổ chức kia.

## Assumptions

Phụ thuộc F05, B03. Phạm vi chỉ gồm kết quả của user story này. Có thể thương lượng cách hiện cảnh báo vượt kinh phí.
