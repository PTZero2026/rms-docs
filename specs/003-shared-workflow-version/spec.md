---
id: US-03
feature: P01
epic: E0
channel: shared
wave: A
status: Draft
updated: 2026-11-21
---

# Giữ quy trình của hồ sơ đang chạy

**Đầu vào** · [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md), US-03, cỡ M. **Nguồn nghiệp vụ** · [P01](../../docs/features/P01-workflow-engine/spec.md) — AC-03, AC-05. Các AC dưới đây có phạm vi riêng của US-03.

## Clarifications

### Session 2026-11-21

- Q: Áp dụng quy chế mới cho hồ sơ nào? → A: Mỗi hồ sơ dùng phiên bản quy trình có hiệu lực lúc tạo cho đến khi hoàn tất. Khi v2 có hiệu lực, hồ sơ đang chờ duyệt theo v1 tiếp tục chuyển bước theo v1. Hồ sơ tạo từ thời điểm đó dùng v2. [RV-03](../review-decisions.md#rv-03)

## User Scenarios & Testing

### User Story 1 — Giữ quy trình của hồ sơ đang chạy (P1)

Người quản lý quy trình phát hành một phiên bản cho hồ sơ mới để quy chế mới có ngày áp dụng rõ ràng.

**Giá trị và phép thử độc lập.** Chuẩn bị một hồ sơ ghim phiên bản 1 và một mẫu phiên bản 2. Thực hiện thao tác bằng đúng vai trò và kiểm đầu ra sau khi mở lại. Lát này thuộc đợt A.

- **AC-01** (US-03.1) — Given mẫu v2 hợp lệ. When kích hoạt và tạo hồ sơ. Then hồ sơ mới theo v2, hồ sơ cũ vẫn theo v1.
- **AC-02** (US-03.2) — Given mẫu có bước thiếu trạng thái chuẩn. When kích hoạt. Then từ chối và nêu bước cần sửa.

- **AC-03** (US-03.3) — Given Hồ sơ cũ còn một bước đang chờ khi v2 đã kích hoạt. When người xử lý hoàn tất bước. Then bước kế tiếp lấy từ v1.

### Edge Cases

Mẫu có bước thiếu trạng thái chuẩn → từ chối và nêu bước cần sửa.

## Requirements

### Functional Requirements

- **BR-01 / FR-001.** Khi mẫu v2 hợp lệ, người có quyền có thể kích hoạt và tạo hồ sơ. Kết quả phải quan sát được: hồ sơ mới theo v2, hồ sơ cũ vẫn theo v1 (AC-01).
- **BR-02 / FR-002.** Với tình huống mẫu có bước thiếu trạng thái chuẩn, thao tác kích hoạt phải cho kết quả từ chối và nêu bước cần sửa (AC-02).

- **BR-03 / FR-003.** Mỗi hồ sơ dùng phiên bản quy trình có hiệu lực lúc tạo cho đến khi hoàn tất. Khi v2 có hiệu lực, hồ sơ đang chờ duyệt theo v1 tiếp tục chuyển bước theo v1. Hồ sơ tạo từ thời điểm đó dùng v2. Kiểm bằng AC-03.

### Key Entities

Đầu vào nghiệp vụ: Mẫu quy trình, phiên bản và các bước có trạng thái chuẩn. Đầu ra cần đối chiếu: Phiên bản khả dụng cho hồ sơ mới hoặc danh sách bước lỗi.

## Success Criteria

- **SC-001.** Hai tình huống gốc của US-03 đúng 2/2 khi chạy riêng bằng bộ dữ liệu trên.
- **SC-002.** Trong bộ thử hai tổ chức, 0 hồ sơ ngoài phạm vi xuất hiện trong kết quả hoặc được thay đổi bởi người của tổ chức kia.

## Assumptions

Phụ thuộc B01, P01. Phạm vi chỉ gồm kết quả của user story này. Có thể thương lượng tên hiển thị của bước.
