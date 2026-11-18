---
story: US-14
feature: F04
review_id: RV-14
status: Draft
updated: 2026-11-18
---

# Mô hình dữ liệu · US-14

| Trường trọng tâm | Ràng buộc của lát | Nguồn |
|---|---|---|
| `ProjectAssignment.approvedBudget` | Phải có ngân sách đã duyệt theo căn cứ giao còn hiệu lực. | [F04](../../docs/features/F04-quan-ly-tien-do/spec.md) |

ProjectAssignment liên kết đề tài APPROVED, quyết định/hợp đồng, ngày hiệu lực, khoảng thực hiện, ngân sách và tệp căn cứ.

Đối tượng nguồn và liên kết nghiệp vụ: Quyết định/hợp đồng, ngân sách, kỳ thực hiện, tệp căn cứ. Khung nhìn hoặc kết quả ghi: Hồ sơ giao EFFECTIVE và đề tài IN_PROGRESS. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi.

**Biên trạng thái.** Khi xác nhận giao với dữ liệu hợp lệ: hồ sơ giao có hiệu lực, đề tài IN_PROGRESS. Nhánh thiếu căn cứ bắt buộc: chỉ ra mục thiếu, đề tài còn APPROVED. Chuyển trạng thái đề tài qua P01, lưu lịch sử và P02 cùng giao dịch.

Các bảng dùng chung theo [mô hình đích](../../docs/architecture/data-model.md). [RV-14](../review-decisions.md#rv-14) điều chỉnh phép kiểm liên quan đến `ProjectAssignment.approvedBudget`.
