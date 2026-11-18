---
story: US-18
feature: F05
review_id: RV-18
status: Draft
updated: 2026-11-18
---

# Mô hình dữ liệu · US-18

| Trường trọng tâm | Ràng buộc của lát | Nguồn |
|---|---|---|
| `BudgetAllocation.managementFeeAmount` | Phí nằm trong tổng cấp, theo tỷ lệ và trần có hiệu lực hoặc mức điều chỉnh hợp lệ. | [F05](../../docs/features/F05-quan-ly-kinh-phi/spec.md) |

BudgetAllocation lấy hạn mức từ quyết định giao có hiệu lực; phí quản lý và phần thực hiện cùng thuộc một lần xác nhận cấp.

Đối tượng nguồn và liên kết nghiệp vụ: Quyết định giao hiệu lực, tổng cấp, tỷ lệ và trần phí. Khung nhìn hoặc kết quả ghi: Tổng cấp, phần phí và kinh phí thực hiện bằng VND. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi.

**Biên trạng thái.** Khi xác nhận với dữ liệu hợp lệ: phí 5 triệu, kinh phí thực hiện 95 triệu đồng. Nhánh chủ nhiệm: bị chặn ở máy chủ. Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ.

Các bảng dùng chung theo [mô hình đích](../../docs/architecture/data-model.md). [RV-18](../review-decisions.md#rv-18) điều chỉnh phép kiểm liên quan đến `BudgetAllocation.managementFeeAmount`.
