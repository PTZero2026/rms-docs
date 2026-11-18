---
story: US-19
feature: F05
review_id: RV-19
status: Draft
updated: 2026-11-18
---

# Kiểm tra đầu cuối · US-19

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị đề tài đang thực hiện, còn 2 triệu đồng. Mở web rms theo quyền của người thực hiện với tài khoản thực hiện trong kỳ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | chủ nhiệm chi 3 triệu | lưu khoản chi | vẫn lưu và cảnh báo vượt 1 triệu đồng |
| TC-02 / AC-02 | số tiền bằng 0 | lưu | báo lỗi, số dư giữ nguyên |
| TC-03 / AC-03 | Còn 2 triệu, khoản chi đúng 2 triệu đồng | chủ nhiệm lưu | số dư bằng 0 và không cảnh báo vượt |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Đối chiếu thêm AC-02, AC-04, AC-06 trong [F05](../../docs/features/F05-quan-ly-kinh-phi/spec.md) ở phần áp dụng cho lát này.

**Đối chiếu nghiệp vụ.** So sổ chi trước và sau ba mức: 0, vừa hết số dư, vượt 1 triệu. Sau COMPLETED thử sửa dòng đã ghi.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho Kế toán và chủ nhiệm. [RV-19](../review-decisions.md#rv-19).
