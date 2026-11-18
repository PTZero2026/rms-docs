---
story: US-31
feature: F01
review_id: RV-31
status: Draft
updated: 2026-11-18
---

# Kiểm tra đầu cuối · US-31

Trong môi trường thử của repo code, tạo hai tenant A/B và người có/ngoài quyền. Chuẩn bị một mẫu yêu cầu, hai đoạn đã gán nhãn, một hồ sơ ở tenant khác. Chỉ bật trợ lý cho tenant và nguồn đã được phép. Mở dịch vụ dùng chung và điểm gọi của module sở hữu với tài khoản thực hiện trong kỳ thử. Ghi mã hồ sơ và ảnh hoặc kết quả trả về cho từng ca.

| Ca / tiêu chí | Given | When | Then |
|---|---|---|---|
| TC-01 / AC-01 | đoạn nguồn hợp lệ | yêu cầu rà | thấy trích đoạn, vị trí và bản mẫu, chủ nhiệm có thể bác gợi ý |
| TC-02 / AC-02 | tài liệu ngoài quyền hoặc thiếu căn cứ | yêu cầu rà | từ chối truy xuất hoặc ghi chưa đủ căn cứ, hồ sơ gốc giữ nguyên |
| TC-03 / AC-03 | Dịch vụ trợ lý gián đoạn lúc rà một thuyết minh | chủ nhiệm trở lại biểu mẫu | vẫn rà thủ công và lưu được bản nháp của mình |
| TC-04 / SC-002 | Người tenant B có cùng vai trò nhưng chỉ có mã/đường dẫn của A | Yêu cầu lại dữ liệu hoặc thao tác của A | Không trả nội dung riêng của A và không thay đổi bản ghi A |

Lấy bảng đối chứng có chữ ký PO/BA trước khi đưa AC mới vào feature nguồn. Tắt dịch vụ và kiểm đường thủ công. Với từng dẫn chứng hãy mở lại đúng trang/đoạn bằng cùng tài khoản.

**Đối chiếu nghiệp vụ.** Trên 50 hồ sơ gán nhãn độc lập, tính số mục thiếu tìm đúng/tổng mục thiếu và số báo sai/tổng cảnh báo. Mục tiêu ≥90%, ≤10%, không lộ chéo hoặc bịa dẫn chứng.

**Đạt khi** cả bốn ca và phép đối chiếu nghiệp vụ khớp kết quả dự kiến. Lưu chứng cứ TC-03 cho PO, chủ dữ liệu trường và QA AI. [RV-31](../review-decisions.md#rv-31).
