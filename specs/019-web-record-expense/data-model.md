---
story: US-19
feature: F05
review_id: RV-19
status: Draft
updated: 2026-11-18
---

# Mô hình dữ liệu · US-19

| Trường trọng tâm | Ràng buộc của lát | Nguồn |
|---|---|---|
| `BudgetTransaction.amount` | Số nguyên VND dương cho dòng chi của chủ nhiệm. | [F05](../../docs/features/F05-quan-ly-kinh-phi/spec.md) |

BudgetTransaction liên kết đề tài, người kê khai và chứng từ Attachment. Số còn lại lấy kinh phí thực hiện trừ tổng chi hợp lệ.

Đối tượng nguồn và liên kết nghiệp vụ: Đề tài, số VND nguyên, ngày chi, mô tả và tệp nếu có. Khung nhìn hoặc kết quả ghi: Khoản chi, số dư và cảnh báo vượt. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi.

**Biên trạng thái.** Khi lưu khoản chi với dữ liệu hợp lệ: vẫn lưu và cảnh báo vượt 1 triệu đồng. Nhánh số tiền bằng 0: báo lỗi, số dư giữ nguyên. Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ.

Các bảng dùng chung theo [mô hình đích](../../docs/architecture/data-model.md). [RV-19](../review-decisions.md#rv-19) điều chỉnh phép kiểm liên quan đến `BudgetTransaction.amount`.
