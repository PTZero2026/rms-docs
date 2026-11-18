---
story: US-13
feature: B02
review_id: RV-13
status: Draft
updated: 2026-11-18
---

# Hợp đồng hành vi · US-13

**Điểm gọi.** Web RMS theo quyền của người thực hiện. Module `report` sở hữu thao tác “Đếm hồ sơ theo trạng thái của một kỳ”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/report/call-report.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Kỳ, phạm vi đơn vị, thời điểm trích xuất |
| Kết quả thành công | Số hồ sơ theo trạng thái, tổng cộng và danh sách đối chứng |
| Điều kiện từ chối / kết quả phụ | chỉ có quyền một đơn vị → cả dòng chi tiết và tổng loại hồ sơ ngoài quyền |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Trường hợp cần review | Có 3 hồ sơ đã cấp mã và một bản nháp chưa từng nộp → đếm cả kỳ rồi xuất danh sách → tổng 3, bản chưa từng nộp không có dòng |

Truy vấn trong phạm vi hiện tại. Đọc hoặc mở liên kết giữ nguyên trạng thái hồ sơ. Hiển thị số hồ sơ theo trạng thái, tổng cộng và danh sách đối chứng; hiển thị riêng tình huống chỉ có quyền một đơn vị và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
