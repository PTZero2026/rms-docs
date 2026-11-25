---
id: US-16
feature: B04
epic: E0
channel: shared
wave: B
status: Draft
updated: 2026-11-24
---

# Nhắc hạn đúng một lần theo mốc

**Đầu vào** · [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md), US-16, cỡ S. **Nguồn nghiệp vụ** · [B04](../../docs/features/B04-thong-bao/spec.md) — AC-07. Các AC dưới đây có phạm vi riêng của US-16.

## Clarifications

### Session 2026-11-18

- Q: Chạy lại sau lỗi gửi email có tạo thông báo nghiệp vụ thứ hai? → A: Dùng một khóa theo tenant, đề tài, kỳ, người nhận và mốc; thử lại việc giao trên cùng thông báo. [RV-16](../review-decisions.md#rv-16). BA/PO chốt cho triển khai ngày 24/11/2026.

## User Scenarios & Testing

### User Story 1 — Nhắc hạn đúng một lần theo mốc (P1)

Chủ nhiệm nhận nhắc khi đến mốc cấu hình để kịp chuẩn bị báo cáo, dù tác vụ gửi được chạy lại.

**Giá trị và phép thử độc lập.** Chuẩn bị một kỳ báo cáo đến mốc nhắc, đồng hồ giả lập. Thực hiện thao tác bằng đúng vai trò và kiểm đầu ra sau khi mở lại. Lát này thuộc đợt B.

- **AC-01** (US-16.1) — Given kỳ đến mốc N. When chạy nhắc. Then có thông báo cho đúng chủ nhiệm.
- **AC-02** (US-16.2) — Given cùng đề tài, kỳ và mốc. When chạy lại. Then không tạo thêm thông báo.

- **AC-03** (US-16.3) — Given Thông báo trong ứng dụng đã có nhưng kênh email lỗi. When tác vụ chạy lại cùng mốc. Then vẫn một thông báo và theo dõi được lần gửi lại.

### Edge Cases

Cùng đề tài, kỳ và mốc → không tạo thêm thông báo.

## Requirements

### Functional Requirements

- **BR-01 / FR-001.** Khi kỳ đến mốc N, người có quyền có thể chạy nhắc. Kết quả phải quan sát được: có thông báo cho đúng chủ nhiệm (AC-01).
- **BR-02 / FR-002.** Với tình huống cùng đề tài, kỳ và mốc, thao tác chạy lại phải cho kết quả không tạo thêm thông báo (AC-02).

- **BR-03 / FR-003.** Dùng một khóa theo tenant, đề tài, kỳ, người nhận và mốc; thử lại việc giao trên cùng thông báo. Kiểm bằng AC-03.

### Key Entities

Đầu vào nghiệp vụ: Đồng hồ nghiệp vụ, mốc nhắc, kỳ báo cáo, người nhận. Đầu ra cần đối chiếu: Một thông báo PROGRESS_REPORT_DUE_SOON theo khóa.

## Success Criteria

- **SC-001.** Hai tình huống gốc của US-16 đúng 2/2 khi chạy riêng bằng bộ dữ liệu trên.
- **SC-002.** Trong bộ thử hai tổ chức, 0 hồ sơ ngoài phạm vi xuất hiện trong kết quả hoặc được thay đổi bởi người của tổ chức kia.

## Assumptions

Phụ thuộc B04, F04, B01. Phạm vi chỉ gồm kết quả của user story này. Có thể thương lượng nội dung tiêu đề nhắc.
