---
story: US-02
feature: B01
review_id: RV-02
status: Draft
updated: 2026-11-21
---

# Kiểm tra đầu cuối · US-02

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị hai tenant dùng cùng một khóa cấu hình. Mở dịch vụ dùng chung và điểm gọi của module sở hữu với tài khoản thực hiện trong kỳ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | tenant A có quyền | lưu giá trị riêng | đọc tại A nhận giá trị mới |
| TC-02 / AC-02 | tenant B chỉ có giá trị chung | đọc cùng khóa | nhận đúng giá trị chung |
| TC-03 / AC-03 | A và B đã đọc cùng khóa và đều nhận giá trị mẫu “chung” | A lưu giá trị “riêng A”, đọc ngay cùng khóa tại A và B trong thời hạn đệm cũ | lần đọc đầu tiên ở A trả “riêng A”, ở B trả “chung” |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Đối chiếu thêm AC-02, AC-05, AC-07 trong [B01](../../docs/features/B01-danh-muc-cau-hinh/spec.md) ở phần áp dụng cho lát này.

**Đối chiếu nghiệp vụ.** Ghi giá trị chung ban đầu và kết quả lần đọc đầu tiên ở từng trường sau khi A lưu thành công. Người dùng thường gửi lệnh ghi nhận từ chối.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho Quản trị tenant và kiến trúc sư. [RV-02](../review-decisions.md#rv-02).
