---
story: US-22
feature: F06
review_id: RV-22
status: Draft
updated: 2026-11-18
---

# Kiểm tra đầu cuối · US-22

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị đề tài đang thực hiện, dữ liệu kỳ cuối và sản phẩm đã duyệt. Mở web rms theo quyền của người thực hiện với tài khoản thực hiện trong kỳ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | kỳ cuối đạt, đủ sản phẩm | nộp hồ sơ cuối | chuyển PENDING_ACCEPTANCE, chuyên viên nhận thông báo |
| TC-02 / AC-02 | thiếu một sản phẩm cam kết | đăng ký | nêu mục thiếu và giữ IN_PROGRESS |
| TC-03 / AC-03 | Cam kết một bài và một sáng chế, đã duyệt hai bài | đăng ký nghiệm thu | nêu thiếu sáng chế và giữ IN_PROGRESS |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Đối chiếu thêm AC-01, AC-07 trong [F06](../../docs/features/F06-nghiem-thu/spec.md) ở phần áp dụng cho lát này.

**Đối chiếu nghiệp vụ.** Thử thiếu kỳ cuối, thiếu sản phẩm đúng loại và đầy đủ cả hai. Chỉ trường hợp cuối có thông báo tiếp nhận.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho Chuyên viên nghiệm thu và chủ nhiệm. [RV-22](../review-decisions.md#rv-22).
