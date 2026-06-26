---
title: "Dự án phục vụ sản xuất — Test plan"
spec: "./spec.md"
owner: "<TEST>"
status: Draft
updated: 2026-06-26
---

# Dự án phục vụ sản xuất — Kế hoạch kiểm thử

> Khung mẫu — mỗi test case bám một AC trong `spec.md`.

## 2. Test cases
| ID | Liên kết AC | Bước thực hiện | Kết quả mong đợi | Loại |
|---|---|---|---|---|
| TC-01 | AC-01 | Lưu/gửi duyệt dự án thiếu đơn vị/viện chủ trì | Bị chặn, yêu cầu chọn đơn vị/viện | Negative |
| TC-02 | AC-02 | Gửi duyệt dự án chưa có đối tác ngoài | Bị chặn, nêu rõ cần bổ sung đối tác | Negative |
| TC-03 | AC-02 | Chọn đối tác ngoài từ danh mục hoặc tạo nhanh theo quyền | Dự án ghi nhận được thông tin đối tác | Happy |
| TC-04 | AC-03 | Nhập kinh phí tổng bằng VND và lưu nháp | Kinh phí được lưu ở mức đầu mục; không yêu cầu dòng dự toán/giải ngân | Happy |
| TC-05 | AC-03 | Lưu dự án có kinh phí tổng | Không tạo hồ sơ/tham chiếu F05 | Happy |
| TC-06 | AC-04 | Cấu hình yêu cầu `CONTRACT`; QLKH duyệt khi thiếu minh chứng này | Bị chặn, nêu rõ thiếu `CONTRACT` | Negative |
| TC-07 | AC-04 | Cấu hình yêu cầu `ACCEPTANCE_MINUTES`; QLKH xác nhận kết quả khi thiếu minh chứng này | Bị chặn, nêu rõ thiếu `ACCEPTANCE_MINUTES` | Negative |
| TC-08 | AC-04 | Bổ sung đúng loại minh chứng bắt buộc rồi duyệt/xác nhận kết quả | Duyệt thành công nếu các điều kiện khác hợp lệ | Happy |
| TC-09 | AC-05 | Người kê khai gửi duyệt → QLKH Trả lại kèm lý do | Dự án về Nháp, lưu lý do, cho phép sửa/gửi lại | Happy |
| TC-10 | AC-06 | QLKH duyệt/trả lại/thu hồi dự án | Ghi `AuditLog` append-only với actor, thời điểm, hành động và lý do nếu có | Happy |
| TC-11 | AC-07 | Dự án 350.000.000 VND đủ điều kiện phát sinh giờ giảng | P03 chọn bậc 60 giờ và phân bổ theo tỉ lệ/vai trò | Happy |
| TC-12 | AC-07 | Xử lý lại cùng sự kiện phát sinh giờ giảng | Không sinh bản ghi giờ trùng | Negative |
| TC-13 | AC-07 | Thu hồi dự án đã duyệt hoặc sửa dữ liệu ảnh hưởng giờ giảng | Giờ giảng được điều chỉnh tương ứng và ghi audit | Happy |

## 3. Trường hợp biên & negative

- Đối tác ngoài trùng mã số thuế/tên gần giống trong danh mục.
- Tỉ lệ đóng góp thành viên vượt 100% hoặc thiếu vai trò bắt buộc theo công thức P03.
- Kinh phí âm, sai định dạng tiền VND, hoặc nhập ngày kết thúc trước ngày bắt đầu.
- Người không có `APPLIEDPROJECT.APPROVE` gọi API duyệt/trả lại.
- Đổi cấu hình `requiredEvidence` sau khi đã có dự án nháp/chờ duyệt.
