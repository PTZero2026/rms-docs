---
story: US-25
feature: F08
review_id: RV-25
status: Draft
updated: 2026-11-18
---

# Kiểm tra đầu cuối · US-25

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị một mẫu đã duyệt, một người có nhiều vai trò trên cùng đầu ra. Mở web rms theo quyền của người thực hiện với tài khoản thực hiện trong kỳ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | có một đầu ra đủ điều kiện qua hai quan hệ | trích xuất | mẫu đúng và chỉ một dòng cho đầu ra |
| TC-02 / AC-02 | người dùng ngoài phạm vi | yêu cầu lý lịch người khác | từ chối |
| TC-03 / AC-03 | Một sản phẩm gắn qua hai vai trò và một sản phẩm đang chờ duyệt | xuất lý lịch | chỉ có một dòng cho sản phẩm đã duyệt |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Đối chiếu thêm AC-09, AC-12, AC-13 trong [F08](../../docs/features/F08-ly-lich-khoa-hoc/spec.md) ở phần áp dụng cho lát này.

**Đối chiếu nghiệp vụ.** Cho cùng tác giả xuất hiện qua hai quan hệ; đối chiếu một dòng, đúng mẫu tenant và sự kiện xuất.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho Phòng tổ chức và chuyên viên KHCN. [RV-25](../review-decisions.md#rv-25).
