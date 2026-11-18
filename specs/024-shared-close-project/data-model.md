---
story: US-24
feature: F05
review_id: RV-24
status: Draft
updated: 2026-11-18
---

# Mô hình dữ liệu · US-24

| Trường trọng tâm | Ràng buộc của lát | Nguồn |
|---|---|---|
| `ResearchProject.status` | Chỉ chuyên viên theo F05 được chuyển PASSED sang COMPLETED qua dịch vụ chung. | [F05](../../docs/features/F05-quan-ly-kinh-phi/spec.md) |

F06 cung cấp kết luận PASSED, F05 sở hữu lần khóa kinh phí. Bản ghi đối soát chỉ có khi đơn vị sử dụng quy trình tích hợp.

Đối tượng nguồn và liên kết nghiệp vụ: Hồ sơ PASSED, người quyết toán, kết quả rà và sai lệch nếu đã có. Khung nhìn hoặc kết quả ghi: Hồ sơ COMPLETED, sổ bị khóa, nhật ký quyết toán. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi.

**Biên trạng thái.** Khi chuyên viên quyết toán với dữ liệu hợp lệ: chuyển COMPLETED, khóa kinh phí và ghi audit. Nhánh chủ nhiệm: từ chối, đề tài giữ nguyên. Chuyển trạng thái đề tài qua P01, lưu lịch sử và P02 cùng giao dịch.

Các bảng dùng chung theo [mô hình đích](../../docs/architecture/data-model.md). [RV-24](../review-decisions.md#rv-24) điều chỉnh phép kiểm liên quan đến `ResearchProject.status`.
