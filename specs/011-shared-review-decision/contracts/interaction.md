---
story: US-11
feature: F03
review_id: RV-11
status: Draft
updated: 2026-11-21
---

# Hợp đồng hành vi · US-11

**Điểm gọi.** Dịch vụ dùng chung và điểm gọi của module sở hữu. Module `review` sở hữu thao tác “Chốt kết quả xét duyệt”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/review/review-decision.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Đề tài, đợt khoa học, ngưỡng và phiếu đã nộp khi chốt khoa học, kết luận khoa học đã lưu khi cập nhật kết quả đạo đức, yêu cầu và kết quả thẩm định của cùng hồ sơ |
| Kết quả thành công | Kết luận đợt, trạng thái đề tài và số phiếu thiếu nếu bị chặn |
| Điều kiện từ chối / kết quả phụ | chưa đủ phiếu → hiển thị số phiếu thiếu, đợt giữ nguyên |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Quyết định RV-11 | Lưu kết luận khoa học riêng. Khi khoa học đạt, đề tài chuyển `APPROVED` nếu quy chế không yêu cầu thẩm định đạo đức hoặc hội đồng đạo đức đã thông qua. Nếu còn chờ hoặc cần bổ sung, giữ `UNDER_REVIEW` và hiển thị việc còn chờ cho chủ nhiệm. Nếu hội đồng đạo đức từ chối cuối cùng, chuyển `REJECTED` và thông báo kết luận. Chỉ gửi thông báo phê duyệt một lần khi chuyển `APPROVED`. |

Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Hiển thị kết luận đợt, trạng thái đề tài và số phiếu thiếu nếu bị chặn; hiển thị riêng tình huống chưa đủ phiếu và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
