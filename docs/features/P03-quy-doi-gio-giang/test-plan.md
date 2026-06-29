---
title: "Quy đổi giờ giảng — Test plan"
spec: "./spec.md"
owner: "<TEST>"
status: Draft
updated: 2026-06-29
---

# Quy đổi giờ giảng — Kế hoạch kiểm thử

> Khung mẫu — mỗi test case bám một AC trong `spec.md`.

## 2. Test cases
| ID | Liên kết AC | Tiền điều kiện | Bước thực hiện | Kết quả mong đợi | Loại |
|---|---|---|---|---|---|
| TC-01 | AC-01 | Có công thức loại X hiệu lực từ 01/01/2026; sự kiện X có `sourceOccurredAt = 15/03/2026` | Gửi yêu cầu quy đổi hợp lệ | Tính đúng số giờ theo công thức hiệu lực tại `sourceOccurredAt` | Happy |
| TC-02 | AC-02 | Tenant dùng mặc định `ACADEMIC_YEAR`; lịch năm học `2026-2027` đã cấu hình | Gửi sự kiện có `sourceOccurredAt` thuộc năm học `2026-2027` | Bản ghi có `recognitionPeriodType=ACADEMIC_YEAR`, `recognitionPeriodCode=2026-2027` | Happy |
| TC-03 | AC-03 | Tenant cấu hình `FISCAL_YEAR`; lịch tài khóa `2026` đã cấu hình | Gửi sự kiện có `sourceOccurredAt` thuộc năm tài khóa `2026` | Bản ghi có `recognitionPeriodType=FISCAL_YEAR`, `recognitionPeriodCode=2026` | Happy |
| TC-04 | AC-04 | Sự kiện có chủ nhiệm và 2 thành viên, có tỉ lệ đóng góp hợp lệ | Gửi yêu cầu quy đổi | Giờ giảng phân bổ đúng theo vai trò/tỉ lệ | Happy |
| TC-05 | AC-05 | Sự kiện đã quy đổi, có cùng `sourceType/sourceId/eventKey` | Xử lý lại cùng sự kiện | Không tạo bản ghi giờ trùng | Biên/Idempotency |
| TC-06 | AC-06 | Có bản ghi giờ giảng đã tạo | Chuyên viên điều chỉnh số giờ, nhập lý do và lưu | Tạo bản ghi điều chỉnh/audit kèm lý do | Audit |
| TC-07 | AC-07 | Đã có công thức X cho `ACADEMIC_YEAR` hiệu lực 01/01/2026-31/12/2026 | Tạo công thức X cùng phạm vi có hiệu lực 01/07/2026-31/12/2026 | Bị từ chối vì khoảng hiệu lực chồng lấn | Negative |
| TC-08 | AC-08 | Đã có bản ghi giờ giảng tính theo công thức cũ | Lưu công thức mới hiệu lực tương lai | Bản ghi cũ không tự thay đổi | Regression |
| TC-09 | AC-08 | Đã có bản ghi giờ giảng và công thức mới cần hồi tố | Chạy tính lại/điều chỉnh có lý do | Tạo bản ghi điều chỉnh chênh lệch và audit, không sửa đè bản ghi cũ | Audit |
| TC-10 | AC-09 | Giảng viên có bản ghi ở nhiều kỳ | Mở F08 hoặc MH-02, lọc theo kỳ | Tổng giờ hiển thị đúng theo `recognitionPeriodType/code` | Integration |

## 3. Trường hợp biên & negative
- Công thức hết hiệu lực hoặc không có công thức cho `periodType` tenant đang dùng.
- Sự kiện ở trạng thái chưa hợp lệ hoặc thiếu `sourceOccurredAt`.
- Ngày nguồn nằm sát ranh giới năm học/năm tài khóa.
- Phân bổ vai trò tổng tỉ lệ khác 100%.
- Công thức mới chồng lấn hiệu lực với công thức cũ cùng loại hoạt động/vai trò/kỳ.
