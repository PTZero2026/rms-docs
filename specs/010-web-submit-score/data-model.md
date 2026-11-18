---
story: US-10
feature: F03
review_id: RV-10
status: Draft
updated: 2026-11-18
---

# Mô hình dữ liệu · US-10

| Trường trọng tâm | Ràng buộc của lát | Nguồn |
|---|---|---|
| `CriterionScore.score` | Điểm nằm trong miền từ 0 đến tối đa của từng tiêu chí. | [F03](../../docs/features/F03-xet-duyet-hoi-dong/spec.md) |

ScoreSheet thuộc một người chấm trong một EvaluationRound. Mỗi CriterionScore thuộc một tiêu chí của bộ dùng cho đợt.

Đối tượng nguồn và liên kết nghiệp vụ: Đợt, thành viên, điểm và nhận xét theo tiêu chí. Khung nhìn hoặc kết quả ghi: Phiếu đã nộp, tổng trọng số và trạng thái khóa. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi.

**Biên trạng thái.** Khi gửi với dữ liệu hợp lệ: tính tổng theo trọng số, khóa phiếu đã nộp. Nhánh người chấm là thành viên đề tài: không thấy việc chấm và không tạo được phiếu. Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ.

Các bảng dùng chung theo [mô hình đích](../../docs/architecture/data-model.md). [RV-10](../review-decisions.md#rv-10) điều chỉnh phép kiểm liên quan đến `CriterionScore.score`.
