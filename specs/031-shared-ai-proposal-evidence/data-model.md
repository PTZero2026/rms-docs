---
story: US-31
feature: F01
review_id: RV-31
status: Draft
updated: 2026-11-18
---

# Mô hình dữ liệu · US-31

| Trường trọng tâm | Ràng buộc của lát | Nguồn |
|---|---|---|
| `AiSuggestion.sources` | Mỗi nhận định cần phiên bản nguồn và vị trí có thể mở trong quyền người dùng. | [F01](../../docs/features/F01-de-xuat-de-tai/spec.md) |

Gợi ý F01 liên kết bản nháp, phiên bản biểu mẫu, đoạn và vị trí trong tài liệu. Quyền đọc nguồn được đánh giá lại khi mở căn cứ.

Đối tượng nguồn và liên kết nghiệp vụ: Bản nháp, mẫu yêu cầu, tài liệu cho phép và người yêu cầu. Khung nhìn hoặc kết quả ghi: Trích đoạn có vị trí/phiên bản hoặc thông báo thiếu căn cứ. Kiểm quyền trước khi đọc tài liệu và khi mở trích dẫn. Lưu gợi ý, nguồn, phiên bản mẫu lệnh/mô hình và quyết định của người dùng riêng với hồ sơ gốc. Dịch vụ AI lỗi thì trở về luồng thủ công.

**Biên trạng thái.** Khi yêu cầu rà với dữ liệu hợp lệ: thấy trích đoạn, vị trí và bản mẫu, chủ nhiệm có thể bác gợi ý. Nhánh tài liệu ngoài quyền hoặc thiếu căn cứ: từ chối truy xuất hoặc ghi chưa đủ căn cứ, hồ sơ gốc giữ nguyên. Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Trợ lý chỉ tạo bản nháp hoặc gợi ý.

Các bảng dùng chung theo [mô hình đích](../../docs/architecture/data-model.md). [RV-31](../review-decisions.md#rv-31) điều chỉnh phép kiểm liên quan đến `AiSuggestion.sources`.
