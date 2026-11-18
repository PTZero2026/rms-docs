---
id: US-13
feature: B02
epic: E3
channel: web
wave: A
status: Draft
updated: 2026-11-18
---

# Đếm hồ sơ theo trạng thái của một kỳ

**Đầu vào** · [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md), US-13, cỡ M. **Nguồn nghiệp vụ** · [B02](../../docs/features/B02-bao-cao-thong-ke/spec.md) — Đề xuất mới, chờ PO/BA xác lập AC nghiệp vụ. Các AC dưới đây có phạm vi riêng của US-13.

## Clarifications

### Session 2026-11-18

- Q: Một hồ sơ trả về nháp rồi nộp lại được đếm thế nào? → A: Đếm theo định danh hồ sơ đã cấp mã trong kỳ, nhóm theo trạng thái chuẩn tại lúc trích xuất. Dòng và tổng dùng cùng bản chụp. [RV-13](../review-decisions.md#rv-13). Khuyến nghị dùng để lập kế hoạch, chờ Trưởng phòng KHCN và PO/BA xác nhận.

## User Scenarios & Testing

### User Story 1 — Đếm hồ sơ theo trạng thái của một kỳ (P1)

Trưởng phòng lấy số đề tài theo trạng thái chuẩn của một kỳ tại thời điểm trích xuất, để đối chiếu danh sách hội đồng.

**Giá trị và phép thử độc lập.** Chuẩn bị một kỳ gồm 3 mã hợp lệ, 2 đơn vị, một mã đã nộp lại. Thực hiện thao tác bằng đúng vai trò và kiểm đầu ra sau khi mở lại. Lát này thuộc đợt A.

- **AC-01** (US-13.1) — Given 3 mã trong quyền, 1 mã đã nộp lại. When tổng hợp theo trạng thái hiện tại. Then tổng bằng 3, từng nhóm khớp danh sách chốt.
- **AC-02** (US-13.2) — Given chỉ có quyền một đơn vị. When xuất báo cáo. Then cả dòng chi tiết và tổng loại hồ sơ ngoài quyền.

- **AC-03** (US-13.3, khuyến nghị) — Given Có 3 hồ sơ đã cấp mã và một bản nháp chưa từng nộp. When đếm cả kỳ rồi xuất danh sách. Then tổng 3, bản chưa từng nộp không có dòng.

### Edge Cases

Chỉ có quyền một đơn vị → cả dòng chi tiết và tổng loại hồ sơ ngoài quyền.

## Requirements

### Functional Requirements

- **BR-01 / FR-001.** Khi 3 mã trong quyền, 1 mã đã nộp lại, người có quyền có thể tổng hợp theo trạng thái hiện tại. Kết quả phải quan sát được: tổng bằng 3, từng nhóm khớp danh sách chốt (AC-01).
- **BR-02 / FR-002.** Với tình huống chỉ có quyền một đơn vị, thao tác xuất báo cáo phải cho kết quả cả dòng chi tiết và tổng loại hồ sơ ngoài quyền (AC-02).

- **BR-03 / FR-003 (đề xuất).** Đếm theo định danh hồ sơ đã cấp mã trong kỳ, nhóm theo trạng thái chuẩn tại lúc trích xuất. Dòng và tổng dùng cùng bản chụp. Kiểm bằng AC-03.

### Key Entities

Đầu vào nghiệp vụ: Kỳ, phạm vi đơn vị, thời điểm trích xuất. Đầu ra cần đối chiếu: Số hồ sơ theo trạng thái, tổng cộng và danh sách đối chứng.

## Success Criteria

- **SC-001.** Hai tình huống gốc của US-13 đúng 2/2 khi chạy riêng bằng bộ dữ liệu trên.
- **SC-002.** Trong bộ thử hai tổ chức, 0 hồ sơ ngoài phạm vi xuất hiện trong kết quả hoặc được thay đổi bởi người của tổ chức kia.

## Assumptions

Phụ thuộc B02, P01, B03. Phạm vi chỉ gồm kết quả của user story này. Có thể thương lượng sắp xếp cột và định dạng xuất.
