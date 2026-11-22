---
story: US-05
feature: F02
review_id: RV-05
status: Draft
updated: 2026-11-21
---

# Hợp đồng hành vi · US-05

**Điểm gọi.** Web RMS theo quyền của người thực hiện. Module `call` sở hữu thao tác “Mở một kỳ nhận đề xuất”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/call/open-call.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Mã kỳ, cửa sổ thời gian, danh mục, bộ tiêu chí |
| Kết quả thành công | Kỳ OPEN hiển thị ở danh sách tiếp nhận |
| Điều kiện từ chối / kết quả phụ | ngày kết thúc trước ngày bắt đầu → báo lỗi và không tạo kỳ sai |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Điều kiện mở kỳ theo RV-05 | Khi chuyên viên bấm Mở kỳ, hệ thống kiểm lại hiệu lực của danh mục và bộ tiêu chí. Nếu có mục hết hiệu lực, kỳ vẫn ở trạng thái Nháp và hệ thống chỉ rõ mục cần thay. Sau khi thay mục và đáp ứng đủ điều kiện, chuyên viên có thể mở chính kỳ đó. |

Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Hiển thị kỳ OPEN hiển thị ở danh sách tiếp nhận; hiển thị riêng tình huống ngày kết thúc trước ngày bắt đầu và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
