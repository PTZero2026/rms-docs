---
id: US-11
feature: F03
epic: E1
channel: shared
wave: A
status: Draft
updated: 2026-11-21
---

# Chốt kết quả xét duyệt

**Đầu vào** · [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md), US-11, cỡ M. **Nguồn nghiệp vụ** · [F03](../../docs/features/F03-xet-duyet-hoi-dong/spec.md) — AC-03, AC-04, AC-05. Các AC dưới đây có phạm vi riêng của US-11.

## Clarifications

### Session 2026-11-21

- Q: Khi cơ sở yêu cầu cả đạo đức lẫn khoa học, lúc nào được phê duyệt đề tài? → A: Lưu kết luận khoa học riêng. Khi khoa học đạt, đề tài chuyển `APPROVED` nếu quy chế không yêu cầu thẩm định đạo đức hoặc hội đồng đạo đức đã thông qua. Nếu còn chờ hoặc cần bổ sung, giữ `UNDER_REVIEW` và hiển thị việc còn chờ cho chủ nhiệm. Nếu hội đồng đạo đức từ chối cuối cùng, chuyển `REJECTED` và thông báo kết luận. Chỉ gửi thông báo phê duyệt một lần khi chuyển `APPROVED`. [RV-11 đã chấp thuận](../review-decisions.md#rv-11).

## User Scenarios & Testing

### User Story 1 — Chốt kết quả xét duyệt (P1)

Chuyên viên kết luận theo số phiếu và ngưỡng điểm để công bố đúng quyết định của đợt.

**Giá trị và phép thử độc lập.** Chuẩn bị ba bộ phiếu dựng sẵn ở trên, dưới và bằng ngưỡng. Thực hiện thao tác bằng đúng vai trò và kiểm đầu ra sau khi mở lại. Lát này thuộc đợt A.

- **AC-01** (US-11.1) — Given đủ phiếu, điểm bằng ngưỡng đạt, quy chế không yêu cầu đạo đức hoặc đã có kết quả đạt. When kết luận. Then đề tài APPROVED và ghi audit.
- **AC-02** (US-11.2) — Given chưa đủ phiếu. When kết luận. Then hiển thị số phiếu thiếu, đợt giữ nguyên.

- **AC-03** (US-11.3, RV-11) — Given Đủ phiếu khoa học, điểm vừa đạt nhưng hồ sơ bắt buộc thẩm định đạo đức đang chờ. When chuyên viên chốt khoa học. Then lưu kết luận khoa học `PASSED`, giữ `UNDER_REVIEW` và hiện bước chờ. Khi có yêu cầu bổ sung, chủ nhiệm thấy nội dung cần bổ sung. Khi thông qua, chuyển `APPROVED` và báo duyệt một lần. Nếu từ chối cuối cùng, chuyển `REJECTED` và báo kết luận cho chủ nhiệm.

### Edge Cases

Chưa đủ phiếu → hiển thị số phiếu thiếu, đợt giữ nguyên.

## Requirements

### Functional Requirements

- **BR-01 / FR-001.** Khi đủ phiếu, điểm bằng ngưỡng đạt, quy chế không yêu cầu đạo đức hoặc đã có kết quả đạt, người có quyền có thể kết luận. Kết quả phải quan sát được: đề tài APPROVED và ghi audit (AC-01).
- **BR-02 / FR-002.** Với tình huống chưa đủ phiếu, thao tác kết luận phải cho kết quả hiển thị số phiếu thiếu, đợt giữ nguyên (AC-02).

- **BR-03 / FR-003.** Lưu kết luận khoa học riêng. Khi khoa học đạt, đề tài chuyển `APPROVED` nếu quy chế không yêu cầu thẩm định đạo đức hoặc hội đồng đạo đức đã thông qua. Nếu còn chờ hoặc cần bổ sung, giữ `UNDER_REVIEW` và hiển thị việc còn chờ cho chủ nhiệm. Nếu hội đồng đạo đức từ chối cuối cùng, chuyển `REJECTED` và thông báo kết luận. Chỉ gửi thông báo phê duyệt một lần khi chuyển `APPROVED`. Kiểm bằng AC-03.

### Key Entities

Đầu vào nghiệp vụ: Đợt khoa học, ngưỡng và phiếu đã nộp hoặc kết luận khoa học đã lưu, yêu cầu và kết quả đạo đức nếu áp dụng. Đầu ra cần đối chiếu: Kết luận đợt, trạng thái đề tài và số phiếu thiếu nếu bị chặn.

## Success Criteria

- **SC-001.** Hai tình huống gốc của US-11 đúng 2/2 khi chạy riêng bằng bộ dữ liệu trên.
- **SC-002.** Trong bộ thử hai tổ chức, 0 hồ sơ ngoài phạm vi xuất hiện trong kết quả hoặc được thay đổi bởi người của tổ chức kia.

## Assumptions

Phụ thuộc F03, P01, B04. Phạm vi chỉ gồm kết quả của user story này. Có thể thương lượng cách trình bày bảng tổng điểm.
