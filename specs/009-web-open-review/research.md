---
story: US-09
feature: F03
review_id: RV-09
status: Draft
updated: 2026-11-18
---

# Căn cứ và quyết định · US-09

**Vấn đề.** Hai chuyên viên cùng mở đợt cho một đề tài thì sao?

**Khuyến nghị hiện dùng.** Chỉ mở một đợt đang thu phiếu cho cùng hồ sơ và lần xét, trả thông tin đợt đã mở cho lần sau.

**Lý do.** Trong trường hợp hai chuyên viên cùng chọn một hồ sơ đủ điều kiện, người dùng cần thấy kết quả “chỉ một đợt thu phiếu, một lần chuyển trạng thái”. Phương án khác: Mở nhiều đợt đồng thời rồi gộp phiếu khi khóa sổ. Dùng TC-03 để phân biệt hai phương án. [RV-09](../review-decisions.md#rv-09)

**Tài liệu đối chiếu.** [F03](../../docs/features/F03-xet-duyet-hoi-dong/spec.md) — AC-01, AC-09. Các tiêu chí sau dẫn lại từ tài liệu nguồn để DEV/QA thấy cả điều kiện đi kèm. Phần được giao giới hạn trong [spec](spec.md).

- **AC-01 (Happy — mở xét duyệt)** — Given một đề tài `SUBMITTED` thuộc kỳ nhận đề xuất đã đóng và đã gán bộ tiêu chí `PROPOSAL_REVIEW`, và đã có hội đồng `PROPOSAL_REVIEW` với ≥ 1 thành viên; When chuyên viên tạo `EvaluationRound` cho đề tài; Then hệ thống tạo đợt đánh giá `COLLECTING_SCORES`, chuyển `ResearchProject` sang `UNDER_REVIEW`, gửi thông báo cho chủ nhiệm và ghi audit.

- **AC-09 (Negative — sai quyền)** — Given người dùng là **Thành viên hội đồng** (không phải chuyên viên); When gọi hành động ra kết luận / lập hội đồng; Then hệ thống trả 403, không thực hiện (BR-09).

**Nguồn làm việc.** [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md). [test-plan.md](../../docs/features/F03-xet-duyet-hoi-dong/test-plan.md) · [ui.md](../../docs/features/F03-xet-duyet-hoi-dong/ui.md)
