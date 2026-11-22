---
story: US-03
feature: P01
review_id: RV-03
status: Draft
updated: 2026-11-21
---

# Kiểm tra đầu cuối · US-03

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị một hồ sơ ghim phiên bản 1 và một mẫu phiên bản 2. Mở dịch vụ dùng chung và điểm gọi của module sở hữu với tài khoản thực hiện trong kỳ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | mẫu v2 hợp lệ | kích hoạt và tạo hồ sơ | hồ sơ mới theo v2, hồ sơ cũ vẫn theo v1 |
| TC-02 / AC-02 | mẫu có bước thiếu trạng thái chuẩn | kích hoạt | từ chối và nêu bước cần sửa |
| TC-03 / AC-03 | X đang chờ duyệt theo v1. Ở cùng bước duyệt, v2 có bước kế tiếp khác v1 | kích hoạt v2, tạo Y rồi cho X và Y hoàn tất bước duyệt và tiếp tục đến khi kết thúc | X đi tới bước của v1, Y đi tới bước của v2. X và Y giữ đúng phiên bản tương ứng tới khi hoàn tất |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Đối chiếu thêm AC-03, AC-05 trong [P01](../../docs/features/P01-workflow-engine/spec.md) ở phần áp dụng cho lát này.

**Đối chiếu nghiệp vụ.** Đọc templateId và bước kế tiếp của cả hai hồ sơ sau khi v2 hiệu lực. Mẫu có cạnh mồ côi cũng phải bị từ chối.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho Chủ quy trình và kiến trúc sư. [RV-03](../review-decisions.md#rv-03).
