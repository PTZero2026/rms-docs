---
story: US-16
feature: B04
review_id: RV-16
status: Draft
updated: 2026-11-18
---

# Kiểm tra đầu cuối · US-16

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị một kỳ báo cáo đến mốc nhắc, đồng hồ giả lập. Mở dịch vụ dùng chung và điểm gọi của module sở hữu bằng cách phát sự kiện hoặc đặt đồng hồ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | kỳ đến mốc N | chạy nhắc | có thông báo cho đúng chủ nhiệm |
| TC-02 / AC-02 | cùng đề tài, kỳ và mốc | chạy lại | không tạo thêm thông báo |
| TC-03 / AC-03 | Thông báo trong ứng dụng đã có nhưng kênh email lỗi | tác vụ chạy lại cùng mốc | vẫn một thông báo và theo dõi được lần gửi lại |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Đối chiếu thêm AC-07 trong [B04](../../docs/features/B04-thong-bao/spec.md) ở phần áp dụng cho lát này.

**Đối chiếu nghiệp vụ.** Cố định đồng hồ tại mốc N, chạy hai lần với cùng kỳ, xem một thông báo đúng người; kiểm ngày ngoài mốc không phát sinh thêm.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho Chuyên viên tiến độ và phụ trách vận hành. [RV-16](../review-decisions.md#rv-16).
