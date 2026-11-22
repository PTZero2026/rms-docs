---
id: US-13
feature: B02
epic: E3
channel: web
wave: A
status: Draft
updated: 2026-11-21
---

# Đếm hồ sơ theo trạng thái của một kỳ

**Đầu vào** · [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md), US-13, cỡ M. **Nguồn nghiệp vụ** · [B02](../../docs/features/B02-bao-cao-thong-ke/spec.md) — BR-01/02 và AC-01/03 ghi quyết định RV-13. Các AC dưới đây có phạm vi riêng của US-13.

## Clarifications

### Session 2026-11-21

- Q: Một hồ sơ trả về nháp rồi nộp lại được đếm thế nào? → A: Trong kỳ và phạm vi được xem, mỗi hồ sơ đã cấp mã được tính một lần, kể cả khi nộp lại hoặc đang ở Nháp sau khi bị trả. Loại nháp chưa từng nộp, chưa có mã. Tổng, chi tiết và tệp xuất cùng dùng trạng thái tại thời điểm tạo bản chụp. [RV-13 đã chấp thuận](../review-decisions.md#rv-13).

## User Scenarios & Testing

### User Story 1 — Đếm hồ sơ theo trạng thái của một kỳ (P1)

Trưởng phòng lấy số đề tài theo trạng thái chuẩn của một kỳ tại thời điểm trích xuất, để đối chiếu danh sách hội đồng.

**Giá trị và phép thử độc lập.** Chuẩn bị kỳ K có ba mã A1, A2 (khoa A) và B1 (khoa B). A1 đã nộp hai lần, A2 còn mã và đang ở Nháp sau khi bị trả. A3 là nhãn dữ liệu thử cho nháp chưa từng nộp, chưa có mã. Thực hiện thao tác bằng đúng vai trò và kiểm đầu ra sau khi mở lại. Lát này thuộc đợt A.

- **AC-01** (US-13.1) — Given 3 mã trong quyền, 1 mã đã nộp lại. When tổng hợp theo trạng thái hiện tại. Then tổng bằng 3, từng nhóm khớp danh sách chốt.
- **AC-02** (US-13.2) — Given chỉ có quyền một đơn vị. When xuất báo cáo. Then cả dòng chi tiết và tổng loại hồ sơ ngoài quyền.

- **AC-03** (US-13.3, RV-13) — Trưởng phòng thấy cả hai khoa, A1 đã nộp lại, A2 bị trả về Nháp còn mã, A3 chưa cấp mã. Tạo báo cáo, sau đó nộp lại A2. Mở chi tiết và xuất từ bản chụp ban đầu rồi tạo báo cáo mới, quyền giữ nguyên. Bản đầu và tệp cùng tổng 3, mỗi mã A1, A2, B1 một dòng, A2 ở nhóm Nháp, vắng A3. Báo cáo mới vẫn tổng 3, A2 sang nhóm Đã nộp.

### Edge Cases

Chỉ có quyền một đơn vị → cả dòng chi tiết và tổng loại hồ sơ ngoài quyền.

## Requirements

### Functional Requirements

- **BR-01 / FR-001.** Khi 3 mã trong quyền, 1 mã đã nộp lại, người có quyền có thể tổng hợp theo trạng thái hiện tại. Kết quả phải quan sát được: tổng bằng 3, từng nhóm khớp danh sách chốt (AC-01).
- **BR-02 / FR-002.** Với tình huống chỉ có quyền một đơn vị, thao tác xuất báo cáo phải cho kết quả cả dòng chi tiết và tổng loại hồ sơ ngoài quyền (AC-02).

- **BR-03 / FR-003.** Trong kỳ và phạm vi được xem, mỗi hồ sơ đã cấp mã được tính một lần, kể cả khi nộp lại hoặc đang ở Nháp sau khi bị trả. Loại nháp chưa từng nộp, chưa có mã. Tổng, chi tiết và tệp xuất cùng dùng trạng thái tại thời điểm tạo bản chụp. Kiểm bằng AC-03.

### Key Entities

Đầu vào nghiệp vụ: Kỳ, phạm vi đơn vị, thời điểm trích xuất. Đầu ra cần đối chiếu: Số hồ sơ theo trạng thái, tổng cộng và danh sách đối chứng.

## Success Criteria

- **SC-001.** Hai tình huống gốc của US-13 đúng 2/2 khi chạy riêng bằng bộ dữ liệu trên.
- **SC-002.** Trong bộ thử hai tổ chức, 0 hồ sơ ngoài phạm vi xuất hiện trong kết quả hoặc được thay đổi bởi người của tổ chức kia.

## Assumptions

Phụ thuộc B02, P01, B03. Phạm vi chỉ gồm kết quả của user story này. Có thể thương lượng sắp xếp cột và định dạng xuất.
