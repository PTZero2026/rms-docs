---
id: US-09
feature: F03
epic: E1
channel: web
wave: A
status: Draft
updated: 2026-11-18
---

# Mở đợt chấm cho một đề tài

**Đầu vào** · [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md), US-09, cỡ M. **Nguồn nghiệp vụ** · [F03](../../docs/features/F03-xet-duyet-hoi-dong/spec.md) — AC-01, AC-09. Các AC dưới đây có phạm vi riêng của US-09.

## Clarifications

### Session 2026-11-18

- Q: Hai chuyên viên cùng mở đợt cho một đề tài thì sao? → A: Chỉ mở một đợt đang thu phiếu cho cùng hồ sơ và lần xét, trả thông tin đợt đã mở cho lần sau. [RV-09](../review-decisions.md#rv-09). Khuyến nghị dùng để lập kế hoạch, chờ Thư ký hội đồng và BA xác nhận.

## User Scenarios & Testing

### User Story 1 — Mở đợt chấm cho một đề tài (P1)

Chuyên viên gắn đề tài đã chốt vào hội đồng và bộ tiêu chí để phát phiếu cho người được phân công.

**Giá trị và phép thử độc lập.** Chuẩn bị kỳ đã đóng, hồ sơ đã nộp, hội đồng xét duyệt có thành viên. Thực hiện thao tác bằng đúng vai trò và kiểm đầu ra sau khi mở lại. Lát này thuộc đợt A.

- **AC-01** (US-09.1) — Given đủ điều kiện. When chuyên viên mở đợt. Then đề tài chuyển UNDER_REVIEW và đợt thu phiếu bắt đầu.
- **AC-02** (US-09.2) — Given thành viên chỉ có quyền chấm. When yêu cầu mở đợt. Then từ chối, không tạo đợt.

- **AC-03** (US-09.3, khuyến nghị) — Given Hai chuyên viên cùng chọn một hồ sơ đủ điều kiện. When xác nhận mở đợt đồng thời. Then chỉ một đợt thu phiếu, một lần chuyển trạng thái.

### Edge Cases

Thành viên chỉ có quyền chấm → từ chối, không tạo đợt.

## Requirements

### Functional Requirements

- **BR-01 / FR-001.** Khi đủ điều kiện, người có quyền có thể chuyên viên mở đợt. Kết quả phải quan sát được: đề tài chuyển UNDER_REVIEW và đợt thu phiếu bắt đầu (AC-01).
- **BR-02 / FR-002.** Với tình huống thành viên chỉ có quyền chấm, thao tác yêu cầu mở đợt phải cho kết quả từ chối, không tạo đợt (AC-02).

- **BR-03 / FR-003 (đề xuất).** Chỉ mở một đợt đang thu phiếu cho cùng hồ sơ và lần xét, trả thông tin đợt đã mở cho lần sau. Kiểm bằng AC-03.

### Key Entities

Đầu vào nghiệp vụ: Hồ sơ chốt, hội đồng, bộ tiêu chí và phân công. Đầu ra cần đối chiếu: Đợt thu phiếu và danh sách người được chấm.

## Success Criteria

- **SC-001.** Hai tình huống gốc của US-09 đúng 2/2 khi chạy riêng bằng bộ dữ liệu trên.
- **SC-002.** Trong bộ thử hai tổ chức, 0 hồ sơ ngoài phạm vi xuất hiện trong kết quả hoặc được thay đổi bởi người của tổ chức kia.

## Assumptions

Phụ thuộc F02, F03, P01. Phạm vi chỉ gồm kết quả của user story này. Có thể thương lượng cách sắp thứ tự thành viên.
