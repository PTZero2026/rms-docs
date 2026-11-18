---
story: US-24
feature: F05
review_id: RV-24
status: Draft
updated: 2026-11-18
---

# Kiểm tra đầu cuối · US-24

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị đề tài PASSED, kịch bản F05 cơ bản, điều kiện F06 AC-10 cần PO xác định trước khi giao. Mở dịch vụ dùng chung và điểm gọi của module sở hữu với tài khoản thực hiện trong kỳ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | đề tài PASSED, chuyên viên đã rà thủ công trong pilot chưa bật kết nối kế toán | chuyên viên quyết toán | chuyển COMPLETED, khóa kinh phí và ghi audit |
| TC-02 / AC-02 | chủ nhiệm | tự đóng | từ chối, đề tài giữ nguyên |
| TC-03 / AC-03 | Đề tài PASSED đã bật đối soát và còn một dòng MISMATCHED | chuyên viên đóng sổ | giữ PASSED, chỉ rõ dòng cần xử lý trước khi đóng |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Đối chiếu thêm AC-05, AC-07 trong [F05](../../docs/features/F05-quan-ly-kinh-phi/spec.md) ở phần áp dụng cho lát này.

**Đối chiếu nghiệp vụ.** Thử khóa ở đơn vị cơ bản, chặn khi đã biết MISMATCHED và gửi lại sau khi thành công. Kiểm mọi lối sửa/xóa chi sau khóa.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho PO, trưởng phòng KHCN và kế toán trưởng. [RV-24](../review-decisions.md#rv-24).
