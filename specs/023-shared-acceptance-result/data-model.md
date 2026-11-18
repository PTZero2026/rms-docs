---
story: US-23
feature: F06
review_id: RV-23
status: Draft
updated: 2026-11-18
---

# Mô hình dữ liệu · US-23

| Trường trọng tâm | Ràng buộc của lát | Nguồn |
|---|---|---|
| `EvaluationRound.type` | Hội đồng, tiêu chí và phiếu dùng loại ACCEPTANCE của đúng đợt. | [F06](../../docs/features/F06-nghiem-thu/spec.md) |

EvaluationRound nghiệm thu dùng type ACCEPTANCE và chỉ các phiếu SUBMITTED của chính đợt. Kết luận đạt bàn giao sang F05.

Đối tượng nguồn và liên kết nghiệp vụ: Đợt nghiệm thu, phiếu hợp lệ và ngưỡng. Khung nhìn hoặc kết quả ghi: Kết luận PASSED và bàn giao F05. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi.

**Biên trạng thái.** Khi kết luận với dữ liệu hợp lệ: đề tài PASSED, chờ quyết toán F05. Nhánh thiếu một phiếu bắt buộc: chặn và báo số phiếu thiếu. Chuyển trạng thái đề tài qua P01, lưu lịch sử và P02 cùng giao dịch.

Các bảng dùng chung theo [mô hình đích](../../docs/architecture/data-model.md). [RV-23](../review-decisions.md#rv-23) điều chỉnh phép kiểm liên quan đến `EvaluationRound.type`.
