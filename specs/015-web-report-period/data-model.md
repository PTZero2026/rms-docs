---
story: US-15
feature: F04
review_id: RV-15
status: Draft
updated: 2026-11-18
---

# Mô hình dữ liệu · US-15

| Trường trọng tâm | Ràng buộc của lát | Nguồn |
|---|---|---|
| `ProgressReport.period` | Mỗi đề tài có tối đa một báo cáo cùng kỳ. | [F04](../../docs/features/F04-quan-ly-tien-do/spec.md) |

ProgressReport thuộc một đề tài đang thực hiện. Cặp đề tài và period xác định kỳ, dueDate là hạn nghiệp vụ.

Đối tượng nguồn và liên kết nghiệp vụ: Đề tài đang làm, mã kỳ và hạn nộp. Khung nhìn hoặc kết quả ghi: Một báo cáo PENDING_SUBMISSION cho kỳ mới. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi.

**Biên trạng thái.** Khi tạo kỳ và hạn với dữ liệu hợp lệ: xuất hiện đúng một báo cáo chờ nộp. Nhánh đã có cùng kỳ trên đề tài: từ chối bản trùng. Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ.

Các bảng dùng chung theo [mô hình đích](../../docs/architecture/data-model.md). [RV-15](../review-decisions.md#rv-15) điều chỉnh phép kiểm liên quan đến `ProgressReport.period`.
