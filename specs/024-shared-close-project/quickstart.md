---
story: US-24
feature: F05
review_id: RV-24
status: Draft
updated: 2026-11-21
---

# Kiểm tra đầu cuối · US-24

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị hồ sơ PASSED cho hai chế độ, gồm pilot rà thủ công và đơn vị bật đối soát với các khoản MATCHED, UNRECONCILED, MISMATCHED. Mở dịch vụ dùng chung và điểm gọi của module sở hữu với tài khoản thực hiện trong kỳ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | đề tài PASSED. Chạy riêng pilot chưa bật đối soát đã rà thủ công và đơn vị đã bật có mọi khoản MATCHED | chuyên viên quyết toán | chuyển COMPLETED, khóa kinh phí và ghi audit |
| TC-02 / AC-02 | chủ nhiệm | tự đóng | từ chối, đề tài giữ nguyên |
| TC-03 / AC-03 | Đề tài PASSED đã bật đối soát. Lần lượt thử chỉ còn UNRECONCILED, chỉ còn MISMATCHED, rồi cả hai cùng một khoản MATCHED | chuyên viên đóng sổ | giữ PASSED và sổ chưa khóa. Danh sách hiển thị đúng mã và trạng thái tất cả khoản vướng |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Đối chiếu thêm AC-05, AC-07 trong [F05](../../docs/features/F05-quan-ly-kinh-phi/spec.md) ở phần áp dụng cho lát này.

**Đối chiếu nghiệp vụ.** Trên hồ sơ bị chặn ở TC-03, xử lý hết khoản vướng thành MATCHED rồi xác nhận quyết toán. Kiểm hồ sơ chuyển COMPLETED, khóa sổ, thông báo và audit. Gửi lại lệnh và kiểm chỉ có một lần chuyển thành công. Kiểm mọi lối sửa/xóa chi sau khóa.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho PO, trưởng phòng KHCN và kế toán trưởng. [RV-24](../review-decisions.md#rv-24).
