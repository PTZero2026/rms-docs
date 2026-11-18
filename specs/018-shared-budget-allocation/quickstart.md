---
story: US-18
feature: F05
review_id: RV-18
status: Draft
updated: 2026-11-18
---

# Kiểm tra đầu cuối · US-18

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị quyết định giao hiệu lực, hạn mức và tỷ lệ hợp lệ. Mở dịch vụ dùng chung và điểm gọi của module sở hữu với tài khoản thực hiện trong kỳ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | cấp 100 triệu, tỷ lệ 5%, trần 10 triệu | xác nhận | phí 5 triệu, kinh phí thực hiện 95 triệu đồng |
| TC-02 / AC-02 | chủ nhiệm | xác nhận cấp | bị chặn ở máy chủ |
| TC-03 / AC-03 | Cấp 300 triệu, tỷ lệ 5%, trần 10 triệu, không điều chỉnh riêng | xác nhận | phí 10 triệu và phần thực hiện 290 triệu |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Đối chiếu thêm AC-01, AC-07 trong [F05](../../docs/features/F05-quan-ly-kinh-phi/spec.md) ở phần áp dụng cho lát này.

**Đối chiếu nghiệp vụ.** Đối chiếu cả mẫu 100 triệu và 300 triệu; thay đổi tỷ lệ chung sau xác nhận phải giữ nguyên khoản đã ghi.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho Kế toán và chuyên viên kinh phí. [RV-18](../review-decisions.md#rv-18).
