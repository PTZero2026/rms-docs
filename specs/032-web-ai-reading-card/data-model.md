---
story: US-32
feature: F07
review_id: RV-32
status: Draft
updated: 2026-11-18
---

# Mô hình dữ liệu · US-32

| Trường trọng tâm | Ràng buộc của lát | Nguồn |
|---|---|---|
| `AiSuggestion.sources` | Trường mô tả nội dung phải dẫn trang hoặc đoạn của toàn văn được phép, giữ nguồn DOI. | [F07](../../docs/features/F07-san-pham-khoa-hoc/spec.md) |

Thẻ đọc nháp gắn DOI đã xác minh và nguồn được phép. Trường thư mục độc lập với các trường phương pháp, kết quả có dẫn trang/đoạn.

Đối tượng nguồn và liên kết nghiệp vụ: DOI, metadata xác minh, toàn văn có quyền sử dụng nếu có. Khung nhìn hoặc kết quả ghi: Thẻ đọc nháp, nguồn từng trường và các mục thiếu căn cứ. Kiểm quyền trước khi đọc tài liệu và khi mở trích dẫn. Lưu gợi ý, nguồn, phiên bản mẫu lệnh/mô hình và quyết định của người dùng riêng với hồ sơ gốc. Dịch vụ AI lỗi thì trở về luồng thủ công.

**Biên trạng thái.** Khi lập thẻ với dữ liệu hợp lệ: trường phương pháp có dẫn trang hoặc đoạn để người đọc kiểm lại. Nhánh chỉ có metadata: chỉ điền thư mục, đánh dấu thiếu căn cứ cho nội dung bài. Mọi chuyển trạng thái đề tài phát sinh thuộc P01. Trợ lý chỉ tạo bản nháp hoặc gợi ý.

Các bảng dùng chung theo [mô hình đích](../../docs/architecture/data-model.md). [RV-32](../review-decisions.md#rv-32) điều chỉnh phép kiểm liên quan đến `AiSuggestion.sources`.
