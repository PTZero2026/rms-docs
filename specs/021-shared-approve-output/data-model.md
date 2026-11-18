---
story: US-21
feature: F07
review_id: RV-21
status: Draft
updated: 2026-11-18
---

# Mô hình dữ liệu · US-21

| Trường trọng tâm | Ràng buộc của lát | Nguồn |
|---|---|---|
| `ResearchOutput.approvalStatus` | Chỉ đầu ra APPROVED đúng đề tài và loại mới được tính vào cam kết. | [F07](../../docs/features/F07-san-pham-khoa-hoc/spec.md) |

ResearchOutput đã duyệt mang người duyệt và giờ duyệt. Cam kết tính trên sản phẩm phân biệt theo đề tài và loại.

Đối tượng nguồn và liên kết nghiệp vụ: Sản phẩm chờ duyệt, chứng cứ và cam kết theo loại. Khung nhìn hoặc kết quả ghi: Người duyệt, giờ duyệt, số đầu ra được tính. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi.

**Biên trạng thái.** Khi chuyên viên duyệt với dữ liệu hợp lệ: APPROVED và được tính vào cam kết của đề tài. Nhánh chủ nhiệm chỉ có quyền kê khai: bị từ chối, tổng đạt giữ nguyên. Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ.

Các bảng dùng chung theo [mô hình đích](../../docs/architecture/data-model.md). [RV-21](../review-decisions.md#rv-21) điều chỉnh phép kiểm liên quan đến `ResearchOutput.approvalStatus`.
