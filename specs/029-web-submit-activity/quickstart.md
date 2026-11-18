---
story: US-29
feature: F12
review_id: RV-29
status: Draft
updated: 2026-11-18
---

# Kiểm tra đầu cuối · US-29

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị tenant bật F12, một loại hoạt động và một quy tắc minh chứng. Bật module E4 riêng theo tenant và quy chế đã chọn. Mở web rms theo quyền của người thực hiện với tài khoản thực hiện trong kỳ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | đủ dữ liệu và minh chứng yêu cầu | gửi duyệt | hoạt động vào danh sách chờ xét |
| TC-02 / AC-02 | thiếu minh chứng bắt buộc của loại hoạt động | gửi | nêu loại tệp cần bổ sung |
| TC-03 / AC-03 | Hai trường yêu cầu minh chứng khác nhau cho cùng một hội nghị | giảng viên trường A gửi | chỉ kiểm bộ minh chứng của A |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Đối chiếu thêm AC-01, AC-02 trong [F12](../../docs/features/F12-hoat-dong-khoa-hoc/spec.md) ở phần áp dụng cho lát này.

**Đối chiếu nghiệp vụ.** Cùng một loại hội nghị ở A/B yêu cầu bộ tệp khác nhau. Thiếu tệp ở A phải hiện đúng loại bị thiếu của A.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho Phòng KHCN và đại diện giảng viên. [RV-29](../review-decisions.md#rv-29).
