---
story: US-11
feature: F03
review_id: RV-11
status: Draft
updated: 2026-11-18
---

# Mô hình dữ liệu · US-11

| Trường trọng tâm | Ràng buộc của lát | Nguồn |
|---|---|---|
| `EvaluationRound.conclusion` | Tổng hợp phiếu đã gửi theo ngưỡng áp dụng cho đợt. | [F03](../../docs/features/F03-xet-duyet-hoi-dong/spec.md) |

EvaluationRound tổng hợp các ScoreSheet đã gửi của chính đợt. Kết luận hội đồng và trạng thái ResearchProject có thể khác mốc thời gian.

Đối tượng nguồn và liên kết nghiệp vụ: Đợt đang thu phiếu, ngưỡng, phiếu đã nộp, kết quả đạo đức nếu áp dụng. Khung nhìn hoặc kết quả ghi: Kết luận đợt, trạng thái đề tài và số phiếu thiếu nếu bị chặn. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi.

**Biên trạng thái.** Khi kết luận với dữ liệu hợp lệ: đề tài APPROVED và ghi audit. Nhánh chưa đủ phiếu: hiển thị số phiếu thiếu, đợt giữ nguyên. Chuyển trạng thái đề tài qua P01, lưu lịch sử và P02 cùng giao dịch.

Các bảng dùng chung theo [mô hình đích](../../docs/architecture/data-model.md). [RV-11](../review-decisions.md#rv-11) điều chỉnh phép kiểm liên quan đến `EvaluationRound.conclusion`.
