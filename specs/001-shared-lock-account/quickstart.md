---
story: US-01
feature: B03
review_id: RV-01
status: Draft
updated: 2026-11-24
---

# Kiểm tra đầu cuối · US-01

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị một tài khoản đích đang hoạt động và hai người thao tác riêng biệt (một admin, một user chỉ xem). Mở dịch vụ dùng chung và điểm gọi của module sở hữu với tài khoản thực hiện trong kỳ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | admin khóa đúng người | gửi lệnh | tài khoản chuyển sang bị khóa và ghi audit |
| TC-02 / AC-02 | người chỉ có quyền xem | gửi cùng yêu cầu | backend từ chối, tài khoản giữ nguyên |
| TC-03 / AC-03 | U đã mở hồ sơ có quyền sửa trước khi quản trị viên khóa tài khoản | thử hai lượt độc lập, lần đầu tải lại, lần sau bấm Lưu nội dung vừa sửa, mỗi thao tác là yêu cầu đầu tiên sau khi khóa | cả hai yêu cầu trả 403. Người có quyền đọc thấy đúng bản đã lưu và lịch sử trước khi khóa |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Đối chiếu thêm AC-08, AC-09, AC-12 trong [B03](../../docs/features/B03-quan-ly-nguoi-dung/spec.md) ở phần áp dụng cho lát này.

**Đối chiếu nghiệp vụ.** Lập biên bản trước/sau cho lần khóa đầu và thử lại bằng phiên cũ; đối chiếu actor, tài khoản đích và giờ khóa.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho Quản trị IAM và phụ trách CNTT. [RV-01](../review-decisions.md#rv-01).
