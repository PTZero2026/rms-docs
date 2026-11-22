---
id: US-24
feature: F05
epic: E2
channel: shared
wave: B
status: Draft
updated: 2026-11-21
---

# Quyết toán và đóng hồ sơ

**Đầu vào** · [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md), US-24, cỡ M. **Nguồn nghiệp vụ** · [F05](../../docs/features/F05-quan-ly-kinh-phi/spec.md) — AC-05, AC-07. Các AC dưới đây có phạm vi riêng của US-24.

## Clarifications

### Session 2026-11-21

- Q: Điều kiện khóa sổ của mỗi chế độ là gì? → A: Pilot chưa bật đối soát dùng kết quả rà thủ công. Khi đã bật, mọi khoản phải `MATCHED`. Nếu còn `UNRECONCILED` hoặc `MISMATCHED`, giữ `PASSED` và liệt kê từng khoản vướng. [RV-24 đã chấp thuận](../review-decisions.md#rv-24).

## User Scenarios & Testing

### User Story 1 — Quyết toán và đóng hồ sơ (P1)

Chuyên viên khóa sổ theo dõi kinh phí của một đề tài nghiệm thu đạt để ghi nhận hoàn thành.

**Giá trị và phép thử độc lập.** Chuẩn bị hồ sơ PASSED cho hai chế độ, gồm pilot rà thủ công và đơn vị bật đối soát với các khoản MATCHED, UNRECONCILED, MISMATCHED. Thực hiện thao tác bằng đúng vai trò và kiểm đầu ra sau khi mở lại. Lát này thuộc đợt B.

- **AC-01** (US-24.1) — Given đề tài PASSED, chuyên viên đã rà thủ công ở pilot chưa bật đối soát hoặc mọi khoản đều MATCHED ở đơn vị đã bật. When chuyên viên quyết toán. Then chuyển COMPLETED, khóa kinh phí và ghi audit.
- **AC-02** (US-24.2) — Given chủ nhiệm. When tự đóng. Then từ chối, đề tài giữ nguyên.

- **AC-03** (US-24.3, RV-24) — Given Đề tài PASSED đã bật đối soát và còn ít nhất một khoản UNRECONCILED hoặc MISMATCHED. When chuyên viên đóng sổ. Then giữ PASSED, liệt kê mã và trạng thái từng khoản cần xử lý trước khi đóng.

### Edge Cases

Chủ nhiệm → từ chối, đề tài giữ nguyên.

## Requirements

### Functional Requirements

- **BR-01 / FR-001.** Khi đề tài PASSED và đủ điều kiện theo chế độ của đơn vị (AC-01), chuyên viên xác nhận quyết toán để chuyển COMPLETED, khóa kinh phí và ghi audit.
- **BR-02 / FR-002.** Với tình huống chủ nhiệm, thao tác tự đóng phải cho kết quả từ chối, đề tài giữ nguyên (AC-02).

- **BR-03 / FR-003.** Pilot chưa bật đối soát dùng kết quả rà thủ công. Khi đã bật, mọi khoản phải `MATCHED`. Nếu còn `UNRECONCILED` hoặc `MISMATCHED`, giữ `PASSED` và liệt kê từng khoản vướng. Kiểm bằng AC-03.

### Key Entities

Đầu vào nghiệp vụ: Hồ sơ PASSED, người quyết toán, chế độ đối soát của đơn vị, kết quả rà thủ công hoặc trạng thái đối soát của từng khoản. Đầu ra cần đối chiếu: Hồ sơ COMPLETED, sổ bị khóa, nhật ký quyết toán.

## Success Criteria

- **SC-001.** Hai tình huống gốc của US-24 đúng 2/2 khi chạy riêng bằng bộ dữ liệu trên.
- **SC-002.** Trong bộ thử hai tổ chức, 0 hồ sơ ngoài phạm vi xuất hiện trong kết quả hoặc được thay đổi bởi người của tổ chức kia.

## Assumptions

Phụ thuộc F05, F06, P01, P02. Phạm vi chỉ gồm kết quả của user story này. Có thể thương lượng vị trí thể hiện trạng thái khóa.
