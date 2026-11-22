---
story: US-30
feature: P03
review_id: RV-30
status: Draft
updated: 2026-11-21
---

# Kiểm tra đầu cuối · US-30

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị tenant thử đã bật P03, một hoạt động có ngày nghiệp vụ 30/09/2027, một giảng viên nhận toàn bộ số giờ và hai định mức mẫu cho cùng loại hoạt động: v1 cho 6 giờ đến hết 30/09/2027, v2 cho 8 giờ từ 01/10/2027. Bật module E4 riêng theo tenant và quy chế đã chọn. Mở dịch vụ dùng chung và điểm gọi của module sở hữu bằng cách phát sự kiện hoặc đặt đồng hồ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | hoạt động hợp lệ ngày 30/09, nhận lần đầu sau khi v2 có hiệu lực | tính giờ | ghi 6 giờ theo v1 vào kỳ của ngày 30/09 |
| TC-02 / AC-02 | cùng sự kiện | xử lý lần hai | không phát sinh dòng giờ trùng |
| TC-03 / AC-03 | Hoạt động ngày 30/09 đã ghi 6 giờ theo v1 | Sau khi v2 có hiệu lực, gửi lại cùng khóa nguồn | Vẫn một dòng 6 giờ theo v1 cho giảng viên, cùng kỳ và phân bổ, tổng vẫn 6 giờ |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Đối chiếu thêm AC-01, AC-05, AC-06, AC-08 trong [P03](../../docs/features/P03-quy-doi-gio-giang/spec.md) ở phần áp dụng cho lát này.

**Đối chiếu nghiệp vụ.** Sau TC-03, người có quyền ghi điều chỉnh +1 giờ với lý do. Gửi lại cùng sự kiện. Đối chiếu dòng gốc 6 giờ theo v1, một dòng điều chỉnh +1 giờ, tổng 7 giờ và nhật ký ghi người sửa, lý do.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho Phòng đào tạo, phòng KHCN và chủ quy chế. [RV-30](../review-decisions.md#rv-30).
