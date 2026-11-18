---
id: US-21
feature: F07
epic: E3
channel: shared
wave: B
status: Draft
updated: 2026-11-18
---

# Duyệt sản phẩm để tính vào cam kết

**Đầu vào** · [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md), US-21, cỡ S. **Nguồn nghiệp vụ** · [F07](../../docs/features/F07-san-pham-khoa-hoc/spec.md) — AC-03, AC-08, AC-11. Các AC dưới đây có phạm vi riêng của US-21.

## Clarifications

### Session 2026-11-18

- Q: Duyệt cùng sản phẩm hai lần có làm tăng số cam kết đã đạt không? → A: Tổng hợp theo định danh sản phẩm đã duyệt, độc lập số lần gửi lệnh. [RV-21](../review-decisions.md#rv-21). Khuyến nghị dùng để lập kế hoạch, chờ Chuyên viên sản phẩm và phòng KHCN xác nhận.

## User Scenarios & Testing

### User Story 1 — Duyệt sản phẩm để tính vào cam kết (P1)

Chuyên viên duyệt một sản phẩm hợp lệ để hệ thống phản ánh đúng số sản phẩm đạt theo loại.

**Giá trị và phép thử độc lập.** Chuẩn bị một sản phẩm đang chờ và cam kết cùng loại. Thực hiện thao tác bằng đúng vai trò và kiểm đầu ra sau khi mở lại. Lát này thuộc đợt B.

- **AC-01** (US-21.1) — Given sản phẩm đủ chứng cứ. When chuyên viên duyệt. Then APPROVED và được tính vào cam kết của đề tài.
- **AC-02** (US-21.2) — Given chủ nhiệm chỉ có quyền kê khai. When tự duyệt. Then bị từ chối, tổng đạt giữ nguyên.

- **AC-03** (US-21.3, khuyến nghị) — Given Cùng một đầu ra vừa duyệt, cam kết còn thiếu một sản phẩm cùng loại. When gửi lại lệnh duyệt. Then chỉ một đầu ra được tính, mục cam kết vẫn thiếu một.

### Edge Cases

Chủ nhiệm chỉ có quyền kê khai → bị từ chối, tổng đạt giữ nguyên.

## Requirements

### Functional Requirements

- **BR-01 / FR-001.** Khi sản phẩm đủ chứng cứ, người có quyền có thể chuyên viên duyệt. Kết quả phải quan sát được: APPROVED và được tính vào cam kết của đề tài (AC-01).
- **BR-02 / FR-002.** Với tình huống chủ nhiệm chỉ có quyền kê khai, thao tác tự duyệt phải cho kết quả bị từ chối, tổng đạt giữ nguyên (AC-02).

- **BR-03 / FR-003 (đề xuất).** Tổng hợp theo định danh sản phẩm đã duyệt, độc lập số lần gửi lệnh. Kiểm bằng AC-03.

### Key Entities

Đầu vào nghiệp vụ: Sản phẩm chờ duyệt, chứng cứ và cam kết theo loại. Đầu ra cần đối chiếu: Người duyệt, giờ duyệt, số đầu ra được tính.

## Success Criteria

- **SC-001.** Hai tình huống gốc của US-21 đúng 2/2 khi chạy riêng bằng bộ dữ liệu trên.
- **SC-002.** Trong bộ thử hai tổ chức, 0 hồ sơ ngoài phạm vi xuất hiện trong kết quả hoặc được thay đổi bởi người của tổ chức kia.

## Assumptions

Phụ thuộc F07, F04, F06. Phạm vi chỉ gồm kết quả của user story này. Có thể thương lượng cách hiển thị đã đạt trên tổng cam kết.
