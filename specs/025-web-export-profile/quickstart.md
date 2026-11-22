---
story: US-25
feature: F08
review_id: RV-25
status: Draft
updated: 2026-11-21
---

# Kiểm tra đầu cuối · US-25

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị hai phiên bản v1 và v2 có tiêu đề khác nhau của cùng một mẫu tenant, một người có hai vai trò trên cùng sản phẩm đã duyệt và một sản phẩm đang chờ duyệt. Mở web rms theo quyền của người thực hiện với tài khoản thực hiện trong kỳ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | một sản phẩm đã duyệt gắn qua hai vai trò và một sản phẩm chờ duyệt | trích xuất | mẫu đúng, sản phẩm đã duyệt xuất hiện một lần, sản phẩm chờ duyệt vắng mặt |
| TC-02 / AC-02 | người dùng ngoài phạm vi | yêu cầu lý lịch người khác | từ chối |
| TC-03 / AC-03 | hai phiên bản cùng mã mẫu của trường, tiêu đề khác nhau | Xuất lý lịch của U khi v1 có hiệu lực, kích hoạt v2 rồi xuất lại cùng lý lịch | Tệp đầu dùng tiêu đề v1, tệp sau dùng tiêu đề v2. Hai sự kiện `EXPORT_CV` ghi cùng mã mẫu và lần lượt ghi phiên bản v1, v2 |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Đối chiếu thêm AC-09, AC-12, AC-13 trong [F08](../../docs/features/F08-ly-lich-khoa-hoc/spec.md) ở phần áp dụng cho lát này.

**Đối chiếu nghiệp vụ.** Lưu hai tệp và hai bản ghi xuất của TC-03. Đối chiếu theo người xuất, hồ sơ và thời điểm để xác định phiên bản mẫu từng lần.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho Phòng tổ chức và chuyên viên KHCN. [RV-25](../review-decisions.md#rv-25).
