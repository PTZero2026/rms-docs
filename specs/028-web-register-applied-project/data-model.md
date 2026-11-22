---
story: US-28
feature: F11
review_id: RV-28
status: Draft
updated: 2026-11-21
---

# Mô hình dữ liệu · US-28

| Trường trọng tâm | Ràng buộc của lát | Nguồn |
|---|---|---|
| `AppliedProject.totalBudgetVnd` | Kinh phí tổng theo VND của đầu mục, lưu riêng với sổ chi F05. | [F11](../../docs/features/F11-du-an-phuc-vu-san-xuat/spec.md) |

AppliedProject thuộc viện chủ trì, có danh sách AppliedProjectPartner và tổng kinh phí. Sổ chi đề tài cấp cơ sở ở F05 độc lập.

Đối tượng nguồn và liên kết nghiệp vụ: Đơn vị chủ trì, đối tác ngoài và tổng kinh phí. Khung nhìn hoặc kết quả ghi: Đầu mục dự án ứng dụng với kinh phí tổng. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi.

**Biên trạng thái.** Khi lưu kê khai với dữ liệu hợp lệ: tra lại đúng đơn vị và tổng kinh phí. Danh sách `AppliedProjectPartner` của bản nháp có thể rỗng. Khi gửi duyệt, domain service F11 kiểm có ít nhất một đối tác ngoài của chính dự án trước khi chuyển `DRAFT` sang `PENDING_APPROVAL`. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ.

Các bảng dùng chung theo [mô hình đích](../../docs/architecture/data-model.md). [RV-28](../review-decisions.md#rv-28) quy định thời điểm kiểm đơn vị chủ trì và danh sách đối tác.
