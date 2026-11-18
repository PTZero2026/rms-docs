---
id: US-24
feature: F05
epic: E2
channel: shared
wave: B
status: Draft
updated: 2026-11-18
---

# Quyết toán và đóng hồ sơ

**Đầu vào** · [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md), US-24, cỡ M. **Nguồn nghiệp vụ** · [F05](../../docs/features/F05-quan-ly-kinh-phi/spec.md) — AC-05, AC-07. Các AC dưới đây có phạm vi riêng của US-24.

## Clarifications

### Session 2026-11-18

- Q: Khi pilot chưa nối kế toán, căn cứ nào đủ để khóa sổ? → A: Khuyến nghị rà thủ công theo F05 BR-07 cho pilot. Khi có dữ liệu đối soát và còn MISMATCHED, F06 AC-10 chặn. PO cùng tài chính phải thống nhất hai spec trước khi giao task chuyển trạng thái. [RV-24](../review-decisions.md#rv-24). Khuyến nghị dùng để lập kế hoạch, chờ PO, trưởng phòng KHCN và kế toán trưởng xác nhận.

## User Scenarios & Testing

### User Story 1 — Quyết toán và đóng hồ sơ (P1)

Chuyên viên khóa sổ theo dõi kinh phí của một đề tài nghiệm thu đạt để ghi nhận hoàn thành.

**Giá trị và phép thử độc lập.** Chuẩn bị đề tài PASSED, kịch bản F05 cơ bản, điều kiện F06 AC-10 cần PO xác định trước khi giao. Thực hiện thao tác bằng đúng vai trò và kiểm đầu ra sau khi mở lại. Lát này thuộc đợt B.

- **AC-01** (US-24.1) — Given đề tài PASSED, chuyên viên đã rà thủ công trong pilot chưa bật kết nối kế toán. When chuyên viên quyết toán. Then chuyển COMPLETED, khóa kinh phí và ghi audit.
- **AC-02** (US-24.2) — Given chủ nhiệm. When tự đóng. Then từ chối, đề tài giữ nguyên.

- **AC-03** (US-24.3, khuyến nghị) — Given Đề tài PASSED đã bật đối soát và còn một dòng MISMATCHED. When chuyên viên đóng sổ. Then giữ PASSED, chỉ rõ dòng cần xử lý trước khi đóng.

### Edge Cases

Chủ nhiệm → từ chối, đề tài giữ nguyên.

## Requirements

### Functional Requirements

- **BR-01 / FR-001.** Khi đề tài PASSED, chuyên viên đã rà thủ công trong pilot chưa bật kết nối kế toán, người có quyền có thể chuyên viên quyết toán. Kết quả phải quan sát được: chuyển COMPLETED, khóa kinh phí và ghi audit (AC-01).
- **BR-02 / FR-002.** Với tình huống chủ nhiệm, thao tác tự đóng phải cho kết quả từ chối, đề tài giữ nguyên (AC-02).

- **BR-03 / FR-003 (đề xuất).** Khuyến nghị rà thủ công theo F05 BR-07 cho pilot. Khi có dữ liệu đối soát và còn MISMATCHED, F06 AC-10 chặn. PO cùng tài chính phải thống nhất hai spec trước khi giao task chuyển trạng thái. Kiểm bằng AC-03.

### Key Entities

Đầu vào nghiệp vụ: Hồ sơ PASSED, người quyết toán, kết quả rà và sai lệch nếu đã có. Đầu ra cần đối chiếu: Hồ sơ COMPLETED, sổ bị khóa, nhật ký quyết toán.

## Success Criteria

- **SC-001.** Hai tình huống gốc của US-24 đúng 2/2 khi chạy riêng bằng bộ dữ liệu trên.
- **SC-002.** Trong bộ thử hai tổ chức, 0 hồ sơ ngoài phạm vi xuất hiện trong kết quả hoặc được thay đổi bởi người của tổ chức kia.

## Assumptions

Phụ thuộc F05, F06, P01, P02. Phạm vi chỉ gồm kết quả của user story này. Có thể thương lượng vị trí thể hiện trạng thái khóa.
