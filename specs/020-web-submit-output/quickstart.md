---
story: US-20
feature: F07
review_id: RV-20
status: Draft
updated: 2026-11-18
---

# Kiểm tra đầu cuối · US-20

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị một đề tài đang làm, minh chứng và hai tài khoản. Mở web rms theo quyền của người thực hiện với tài khoản thực hiện trong kỳ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | sản phẩm đủ minh chứng | gửi | vào hàng chờ duyệt, giữ liên kết đề tài |
| TC-02 / AC-02 | thiếu minh chứng bắt buộc | gửi | báo thiếu, bản kê khai chưa chuyển chờ duyệt |
| TC-03 / AC-03 | Tệp đính kèm đã bị thu quyền trước khi gửi | nộp sản phẩm | báo minh chứng chưa hợp lệ, giữ nháp |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Đối chiếu thêm AC-01, AC-05, AC-07 trong [F07](../../docs/features/F07-san-pham-khoa-hoc/spec.md) ở phần áp dụng cho lát này.

**Đối chiếu nghiệp vụ.** Thử ba bộ: đủ minh chứng, thiếu tệp, tệp còn nhưng đã thu quyền; kiểm cả hàng chờ lẫn nội dung nháp.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho Chủ nhiệm và chuyên viên sản phẩm. [RV-20](../review-decisions.md#rv-20).
