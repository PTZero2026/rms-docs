---
story: US-23
feature: F06
review_id: RV-23
status: Draft
updated: 2026-11-18
---

# Kiểm tra đầu cuối · US-23

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị đợt nghiệm thu có phiếu đã gửi và ngưỡng đã cấu hình. Mở dịch vụ dùng chung và điểm gọi của module sở hữu với tài khoản thực hiện trong kỳ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | đủ phiếu và đạt ngưỡng | kết luận | đề tài PASSED, chờ quyết toán F05 |
| TC-02 / AC-02 | thiếu một phiếu bắt buộc | kết luận | chặn và báo số phiếu thiếu |
| TC-03 / AC-03 | Đợt nghiệm thu thiếu một phiếu, đề tài có một phiếu xét duyệt đầu vào | chốt kết luận | vẫn thiếu một phiếu, chưa chuyển PASSED |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Đối chiếu thêm AC-04, AC-06 trong [F06](../../docs/features/F06-nghiem-thu/spec.md) ở phần áp dụng cho lát này.

**Đối chiếu nghiệp vụ.** Dùng phiếu của đợt xét đầu vào làm dòng nhiễu; xác minh không được tính bù cho một phiếu nghiệm thu còn thiếu.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho Thư ký hội đồng nghiệm thu và PO. [RV-23](../review-decisions.md#rv-23).
