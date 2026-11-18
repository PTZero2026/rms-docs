---
story: US-11
feature: F03
review_id: RV-11
status: Draft
updated: 2026-11-18
---

# Hợp đồng hành vi · US-11

**Điểm gọi.** Dịch vụ dùng chung và điểm gọi của module sở hữu. Module `review` sở hữu thao tác “Chốt kết quả xét duyệt”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/review/review-decision.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Đợt đang thu phiếu, ngưỡng, phiếu đã nộp, kết quả đạo đức nếu áp dụng |
| Kết quả thành công | Kết luận đợt, trạng thái đề tài và số phiếu thiếu nếu bị chặn |
| Điều kiện từ chối / kết quả phụ | chưa đủ phiếu → hiển thị số phiếu thiếu, đợt giữ nguyên |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Trường hợp cần review | Đủ phiếu khoa học, điểm vừa đạt nhưng hồ sơ bắt buộc thẩm định đạo đức đang chờ → chuyên viên chốt khoa học → lưu kết quả hội đồng, đề tài chưa APPROVED |

Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Hiển thị kết luận đợt, trạng thái đề tài và số phiếu thiếu nếu bị chặn; hiển thị riêng tình huống chưa đủ phiếu và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
