---
story: US-17
feature: F04
review_id: RV-17
status: Draft
updated: 2026-11-18
---

# Mô hình dữ liệu · US-17

| Trường trọng tâm | Ràng buộc của lát | Nguồn |
|---|---|---|
| `ProgressReport.submittedAt` | Lấy giờ tiếp nhận để xác định trễ sau hạn của kỳ. | [F04](../../docs/features/F04-quan-ly-tien-do/spec.md) |

ProgressReport gắn đề tài, kỳ, tệp và nội dung, trạng thái PENDING_SUBMISSION hoặc trạng thái nguồn hợp lệ khi nộp lại.

Đối tượng nguồn và liên kết nghiệp vụ: Báo cáo chờ, nội dung và tệp, thời điểm nhận. Khung nhìn hoặc kết quả ghi: Báo cáo SUBMITTED, dấu trễ và giờ nhận. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi.

**Biên trạng thái.** Khi nộp với dữ liệu hợp lệ: ghi nhận thời điểm, thể hiện trễ, chuyển chờ duyệt. Nhánh đề tài tạm dừng: chặn và giữ trạng thái kỳ. Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ.

Các bảng dùng chung theo [mô hình đích](../../docs/architecture/data-model.md). [RV-17](../review-decisions.md#rv-17) điều chỉnh phép kiểm liên quan đến `ProgressReport.submittedAt`.
