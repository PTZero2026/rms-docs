---
story: US-31
feature: F01
review_id: RV-31
status: Draft
updated: 2026-11-25
---

# Hợp đồng hành vi · US-31

**Điểm gọi.** Dịch vụ dùng chung và điểm gọi của module sở hữu. Module `proposal` sở hữu thao tác “Đối chiếu mục bắt buộc trong một thuyết minh”. Định dạng phản hồi dùng chung nằm trong hợp đồng OpenAPI. [Thẻ gợi ý và trường dữ liệu](../../../packages/api-contracts/assistant/evidence.yaml)

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Bản nháp, mẫu yêu cầu, tài liệu cho phép và người yêu cầu |
| Kết quả thành công | Trích đoạn có vị trí/phiên bản hoặc thông báo thiếu căn cứ |
| Điều kiện từ chối / kết quả phụ | tài liệu ngoài quyền hoặc thiếu căn cứ → từ chối truy xuất hoặc ghi chưa đủ căn cứ, hồ sơ gốc giữ nguyên |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Chỉ truy xuất phần tài liệu mà người dùng hiện có quyền đọc và trường cho phép dùng cho AI. Kiểm tra cả hai quyền trước khi gửi nội dung cho mô hình và khi mở lại yêu cầu hoặc căn cứ cũ. [RV-35](../../review-decisions.md#rv-35). |
| Trường hợp cần review | Dịch vụ trợ lý gián đoạn lúc rà một thuyết minh → chủ nhiệm trở lại biểu mẫu → vẫn rà thủ công và lưu được bản nháp của mình |

Mỗi gợi ý trả UUID trường, loại nguồn, UUID nguồn, phiên bản nguồn và mẫu đã dùng, phiên bản mô hình và mẫu lệnh. Ghi lựa chọn dùng/bỏ khi người dùng quyết định. Khi tắt AI hoặc dịch vụ gặp lỗi, người dùng vẫn tiếp tục thủ công. Hiển thị trích đoạn có vị trí/phiên bản hoặc thông báo thiếu căn cứ; hiển thị riêng tình huống tài liệu ngoài quyền hoặc thiếu căn cứ và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
