---
story: US-05
feature: F02
review_id: RV-05
status: Draft
updated: 2026-11-18
---

# Kiểm tra đầu cuối · US-05

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị một kỳ nháp, danh mục còn hiệu lực. Mở web rms theo quyền của người thực hiện với tài khoản thực hiện trong kỳ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | kỳ đủ cấu hình | mở | kỳ nhận đề xuất hiển thị dưới trạng thái OPEN |
| TC-02 / AC-02 | ngày kết thúc trước ngày bắt đầu | lưu kỳ | báo lỗi và không tạo kỳ sai |
| TC-03 / AC-03 | Một lĩnh vực bắt buộc vừa ngừng hiệu lực trong bản nháp | chuyên viên mở kỳ | kỳ vẫn nháp và hiển thị mục cần thay |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Đối chiếu thêm AC-01, AC-02, AC-05 trong [F02](../../docs/features/F02-dot-keu-goi/spec.md) ở phần áp dụng cho lát này.

**Đối chiếu nghiệp vụ.** So danh sách kỳ của giảng viên trước/sau mở; kiểm kỳ sai ngày và kỳ thiếu tiêu chí đều chưa mở.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho Phòng KHCN và BA. [RV-05](../review-decisions.md#rv-05).
