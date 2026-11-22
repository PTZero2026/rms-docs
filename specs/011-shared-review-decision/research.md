---
story: US-11
feature: F03
review_id: RV-11
status: Draft
updated: 2026-11-21
---

# Căn cứ và quyết định · US-11

**Vấn đề.** Khi cơ sở yêu cầu cả đạo đức lẫn khoa học, lúc nào được phê duyệt đề tài?

**Quyết định ngày 21/11/2026.** Lưu kết luận khoa học riêng. Khi khoa học đạt, đề tài chuyển `APPROVED` nếu quy chế không yêu cầu thẩm định đạo đức hoặc hội đồng đạo đức đã thông qua. Nếu còn chờ hoặc cần bổ sung, giữ `UNDER_REVIEW` và hiển thị việc còn chờ cho chủ nhiệm. Nếu hội đồng đạo đức từ chối cuối cùng, chuyển `REJECTED` và thông báo kết luận. Chỉ gửi thông báo phê duyệt một lần khi chuyển `APPROVED`.

**Lý do.** Trong trường hợp đủ phiếu khoa học, điểm vừa đạt nhưng hồ sơ bắt buộc thẩm định đạo đức đang chờ, người dùng cần thấy kết quả “lưu kết quả hội đồng, đề tài chưa APPROVED”. Phương án khác: Phê duyệt ngay khi hội đồng khoa học đạt ngưỡng. Dùng TC-03 để phân biệt hai phương án. [RV-11](../review-decisions.md#rv-11)

**Tài liệu đối chiếu.** [F03](../../docs/features/F03-xet-duyet-hoi-dong/spec.md) — AC-03, AC-04, AC-05. Các tiêu chí sau dẫn lại từ tài liệu nguồn để DEV/QA thấy cả điều kiện đi kèm. Phần được giao giới hạn trong [spec](spec.md).

- **AC-03** — Khoa học đạt và đủ kết quả đạo đức bắt buộc mới chuyển `APPROVED`. Khi còn chờ hoặc cần bổ sung, đề tài vẫn `UNDER_REVIEW`.

- **AC-04 (Biên — điểm ngưỡng REJECTED)** — Given đủ phiếu nhưng `aggregateScore < PASSING_SCORE`; When chuyên viên ra kết luận; Then `conclusion=FAILED`, `ResearchProject` chuyển `REJECTED`, chủ nhiệm nhận thông báo từ chối.

- **AC-05 (Biên — thiếu phiếu)** — Given số phiếu `SUBMITTED` < `MIN_SUBMITTED_SCORE_SHEETS`; When chuyên viên cố ra kết luận; Then hệ thống chặn, hiển thị số phiếu còn thiếu, không đổi trạng thái đề tài (BR-07).

**Nguồn làm việc.** [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md). [test-plan.md](../../docs/features/F03-xet-duyet-hoi-dong/test-plan.md) · [ui.md](../../docs/features/F03-xet-duyet-hoi-dong/ui.md)

**Căn cứ.** RV-11 cụ thể hóa quyết định thẩm định song song ở F03 BR-08 và AC-03/04. [Bản đồ migration](../../docs/architecture/migration-coverage.md).
