---
story: US-04
feature: P02
review_id: RV-04
status: Draft
updated: 2026-11-18
---

# Mô hình dữ liệu · US-04

| Trường trọng tâm | Ràng buộc của lát | Nguồn |
|---|---|---|
| `AuditLog.targetId` | Sự kiện gắn đối tượng nguồn và chỉ người trong phạm vi hiện tại được đọc. | [P02](../../docs/features/P02-audit/spec.md) |

AuditLog lưu tác nhân, đối tượng, hành động, trước/sau và giờ xảy ra. Quyền đọc lịch sử phụ thuộc quyền hiện tại trên đối tượng.

Đối tượng nguồn và liên kết nghiệp vụ: Định danh đề tài và khoảng thời gian cần tra. Khung nhìn hoặc kết quả ghi: Danh sách sự kiện trong quyền, tác nhân, thời điểm, hành động. Truy vấn trong phạm vi hiện tại. Đọc hoặc mở liên kết giữ nguyên trạng thái hồ sơ.

**Biên trạng thái.** Khi mở sự kiện với dữ liệu hợp lệ: thấy đúng người, thời gian, đối tượng và hành động. Nhánh người ngoài phạm vi: không nhận nội dung của đề tài. Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Lát đọc này không phát lệnh chuyển.

Các bảng dùng chung theo [mô hình đích](../../docs/architecture/data-model.md). [RV-04](../review-decisions.md#rv-04) điều chỉnh phép kiểm liên quan đến `AuditLog.targetId`.
