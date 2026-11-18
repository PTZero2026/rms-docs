---
story: US-13
feature: B02
review_id: RV-13
status: Draft
updated: 2026-11-18
---

# Kiểm tra đầu cuối · US-13

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị một kỳ gồm 3 mã hợp lệ, 2 đơn vị, một mã đã nộp lại. Mở web rms theo quyền của người thực hiện với tài khoản thực hiện trong kỳ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | 3 mã trong quyền, 1 mã đã nộp lại | tổng hợp theo trạng thái hiện tại | tổng bằng 3, từng nhóm khớp danh sách chốt |
| TC-02 / AC-02 | chỉ có quyền một đơn vị | xuất báo cáo | cả dòng chi tiết và tổng loại hồ sơ ngoài quyền |
| TC-03 / AC-03 | Có 3 hồ sơ đã cấp mã và một bản nháp chưa từng nộp | đếm cả kỳ rồi xuất danh sách | tổng 3, bản chưa từng nộp không có dòng |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Lấy bảng đối chứng có chữ ký PO/BA trước khi đưa AC mới vào feature nguồn.

**Đối chiếu nghiệp vụ.** Sau khi tạo bản chụp, chuyển trạng thái một hồ sơ rồi đối chiếu tệp với danh sách cũ; tạo bản chụp mới phải thấy thay đổi.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho Trưởng phòng KHCN và PO/BA. [RV-13](../review-decisions.md#rv-13).
