---
story: US-28
feature: F11
review_id: RV-28
status: Draft
updated: 2026-11-18
---

# Kiểm tra đầu cuối · US-28

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị tenant bật F11, danh mục đơn vị và một đối tác. Bật module E4 riêng theo tenant và quy chế đã chọn. Mở web rms theo quyền của người thực hiện với tài khoản thực hiện trong kỳ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | đủ trường và đối tác | lưu kê khai | tra lại đúng đơn vị và tổng kinh phí |
| TC-02 / AC-02 | thiếu đối tác ngoài | gửi duyệt | chặn và yêu cầu bổ sung |
| TC-03 / AC-03 | Đã có viện chủ trì, đối tác và 50 triệu VND | lưu dự án | đầu mục giữ 50 triệu, sổ chi đề tài F05 giữ nguyên |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Đối chiếu thêm AC-01, AC-02, AC-03 trong [F11](../../docs/features/F11-du-an-phuc-vu-san-xuat/spec.md) ở phần áp dụng cho lát này.

**Đối chiếu nghiệp vụ.** Đối chiếu số tiền ở đầu mục với dữ liệu nhập và kiểm số dòng F05 trước/sau bằng nhau.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho Đại diện viện chủ trì và chuyên viên KHCN. [RV-28](../review-decisions.md#rv-28).
