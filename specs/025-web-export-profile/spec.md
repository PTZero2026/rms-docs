---
id: US-25
feature: F08
epic: E3
channel: web
wave: B
status: Draft
updated: 2026-11-21
---

# Xuất lý lịch nghiên cứu của cá nhân

**Đầu vào** · [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md), US-25, cỡ M. **Nguồn nghiệp vụ** · [F08](../../docs/features/F08-ly-lich-khoa-hoc/spec.md) — AC-09, AC-12, AC-13. Các AC dưới đây có phạm vi riêng của US-25.

## Clarifications

### Session 2026-11-21

- Q: Nếu mẫu của tenant thay sau lần xuất thì dùng mẫu nào? → A: Mỗi lần xuất dùng phiên bản mẫu của trường đang có hiệu lực tại thời điểm xuất. Nhật ký `EXPORT_CV` của lần đó ghi mã mẫu và phiên bản thực tế đã dùng. [RV-25 đã chấp thuận](../review-decisions.md#rv-25).

## User Scenarios & Testing

### User Story 1 — Xuất lý lịch nghiên cứu của cá nhân (P1)

Nhà nghiên cứu lấy lý lịch theo mẫu đơn vị, tái dùng đề tài và sản phẩm đã đủ điều kiện tổng hợp.

**Giá trị và phép thử độc lập.** Chuẩn bị hai phiên bản v1 và v2 có tiêu đề khác nhau của cùng một mẫu tenant, một người có hai vai trò trên cùng sản phẩm đã duyệt và một sản phẩm đang chờ duyệt. Thực hiện thao tác bằng đúng vai trò và kiểm đầu ra sau khi mở lại. Lát này thuộc đợt B.

- **AC-01** (US-25.1) — Given một sản phẩm đã duyệt gắn qua hai vai trò và một sản phẩm chờ duyệt. When trích xuất. Then tệp dùng đúng mẫu, sản phẩm đã duyệt xuất hiện một lần và sản phẩm chờ duyệt vắng mặt.
- **AC-02** (US-25.2) — Given người dùng ngoài phạm vi. When yêu cầu lý lịch người khác. Then từ chối.

- **AC-03** (US-25.3, RV-25) — Given trường có hai phiên bản cùng mã mẫu với tiêu đề riêng. When xuất lý lịch của U khi v1 có hiệu lực, kích hoạt v2 rồi xuất lại cùng lý lịch. Then Tệp đầu dùng tiêu đề v1, tệp sau dùng tiêu đề v2. Hai sự kiện `EXPORT_CV` ghi cùng mã mẫu và lần lượt ghi phiên bản v1, v2.

### Edge Cases

Người dùng ngoài phạm vi → từ chối.

## Requirements

### Functional Requirements

- **BR-01 / FR-001.** Khi có một đầu ra đủ điều kiện qua hai quan hệ, người có quyền có thể trích xuất. Kết quả phải quan sát được: mẫu đúng và chỉ một dòng cho đầu ra (AC-01).
- **BR-02 / FR-002.** Với tình huống người dùng ngoài phạm vi, thao tác yêu cầu lý lịch người khác phải cho kết quả từ chối (AC-02).

- **BR-03 / FR-003.** Mỗi lần xuất dùng phiên bản mẫu của trường đang có hiệu lực tại thời điểm xuất. Nhật ký `EXPORT_CV` của lần đó ghi mã mẫu và phiên bản thực tế đã dùng. Kiểm bằng AC-03.

### Key Entities

Đầu vào nghiệp vụ: Cá nhân, mẫu tenant, sản phẩm duyệt và vai trò. Đầu ra cần đối chiếu: Bản lý lịch theo mẫu, từng đầu ra chỉ xuất hiện một lần.

## Success Criteria

- **SC-001.** Hai tình huống gốc của US-25 đúng 2/2 khi chạy riêng bằng bộ dữ liệu trên.
- **SC-002.** Trong bộ thử hai tổ chức, 0 hồ sơ ngoài phạm vi xuất hiện trong kết quả hoặc được thay đổi bởi người của tổ chức kia.

## Assumptions

Phụ thuộc F08, F07, P03. Phạm vi chỉ gồm kết quả của user story này. Có thể thương lượng bố cục mẫu xuất.
