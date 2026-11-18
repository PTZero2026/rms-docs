---
story: US-21
feature: F07
review_id: RV-21
status: Draft
updated: 2026-11-18
---

# Kiểm tra đầu cuối · US-21

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị một sản phẩm đang chờ và cam kết cùng loại. Mở dịch vụ dùng chung và điểm gọi của module sở hữu với tài khoản thực hiện trong kỳ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | sản phẩm đủ chứng cứ | chuyên viên duyệt | APPROVED và được tính vào cam kết của đề tài |
| TC-02 / AC-02 | chủ nhiệm chỉ có quyền kê khai | tự duyệt | bị từ chối, tổng đạt giữ nguyên |
| TC-03 / AC-03 | Cùng một đầu ra vừa duyệt, cam kết còn thiếu một sản phẩm cùng loại | gửi lại lệnh duyệt | chỉ một đầu ra được tính, mục cam kết vẫn thiếu một |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Đối chiếu thêm AC-03, AC-08, AC-11 trong [F07](../../docs/features/F07-san-pham-khoa-hoc/spec.md) ở phần áp dụng cho lát này.

**Đối chiếu nghiệp vụ.** Dùng cam kết hai bài; duyệt lại cùng một bài vẫn chỉ đạt một trên hai.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho Chuyên viên sản phẩm và phòng KHCN. [RV-21](../review-decisions.md#rv-21).
