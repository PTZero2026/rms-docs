---
story: US-11
feature: F03
review_id: RV-11
status: Draft
updated: 2026-11-18
---

# Căn cứ và quyết định · US-11

**Vấn đề.** Khi cơ sở yêu cầu cả đạo đức lẫn khoa học, lúc nào được phê duyệt đề tài?

**Khuyến nghị hiện dùng.** Lưu kết luận khoa học riêng, giữ chuyển APPROVED cho tới khi đủ kết quả đạo đức nếu quy chế yêu cầu.

**Lý do.** Trong trường hợp đủ phiếu khoa học, điểm vừa đạt nhưng hồ sơ bắt buộc thẩm định đạo đức đang chờ, người dùng cần thấy kết quả “lưu kết quả hội đồng, đề tài chưa APPROVED”. Phương án khác: Phê duyệt ngay khi hội đồng khoa học đạt ngưỡng. Dùng TC-03 để phân biệt hai phương án. [RV-11](../review-decisions.md#rv-11)

**Tài liệu đối chiếu.** [F03](../../docs/features/F03-xet-duyet-hoi-dong/spec.md) — AC-03, AC-04, AC-05. Các tiêu chí sau dẫn lại từ tài liệu nguồn để DEV/QA thấy cả điều kiện đi kèm. Phần được giao giới hạn trong [spec](spec.md).

- **AC-03 (Happy — kết luận APPROVED)** — Given số phiếu `SUBMITTED` ≥ ngưỡng tối thiểu và `aggregateScore` ≥ `PASSING_SCORE`; When chuyên viên ra kết luận; Then `EvaluationRound.conclusion=PASSED`, đợt chuyển `CONCLUDED`, `ResearchProject` chuyển `APPROVED`, chủ nhiệm nhận thông báo kết quả.

- **AC-04 (Biên — điểm ngưỡng REJECTED)** — Given đủ phiếu nhưng `aggregateScore < PASSING_SCORE`; When chuyên viên ra kết luận; Then `conclusion=FAILED`, `ResearchProject` chuyển `REJECTED`, chủ nhiệm nhận thông báo từ chối.

- **AC-05 (Biên — thiếu phiếu)** — Given số phiếu `SUBMITTED` < `MIN_SUBMITTED_SCORE_SHEETS`; When chuyên viên cố ra kết luận; Then hệ thống chặn, hiển thị số phiếu còn thiếu, không đổi trạng thái đề tài (BR-07).

**Nguồn làm việc.** [Danh mục INVEST](../../docs/sales/thi-truong-viet-nam-2026/feature-list-invest.md). [test-plan.md](../../docs/features/F03-xet-duyet-hoi-dong/test-plan.md) · [ui.md](../../docs/features/F03-xet-duyet-hoi-dong/ui.md)

**Điểm lệch cần chủ nghiệp vụ phân xử.** F03 AC-03 mô tả duyệt sau kết quả khoa học; bản đồ migration đã chốt thẩm định song song cho trường hợp phải có đạo đức. RV-11 giữ kết quả khoa học ở cấp đợt trong khi chờ hội đồng thứ hai. PO và hai thư ký duyệt lại BR/AC F03 và đầu ra thông báo. [Bản đồ migration](../../docs/architecture/migration-coverage.md).
