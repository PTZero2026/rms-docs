---
story: US-12
feature: B06
review_id: RV-12
status: Draft
updated: 2026-11-18
---

# Kiểm tra đầu cuối · US-12

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị một hồ sơ cần bổ sung, tài khoản đúng và sai phạm vi. Mở web responsive, màn hình 360 px và 390 px với tài khoản thực hiện trong kỳ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | người có việc, màn hình 360 px | chạm thẻ | mở đúng hồ sơ nguồn, trạng thái giữ nguyên |
| TC-02 / AC-02 | người ngoài phạm vi | tải trang chủ | tiêu đề và số liệu hồ sơ kia đều không xuất hiện |
| TC-03 / AC-03 | Điện thoại rộng 360 px đã hiện thẻ rồi tài khoản bị thu quyền | chạm thẻ cũ | không lộ hồ sơ và có đường về trang chủ |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Đối chiếu thêm AC-03, AC-04, AC-05 trong [B06](../../docs/features/B06-trang-chu/spec.md) ở phần áp dụng cho lát này.

**Đối chiếu nghiệp vụ.** Ở 360 và 390 px, chạm thẻ bằng một tay, quay lại danh sách; đối chiếu mã nguồn và trạng thái chưa thay đổi.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho Chủ nhiệm, UX và chủ dữ liệu. [RV-12](../review-decisions.md#rv-12).
