---
story: US-05
feature: F02
review_id: RV-05
status: Draft
updated: 2026-11-21
---

# Mô hình dữ liệu · US-05

| Trường trọng tâm | Ràng buộc của lát | Nguồn |
|---|---|---|
| `ProposalCall.endDate` | Kết thúc từ lúc bắt đầu trở đi, đối chiếu thời gian nghiệp vụ của kỳ. | [F02](../../docs/features/F02-dot-keu-goi/spec.md) |

ProposalCall tham chiếu bộ tiêu chí, danh mục và biểu mẫu của kỳ. Mở kỳ là thay đổi trên ProposalCall.

Đối tượng nguồn và liên kết nghiệp vụ: Mã kỳ, cửa sổ thời gian, danh mục, bộ tiêu chí. Khung nhìn hoặc kết quả ghi: Kỳ OPEN hiển thị ở danh sách tiếp nhận. Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi.

**Biên trạng thái.** Khi mở với dữ liệu hợp lệ: kỳ nhận đề xuất hiển thị dưới trạng thái OPEN. Nhánh ngày kết thúc trước ngày bắt đầu: báo lỗi và không tạo kỳ sai. Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ.

Các bảng dùng chung theo [mô hình đích](../../docs/architecture/data-model.md). [RV-05](../review-decisions.md#rv-05) yêu cầu kiểm hiệu lực của danh mục và bộ tiêu chí mà kỳ tham chiếu tại thời điểm chuyển từ DRAFT sang OPEN.
