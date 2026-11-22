---
story: US-25
feature: F08
review_id: RV-25
status: Draft
updated: 2026-11-21
---

# Mô hình dữ liệu · US-25

| Trường trọng tâm | Ràng buộc của lát | Nguồn |
|---|---|---|
| `ResearchOutput.id` | Một sản phẩm đã duyệt xuất hiện một lần dù cá nhân có nhiều vai trò. | [F08](../../docs/features/F08-ly-lich-khoa-hoc/spec.md) |

F08 tổng hợp User, vai trò đề tài, ResearchOutput đã duyệt và giờ P03 khi bật. Nhật ký `EXPORT_CV` lưu mã mẫu của tenant và phiên bản thực tế dùng để tạo tệp của từng lần xuất.

Đối tượng nguồn và liên kết nghiệp vụ: Cá nhân, mẫu tenant, sản phẩm duyệt và vai trò. Khung nhìn hoặc kết quả ghi: Bản lý lịch theo mẫu, từng đầu ra chỉ xuất hiện một lần. Truy vấn trong phạm vi hiện tại. Đọc hoặc mở liên kết giữ nguyên trạng thái hồ sơ.

**Biên trạng thái.** Khi trích xuất với dữ liệu hợp lệ: mẫu đúng và chỉ một dòng cho đầu ra. Nhánh người dùng ngoài phạm vi: từ chối. Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Lát đọc này không phát lệnh chuyển.

Các bảng dùng chung theo [mô hình đích](../../docs/architecture/data-model.md). [RV-25](../review-decisions.md#rv-25) quy định việc đối chiếu tệp xuất với mã và phiên bản mẫu trong nhật ký.
