---
story: US-20
feature: F07
review_id: RV-20
status: Draft
updated: 2026-11-18
---

# Mô hình dữ liệu · US-20

| Trường trọng tâm | Ràng buộc của lát | Nguồn |
|---|---|---|
| `ResearchOutput.researchProjectId` | Liên kết tới đề tài được phép kê khai, minh chứng cùng phạm vi. | [F07](../../docs/features/F07-san-pham-khoa-hoc/spec.md) |

ResearchOutput liên kết đề tài trong phạm vi, loại sản phẩm, tác giả và minh chứng. Trạng thái duyệt tách khỏi trạng thái đề tài.

Đối tượng nguồn và liên kết nghiệp vụ: Đề tài, loại sản phẩm, thông tin công bố, tác giả, minh chứng. Khung nhìn hoặc kết quả ghi: Sản phẩm chờ duyệt gắn đúng đề tài. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi.

**Biên trạng thái.** Khi gửi với dữ liệu hợp lệ: vào hàng chờ duyệt, giữ liên kết đề tài. Nhánh thiếu minh chứng bắt buộc: báo thiếu, bản kê khai chưa chuyển chờ duyệt. Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ.

Các bảng dùng chung theo [mô hình đích](../../docs/architecture/data-model.md). [RV-20](../review-decisions.md#rv-20) điều chỉnh phép kiểm liên quan đến `ResearchOutput.researchProjectId`.
