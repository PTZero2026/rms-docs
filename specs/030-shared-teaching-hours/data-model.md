---
story: US-30
feature: P03
review_id: RV-30
status: Draft
updated: 2026-11-18
---

# Mô hình dữ liệu · US-30

| Trường trọng tâm | Ràng buộc của lát | Nguồn |
|---|---|---|
| `TeachingHourRequest.sourceOccurredAt` | Chọn công thức có hiệu lực tại thời điểm sự kiện nguồn, ghi phiên bản ở dòng giờ. | [P03](../../docs/features/P03-quy-doi-gio-giang/spec.md) |

TeachingHourRequest mang khóa nguồn và ngày sự kiện; TeachingHourRecord giữ giảng viên, phân bổ, kỳ ghi nhận và formulaId.

Đối tượng nguồn và liên kết nghiệp vụ: Sự kiện hợp lệ, ngày nguồn, công thức hiệu lực và phân bổ. Khung nhìn hoặc kết quả ghi: Dòng giờ theo giảng viên/kỳ và căn cứ tính. Dùng khóa sự kiện để nhận lại an toàn, chỉ xác nhận xử lý sau khi lưu kết quả.

**Biên trạng thái.** Khi tính giờ với dữ liệu hợp lệ: ra đúng giờ đối chứng theo công thức của kỳ. Nhánh cùng sự kiện: không phát sinh dòng giờ trùng. Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Ghi P02 khi hành vi đổi trạng thái nghiệp vụ.

Các bảng dùng chung theo [mô hình đích](../../docs/architecture/data-model.md). [RV-30](../review-decisions.md#rv-30) điều chỉnh phép kiểm liên quan đến `TeachingHourRequest.sourceOccurredAt`.
