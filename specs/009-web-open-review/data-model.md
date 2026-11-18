---
story: US-09
feature: F03
review_id: RV-09
status: Draft
updated: 2026-11-18
---

# Mô hình dữ liệu · US-09

| Trường trọng tâm | Ràng buộc của lát | Nguồn |
|---|---|---|
| `EvaluationRound.type` | Đợt xét đầu vào dùng PROPOSAL_REVIEW và hội đồng tương ứng. | [F03](../../docs/features/F03-xet-duyet-hoi-dong/spec.md) |

EvaluationRound gắn một đề tài, hội đồng và bộ tiêu chí PROPOSAL_REVIEW. Thành viên chấm phải thuộc phân công của đợt.

Đối tượng nguồn và liên kết nghiệp vụ: Hồ sơ chốt, hội đồng, bộ tiêu chí và phân công. Khung nhìn hoặc kết quả ghi: Đợt thu phiếu và danh sách người được chấm. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi.

**Biên trạng thái.** Khi chuyên viên mở đợt với dữ liệu hợp lệ: đề tài chuyển UNDER_REVIEW và đợt thu phiếu bắt đầu. Nhánh thành viên chỉ có quyền chấm: từ chối, không tạo đợt. Chuyển trạng thái đề tài qua P01, lưu lịch sử và P02 cùng giao dịch.

Các bảng dùng chung theo [mô hình đích](../../docs/architecture/data-model.md). [RV-09](../review-decisions.md#rv-09) điều chỉnh phép kiểm liên quan đến `EvaluationRound.type`.
