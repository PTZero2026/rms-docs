---
story: US-06
feature: F01
review_id: RV-06
status: Draft
updated: 2026-11-18
---

# Mô hình dữ liệu · US-06

| Trường trọng tâm | Ràng buộc của lát | Nguồn |
|---|---|---|
| `ResearchProject.principalInvestigatorId` | Đúng một chủ nhiệm trong bản nháp và trong danh sách thành viên. | [F01](../../docs/features/F01-de-xuat-de-tai/spec.md) |

ResearchProject mới liên kết kỳ và đúng một ProjectMember mang vai trò chủ nhiệm. projectCode chưa được cấp.

Đối tượng nguồn và liên kết nghiệp vụ: Kỳ mở, chủ nhiệm, phần thuyết minh đã soạn. Khung nhìn hoặc kết quả ghi: Định danh nháp và nội dung đã lưu. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi.

**Biên trạng thái.** Khi lưu lần đầu với dữ liệu hợp lệ: có bản Nháp của chủ nhiệm, chưa cấp mã đề tài. Nhánh nhà nghiên cứu khác ngoài phạm vi: bị từ chối. Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ.

Các bảng dùng chung theo [mô hình đích](../../docs/architecture/data-model.md). [RV-06](../review-decisions.md#rv-06) điều chỉnh phép kiểm liên quan đến `ResearchProject.principalInvestigatorId`.
