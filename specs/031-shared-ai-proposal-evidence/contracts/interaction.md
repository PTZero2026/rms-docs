---
story: US-31
feature: F01
review_id: RV-31
status: Draft
updated: 2026-11-18
---

# Hợp đồng hành vi · US-31

**Điểm gọi.** Dịch vụ dùng chung và điểm gọi của module sở hữu. Module `proposal` sở hữu thao tác “Đối chiếu mục bắt buộc trong một thuyết minh”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/proposal/ai-proposal-evidence.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Bản nháp, mẫu yêu cầu, tài liệu cho phép và người yêu cầu |
| Kết quả thành công | Trích đoạn có vị trí/phiên bản hoặc thông báo thiếu căn cứ |
| Điều kiện từ chối / kết quả phụ | tài liệu ngoài quyền hoặc thiếu căn cứ → từ chối truy xuất hoặc ghi chưa đủ căn cứ, hồ sơ gốc giữ nguyên |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Trường hợp cần review | Dịch vụ trợ lý gián đoạn lúc rà một thuyết minh → chủ nhiệm trở lại biểu mẫu → vẫn rà thủ công và lưu được bản nháp của mình |

Kiểm quyền trước khi đọc tài liệu và khi mở trích dẫn. Lưu gợi ý, nguồn, phiên bản mẫu lệnh/mô hình và quyết định của người dùng riêng với hồ sơ gốc. Dịch vụ AI lỗi thì trở về luồng thủ công. Hiển thị trích đoạn có vị trí/phiên bản hoặc thông báo thiếu căn cứ; hiển thị riêng tình huống tài liệu ngoài quyền hoặc thiếu căn cứ và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
