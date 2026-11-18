---
story: US-12
feature: B06
review_id: RV-12
status: Draft
updated: 2026-11-18
---

# Mô hình dữ liệu · US-12

| Trường trọng tâm | Ràng buộc của lát | Nguồn |
|---|---|---|
| `ResearchProject.id` | Liên kết trỏ đúng hồ sơ nguồn, tổng số và tiêu đề chỉ lấy trong phạm vi. | [B06](../../docs/features/B06-trang-chu/spec.md) |

Mỗi việc trên B06 tham chiếu loại đối tượng, định danh và module sở hữu. Số tổng sử dụng cùng phạm vi với danh sách.

Đối tượng nguồn và liên kết nghiệp vụ: Phiên người dùng, danh sách việc, liên kết của thẻ ở màn hình hẹp. Khung nhìn hoặc kết quả ghi: Chuyển tới đúng hồ sơ nguồn, giữ nguyên dữ liệu. Truy vấn trong phạm vi hiện tại. Đọc hoặc mở liên kết giữ nguyên trạng thái hồ sơ.

**Biên trạng thái.** Khi chạm thẻ với dữ liệu hợp lệ: mở đúng hồ sơ nguồn, trạng thái giữ nguyên. Nhánh người ngoài phạm vi: tiêu đề và số liệu hồ sơ kia đều không xuất hiện. Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Lát đọc này không phát lệnh chuyển.

Các bảng dùng chung theo [mô hình đích](../../docs/architecture/data-model.md). [RV-12](../review-decisions.md#rv-12) điều chỉnh phép kiểm liên quan đến `ResearchProject.id`.
