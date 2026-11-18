---
story: US-26
feature: F09
review_id: RV-26
status: Draft
updated: 2026-11-18
---

# Kiểm tra đầu cuối · US-26

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị tenant bật F09, một loại nhiệm vụ và quy tắc minh chứng. Bật module E4 riêng theo tenant và quy chế đã chọn. Mở web rms theo quyền của người thực hiện với tài khoản thực hiện trong kỳ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | đủ dữ liệu | lưu | tra lại đầu mục đúng cấp và đơn vị |
| TC-02 / AC-02 | thiếu tệp bắt buộc ở bước duyệt | gửi duyệt và QLKH kiểm tại bước duyệt | chặn và chỉ rõ chứng cứ thiếu |
| TC-03 / AC-03 | Đầu mục cấp Bộ có tệp sai loại so với quy tắc DECISION | chuyên viên duyệt | nêu đúng loại quyết định phải bổ sung |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Đối chiếu thêm AC-01, AC-02 trong [F09](../../docs/features/F09-de-tai-cap-tren/spec.md) ở phần áp dụng cho lát này.

**Đối chiếu nghiệp vụ.** Dùng cấp Bộ cần DECISION và một loại không yêu cầu tệp đó. So kết quả duyệt theo quy tắc của từng loại.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho Phòng KHCN phụ trách nhiệm vụ cấp trên. [RV-26](../review-decisions.md#rv-26).
