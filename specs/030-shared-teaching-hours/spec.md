---
id: US-30
feature: P03
epic: E4
channel: shared
wave: C
status: Draft
updated: 2026-11-18
---

# Ghi giờ giảng từ một sự kiện hợp lệ

**Đầu vào** · [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md), US-30, cỡ M. **Nguồn nghiệp vụ** · [P03](../../docs/features/P03-quy-doi-gio-giang/spec.md) — AC-01, AC-05. Các AC dưới đây có phạm vi riêng của US-30.

## Clarifications

### Session 2026-11-18

- Q: Xử lý sự kiện cũ được gửi lại sau khi đổi định mức thế nào? → A: Dùng ngày sự kiện gốc, khóa nguồn và phân bổ theo công thức của kỳ; sửa sai bằng điều chỉnh có lý do. [RV-30](../review-decisions.md#rv-30). Khuyến nghị dùng để lập kế hoạch, chờ Phòng đào tạo, phòng KHCN và chủ quy chế xác nhận.

## User Scenarios & Testing

### User Story 1 — Ghi giờ giảng từ một sự kiện hợp lệ (P1)

Chuyên viên đối chiếu giờ của một giảng viên với hoạt động nguồn và công thức có hiệu lực của trường.

**Giá trị và phép thử độc lập.** Chuẩn bị tenant bật P03, một sự kiện đã duyệt, một công thức do trường xác nhận. Thực hiện thao tác bằng đúng vai trò và kiểm đầu ra sau khi mở lại. Lát này thuộc đợt C.

- **AC-01** (US-30.1) — Given sự kiện hợp lệ. When tính giờ. Then ra đúng giờ đối chứng theo công thức của kỳ.
- **AC-02** (US-30.2) — Given cùng sự kiện. When xử lý lần hai. Then không phát sinh dòng giờ trùng.

- **AC-03** (US-30.3, khuyến nghị) — Given Sự kiện tháng trước được gửi lại sau ngày công thức mới có hiệu lực. When đối chiếu sổ giờ. Then giữ số giờ theo công thức cũ, không có dòng trùng.

### Edge Cases

Cùng sự kiện → không phát sinh dòng giờ trùng.

## Requirements

### Functional Requirements

- **BR-01 / FR-001.** Khi sự kiện hợp lệ, người có quyền có thể tính giờ. Kết quả phải quan sát được: ra đúng giờ đối chứng theo công thức của kỳ (AC-01).
- **BR-02 / FR-002.** Với tình huống cùng sự kiện, thao tác xử lý lần hai phải cho kết quả không phát sinh dòng giờ trùng (AC-02).

- **BR-03 / FR-003 (đề xuất).** Dùng ngày sự kiện gốc, khóa nguồn và phân bổ theo công thức của kỳ; sửa sai bằng điều chỉnh có lý do. Kiểm bằng AC-03.

### Key Entities

Đầu vào nghiệp vụ: Sự kiện hợp lệ, ngày nguồn, công thức hiệu lực và phân bổ. Đầu ra cần đối chiếu: Dòng giờ theo giảng viên/kỳ và căn cứ tính.

## Success Criteria

- **SC-001.** Hai tình huống gốc của US-30 đúng 2/2 khi chạy riêng bằng bộ dữ liệu trên.
- **SC-002.** Trong bộ thử hai tổ chức, 0 hồ sơ ngoài phạm vi xuất hiện trong kết quả hoặc được thay đổi bởi người của tổ chức kia.

## Assumptions

Bật module E4 riêng theo tenant và quy chế đã chọn. Phụ thuộc P03, F08, B01. Phạm vi chỉ gồm kết quả của user story này. Có thể thương lượng cách trình bày chi tiết phép tính.
