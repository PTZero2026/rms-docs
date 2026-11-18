---
story: US-09
feature: F03
review_id: RV-09
status: Draft
updated: 2026-11-18
---

# Hợp đồng hành vi · US-09

**Điểm gọi.** Web RMS theo quyền của người thực hiện. Module `review` sở hữu thao tác “Mở đợt chấm cho một đề tài”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/review/open-review.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Hồ sơ chốt, hội đồng, bộ tiêu chí và phân công |
| Kết quả thành công | Đợt thu phiếu và danh sách người được chấm |
| Điều kiện từ chối / kết quả phụ | thành viên chỉ có quyền chấm → từ chối, không tạo đợt |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Trường hợp cần review | Hai chuyên viên cùng chọn một hồ sơ đủ điều kiện → xác nhận mở đợt đồng thời → chỉ một đợt thu phiếu, một lần chuyển trạng thái |

Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Hiển thị đợt thu phiếu và danh sách người được chấm; hiển thị riêng tình huống thành viên chỉ có quyền chấm và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
