---
story: US-08
feature: F01
review_id: RV-08
status: Draft
updated: 2026-11-18
---

# Hợp đồng hành vi · US-08

**Điểm gọi.** Web RMS theo quyền của người thực hiện. Module `proposal` sở hữu thao tác “Trả hồ sơ cần bổ sung”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/proposal/return-proposal.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Mã hồ sơ đã nộp, lý do trả, kỳ tiếp nhận |
| Kết quả thành công | Bản nháp mở lại và lý do gắn cùng mã cũ |
| Điều kiện từ chối / kết quả phụ | đã hết hạn → chặn thao tác và giữ trạng thái |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Trường hợp cần review | Hồ sơ còn hạn và lý do chỉ chứa khoảng trắng → chuyên viên gửi trả → giữ Đã nộp, yêu cầu nhập lý do |

Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Hiển thị bản nháp mở lại và lý do gắn cùng mã cũ; hiển thị riêng tình huống đã hết hạn và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
