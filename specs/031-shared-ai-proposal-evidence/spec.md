---
id: US-31
feature: F01
epic: E1
channel: shared
wave: C
status: Draft
updated: 2026-11-18
---

# Đối chiếu mục bắt buộc trong một thuyết minh

**Đầu vào** · [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md), US-31, cỡ M. **Nguồn nghiệp vụ** · [F01](../../docs/features/F01-de-xuat-de-tai/spec.md) — Đề xuất mới, chờ PO/BA xác lập AC nghiệp vụ. Các AC dưới đây có phạm vi riêng của US-31.

## Clarifications

### Session 2026-11-18

- Q: Nếu không tìm thấy căn cứ đáng tin hoặc quyền đọc vừa bị thu hồi thì sao? → A: Hiện chưa đủ căn cứ hoặc từ chối truy xuất; giữ nguyên thuyết minh, cho rà thủ công. Trước pilot kiểm 50 hồ sơ, tìm ≥90% mục thiếu, ≤10% cảnh báo sai, 0 lộ quyền và 0 dẫn chứng bịa. [RV-31](../review-decisions.md#rv-31). Khuyến nghị dùng để lập kế hoạch, chờ PO, chủ dữ liệu trường và QA AI xác nhận.

## User Scenarios & Testing

### User Story 1 — Đối chiếu mục bắt buộc trong một thuyết minh (P1)

Chủ nhiệm yêu cầu trợ lý đọc một bản nháp được phép dùng và chỉ ra đoạn nào chứng minh một yêu cầu của mẫu.

**Giá trị và phép thử độc lập.** Chuẩn bị một mẫu yêu cầu, hai đoạn đã gán nhãn, một hồ sơ ở tenant khác. Thực hiện thao tác bằng đúng vai trò và kiểm đầu ra sau khi mở lại. Lát này thuộc đợt C.

- **AC-01** (US-31.1) — Given đoạn nguồn hợp lệ. When yêu cầu rà. Then thấy trích đoạn, vị trí và bản mẫu, chủ nhiệm có thể bác gợi ý.
- **AC-02** (US-31.2) — Given tài liệu ngoài quyền hoặc thiếu căn cứ. When yêu cầu rà. Then từ chối truy xuất hoặc ghi chưa đủ căn cứ, hồ sơ gốc giữ nguyên.

- **AC-03** (US-31.3, khuyến nghị) — Given Dịch vụ trợ lý gián đoạn lúc rà một thuyết minh. When chủ nhiệm trở lại biểu mẫu. Then vẫn rà thủ công và lưu được bản nháp của mình.

### Edge Cases

Tài liệu ngoài quyền hoặc thiếu căn cứ → từ chối truy xuất hoặc ghi chưa đủ căn cứ, hồ sơ gốc giữ nguyên.

## Requirements

### Functional Requirements

- **BR-01 / FR-001.** Khi đoạn nguồn hợp lệ, người có quyền có thể yêu cầu rà. Kết quả phải quan sát được: thấy trích đoạn, vị trí và bản mẫu, chủ nhiệm có thể bác gợi ý (AC-01).
- **BR-02 / FR-002.** Với tình huống tài liệu ngoài quyền hoặc thiếu căn cứ, thao tác yêu cầu rà phải cho kết quả từ chối truy xuất hoặc ghi chưa đủ căn cứ, hồ sơ gốc giữ nguyên (AC-02).

- **BR-03 / FR-003 (đề xuất).** Hiện chưa đủ căn cứ hoặc từ chối truy xuất; giữ nguyên thuyết minh, cho rà thủ công. Trước pilot kiểm 50 hồ sơ, tìm ≥90% mục thiếu, ≤10% cảnh báo sai, 0 lộ quyền và 0 dẫn chứng bịa. Kiểm bằng AC-03.

### Key Entities

Đầu vào nghiệp vụ: Bản nháp, mẫu yêu cầu, tài liệu cho phép và người yêu cầu. Đầu ra cần đối chiếu: Trích đoạn có vị trí/phiên bản hoặc thông báo thiếu căn cứ.

## Success Criteria

- **SC-001.** Hai tình huống gốc của US-31 đúng 2/2 khi chạy riêng bằng bộ dữ liệu trên.
- **SC-002.** Trong bộ thử hai tổ chức, 0 hồ sơ ngoài phạm vi xuất hiện trong kết quả hoặc được thay đổi bởi người của tổ chức kia.

## Assumptions

Chỉ bật trợ lý cho tenant và nguồn đã được phép. Phụ thuộc F01, B03, P02. Phạm vi chỉ gồm kết quả của user story này. Có thể thương lượng cách sắp các mục cần rà.
