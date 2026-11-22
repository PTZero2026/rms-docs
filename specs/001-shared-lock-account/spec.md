---
id: US-01
feature: B03
epic: E0
channel: shared
wave: A
status: Draft
updated: 2026-11-21
---

# Khóa tài khoản của người rời đơn vị

**Đầu vào** · [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md), US-01, cỡ S. **Nguồn nghiệp vụ** · [B03](../../docs/features/B03-quan-ly-nguoi-dung/spec.md) — AC-08, AC-09, AC-12. Các AC dưới đây có phạm vi riêng của US-01.

## Clarifications

### Session 2026-11-21

- Q: Có chờ hết phiên khi nhân sự rời trường? → A: Ngay khi tài khoản bị khóa, backend từ chối yêu cầu nghiệp vụ kế tiếp, kể cả tải lại hoặc lưu hồ sơ từ phiên đã mở. Người có quyền vẫn tra cứu được lịch sử trước khi khóa. [RV-01 · Chấp thuận](../review-decisions.md#rv-01)

## User Scenarios & Testing

### User Story 1 — Khóa tài khoản của người rời đơn vị (P1)

Quản trị viên khóa một tài khoản khi người dùng rời đơn vị để ngừng truy cập nghiệp vụ.

**Giá trị và phép thử độc lập.** Chuẩn bị một tài khoản hoạt động, hai vai trò. Thực hiện thao tác bằng đúng vai trò và kiểm đầu ra sau khi mở lại. Lát này thuộc đợt A.

- **AC-01** (US-01.1) — Given admin khóa đúng người. When gửi lệnh. Then tài khoản chuyển sang bị khóa và ghi audit.
- **AC-02** (US-01.2) — Given người chỉ có quyền xem. When gửi cùng yêu cầu. Then backend từ chối, tài khoản giữ nguyên.

- **AC-03** (US-01.3) — Với hồ sơ đang mở khi tài khoản bị khóa, yêu cầu tải lại hoặc lưu bị từ chối ngay. Nội dung đã lưu và lịch sử trước khi khóa vẫn tra cứu được bằng tài khoản có quyền.

### Edge Cases

Người chỉ có quyền xem → backend từ chối, tài khoản giữ nguyên.

## Requirements

### Functional Requirements

- **BR-01 / FR-001.** Khi admin khóa đúng người, người có quyền có thể gửi lệnh. Kết quả phải quan sát được: tài khoản chuyển sang bị khóa và ghi audit (AC-01).
- **BR-02 / FR-002.** Với tình huống người chỉ có quyền xem, thao tác gửi cùng yêu cầu phải cho kết quả backend từ chối, tài khoản giữ nguyên (AC-02).

- **BR-03 / FR-003.** Ngay khi tài khoản bị khóa, backend từ chối yêu cầu nghiệp vụ kế tiếp, kể cả tải lại hoặc lưu hồ sơ từ phiên đã mở. Người có quyền vẫn tra cứu được lịch sử trước khi khóa. Kiểm bằng AC-03.

### Key Entities

Đầu vào nghiệp vụ: Tài khoản đích và xác nhận khóa. Đầu ra cần đối chiếu: Trạng thái truy cập và sự kiện ACCOUNT_LOCKED.

## Success Criteria

- **SC-001.** Hai tình huống gốc của US-01 đúng 2/2 khi chạy riêng bằng bộ dữ liệu trên.
- **SC-002.** Trong bộ thử hai tổ chức, 0 hồ sơ ngoài phạm vi xuất hiện trong kết quả hoặc được thay đổi bởi người của tổ chức kia.

## Assumptions

Phụ thuộc B03, P02. Phạm vi chỉ gồm kết quả của user story này. Có thể thương lượng lời nhắc xác nhận khóa.
