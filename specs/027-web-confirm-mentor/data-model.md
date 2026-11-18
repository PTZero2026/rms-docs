---
story: US-27
feature: F10
review_id: RV-27
status: Draft
updated: 2026-11-18
---

# Mô hình dữ liệu · US-27

| Trường trọng tâm | Ràng buộc của lát | Nguồn |
|---|---|---|
| `StudentProject.id` | Xác nhận giảng viên phải thuộc đúng hồ sơ nộp trong đợt mở. | [F10](../../docs/features/F10-de-tai-sinh-vien/spec.md) |

Đăng ký F10 thuộc đợt, nhóm sinh viên và GV hướng dẫn. Trạng thái xác nhận gắn với đăng ký và đúng GV được mời.

Đối tượng nguồn và liên kết nghiệp vụ: Đăng ký của nhóm, đợt, người hướng dẫn và xác nhận tương ứng. Khung nhìn hoặc kết quả ghi: Trạng thái đủ/thiếu xác nhận cho đúng đăng ký. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi.

**Biên trạng thái.** Khi nộp với dữ liệu hợp lệ: qua điều kiện người hướng dẫn. Nhánh chưa ai xác nhận: chỉ rõ thiếu xác nhận và giữ bản đăng ký. Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ. Tên thực thể kỹ thuật trong bảng là đề xuất cho khái niệm ở §5 của spec nguồn.

Các bảng dùng chung theo [mô hình đích](../../docs/architecture/data-model.md). [RV-27](../review-decisions.md#rv-27) điều chỉnh phép kiểm liên quan đến `StudentProject.id`.
