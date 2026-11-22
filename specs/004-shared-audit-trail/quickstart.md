---
story: US-04
feature: P02
review_id: RV-04
status: Draft
updated: 2026-11-21
---

# Kiểm tra đầu cuối · US-04

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị một chuyển bước thành công và hai người khác phạm vi. Mở dịch vụ dùng chung và điểm gọi của module sở hữu với tài khoản thực hiện trong kỳ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | đề tài thuộc phạm vi | mở sự kiện | thấy đúng người, thời gian, đối tượng và hành động |
| TC-02 / AC-02 | người ngoài phạm vi | mở trực tiếp lịch sử | không nhận nội dung của đề tài |
| TC-03 / AC-03 | Chuyên viên U chuyển bước khi còn ở khoa A, sau đó sang khoa B và mất quyền xem đề tài. Người V vẫn có quyền | U và V lần lượt mở cùng liên kết lịch sử đã lưu | U không thấy tên đề tài hay nội dung nhật ký. V thấy người thực hiện là U, thuộc khoa A tại thời điểm chuyển bước |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Đối chiếu thêm AC-01, AC-02, AC-05 trong [P02](../../docs/features/P02-audit/spec.md) ở phần áp dụng cho lát này.

**Đối chiếu nghiệp vụ.** Đối chiếu một giao dịch thành công với một giao dịch rollback: chỉ giao dịch thành công có sự kiện chuyển bước.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho Chủ dữ liệu và QA phân quyền. [RV-04](../review-decisions.md#rv-04).
