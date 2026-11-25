---
id: US-23
feature: F06
epic: E2
channel: shared
wave: B
status: Draft
updated: 2026-11-24
---

# Ghi kết luận nghiệm thu đạt

**Đầu vào** · [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md), US-23, cỡ M. **Nguồn nghiệp vụ** · [F06](../../docs/features/F06-nghiem-thu/spec.md) — AC-04, AC-06. Các AC dưới đây có phạm vi riêng của US-23.

## Clarifications

### Session 2026-11-18

- Q: Một phiếu xét duyệt đầu vào có được tính để đủ số phiếu nghiệm thu? → A: Chỉ tính phiếu đã gửi của đợt nghiệm thu đang kết luận. [RV-23](../review-decisions.md#rv-23). BA/PO chốt cho triển khai ngày 24/11/2026.

## User Scenarios & Testing

### User Story 1 — Ghi kết luận nghiệm thu đạt (P1)

Chuyên viên ghi kết luận đạt theo bộ phiếu nghiệm thu để bàn giao sang bước quyết toán.

**Giá trị và phép thử độc lập.** Chuẩn bị đợt nghiệm thu có phiếu đã gửi và ngưỡng đã cấu hình. Thực hiện thao tác bằng đúng vai trò và kiểm đầu ra sau khi mở lại. Lát này thuộc đợt B.

- **AC-01** (US-23.1) — Given đủ phiếu và đạt ngưỡng. When kết luận. Then đề tài PASSED, chờ quyết toán F05.
- **AC-02** (US-23.2) — Given thiếu một phiếu bắt buộc. When kết luận. Then chặn và báo số phiếu thiếu.

- **AC-03** (US-23.3) — Given Đợt nghiệm thu thiếu một phiếu, đề tài có một phiếu xét duyệt đầu vào. When chốt kết luận. Then vẫn thiếu một phiếu, chưa chuyển PASSED.

### Edge Cases

Thiếu một phiếu bắt buộc → chặn và báo số phiếu thiếu.

## Requirements

### Functional Requirements

- **BR-01 / FR-001.** Khi đủ phiếu và đạt ngưỡng, người có quyền có thể kết luận. Kết quả phải quan sát được: đề tài PASSED, chờ quyết toán F05 (AC-01).
- **BR-02 / FR-002.** Với tình huống thiếu một phiếu bắt buộc, thao tác kết luận phải cho kết quả chặn và báo số phiếu thiếu (AC-02).

- **BR-03 / FR-003.** Chỉ tính phiếu đã gửi của đợt nghiệm thu đang kết luận. Kiểm bằng AC-03.

### Key Entities

Đầu vào nghiệp vụ: Đợt nghiệm thu, phiếu hợp lệ và ngưỡng. Đầu ra cần đối chiếu: Kết luận PASSED và bàn giao F05.

## Success Criteria

- **SC-001.** Hai tình huống gốc của US-23 đúng 2/2 khi chạy riêng bằng bộ dữ liệu trên.
- **SC-002.** Trong bộ thử hai tổ chức, 0 hồ sơ ngoài phạm vi xuất hiện trong kết quả hoặc được thay đổi bởi người của tổ chức kia.

## Assumptions

Phụ thuộc F06, F03, P01. Phạm vi chỉ gồm kết quả của user story này. Có thể thương lượng bố cục biên nhận kết luận.
