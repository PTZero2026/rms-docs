---
story: US-32
feature: F07
review_id: RV-32
status: Draft
updated: 2026-11-18
---

# Hợp đồng hành vi · US-32

**Điểm gọi.** Web RMS theo quyền của người thực hiện. Module `product` sở hữu thao tác “Lập thẻ đọc cho một tài liệu có DOI”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/product/ai-reading-card.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | DOI, metadata xác minh, toàn văn có quyền sử dụng nếu có |
| Kết quả thành công | Thẻ đọc nháp, nguồn từng trường và các mục thiếu căn cứ |
| Điều kiện từ chối / kết quả phụ | chỉ có metadata → chỉ điền thư mục, đánh dấu thiếu căn cứ cho nội dung bài |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Trường hợp cần review | Tài liệu có DOI nhưng quyền dùng toàn văn đã hết → lập lại thẻ đọc → chỉ còn dữ liệu thư mục được phép, phần nội dung chờ bổ sung nguồn |

Kiểm quyền trước khi đọc tài liệu và khi mở trích dẫn. Lưu gợi ý, nguồn, phiên bản mẫu lệnh/mô hình và quyết định của người dùng riêng với hồ sơ gốc. Dịch vụ AI lỗi thì trở về luồng thủ công. Hiển thị thẻ đọc nháp, nguồn từng trường và các mục thiếu căn cứ; hiển thị riêng tình huống chỉ có metadata và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
