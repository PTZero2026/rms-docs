---
story: US-06
feature: F01
review_id: RV-06
status: Draft
updated: 2026-11-18
---

# Kiểm tra đầu cuối · US-06

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị kỳ mở, hai nhà nghiên cứu độc lập. Mở web rms theo quyền của người thực hiện với tài khoản thực hiện trong kỳ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | chủ nhiệm trong kỳ mở | lưu lần đầu | có bản Nháp của chủ nhiệm, chưa cấp mã đề tài |
| TC-02 / AC-02 | nhà nghiên cứu khác ngoài phạm vi | mở nháp bằng đường dẫn | bị từ chối |
| TC-03 / AC-03 | Chủ nhiệm đã chọn kỳ và nhập tên nhưng thiếu phần phương pháp | lưu rồi mở lại nháp | thấy phần đã nhập và có thể tiếp tục sửa |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Đối chiếu thêm AC-01, AC-06 trong [F01](../../docs/features/F01-de-xuat-de-tai/spec.md) ở phần áp dụng cho lát này.

**Đối chiếu nghiệp vụ.** Sau khi đăng nhập lại, so nội dung đã lưu, đúng một chủ nhiệm và trường mã còn trống.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho Chủ nhiệm và BA. [RV-06](../review-decisions.md#rv-06).
