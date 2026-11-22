---
story: US-13
feature: B02
review_id: RV-13
status: Draft
updated: 2026-11-21
---

# Hợp đồng hành vi · US-13

**Điểm gọi.** Web RMS theo quyền của người thực hiện. Module `report` sở hữu thao tác “Đếm hồ sơ theo trạng thái của một kỳ”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/report/call-report.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Kỳ, phạm vi đơn vị, thời điểm trích xuất |
| Kết quả thành công | Số hồ sơ theo trạng thái, tổng cộng và danh sách đối chứng |
| Điều kiện từ chối / kết quả phụ | chỉ có quyền một đơn vị → cả dòng chi tiết và tổng loại hồ sơ ngoài quyền |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Quyết định RV-13 | Trong kỳ và phạm vi được xem, mỗi hồ sơ đã cấp mã được tính một lần, kể cả khi nộp lại hoặc đang ở Nháp sau khi bị trả. Loại nháp chưa từng nộp, chưa có mã. Tổng, chi tiết và tệp xuất cùng dùng trạng thái tại thời điểm tạo bản chụp. |

Truy vấn trong phạm vi hiện tại. Đọc hoặc mở liên kết giữ nguyên trạng thái hồ sơ. Hiển thị số hồ sơ theo trạng thái, tổng cộng và danh sách đối chứng; hiển thị riêng tình huống chỉ có quyền một đơn vị và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
