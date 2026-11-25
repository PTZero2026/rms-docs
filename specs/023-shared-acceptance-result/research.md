---
story: US-23
feature: F06
review_id: RV-23
status: Draft
updated: 2026-11-24
---

# Căn cứ và quyết định · US-23

**Vấn đề.** Một phiếu xét duyệt đầu vào có được tính để đủ số phiếu nghiệm thu?

**Quyết định triển khai.** Chỉ tính phiếu đã gửi của đợt nghiệm thu đang kết luận.

**Lý do.** Trong trường hợp đợt nghiệm thu thiếu một phiếu, đề tài có một phiếu xét duyệt đầu vào, người dùng cần thấy kết quả “vẫn thiếu một phiếu, chưa chuyển PASSED”. Phương án khác: Tính mọi phiếu gắn cùng mã đề tài. Dùng TC-03 để phân biệt hai phương án. [RV-23](../review-decisions.md#rv-23)

**Tài liệu đối chiếu.** [F06](../../docs/features/F06-nghiem-thu/spec.md) — AC-04, AC-06. Các tiêu chí sau dẫn lại từ tài liệu nguồn để DEV/QA thấy cả điều kiện đi kèm. Phần được giao giới hạn trong [spec](spec.md).

- **AC-04 (Happy — kết luận PASSED & đóng đề tài)** — Given đủ phiếu, `aggregateScore ≥ PASSING_SCORE`; When chuyên viên ra kết luận, rồi F05 xác nhận quyết toán xong; Then `conclusion=PASSED`, `ResearchProject` `PASSED`, sau quyết toán chuyển `COMPLETED`, thông báo chủ nhiệm.

- **AC-06 (Biên — thiếu phiếu)** — Given số phiếu `SUBMITTED` < `MIN_SUBMITTED_SCORE_SHEETS`; When chuyên viên cố ra kết luận; Then chặn, báo số phiếu thiếu, không đổi trạng thái (BR-07).

**Nguồn làm việc.** [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md). [test-plan.md](../../docs/features/F06-nghiem-thu/test-plan.md) · [ui.md](../../docs/features/F06-nghiem-thu/ui.md)
