---
story: US-10
feature: F03
review_id: RV-10
status: Draft
updated: 2026-11-18
---

# Kiểm tra đầu cuối · US-10

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị một thành viên được phân công và một thành viên có xung đột lợi ích. Mở web rms theo quyền của người thực hiện với tài khoản thực hiện trong kỳ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | phiếu đủ điểm hợp lệ | gửi | tính tổng theo trọng số, khóa phiếu đã nộp |
| TC-02 / AC-02 | người chấm là thành viên đề tài | mở hoặc tạo phiếu cho đề tài | không thấy việc chấm và không tạo được phiếu |
| TC-03 / AC-03 | Người đã mở nháp vừa được bổ sung vào nhóm đề tài | gửi phiếu đã điền | phiếu không được tính và người đó mất quyền chấm |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Đối chiếu thêm AC-02, AC-06, AC-07 trong [F03](../../docs/features/F03-xet-duyet-hoi-dong/spec.md) ở phần áp dụng cho lát này.

**Đối chiếu nghiệp vụ.** Thử điểm bằng tối đa, vượt tối đa và thiếu một tiêu chí. Chỉ phiếu hợp lệ được tính vào số lượng đã gửi.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho Chủ tịch hội đồng và QA. [RV-10](../review-decisions.md#rv-10).
