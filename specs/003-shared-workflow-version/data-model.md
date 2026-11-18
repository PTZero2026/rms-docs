---
story: US-03
feature: P01
review_id: RV-03
status: Draft
updated: 2026-11-18
---

# Mô hình dữ liệu · US-03

| Trường trọng tâm | Ràng buộc của lát | Nguồn |
|---|---|---|
| `WorkflowInstance.templateId` | Ghim phiên bản từ lúc tạo hồ sơ, duy trì đến khi kết thúc. | [P01](../../docs/features/P01-workflow-engine/spec.md) |

WorkflowTemplate có phiên bản; WorkflowInstance gắn template của chính hồ sơ, bước hiện tại tham chiếu graph phiên bản đó.

Đối tượng nguồn và liên kết nghiệp vụ: Mẫu quy trình, phiên bản và các bước có trạng thái chuẩn. Khung nhìn hoặc kết quả ghi: Phiên bản khả dụng cho hồ sơ mới hoặc danh sách bước lỗi. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi.

**Biên trạng thái.** Khi kích hoạt và tạo hồ sơ với dữ liệu hợp lệ: hồ sơ mới theo v2, hồ sơ cũ vẫn theo v1. Nhánh mẫu có bước thiếu trạng thái chuẩn: từ chối và nêu bước cần sửa. Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ.

Các bảng dùng chung theo [mô hình đích](../../docs/architecture/data-model.md). [RV-03](../review-decisions.md#rv-03) điều chỉnh phép kiểm liên quan đến `WorkflowInstance.templateId`.
