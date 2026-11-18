---
story: US-13
feature: B02
review_id: RV-13
status: Draft
updated: 2026-11-18
---

# Mô hình dữ liệu · US-13

| Trường trọng tâm | Ràng buộc của lát | Nguồn |
|---|---|---|
| `ResearchProject.id` | Mỗi hồ sơ đã có mã chỉ được tính một lần trong kỳ và trong phạm vi người trích xuất. | [B02](../../docs/features/B02-bao-cao-thong-ke/spec.md) |

Tập báo cáo gồm định danh, mã đã cấp, kỳ, đơn vị và trạng thái chuẩn. Trả bổ sung giữ mã nên vẫn được đếm. Thời điểm trích xuất đi kèm tập này.

Đối tượng nguồn và liên kết nghiệp vụ: Kỳ, phạm vi đơn vị, thời điểm trích xuất. Khung nhìn hoặc kết quả ghi: Số hồ sơ theo trạng thái, tổng cộng và danh sách đối chứng. Truy vấn trong phạm vi hiện tại. Đọc hoặc mở liên kết giữ nguyên trạng thái hồ sơ.

**Biên trạng thái.** Khi tổng hợp theo trạng thái hiện tại với dữ liệu hợp lệ: tổng bằng 3, từng nhóm khớp danh sách chốt. Nhánh chỉ có quyền một đơn vị: cả dòng chi tiết và tổng loại hồ sơ ngoài quyền. Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Lát đọc này không phát lệnh chuyển.

Các bảng dùng chung theo [mô hình đích](../../docs/architecture/data-model.md). [RV-13](../review-decisions.md#rv-13) điều chỉnh phép kiểm liên quan đến `ResearchProject.id`.
