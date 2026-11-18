---
story: US-30
feature: P03
review_id: RV-30
status: Draft
updated: 2026-11-18
---

# Kiểm tra đầu cuối · US-30

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị tenant bật P03, một sự kiện đã duyệt, một công thức do trường xác nhận. Bật module E4 riêng theo tenant và quy chế đã chọn. Mở dịch vụ dùng chung và điểm gọi của module sở hữu bằng cách phát sự kiện hoặc đặt đồng hồ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | sự kiện hợp lệ | tính giờ | ra đúng giờ đối chứng theo công thức của kỳ |
| TC-02 / AC-02 | cùng sự kiện | xử lý lần hai | không phát sinh dòng giờ trùng |
| TC-03 / AC-03 | Sự kiện tháng trước được gửi lại sau ngày công thức mới có hiệu lực | đối chiếu sổ giờ | giữ số giờ theo công thức cũ, không có dòng trùng |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Đối chiếu thêm AC-01, AC-05 trong [P03](../../docs/features/P03-quy-doi-gio-giang/spec.md) ở phần áp dụng cho lát này.

**Đối chiếu nghiệp vụ.** Dùng một hoạt động ở ranh giới ngày đổi công thức và một yêu cầu gửi lại cùng khóa. Đối chiếu sổ nguồn, kỳ, số giờ và phiên bản công thức.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho Phòng đào tạo, phòng KHCN và chủ quy chế. [RV-30](../review-decisions.md#rv-30).
