---
story: US-32
feature: F07
review_id: RV-32
status: Draft
updated: 2026-11-18
---

# Kiểm tra đầu cuối · US-32

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị một DOI đã xác minh, một bản toàn văn được phép dùng và một trường hợp chỉ có metadata. Chỉ bật trợ lý cho tenant và nguồn đã được phép. Mở web rms theo quyền của người thực hiện với tài khoản thực hiện trong kỳ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | bài có đoạn phương pháp | lập thẻ | trường phương pháp có dẫn trang hoặc đoạn để người đọc kiểm lại |
| TC-02 / AC-02 | chỉ có metadata | lập thẻ | chỉ điền thư mục, đánh dấu thiếu căn cứ cho nội dung bài |
| TC-03 / AC-03 | Tài liệu có DOI nhưng quyền dùng toàn văn đã hết | lập lại thẻ đọc | chỉ còn dữ liệu thư mục được phép, phần nội dung chờ bổ sung nguồn |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Lấy bảng đối chứng có chữ ký PO/BA trước khi đưa AC mới vào feature nguồn. Tắt dịch vụ và kiểm đường thủ công. Với từng dẫn chứng hãy mở lại đúng trang/đoạn bằng cùng tài khoản.

**Đối chiếu nghiệp vụ.** Người đọc mở lại từng vị trí dẫn trên tài liệu được phép, bác một trường sai và kiểm hồ sơ sản phẩm không đổi. Khi quyền toàn văn hết, kiểm cả lần mở thẻ cũ.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho Nhà nghiên cứu, thư viện và chủ dữ liệu. [RV-32](../review-decisions.md#rv-32).
