---
id: US-15
feature: F04
epic: E2
channel: web
wave: B
status: Draft
updated: 2026-11-24
---

# Đặt hạn báo cáo theo kỳ

**Đầu vào** · [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md), US-15, cỡ S. **Nguồn nghiệp vụ** · [F04](../../docs/features/F04-quan-ly-tien-do/spec.md) — AC-02, AC-13. Các AC dưới đây có phạm vi riêng của US-15.

## Clarifications

### Session 2026-11-18

- Q: Hai đề tài có được dùng cùng mã kỳ không? → A: Áp khóa theo cặp đề tài và kỳ, cho hai đề tài khác nhau dùng cùng tên kỳ. [RV-15](../review-decisions.md#rv-15). BA/PO chốt cho triển khai ngày 24/11/2026.

## User Scenarios & Testing

### User Story 1 — Đặt hạn báo cáo theo kỳ (P1)

Chuyên viên lập một kỳ báo cáo có hạn nộp để chủ nhiệm biết thời điểm phải nộp tiến độ.

**Giá trị và phép thử độc lập.** Chuẩn bị một đề tài đang thực hiện và một mã kỳ. Thực hiện thao tác bằng đúng vai trò và kiểm đầu ra sau khi mở lại. Lát này thuộc đợt B.

- **AC-01** (US-15.1) — Given chưa có kỳ. When tạo kỳ và hạn. Then xuất hiện đúng một báo cáo chờ nộp.
- **AC-02** (US-15.2) — Given đã có cùng kỳ trên đề tài. When tạo lại. Then từ chối bản trùng.

- **AC-03** (US-15.3) — Given Hai đề tài đang thực hiện cùng chưa có kỳ 1. When tạo kỳ 1 cho từng đề tài. Then mỗi đề tài có một báo cáo chờ riêng.

### Edge Cases

Đã có cùng kỳ trên đề tài → từ chối bản trùng.

## Requirements

### Functional Requirements

- **BR-01 / FR-001.** Khi chưa có kỳ, người có quyền có thể tạo kỳ và hạn. Kết quả phải quan sát được: xuất hiện đúng một báo cáo chờ nộp (AC-01).
- **BR-02 / FR-002.** Với tình huống đã có cùng kỳ trên đề tài, thao tác tạo lại phải cho kết quả từ chối bản trùng (AC-02).

- **BR-03 / FR-003.** Áp khóa theo cặp đề tài và kỳ, cho hai đề tài khác nhau dùng cùng tên kỳ. Kiểm bằng AC-03.

### Key Entities

Đầu vào nghiệp vụ: Đề tài đang làm, mã kỳ và hạn nộp. Đầu ra cần đối chiếu: Một báo cáo PENDING_SUBMISSION cho kỳ mới.

## Success Criteria

- **SC-001.** Hai tình huống gốc của US-15 đúng 2/2 khi chạy riêng bằng bộ dữ liệu trên.
- **SC-002.** Trong bộ thử hai tổ chức, 0 hồ sơ ngoài phạm vi xuất hiện trong kết quả hoặc được thay đổi bởi người của tổ chức kia.

## Assumptions

Phụ thuộc F04, B04. Phạm vi chỉ gồm kết quả của user story này. Có thể thương lượng tên gợi nhớ của kỳ.
