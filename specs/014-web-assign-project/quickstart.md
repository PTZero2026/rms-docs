---
story: US-14
feature: F04
review_id: RV-14
status: Draft
updated: 2026-11-18
---

# Kiểm tra đầu cuối · US-14

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị đề tài APPROVED và mẫu hồ sơ giao. Mở web rms theo quyền của người thực hiện với tài khoản thực hiện trong kỳ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | đủ căn cứ | xác nhận giao | hồ sơ giao có hiệu lực, đề tài IN_PROGRESS |
| TC-02 / AC-02 | thiếu căn cứ bắt buộc | xác nhận | chỉ ra mục thiếu, đề tài còn APPROVED |
| TC-03 / AC-03 | Thiếu tệp căn cứ dù đã nhập số quyết định | xác nhận giao | nêu mục tệp thiếu, giữ APPROVED |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Đối chiếu thêm AC-01, AC-14 trong [F04](../../docs/features/F04-quan-ly-tien-do/spec.md) ở phần áp dụng cho lát này.

**Đối chiếu nghiệp vụ.** Lần lượt rút số quyết định, ngân sách hoặc tệp trước khi xác nhận. Mỗi lần nêu đúng trường thiếu và đề tài còn APPROVED.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho Trưởng phòng KHCN và chuyên viên hợp đồng. [RV-14](../review-decisions.md#rv-14).
