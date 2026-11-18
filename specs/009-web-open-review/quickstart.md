---
story: US-09
feature: F03
review_id: RV-09
status: Draft
updated: 2026-11-18
---

# Kiểm tra đầu cuối · US-09

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị kỳ đã đóng, hồ sơ đã nộp, hội đồng xét duyệt có thành viên. Mở web rms theo quyền của người thực hiện với tài khoản thực hiện trong kỳ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | đủ điều kiện | chuyên viên mở đợt | đề tài chuyển UNDER_REVIEW và đợt thu phiếu bắt đầu |
| TC-02 / AC-02 | thành viên chỉ có quyền chấm | yêu cầu mở đợt | từ chối, không tạo đợt |
| TC-03 / AC-03 | Hai chuyên viên cùng chọn một hồ sơ đủ điều kiện | xác nhận mở đợt đồng thời | chỉ một đợt thu phiếu, một lần chuyển trạng thái |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Đối chiếu thêm AC-01, AC-09 trong [F03](../../docs/features/F03-xet-duyet-hoi-dong/spec.md) ở phần áp dụng cho lát này.

**Đối chiếu nghiệp vụ.** Đếm đợt, danh sách phân công và lịch sử chuyển khi hai chuyên viên xác nhận cùng lúc.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho Thư ký hội đồng và BA. [RV-09](../review-decisions.md#rv-09).
