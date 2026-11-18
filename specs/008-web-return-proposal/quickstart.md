---
story: US-08
feature: F01
review_id: RV-08
status: Draft
updated: 2026-11-18
---

# Kiểm tra đầu cuối · US-08

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị hồ sơ đã nộp có mã, hai kỳ còn hạn và đã đóng. Mở web rms theo quyền của người thực hiện với tài khoản thực hiện trong kỳ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | còn hạn | trả kèm lý do rồi chủ nhiệm nộp lại | chủ nhiệm thấy lý do, mã đề tài được giữ |
| TC-02 / AC-02 | đã hết hạn | chuyên viên trả | chặn thao tác và giữ trạng thái |
| TC-03 / AC-03 | Hồ sơ còn hạn và lý do chỉ chứa khoảng trắng | chuyên viên gửi trả | giữ Đã nộp, yêu cầu nhập lý do |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Đối chiếu thêm AC-07, AC-08, AC-11 trong [F01](../../docs/features/F01-de-xuat-de-tai/spec.md) ở phần áp dụng cho lát này.

**Đối chiếu nghiệp vụ.** So mã trước và sau, hai mốc thời gian nộp, nguyên văn lý do. Dùng ca hết hạn để kiểm không mở lại quyền sửa.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho Chuyên viên tiếp nhận và PO. [RV-08](../review-decisions.md#rv-08).
