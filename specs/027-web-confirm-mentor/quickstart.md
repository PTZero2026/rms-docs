---
story: US-27
feature: F10
review_id: RV-27
status: Draft
updated: 2026-11-18
---

# Kiểm tra đầu cuối · US-27

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị đợt bật F10, nhóm hợp lệ và một giảng viên. Bật module E4 riêng theo tenant và quy chế đã chọn. Mở web rms theo quyền của người thực hiện với tài khoản thực hiện trong kỳ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | nhóm đủ điều kiện còn lại, giảng viên đã xác nhận | nộp | qua điều kiện người hướng dẫn |
| TC-02 / AC-02 | chưa ai xác nhận | nộp | chỉ rõ thiếu xác nhận và giữ bản đăng ký |
| TC-03 / AC-03 | Giảng viên đã xác nhận cho hồ sơ A, sinh viên gửi hồ sơ B | nộp B | yêu cầu xác nhận riêng cho B |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Đối chiếu thêm AC-04 trong [F10](../../docs/features/F10-de-tai-sinh-vien/spec.md) ở phần áp dụng cho lát này.

**Đối chiếu nghiệp vụ.** Cùng sinh viên có hai đăng ký, chỉ một được GV xác nhận; chỉ hồ sơ đó qua bước kiểm người hướng dẫn.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho Đại diện khoa, giảng viên hướng dẫn và BA. [RV-27](../review-decisions.md#rv-27).
