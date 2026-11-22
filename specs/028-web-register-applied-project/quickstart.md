---
story: US-28
feature: F11
review_id: RV-28
status: Draft
updated: 2026-11-21
---

# Kiểm tra đầu cuối · US-28

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị tenant bật F11, danh mục đơn vị và một đối tác. Bật module E4 riêng theo tenant và quy chế đã chọn. Mở web rms theo quyền của người thực hiện với tài khoản thực hiện trong kỳ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | đủ trường và đối tác, tổng kinh phí 50 triệu VND | lưu kê khai | tra lại đúng đơn vị và 50 triệu VND ở đầu mục, sổ chi F05 giữ nguyên |
| TC-02 / AC-02 | thiếu đối tác ngoài | gửi duyệt | chặn và yêu cầu bổ sung |
| TC-03 / AC-03 | Hồ sơ có đơn vị chủ trì, đủ các điều kiện khác, chưa có đối tác ngoài | Lưu và mở lại bản nháp. Gửi duyệt khi chưa có đối tác. Trên cùng hồ sơ, thêm một đối tác ngoài rồi gửi lại | Lưu nháp thành công. Lần gửi đầu giữ Nháp và yêu cầu bổ sung đối tác. Lần gửi sau chuyển cùng hồ sơ sang Chờ duyệt |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Đối chiếu thêm AC-01, AC-02, AC-03 trong [F11](../../docs/features/F11-du-an-phuc-vu-san-xuat/spec.md) ở phần áp dụng cho lát này.

**Đối chiếu nghiệp vụ.** Ở TC-01, so số dòng F05 trước và sau khi lưu. Ở TC-03, ghi mã hồ sơ lúc lưu và đối chiếu cùng mã qua hai lần gửi. Thử riêng lưu nháp thiếu đơn vị chủ trì và kiểm thông báo yêu cầu chọn đơn vị (F11 AC-01).

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho Đại diện viện chủ trì và chuyên viên KHCN. [RV-28](../review-decisions.md#rv-28).
