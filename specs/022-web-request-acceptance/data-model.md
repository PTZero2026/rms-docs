---
story: US-22
feature: F06
review_id: RV-22
status: Draft
updated: 2026-11-18
---

# Mô hình dữ liệu · US-22

| Trường trọng tâm | Ràng buộc của lát | Nguồn |
|---|---|---|
| `ProgressReport.status` | Kỳ cuối phải đạt PASSED, kết hợp đủ sản phẩm đã duyệt đúng loại. | [F06](../../docs/features/F06-nghiem-thu/spec.md) |

Kỳ báo cáo cuối thuộc F04, danh sách cam kết và số sản phẩm APPROVED theo loại do F07 cung cấp. Hồ sơ cuối thuộc F06.

Đối tượng nguồn và liên kết nghiệp vụ: Đề tài đang thực hiện, kết quả kỳ cuối, cam kết và hồ sơ cuối. Khung nhìn hoặc kết quả ghi: Danh mục thiếu hoặc hồ sơ PENDING_ACCEPTANCE và thông báo. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi.

**Biên trạng thái.** Khi nộp hồ sơ cuối với dữ liệu hợp lệ: chuyển PENDING_ACCEPTANCE, chuyên viên nhận thông báo. Nhánh thiếu một sản phẩm cam kết: nêu mục thiếu và giữ IN_PROGRESS. Chuyển trạng thái đề tài qua P01, lưu lịch sử và P02 cùng giao dịch.

Các bảng dùng chung theo [mô hình đích](../../docs/architecture/data-model.md). [RV-22](../review-decisions.md#rv-22) điều chỉnh phép kiểm liên quan đến `ProgressReport.status`.
