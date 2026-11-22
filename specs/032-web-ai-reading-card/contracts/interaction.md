---
story: US-32
feature: F07
review_id: RV-32
status: Draft
updated: 2026-11-21
---

# Hợp đồng hành vi · US-32

**Điểm gọi.** Web RMS theo quyền của người thực hiện. Module `product` sở hữu thao tác “Lập thẻ đọc cho một tài liệu có DOI”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/product/ai-reading-card.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | DOI, metadata xác minh, toàn văn có quyền sử dụng nếu có |
| Kết quả thành công | Thẻ đọc nháp, nguồn từng trường và các mục thiếu căn cứ |
| Điều kiện từ chối / kết quả phụ | chỉ có metadata → chỉ điền thư mục, đánh dấu thiếu căn cứ cho nội dung bài |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Chỉ truy xuất phần tài liệu mà người dùng hiện có quyền đọc và trường cho phép dùng cho AI. Kiểm tra cả hai quyền trước khi gửi nội dung cho mô hình và khi mở lại yêu cầu hoặc căn cứ cũ. [RV-35](../../review-decisions.md#rv-35). |
| Khi quyền dùng toàn văn hết hạn | Khi mở lại hoặc lập lại thẻ, kiểm quyền hiện tại. Khi chỉ có quyền dùng thông tin thư mục, trợ lý chỉ điền tên bài, tác giả, năm và DOI theo dữ liệu được phép. Cả phương pháp và kết quả ghi “chưa đủ căn cứ”. Nhà nghiên cứu kiểm thẻ nháp trước khi quyết định dùng hoặc bỏ. |

Mỗi gợi ý lưu nguồn và phiên bản đã dùng, phiên bản mô hình và mẫu lệnh. Ghi lựa chọn dùng/bỏ khi người dùng quyết định. Khi tắt AI hoặc dịch vụ gặp lỗi, người dùng vẫn tiếp tục thủ công. Hiển thị thẻ đọc nháp, nguồn từng trường và các mục thiếu căn cứ; hiển thị riêng tình huống chỉ có metadata và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
