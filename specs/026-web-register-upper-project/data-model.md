---
story: US-26
feature: F09
review_id: RV-26
status: Draft
updated: 2026-11-18
---

# Mô hình dữ liệu · US-26

| Trường trọng tâm | Ràng buộc của lát | Nguồn |
|---|---|---|
| `UpperProject.managingBodyItemId` | Cơ quan quản lý cấp trên là mục danh mục bắt buộc. Đơn vị chủ trì phía trường có thể để trống theo thiết kế F09. | [F09](../../docs/features/F09-de-tai-cap-tren/spec.md) |

UpperProject có cấp nhiệm vụ, cơ quan quản lý và chủ nhiệm. Tệp quyết định là loại minh chứng quy định theo cấp và bước duyệt.

Đối tượng nguồn và liên kết nghiệp vụ: Cấp nhiệm vụ, cơ quan quản lý, đơn vị thực hiện và tệp căn cứ. Khung nhìn hoặc kết quả ghi: Đầu mục tra được theo cấp và thông tin chứng cứ cần bổ sung. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi.

**Biên trạng thái.** Khi lưu với dữ liệu hợp lệ: tra lại đầu mục đúng cấp và đơn vị. Nhánh thiếu tệp bắt buộc ở bước duyệt: chặn và chỉ rõ chứng cứ thiếu. Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ.

Các bảng dùng chung theo [mô hình đích](../../docs/architecture/data-model.md). [RV-26](../review-decisions.md#rv-26) điều chỉnh phép kiểm liên quan đến `UpperProject.managingBodyItemId`.
