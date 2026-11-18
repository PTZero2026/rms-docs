---
story: US-14
feature: F04
review_id: RV-14
status: Draft
updated: 2026-11-18
---

# Hợp đồng hành vi · US-14

**Điểm gọi.** Web RMS theo quyền của người thực hiện. Module `progress` sở hữu thao tác “Giao thực hiện đề tài đã duyệt”. Định nghĩa định dạng chính thức khi thực thi ở `packages/api-contracts/progress/assign-project.yaml`.

| Thành phần | Thỏa thuận |
|---|---|
| Đầu vào | Quyết định/hợp đồng, ngân sách, kỳ thực hiện, tệp căn cứ |
| Kết quả thành công | Hồ sơ giao EFFECTIVE và đề tài IN_PROGRESS |
| Điều kiện từ chối / kết quả phụ | thiếu căn cứ bắt buộc → chỉ ra mục thiếu, đề tài còn APPROVED |
| Quyền | Lấy tenant và vai trò từ phiên hoặc ngữ cảnh worker đã xác thực. Kiểm trên đối tượng nguồn, cả khi đi theo liên kết trực tiếp. |
| Trường hợp cần review | Thiếu tệp căn cứ dù đã nhập số quyết định → xác nhận giao → nêu mục tệp thiếu, giữ APPROVED |

Kiểm điều kiện ngay lúc ghi. Lưu thay đổi và sự kiện nghiệp vụ cùng giao dịch, rollback đồng thời nếu ghi lỗi. Hiển thị hồ sơ giao EFFECTIVE và đề tài IN_PROGRESS; hiển thị riêng tình huống thiếu căn cứ bắt buộc và cho người có quyền quay về dữ liệu nguồn. [Spec và nguồn](../spec.md).
