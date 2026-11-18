---
story: US-08
feature: F01
review_id: RV-08
status: Draft
updated: 2026-11-18
---

# Mô hình dữ liệu · US-08

| Trường trọng tâm | Ràng buộc của lát | Nguồn |
|---|---|---|
| `ResearchProject.submittedAt` | Cập nhật lúc nộp lại, mã hồ sơ cũ được giữ để tra cứu. | [F01](../../docs/features/F01-de-xuat-de-tai/spec.md) |

ResearchProject có cùng ID và projectCode trong cả hai lần nộp. Lịch sử giữ người trả, lý do, giờ trả và giờ nộp lại.

Đối tượng nguồn và liên kết nghiệp vụ: Mã hồ sơ đã nộp, lý do trả, kỳ tiếp nhận. Khung nhìn hoặc kết quả ghi: Bản nháp mở lại và lý do gắn cùng mã cũ. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi.

**Biên trạng thái.** Khi trả kèm lý do rồi chủ nhiệm nộp lại với dữ liệu hợp lệ: chủ nhiệm thấy lý do, mã đề tài được giữ. Nhánh đã hết hạn: chặn thao tác và giữ trạng thái. Chuyển trạng thái đề tài qua P01, lưu lịch sử và P02 cùng giao dịch.

Các bảng dùng chung theo [mô hình đích](../../docs/architecture/data-model.md). [RV-08](../review-decisions.md#rv-08) điều chỉnh phép kiểm liên quan đến `ResearchProject.submittedAt`.
