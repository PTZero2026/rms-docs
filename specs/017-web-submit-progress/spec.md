---
id: US-17
feature: F04
epic: E2
channel: web
wave: B
status: Draft
updated: 2026-11-24
---

# Nộp báo cáo tiến độ

**Đầu vào** · [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md), US-17, cỡ S. **Nguồn nghiệp vụ** · [F04](../../docs/features/F04-quan-ly-tien-do/spec.md) — AC-03, AC-08, AC-09. Các AC dưới đây có phạm vi riêng của US-17.

## Clarifications

### Session 2026-11-18

- Q: Có chặn báo cáo quá hạn nếu đề tài vẫn đang thực hiện? → A: Nhận hồ sơ, ghi giờ và nhãn trễ, chặn khi đề tài tạm dừng. [RV-17](../review-decisions.md#rv-17). BA/PO chốt cho triển khai ngày 24/11/2026.

## User Scenarios & Testing

### User Story 1 — Nộp báo cáo tiến độ (P1)

Chủ nhiệm đính báo cáo của kỳ và nộp để chuyên viên theo dõi được cả thời điểm nộp trễ.

**Giá trị và phép thử độc lập.** Chuẩn bị kỳ chờ nộp của đề tài đang làm và đề tài tạm dừng. Thực hiện thao tác bằng đúng vai trò và kiểm đầu ra sau khi mở lại. Lát này thuộc đợt B.

- **AC-01** (US-17.1) — Given đang thực hiện, kỳ quá hạn. When nộp. Then ghi nhận thời điểm, thể hiện trễ, chuyển chờ duyệt.
- **AC-02** (US-17.2) — Given đề tài tạm dừng. When nộp cùng loại báo cáo. Then chặn và giữ trạng thái kỳ.

- **AC-03** (US-17.3) — Given Báo cáo đến đúng hạn trong khi đề tài đang thực hiện. When chủ nhiệm nộp đủ tệp. Then ghi nhận đúng hạn và chuyển chờ duyệt.

### Edge Cases

Đề tài tạm dừng → chặn và giữ trạng thái kỳ.

## Requirements

### Functional Requirements

- **BR-01 / FR-001.** Khi đang thực hiện, kỳ quá hạn, người có quyền có thể nộp. Kết quả phải quan sát được: ghi nhận thời điểm, thể hiện trễ, chuyển chờ duyệt (AC-01).
- **BR-02 / FR-002.** Với tình huống đề tài tạm dừng, thao tác nộp cùng loại báo cáo phải cho kết quả chặn và giữ trạng thái kỳ (AC-02).

- **BR-03 / FR-003.** Nhận hồ sơ, ghi giờ và nhãn trễ, chặn khi đề tài tạm dừng. Kiểm bằng AC-03.

### Key Entities

Đầu vào nghiệp vụ: Báo cáo chờ, nội dung và tệp, thời điểm nhận. Đầu ra cần đối chiếu: Báo cáo SUBMITTED, dấu trễ và giờ nhận.

## Success Criteria

- **SC-001.** Hai tình huống gốc của US-17 đúng 2/2 khi chạy riêng bằng bộ dữ liệu trên.
- **SC-002.** Trong bộ thử hai tổ chức, 0 hồ sơ ngoài phạm vi xuất hiện trong kết quả hoặc được thay đổi bởi người của tổ chức kia.

## Assumptions

Phụ thuộc F04, B04. Phạm vi chỉ gồm kết quả của user story này. Có thể thương lượng vị trí hiển thị nhãn nộp muộn.
