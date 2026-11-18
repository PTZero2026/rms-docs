---
story: US-07
feature: F01
review_id: RV-07
status: Draft
updated: 2026-11-18
---

# Kiểm tra đầu cuối · US-07

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị hai hồ sơ nháp, đồng hồ cố định trong hạn và sau hạn. Mở web rms theo quyền của người thực hiện với tài khoản thực hiện trong kỳ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | nháp đủ trường, còn hạn | nộp | chuyển Đã nộp, cấp mã, ghi giờ, khóa sửa |
| TC-02 / AC-02 | nháp đủ trường, đã quá hạn | nộp | giữ Nháp và báo hết hạn |
| TC-03 / AC-03 | Nháp hợp lệ, đồng hồ máy chủ đúng hạn và kỳ còn mở | chủ nhiệm gửi hai lần | chỉ có một mã và một lần chuyển Đã nộp |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Đối chiếu thêm AC-02, AC-03, AC-04 trong [F01](../../docs/features/F01-de-xuat-de-tai/spec.md) ở phần áp dụng cho lát này.

**Đối chiếu nghiệp vụ.** Gửi song song hai yêu cầu cho cùng nháp và hai nháp khác nhau; đối chiếu tính duy nhất, khóa sửa và audit.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho Chuyên viên quản lý kỳ và PO. [RV-07](../review-decisions.md#rv-07).
